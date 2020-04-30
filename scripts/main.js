// Element 생성
function createElement(elementName, htmlCode) {
	const newElement = document.createElement(elementName);
	newElement.innerHTML = htmlCode;
	return newElement;
}

// 새 창으로 열기
function openLinkNewWindow(url, urlDatas = null, features = null) {
	let completeURL = url;
	let completeFeatures = '';

	if (urlDatas) {
		completeURL += '?';
		for (const name in urlDatas) completeURL += `${name}=${urlDatas[name]}&`;
		completeURL = completeURL.substring(0, completeURL.length - 1);
	}

	if (features) {
		for (const name in features) completeFeatures += `${name}=${features[name]},`;
		completeFeatures = completeFeatures.substring(0, completeFeatures.length - 1);
	}

	window.open(completeURL, '', completeFeatures);
}

// 소수점 버림 함수
function floorFixed(number, decimalPlace = 2) {
	const pow10 = 10 ** decimalPlace;
	return (Math.floor(number * pow10) / pow10).toFixed(decimalPlace);
}

// 콘솔에 오류 띄우기
function consoleError(error, info) {
	console.error(`[KLAS Helper Error]\n${info.title}: ${info.content}\nMessage: ${error.message}`);
}

// 메인 실행 함수
(function () {
	'use strict';

	// 기본 함수 삽입
	document.head.appendChild(createElement('script',
		createElement.toString() +
		openLinkNewWindow.toString() +
		floorFixed.toString() +
		consoleError.toString()
	));

	const externalLibs = [
		'https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js'
	];

	// 외부 라이브러리 삽입
	for (const src of externalLibs) {
		const scriptElement = document.createElement('script');
		scriptElement.setAttribute('src', src);
		document.head.appendChild(scriptElement);
	}

	// 이미 window.onload 이벤트가 존재하는지 체크
	const onloadFunction = window.onload ? window.onload : (() => {});

	// window.onload 설정
	window.onload = () => {
		onloadFunction();

		// externalPathFunctions 함수 삽입
		for (const path in externalPathFunctions) {
			if (path === location.pathname) {
				document.head.appendChild(createElement('script', `(${externalPathFunctions[path].toString()})();`));
			}
		}
	};
})();

// 태그에 삽입되는 함수 목록
// 다른 확장 프로그램을 지원하기 위해 태그 삽입이 필요
const externalPathFunctions = {
	// 강의 계획서 조회 - 학부
	'/std/cps/atnlc/LectrePlanStdPage.do': () => {
		let waitSearch = false;

		// 인증 코드 개선 및 메시지 제거
		appModule.getSearch = function () {
			this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

			// 서버 부하를 방지하기 위해 모든 강의 계획서 검색 방지
			if (this.selectRadio === 'all' && this.selectText === '' && this.selectProfsr === '' && this.cmmnGamok === '' && this.selecthakgwa === '') {
				alert('과목명 또는 담당 교수를 입력하지 않은 경우 반드시 과목이나 학과를 선택하셔야 합니다.');
				return false;
			}

			// 서버 부하를 방지하기 위해 2초간 검색 방지
			if (waitSearch) {
				alert('서버 부하 문제를 방지하기 위해 2초 뒤에 검색이 가능합니다.');
				return false;
			}

			// 2초 타이머
			waitSearch = true;
			setTimeout(() => { waitSearch = false; }, 2000);

			axios.post('LectrePlanStdList.do', this.$data).then(function (response) {
				this.list = response.data;
			}.bind(this));
		};

		// 강의 계획서 새 창으로 열기
		appModule.goLectrePlan = function (item) {
			if (item.closeOpt === 'Y') { alert('폐강된 강의입니다.'); return false; }
			if (!item.summary) { alert('강의 계획서 정보가 없습니다.'); return false; }

			openLinkNewWindow(
				'popup/LectrePlanStdView.do',
				{
					selectSubj: 'U' + item.thisYear + item.hakgi + item.openGwamokNo + item.openMajorCode + item.bunbanNo + item.openGrade,
					selectYear: item.thisYear,
					selecthakgi: item.hakgi
				},
				{
					width: 1000,
					height: 800,
					scrollbars: 'yes',
					title: '강의 계획서 조회'
				}
			);
		};

		// 안내 문구 렌더링
		document.querySelector('table:nth-of-type(1) tr:nth-of-type(5) td').innerText = '인증 코드를 입력하실 필요가 없습니다.';

		// 엔터로 강의 계획서 검색
		$('table:nth-of-type(1) input[type="text"]').keydown((event) => {
			if (event.keyCode === 13) {
				appModule.getSearch();
			}
		});
	},
	// 강의 계획서 조회 - 대학원
	'/std/cps/atnlc/LectrePlanGdhlStdPage.do': () => {
		// 인증 코드 개선 및 메시지 제거
		appModule.getSearch = function () {
			if (!this.selectGdhlitem) {
				alert('대학원을 선택해 주세요.');
				return;
			}

			axios.post('LectrePlanDaList.do', this.$data).then(function (response) {
				this.GdhlList = response.data;
			}.bind(this));
		};

		// 안내 문구 렌더링
		document.querySelector('table:nth-of-type(1) tr:nth-of-type(4) td').innerText = '인증 코드를 입력하실 필요가 없습니다.';
	},
	// 수강 및 성적 조회
	'/std/cps/inqire/AtnlcScreStdPage.do': () => {
		appModule.$watch('sungjuk', (watchValue) => {
			let htmlCode = '';
			let trCode = '';

			const labelList = [];
			const majorScoreList = [];
			const notMajorScoreList = [];
			const allScoreList = [];

			for (let i = watchValue.length - 1; i >= 0; i--) {
				const year = watchValue[i].thisYear;
				const semester = watchValue[i].hakgi;
				const scoreInfo = watchValue[i].sungjukList;

				// 계절 학기의 경우 계산에서 제외
				if (semester > 2) continue;

				// 표 순서대로 평점 정보 기록
				const gpaInfo = scoreInfo.reduce((acc, cur) => {
					const changer = {
						'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': 0, 'NP': 0
					};

					const code = cur.codeName1.trim();
					const credit = parseInt(cur.hakjumNum);
					const grade = cur.getGrade.trim();

					const isMajor = code[0] === '전';
					const isPass = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'P'].includes(grade);
					const isIncludeF = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'NP'].includes(grade);
					const isNotIncludeF = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0'].includes(grade);

					acc[0] += isPass ? credit : 0;                                          // 취득 학점
					acc[1] += isMajor && isIncludeF ? changer[grade] * credit : 0;          // 전공 총점 (F 포함)
					acc[2] += isMajor && isIncludeF ? credit : 0;                           // 전공 취득 학점 (F 포함)
					acc[3] += isMajor && isNotIncludeF ? changer[grade] * credit : 0;       // 전공 총점 (F 미포함)
					acc[4] += isMajor && isNotIncludeF ? credit : 0;                        // 전공 취득 학점 (F 미포함)
					acc[5] += !isMajor && isIncludeF ? changer[grade] * credit : 0;         // 전공 외 총점 (F 포함)
					acc[6] += !isMajor && isIncludeF ? credit : 0;                          // 전공 외 취득 학점 (F 포함)
					acc[7] += !isMajor && isNotIncludeF ? changer[grade] * credit : 0;      // 전공 외 총점 (F 미포함)
					acc[8] += !isMajor && isNotIncludeF ? credit : 0;                       // 전공 외 취득 학점 (F 미포함)
					acc[9] += isIncludeF ? changer[grade] * credit : 0;                     // 전체 총점 (F 포함)
					acc[10] += isIncludeF ? credit : 0;                                     // 전체 취득 학점 (F 포함)
					acc[11] += isNotIncludeF ? changer[grade] * credit : 0;                 // 전체 총점 (F 미포함)
					acc[12] += isNotIncludeF ? credit : 0;                                  // 전체 취득 학점 (F 미포함)

					return acc;
				}, Array(13).fill(0));

				if (gpaInfo[0] === 0) {
					gpaInfo[0] = '-';
				}

				// 평점 계산
				for (let j = 1; j < gpaInfo.length; j += 2) {
					gpaInfo[j] = gpaInfo[j + 1] > 0 ? floorFixed(gpaInfo[j] / gpaInfo[j + 1]) : '-';
				}

				trCode += `
					<tr>
						<td>${year}학년도 ${semester}학기</td>
						<td>${gpaInfo[0]}</td>
						<td>${gpaInfo[1]}</td>
						<td>${gpaInfo[3]}</td>
						<td>${gpaInfo[5]}</td>
						<td>${gpaInfo[7]}</td>
						<td>${gpaInfo[9]}</td>
						<td>${gpaInfo[11]}</td>
					</tr>
				`;

				// 차트 데이터 생성
				if (gpaInfo[0] !== '-') {
					labelList.push([`${year}학년도`, `${semester}학기`]);
					majorScoreList.push(gpaInfo[1]);
					notMajorScoreList.push(gpaInfo[5]);
					allScoreList.push(gpaInfo[9]);
				}
			}

			htmlCode += `
				<table class="tablegw">
					<colgroup>
						<col width="25%">
						<col width="15%">
						<col width="10%">
						<col width="10%">
						<col width="10%">
						<col width="10%">
						<col width="10%">
						<col width="10%">
					</colgroup>
					<thead>
						<tr>
							<th rowspan="2">학기</th>
							<th rowspan="2">취득 학점</th>
							<th colspan="2">전공 평점</th>
							<th colspan="2">전공 외 평점</th>
							<th colspan="2">평균 평점</th>
						</tr>
						<tr>
							<th>F 포함</th>
							<th>미포함</th>
							<th>F 포함</th>
							<th>미포함</th>
							<th>F 포함</th>
							<th>미포함</th>
						</tr>
					</thead>
					<tbody>
						${trCode}
					</tbody>
				</table>
			`;

			// 평점 정보 렌더링
			document.querySelector('table[width="100%"]').before(createElement('div', `<br>${htmlCode}<br>`));

			// 평점 차트 그리기
			if (labelList.length > 0) {
				document.querySelector('table[width="100%"]').before(createElement('div', `
					<div style="margin-bottom: 20px">
						<canvas id="chart-score"></canvas>
					</div>
				`));

				const ctx = document.getElementById('chart-score');
				ctx.height = 80;

				const chart = new Chart(ctx, {
					type: 'line',
					data: {
						labels: labelList,
						datasets: [
							{
								label: '전공 평점',
								data: majorScoreList,
								borderColor: '#E74C3C',
								borderWidth: 1,
								fill: false,
								lineTension: 0,
								pointBackgroundColor: 'white',
								pointRadius: 5
							},
							{
								label: '전공 외 평점',
								data: notMajorScoreList,
								borderColor: '#2980B9',
								borderWidth: 1,
								fill: false,
								lineTension: 0,
								pointBackgroundColor: 'white',
								pointRadius: 5
							},
							{
								label: '평균 평점',
								data: allScoreList,
								borderColor: '#BDC3C7',
								borderWidth: 2,
								fill: false,
								lineTension: 0,
								pointBackgroundColor: 'white',
								pointRadius: 5
							}
						]
					},
					options: {
						scales: {
							yAxes: [{
								ticks: {
									suggestedMin: 2,
									suggestedMax: 4.5,
									stepSize: 0.5
								}
							}]
						},
						tooltips: {
							callbacks: {
								title: (tooltipItem, data) => {
									const xLabel = tooltipItem[0].xLabel;
									return xLabel[0] + ' ' + xLabel[1];
								}
							}
						}
					}
				});
			}
		});
	},
	// 석차 조회
	'/std/cps/inqire/StandStdPage.do': () => {
		// 재학했던 학기의 모든 석차 조회
		$('.tablegw').after(`
			<div style="margin-top: 10px">
				<button type="button" class="btn2 btn-learn btn-ranking">이전 석차 내역 불러오기</button>
			</div>
		`);

		$('.btn-ranking').click(() => {
			// 현재 연도, 학기, 입학연도 획득
			let nowYear = appModule.$data.selectYear;
			let nowSemester = appModule.$data.selectHakgi;
			const admissionYear = parseInt(appModule.$data.info[0].hakbun.substring(0, 4));

			// 버튼 숨기기
			$('.btn-ranking').hide();

			// 비동기 문제로 타이머 사용
			const syncTimer = setInterval(() => {
				if (nowSemester === '2') {
					nowSemester = '1';
				}
				else {
					nowYear--;
					nowSemester = '2';
				}

				const params = {
					'selectYearhakgi': nowYear + ',' + nowSemester,
					'selectChangeYn': 'Y'
				};

				// 석차 조회
				axios.post('/std/cps/inqire/StandStdList.do', params).then(function (response) {
					if (response.data) {
						$('table.AType > tbody').append(`
							<tr>
								<td>${response.data.thisYear}</td>
								<td>${response.data.hakgi}</td>
								<td>${response.data.applyHakjum}</td>
								<td>${response.data.applySum}</td>
								<td>${response.data.applyPoint}</td>
								<td>${response.data.pcnt}</td>
								<td>${response.data.classOrder} / ${response.data.manNum}</td>
								<td>${response.data.warningOpt ? response.data.warningOpt : ''}</td>
							</tr>
						`);

						return;
					}

					if (nowYear < admissionYear) {
						clearInterval(syncTimer);
						alert('석차 정보를 모두 불러왔습니다.');
					}
				}.bind(this));
			}, 500);
		});
	},
	// 강의 종합
	'/std/lis/evltn/LctrumHomeStdPage.do': () => {
		// 인증 팝업 무시
		/*
		lrnCerti.certiCheck = function (grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun) {
			let self = this;
			self.grcode = grcode;
			self.subj = subj;
			self.weeklyseq = weeklyseq;
			self.gubun = gubun;

			axios.post('/std/lis/evltn/CertiStdCheck.do', self.$data).then(function (response) {
				appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
			}.bind(this));
		};
		*/
	},
	// 온라인 강의 컨텐츠 보기
	'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
		// 2분 쿨타임 제거
		$('#appModule > table:not(#prjctList) > tbody').append(`
			<tr>
				<td>
					<div style="margin-bottom: 5px">※ 2분 쿨타임을 제거할 수 있습니다. 단, 동시에 여러 컨텐츠 학습을 하지 않도록 주의해 주세요.</div>
					<button type="button" class="btn2 btn-learn btn-cooldown">2분 쿨타임 제거</button>
				</td>
			</tr>
		`);

		$('.btn-cooldown').click(() => {
			appModule.getLrnSttus = function (param) {
				let self = this;
				axios.post('/std/lis/evltn/SelectLrnSttusStd.do', self.$data).then(function (response) {
					self.lrnSttus = response.data;
					let popup = window.open('', 'previewPopup', 'resizable=yes, scrollbars=yes, top=100px, left=100px, height=' + self.height + 'px, width= ' + self.width + 'px');
					$("#viewForm").prop('target', 'previewPopup').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit().prop('target', '');
					popup.focus();
				}.bind(this));
			};

			alert('2분 쿨타임이 제거되었습니다.');
		});

		// 저작권 안내 문구 렌더링
		$('#appModule > table:not(#prjctList) > tbody').append(`
			<tr>
				<td>
					<div style="color: red; margin-top: 10px">※ 온라인 강의 시 사용되는 강의 내용을 공유 및 배포하는 것은 저작권을 침해하는 행위이므로 꼭 개인 소장 용도로만 이용해 주시기 바랍니다.</div>
				</td>
			</tr>
		`);

		// 인증 팝업 무시
		/*
		lrnCerti.certiCheck = function (grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun) {
			let self = this;
			self.grcode = grcode;
			self.subj = subj;
			self.weeklyseq = weeklyseq;
			self.gubun = gubun;

			axios.post('/std/lis/evltn/CertiStdCheck.do', self.$data).then(function (response) {
				appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
			}.bind(this));
		};
		*/

		// 온라인 강의 고유 번호 파싱
		/*
		appModule.$watch('list', function (watchValue) {
			const videoCodes = [];
			let videoCount = 0;

			for (let i = 0; i < watchValue.length; i++) {
				videoCount += watchValue[i].hasOwnProperty('starting');
			}

			for (let i = 0; i < watchValue.length; i++) {
				const videoInfo = watchValue[i];
				let	videoCode = '';

				if (!videoInfo.hasOwnProperty('starting')) {
					continue;
				}

				// 예외인 고유 번호는 직접 파싱해서 처리
				if (videoInfo.starting === null || videoInfo.starting === 'default.htm') {
					const postData = [];
					for (const key in videoInfo) postData.push(`${key}=${videoInfo[key]}`);

					axios.post('/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do', postData.join('&')).then(function (response) {
						if (response.data.indexOf('kwcommons.kw.ac.kr/em/') === -1) {
							videoCode = undefined;
						}
						else {
							videoCode = response.data.split('kwcommons.kw.ac.kr/em/')[1].split('"')[0];
						}
					});
				}
				else {
					videoCode = videoInfo.starting.split('/');
					videoCode = videoCode[videoCode.length - 1];
				}

				const syncTimer = setInterval(() => {
					if (videoCode === undefined) {
						videoCount--;
						clearInterval(syncTimer);
					}
					else if (videoCode !== '') {
						videoCodes.push({ index: i, videoCode });
						clearInterval(syncTimer);
					}
				}, 100);
			}

			// table 태그에 고유 번호 저장
			const syncTimer = setInterval(() => {
				if (videoCount === videoCodes.length) {
					document.querySelector('#prjctList').setAttribute('data-video-codes', JSON.stringify(videoCodes));
					clearInterval(syncTimer);
				}
			}, 100);
		});
		*/

		// 2분 쿨타임 제거
		$('#appModule > table:not(#prjctList) > tbody').append(`
			<tr>
				<td>
					<div style="margin-bottom: 5px">※ 갑작스럽게 사용자 수가 급증하는 관계로 서버에 부담을 주지 않기 위해 아래 버튼을 눌러야만 다운로드 버튼이 생기도록 수정합니다. 양해 부탁드립니다. 조만간 해결하겠습니다.</div>
					<button type="button" class="btn2 btn-learn btn-lecture-down">인강 다운로드 버튼 생성</button>
				</td>
			</tr>
		`);

		$('.btn-lecture-down').click(() => {
			$('.btn-lecture-down').hide();

			const videoCodes = [];
			let videoCount = 0;
			const watchValue = appModule.$data.list;

			for (let i = 0; i < watchValue.length; i++) {
				videoCount += watchValue[i].hasOwnProperty('starting');
			}

			for (let i = 0; i < watchValue.length; i++) {
				const videoInfo = watchValue[i];
				let	videoCode = '';

				if (!videoInfo.hasOwnProperty('starting')) {
					continue;
				}

				// 예외인 고유 번호는 직접 파싱해서 처리
				if (videoInfo.starting === null || videoInfo.starting === 'default.htm') {
					const postData = [];
					for (const key in videoInfo) postData.push(`${key}=${videoInfo[key]}`);

					axios.post('/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do', postData.join('&')).then(function (response) {
						if (response.data.indexOf('kwcommons.kw.ac.kr/em/') === -1) {
							videoCode = undefined;
						}
						else {
							videoCode = response.data.split('kwcommons.kw.ac.kr/em/')[1].split('"')[0];
						}
					});
				}
				else {
					videoCode = videoInfo.starting.split('/');
					videoCode = videoCode[videoCode.length - 1];
				}

				const syncTimer = setInterval(() => {
					if (videoCode === undefined) {
						videoCount--;
						clearInterval(syncTimer);
					}
					else if (videoCode !== '') {
						videoCodes.push({ index: i, videoCode });
						clearInterval(syncTimer);
					}
				}, 100);
			}

			// table 태그에 고유 번호 저장
			const syncTimer = setInterval(() => {
				if (videoCount === videoCodes.length) {
					document.querySelector('#prjctList').setAttribute('data-video-codes', JSON.stringify(videoCodes));
					clearInterval(syncTimer);
				}
			}, 100);
		});

		// 표 디자인 수정
		document.querySelector('#prjctList > colgroup > col:nth-of-type(6)').setAttribute('width', '5%');
		document.querySelector('#prjctList > colgroup > col:nth-of-type(7)').setAttribute('width', '15%');
	}
};
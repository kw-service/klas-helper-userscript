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

	const externalLibs = [
		'https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js'
	];

	// 외부 라이브러리 삽입
	for (const src of externalLibs) {
		const scriptElement = document.createElement('script');
		scriptElement.setAttribute('src', src);
		document.head.appendChild(scriptElement);
	}

	// window.onload 설정
	window.addEventListener('load', () => {
		// externalPathFunctions 함수 실행
		for (const path in externalPathFunctions) {
			if (path === location.pathname) {
				externalPathFunctions[path]();
			}
		}

		// KLAS Helper 사용 여부 문구 추가
		document.querySelector('.navtxt').prepend(createElement('span', `
			<span style="margin-right: 20px">
				<a href="https://github.com/nbsp1221/klas-helper" target="_blank">KLAS Helper</a> 사용 중
			</span>
		`));

		// To top button 위치 고정
		$('.btnup').css({
			position: 'fixed',
			right: '30px',
			bottom: '30px'
		});
	});

	// 로그인 세션 유지
	setInterval(() => fetch('/'), 600000);
})();

// 태그에 삽입되는 함수 목록
// 다른 확장 프로그램을 지원하기 위해 태그 삽입이 필요
const externalPathFunctions = {
	// 메인 페이지
	'/std/cmn/frame/Frame.do': () => {
		// 기말 평가 안내문 표시
		const showEvaluation = async () => {
			const setData = {
				nowYear: 2020,
				nowSemester: 1,
				startDate: '2020-06-15',
				endDate: '2020-06-26',
				noticeURL: 'https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=33096'
			};

			if (!setData.startDate || !setData.endDate) {
				return;
			}

			const startDate = new Date(setData.startDate + ' 00:00:00');
			const endDate = new Date(setData.endDate + ' 23:59:59');
			const nowDate = new Date();

			if (nowDate < startDate || nowDate > endDate) {
				return;
			}

			const postData = {
				thisYear: setData.nowYear,
				hakgi: setData.nowSemester,
				termYn: 'Y'
			};

			await axios.post('/std/cps/inqire/LctreEvlTermCheck.do').then((response) => {
				postData['judgeChasu'] = response.data.judgeChasu;
			});

			await axios.post('/std/cps/inqire/LctreEvlGetHakjuk.do').then((response) => {
				postData['info'] = response.data;
			});

			let totalCount = 0;
			let leftCount = 0;

			await axios.post('/std/cps/inqire/LctreEvlsugangList.do', postData).then((response) => {
				leftCount = response.data.filter((v) => { if (v.judgeOpt === 'N') return v; }).length;
				totalCount = response.data.length;
			});

			if (leftCount === 0) {
				return;
			}

			// 렌더링
			$('.subjectbox').prepend(`
				<div class="card card-body mb-4">
					<div class="bodtitle">
						<p class="title-text">수업 평가 안내</p>
					</div>
					<div>
						<div>
							<div><strong>${setData.startDate}</strong>부터 <strong>${setData.endDate}</strong>까지 기말 수업 평가를 실시합니다.</div>
							<div style="color: red">수업 평가를 하지 않으면 성적 공개 기간에 해당 과목의 성적을 확인할 수 없으니 잊지 말고 반드시 평가해 주세요.</div>
							<div><strong>${totalCount}개</strong> 중 <strong>${leftCount}개</strong>의 수업 평가가 남았습니다.</div>
						</div>
						<div style="margin-top: 20px">
							<button type="button" class="btn2 btn-learn" onclick="linkUrl('/std/cps/inqire/LctreEvlStdPage.do')">수업 평가</button>
							<a href="${setData.noticeURL}" target="_blank"><button type="button" class="btn2 btn-gray">공지사항 확인</button></a>
						</div>
					</div>
				</div>
			`);
		};

		// 수강 과목 현황
		const showDeadline = () => {
			// 뼈대 코드 렌더링
			document.querySelector('.subjectbox').prepend(createElement('div', `
				<div class="card card-body mb-4">
					<div class="bodtitle">
						<p class="title-text">수강 과목 현황</p>
					</div>
					<table id="yes-deadline" style="width: 100%">
						<colgroup>
							<col width="30%">
							<col width="35%">
							<col width="35%">
						</colgroup>
						<thead>
							<tr style="border-bottom: 1px solid #dce3eb; font-weight: bold; height: 30px">
								<td></td>
								<td>온라인 강의</td>
								<td>과제</td>
							</tr>
						</thead>
						<tbody></tbody>
					</table>
					<div id="no-deadline" style="display: none; text-align: center">
						<span style="color: green; font-weight: bold">남아있는 항목이 없습니다. 깔끔하네요! 😊</span>
					</div>
				</div>
			`));

			// 수강 과목 현황 업데이트
			const updateDeadline = async (subjectList) => {
				const promises = [];
				const deadlineInfo = {};
				let isDeadline = false;

				// 현재 수강 중인 과목 얻기
				for (const subjectInfo of subjectList) {
					deadlineInfo[subjectInfo.subj] = {
						subjectName: subjectInfo.subjNm,
						subjectCode: subjectInfo.subj,
						yearSemester: subjectInfo.yearhakgi,
						lecture: {
							time: Infinity,
							count: 0,
							totalCount: 0
						},
						homework: {
							time: Infinity,
							count: 0,
							totalCount: 0
						}
					};

					// 온라인 강의를 가져올 주소 설정
					promises.push(axios.post('/std/lis/evltn/SelectOnlineCntntsStdList.do', {
						selectSubj: subjectInfo.subj,
						selectYearhakgi: subjectInfo.yearhakgi,
						selectChangeYn: 'Y'
					}));

					// 과제를 가져올 주소 설정
					promises.push(axios.post('/std/lis/evltn/TaskStdList.do', {
						selectSubj: subjectInfo.subj,
						selectYearhakgi: subjectInfo.yearhakgi,
						selectChangeYn: 'Y'
					}));
				}

				// 온라인 강의 파싱 함수
				const parseLecture = (subjectCode, responseData) => {
					const nowDate = new Date();

					for (const lectureInfo of responseData) {
						if (lectureInfo.evltnSe !== 'lesson' || lectureInfo.prog === 100) {
							continue;
						}
	
						const endDate = new Date(lectureInfo.endDate + ':59');
						const gapHours = Math.floor((endDate - nowDate) / 3600000);
	
						if (gapHours < 0) {
							continue;
						}
	
						if (deadlineInfo[subjectCode].lecture.time > gapHours) {
							deadlineInfo[subjectCode].lecture.time = gapHours;
							deadlineInfo[subjectCode].lecture.count = 1;
						}
						else if (deadlineInfo[subjectCode].lecture.time === gapHours) {
							deadlineInfo[subjectCode].lecture.count++;
						}
	
						deadlineInfo[subjectCode].lecture.totalCount++;
						isDeadline = true;
					}
				};

				// 과제 파싱 함수
				const parseHomework = (subjectCode, responseData) => {
					const nowDate = new Date();

					for (const homeworkInfo of responseData) {
						if (homeworkInfo.submityn === 'Y') {
							continue;
						}

						const endDate = new Date(homeworkInfo.expiredate);
						let gapHours = Math.floor((endDate - nowDate) / 3600000);

						if (gapHours < 0) {
							if (!homeworkInfo.reexpiredate) {
								continue;
							}

							// 추가 제출 기한
							const reEndDate = new Date(homeworkInfo.reexpiredate);
							gapHours = Math.floor((reEndDate - nowDate) / 3600000);

							if (gapHours < 0) {
								continue;
							}
						}

						if (deadlineInfo[subjectCode].homework.time > gapHours) {
							deadlineInfo[subjectCode].homework.time = gapHours;
							deadlineInfo[subjectCode].homework.count = 1;
						}
						else if (deadlineInfo[subjectCode].homework.time === gapHours) {
							deadlineInfo[subjectCode].homework.count++;
						}

						deadlineInfo[subjectCode].homework.totalCount++;
						isDeadline = true;
					}
				};

				// 해당 과목의 마감 정보 얻기
				await axios.all(promises).then((results) => {
					for (const response of results) {
						const subjectCode = JSON.parse(response.config.data).selectSubj;

						switch (response.config.url) {
							case '/std/lis/evltn/SelectOnlineCntntsStdList.do':
								parseLecture(subjectCode, response.data);
								break;

							case '/std/lis/evltn/TaskStdList.do':
								parseHomework(subjectCode, response.data);
								break;
						}
					}
				});

				// 마감이 빠른 순으로 정렬
				const sortedDeadlineInfo = Object.values(deadlineInfo).sort((left, right) => {
					const minLeft = left.homework.time < left.lecture.time ? left.homework : left.lecture;
					const minRight = right.homework.time < right.lecture.time ? right.homework : right.lecture;

					if (minLeft.time !== minRight.time) {
						return minLeft.time - minRight.time;
					}

					if (minLeft.count !== minRight.count) {
						return minRight.count - minLeft.count;
					}

					return (right.lecture.count + right.homework.count) - (left.lecture.count - left.homework.count);
				});

				// 내용 생성 함수
				const createContent = (itemName, info) => {
					const leftTime = info.time;
					const itemCount = info.count;
					const itemTotalCount = info.totalCount;

					if (leftTime === Infinity) {
						return `<span style="color: green">남아있는 ${itemName}가 없습니다! 😄</span>`;
					}

					const leftDay = Math.floor(leftTime / 24);
					const leftHours = leftTime % 24;

					if (leftDay === 0) {
						if (leftHours === 0) {
							return `<span style="color: red; font-weight: bold">${itemTotalCount}개의 ${itemName} 중 ${itemCount}개가 곧 마감입니다. 😱</span>`;
						}
						else {
							return `<span style="color: red; font-weight: bolder">${itemTotalCount}개의 ${itemName} 중 <strong>${itemCount}개</strong>가 <strong>${leftHours}시간 후</strong> 마감입니다. 😭</span>`;
						}
					}
					else if (leftDay === 1) {
						return `<span style="color: red">${itemTotalCount}개의 ${itemName} 중 <strong>${itemCount}개</strong>가 <strong>1일 후</strong> 마감입니다. 😥</span>`;
					}
					else {
						return `<span>${itemTotalCount}개의 ${itemName} 중 <strong>${itemCount}개</strong>가 <strong>${leftDay}일 후</strong> 마감입니다.</span>`;
					}
				};

				// HTML 코드 생성
				const trCode = sortedDeadlineInfo.reduce((acc, cur) => {
					acc += `
						<tr style="border-bottom: 1px solid #dce3eb; height: 30px">
							<td style="font-weight: bold">
								<span style="cursor: pointer" onclick="appModule.goLctrum('${cur.yearSemester}', '${cur.subjectCode}')">${cur.subjectName}</span>
							</td>
							<td>
								<span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/OnlineCntntsStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
									${createContent('강의', cur.lecture)}
								</span>
							</td>
							<td>
								<span style="cursor: pointer" onclick="appModule.goLctrumBoard('/std/lis/evltn/TaskStdPage.do', '${cur.yearSemester}', '${cur.subjectCode}')">
									${createContent('과제', cur.homework)}
								<span>
							</td>
						</tr>
					`;

					return acc;
				}, '');

				// 렌더링
				if (isDeadline) {
					$('#yes-deadline > tbody').html(trCode);
					$('#yes-deadline').css('display', 'table');
					$('#no-deadline').css('display', 'none');
				}
				else {
					$('#yes-deadline').css('display', 'none');
					$('#no-deadline').css('display', 'block');
				}
			};

			// 강의 변경 시 수강 과목 현황 업데이트
			appModule.$watch('atnlcSbjectList', (watchValue) => {
				updateDeadline(watchValue);
			});

			// 모든 정보를 불러올 때까지 대기
			const waitTimer = setInterval(() => {
				if (appModule && appModule.atnlcSbjectList.length > 0) {
					clearInterval(waitTimer);
					updateDeadline(appModule.atnlcSbjectList);
				}
			}, 100);
		};

		showEvaluation();
		showDeadline();
	},
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

		// 엔터로 강의 계획서 검색
		$('table:nth-of-type(1) input[type="text"]').keydown((event) => {
			if (event.keyCode === 13) {
				appModule.getSearch();
			}
		});
	},
	// 수강 및 성적 조회
	'/std/cps/inqire/AtnlcScreStdPage.do': () => {
		const scoreTimer = setInterval(() => {
			if (!appModule) {
				return;
			}

			if (appModule.$data.sungjuk.length === 0) {
				return;
			}

			const scoreDatas = appModule.$data.sungjuk;
			let htmlCode = '';
			let trCode = '';

			const labelList = [];
			const majorScoreList = [];
			const notMajorScoreList = [];
			const allScoreList = [];

			for (let i = scoreDatas.length - 1; i >= 0; i--) {
				const year = scoreDatas[i].thisYear;
				const semester = scoreDatas[i].hakgi;
				const scoreInfo = scoreDatas[i].sungjukList;

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
								borderColor: '#e74c3c',
								borderWidth: 1,
								fill: false,
								lineTension: 0,
								pointBackgroundColor: 'white',
								pointRadius: 5
							},
							{
								label: '전공 외 평점',
								data: notMajorScoreList,
								borderColor: '#2980b9',
								borderWidth: 1,
								fill: false,
								lineTension: 0,
								pointBackgroundColor: 'white',
								pointRadius: 5
							},
							{
								label: '평균 평점',
								data: allScoreList,
								borderColor: '#bdc3c7',
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

			clearInterval(scoreTimer);
		}, 100);
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
		lrnCerti.certiCheck = function (grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun) {
			console.log(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun);
			let self = this;
			self.grcode = grcode;
			self.subj = subj;
			self.weeklyseq = weeklyseq;
			self.gubun = gubun;
			axios.post('/std/lis/evltn/CertiStdCheck.do', self.$data)
				.then(function () {
					appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
				}.bind(this));
		};

		// 2분 쿨타임 제거, 강의 숨기기 버튼 생성
		$("p:contains('온라인 강의리스트')").append(`
			<button type="button" class="btn2 btn-learn btn-cooltime">2분 쿨타임 제거</button>
			<button type="button" class="btn2 btn-gray btn-clean">강의 숨기기 On / Off</button>
		`);

		// 2분 쿨타임 제거 버튼에 이벤트 설정
		$('.btn-cooltime').click(() => {
			appModule.getLrnSttus = function (param) {
				let self = this;
				axios.post('/std/lis/evltn/SelectLrnSttusStd.do', self.$data).then(function (response) {
					self.lrnSttus = response.data;

					if (response.data === 'Y' || response.data === 'N') {
						if (ios) {
							$('#viewForm').prop('target', '_blank').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit();
						}
						else {
							let popup = window.open('', 'previewPopup', 'resizable=yes, scrollbars=yes, top=100px, left=100px, height=' + self.height + 'px, width= ' + self.width + 'px');
							$('#viewForm').prop('target', 'previewPopup').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit().prop('target', '');
							popup.focus();
						}
					}
					else if (response.request.responseURL.includes('LoginForm.do')){
						linkUrl(response.request.responseURL);
					}
				}.bind(this));
			};

			alert('2분 쿨타임이 제거되었습니다.');
		});

		// 강의 숨기기 버튼에 이벤트 설정
		$('.btn-clean').click(() => {
			if (appModule.origin == undefined) {
				appModule.origin = appModule.cntntList;
				let copy = [];
				appModule.cntntList.forEach(item => {
					if (item.prog != '100') copy.push(item)
				})
				appModule.cntntList = copy;
			}
			else {
				appModule.cntntList = appModule.origin;
				appModule.origin = undefined;
			}

			$('.btn-clean').toggleClass('btn-green');
			$('.btn-clean').toggleClass('btn-gray');
		});

		// 과목 변경시 강의 숨기기 초기화
		$("select[name='selectSubj']").change(() => {
			appModule.origin = undefined;
			$('.btn-green').toggleClass('btn-green').toggleClass('btn-gray');
		});
	},
	// 수업 평가
	'/std/cps/inqire/LctreEvlViewStdPage.do': () => {
		// 일괄 선택 기능
		$('.tablegw').before(`
			<div style="border: 1px solid #ddd; margin: 20px 0 35px 0">
				<div style="background-color: #d3e9f8; border-bottom: 1px solid #ddd; font-weight: bold; padding: 5px; text-align: center">일괄 선택 기능</div>
				<div style="overflow: hidden; padding: 10px 0; text-align: center">
					<div style="float: left; width: 25%">
						<input type="radio" name="auto" id="auto-2">
						<label for="auto-2" style="margin: 0">그렇지 않다</label>
					</div>
					<div style="float: left; width: 25%">
						<input type="radio" name="auto" id="auto-3">
						<label for="auto-3" style="margin: 0">보통이다</label>
					</div>
					<div style="float: left; width: 25%">
						<input type="radio" name="auto" id="auto-4">
						<label for="auto-4" style="margin: 0">그렇다</label>
					</div>
					<div style="float: left; width: 25%">
						<input type="radio" name="auto" id="auto-5">
						<label for="auto-5" style="margin: 0">정말 그렇다</label>
					</div>
				</div>
			</div>
		`);
		
		// 일괄 선택 기능에 이벤트 설정
		$('input[name="auto"]').change(function () {
			let value = parseInt(this.id.split('-')[1]);

			$(`.tablegw input[value="${value}"]`).each(function() {
				appModule[this.name] = value;
				appModule.checkValue(this.name);
			});
		});
	},
	// 온라인 강의 컨텐츠 보기
	'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
		// 강의 숨기기 기능에 맞도록 표 레이아웃 구현 방식 수정
		appModule.setRowspan = function () {
			for (let i = 1; i <= 16; i++) {
				const weekRows = $('.weekNo-' + i);
				const moduleTitleRows = $('.moduletitle-' + i);
				const totalTimeRows = $('.totalTime-' + i);

				weekRows.removeAttr('rowspan').show();
				moduleTitleRows.removeAttr('rowspan').show();
				totalTimeRows.removeAttr('rowspan').show();

				if (weekRows.length > 1) {
					weekRows.eq(0).attr('rowspan', weekRows.length);
					weekRows.not(':eq(0)').hide();
				}

				if (moduleTitleRows.length > 1) {
					moduleTitleRows.eq(0).attr('rowspan', moduleTitleRows.length);
					moduleTitleRows.not(':eq(0)').hide();
				}

				if (totalTimeRows.length > 1) {
					totalTimeRows.eq(0).attr('rowspan', totalTimeRows.length);
					totalTimeRows.not(':eq(0)').hide();
				}
			}
		};

		// 안내 문구 및 새로운 기능 렌더링
		document.querySelector('#appModule > table:not(#prjctList)').after(createElement('div', `
			<div id="new-features" style="border: 1px solid #d3d0d0; border-radius: 5px; margin-top: 30px; padding: 10px">
				<div>온라인 강의 다운로드는 '보기' 버튼을 누르면 나오는 강의 화면 페이지에서 이용하실 수 있습니다.</div>
				<div style="color: red">온라인 강의 시 사용되는 강의 내용을 공유 및 배포하는 것은 저작권을 침해하는 행위이므로 꼭 개인 소장 용도로만 이용해 주시기 바랍니다.</div>
				<div style="font-weight: bold; margin-top: 10px">추가된 기능</div>
				<div>- 2분 쿨타임 제거: 2분 쿨타임을 제거할 수 있습니다. 단, 동시에 여러 콘텐츠 학습을 하지 않도록 주의해 주세요.</div>
				<div>- 강의 숨기기: 진도율 100%인 강의를 숨길 수 있습니다.</div>
				<div style="margin-top: 20px">
					<button type="button" id="btn-cooltime" class="btn2 btn-learn">2분 쿨타임 제거</button>
					<button type="button" id="btn-hide-lecture" class="btn2 btn-gray">강의 숨기기 On / Off</button>
				</div>
			</div>
		`));

		// 2분 쿨타임 제거 버튼에 이벤트 설정
		$('#btn-cooltime').click(() => {
			appModule.getLrnSttus = function (param) {
				let self = this;
				axios.post('/std/lis/evltn/SelectLrnSttusStd.do', self.$data).then(function (response) {
					self.lrnSttus = response.data;

					if (response.data === 'Y' || response.data === 'N') {
						if (ios) {
							$('#viewForm').prop('target', '_blank').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit();
						}
						else {
							let popup = window.open('', 'previewPopup', 'resizable=yes, scrollbars=yes, top=100px, left=100px, height=' + self.height + 'px, width= ' + self.width + 'px');
							$('#viewForm').prop('target', 'previewPopup').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit().prop('target', '');
							popup.focus();
						}
					}
					else if (response.request.responseURL.includes('LoginForm.do')){
						linkUrl(response.request.responseURL);
					}
				}.bind(this));
			};

			alert('2분 쿨타임이 제거되었습니다.');
		});

		// 강의 숨기기 버튼에 이벤트 설정
		$('#btn-hide-lecture').click(() => {
			if (appModule.listBackup) {
				appModule.list = appModule.listBackup;
				appModule.listBackup = undefined;
			}
			else {
				appModule.listBackup = appModule.list;
				appModule.list = appModule.list.filter(v => { if (v.prog !== 100) return v; });
			}

			$('#btn-hide-lecture').toggleClass('btn-gray');
			$('#btn-hide-lecture').toggleClass('btn-green');
		});

		// 과목 변경 시 적용된 기능 초기화
		$('select[name="selectSubj"]').change(() => {
			appModule.listBackup = undefined;
			$('#new-features .btn-green').toggleClass('btn-green').toggleClass('btn-gray');
		});

		// 인증 팝업 무시
		lrnCerti.certiCheck = function (grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun) {
			console.log(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun);
			let self = this;
			self.grcode = grcode;
			self.subj = subj;
			self.weeklyseq = weeklyseq;
			self.gubun = gubun;
			axios.post('/std/lis/evltn/CertiStdCheck.do', self.$data)
				.then(function () {
					appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
				}.bind(this));
		};
	},
	// 온라인 강의 화면
	'/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
		// 온라인 강의 고유 번호 파싱
		const videoURL = chkOpen.toString().split('https://kwcommons.kw.ac.kr/em/')[1].split('"')[0];
		document.body.setAttribute('data-video-code', videoURL);
	}
};

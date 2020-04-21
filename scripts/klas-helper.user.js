// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      1.6.1
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-end
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @updateURL    https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js
// @downloadURL  https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
	'use strict';

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
				if (item.summary === null) { alert('강의 계획서 정보가 없습니다.'); return false; }

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
			appModule.$watch('sungjuk', function (newVal, oldVal) {
				let htmlCode = '';
				let trCode = '';

				for (let i = newVal.length - 1; i >= 0; i--) {
					const year = newVal[i].thisYear;
					const semester = newVal[i].hakgi;
					const scoreInfo = newVal[i].sungjukList;

					// 계절 학기의 경우 계산에서 제외
					if (semester > 2) {
						continue;
					}

					const changer = {
						'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'P': 0, 'NP': 0
					};

					// 표 순서대로 평점 정보 기록
					const gpaInfo = scoreInfo.reduce((acc, cur) => {
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
					}, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

					if (gpaInfo[0] === 0) {
						gpaInfo[0] = '-';
					}

					// 평점 계산
					for (let i = 1; i < gpaInfo.length; i += 2) {
						gpaInfo[i] = gpaInfo[i + 1] > 0 ? floorFixed(gpaInfo[i] / gpaInfo[i + 1]) : '-';
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
				document.querySelector('table[width="100%"]').before(createTag('div', `<br>${htmlCode}<br>`));
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

			// 온라인 강의 고유 번호 파싱
			appModule.$watch('list', function (newVal, oldVal) {
				const videoCodes = [];
				let videoCount = 0;

				for (let i = 0; i < newVal.length; i++) {
					videoCount += newVal[i].hasOwnProperty('starting');
				}

				for (let i = 0; i < newVal.length; i++) {
					const videoInfo = newVal[i];
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

			// 인증 팝업 무시
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
		}
	};

	// 태그에 삽입되지 않는 함수 목록
	// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요
	const internalPathFunctions = {
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// MutationObserver 삽입
			const observer = new MutationObserver(function (mutationList, observer) {
				// table 태그에 저장한 고유 번호 파싱
				const videoCodes = JSON.parse(mutationList[0].target.dataset.videoCodes);

				// 이미 생성된 다운로드 버튼 제거
				$('.btn-download').hide();

				// 동영상 XML 정보 획득
				for (const videoInfo of videoCodes) {
					GM.xmlHttpRequest({
						method: 'GET',
						url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoInfo.videoCode,
						onload: function (response) {
							const documentXML = response.responseXML;
							const videoURLs = [];

							// 분할된 동영상 등 다양한 상황 처리
							try {
								if (documentXML.getElementsByTagName('desktop').length > 0) {
									videoURLs.push(documentXML.getElementsByTagName('media_uri')[0].innerHTML);
								}
								else {
									const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;

									for (const videoName of documentXML.getElementsByTagName('main_media')) {
										videoURLs.push(mediaURI.replace('[MEDIA_FILE]', videoName.innerHTML));
									}
								}
							}
							catch (error) {
								consoleError(error, {
									title: 'Video Code',
									content: videoInfo.videoCode
								});
							}

							// 다운로드 버튼 렌더링
							videoURLs.forEach((videoURL, i) => {
								const tdList = document.getElementById('prjctList').querySelectorAll(`tbody > tr:nth-of-type(${videoInfo.index + 1}) > td`);
								let tdElement = tdList[tdList.length - 1];
								tdElement = tdElement.className === '' ? tdElement : tdList[tdList.length - 2];

								tdElement.appendChild(createTag('div', `
									<a href="${videoURL}" target="_blank" style="display: block; margin-top: 10px">
										<button type="button" class="btn2 btn-gray btn-download">동영상 받기 #${i + 1}</button>
									</a>
								`));
							});
						}
					});
				}
			});

			// MutationObserver 감지 시작
			observer.observe(document.querySelector('#prjctList'), { attributes: true });
		}
	};

	// 기본 함수 삽입
	document.head.appendChild(createTag('script',
		consoleError.toString() +
		createTag.toString() +
		floorFixed.toString() +
		openLinkNewWindow.toString()
	));

	// externalPathFunctions 함수 삽입
	for (const path in externalPathFunctions) {
		if (path === location.pathname) {
			document.head.appendChild(createTag('script', `(${externalPathFunctions[path].toString()})();`));
		}
	}

	// internalPathFunctions 함수 실행
	for (const path in internalPathFunctions) {
		if (path === location.pathname) {
			internalPathFunctions[path]();
		}
	}
})();

// 콘솔에 오류 띄우기
function consoleError(error, info) {
	console.error(`[KLAS Helper Error]\n${info.title}: ${info.content}\nMessage: ${error.message}`);
}

// 태그 생성
function createTag(tagName, htmlCode) {
	const tagElement = document.createElement(tagName);
	tagElement.innerHTML = htmlCode;
	return tagElement;
}

// 소수점 버림 함수
function floorFixed(number, decimalPlace = 2) {
	const pow10 = 10 ** decimalPlace;
	return (Math.floor(number * pow10) / pow10).toFixed(decimalPlace);
}

// 새 창으로 열기
function openLinkNewWindow(url, getDatas = null, specs = null) {
	let completeURL = url;
	let completeSpecs = '';

	if (getDatas !== null) {
		completeURL += '?';
		for (let name in getDatas) completeURL += `${name}=${getDatas[name]}&`;
		completeURL = completeURL.substring(0, completeURL.length - 1);
	}

	if (specs !== null) {
		for (let name in specs) completeSpecs += `${name}=${specs[name]},`;
		completeSpecs = completeSpecs.substring(0, completeSpecs.length - 1);
	}

	window.open(completeURL, '', completeSpecs);
}

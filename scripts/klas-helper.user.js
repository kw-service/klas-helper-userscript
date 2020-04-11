// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      1.4.0
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
	let externalPathFunctions = {
		//학습 톡톡 작성자 추가
		  '/std/lis/sport/LrnTalkStdPopupPage.do' : ()=>{
        appLrnTalk.$watch('list',function(newVal,oldVal){

           $("div:eq(8) *").remove();
           $("div:eq(8)").append(`
             <p class="alltxt">
                    전체글 <span class="fred B">${appLrnTalk.totalCount}</span>
                </p>
           `);
           for(let i=appLrnTalk.totalCount-1;i>-1;i--)
           {
               let message = appLrnTalk.list[i].mssage;
               let registDt = appLrnTalk.list[i].registDt;
               let Date = registDt.substr(0,10);
               let Year = parseInt(registDt.substr(0,4));
               let Month = parseInt(registDt.substr(5,2));
               let Day = parseInt(Date.substr(8,2));
               let Time = registDt.substr(11,8);
               let hour = parseInt(Time.substr(0,2))+9;
               let min = registDt.substr(14,2);
               let sec = registDt.substr(17,2);
               let yoon =0;
               if(hour>24)
               {
                hour-=24;
                Day+=1;
                if(Year%4 ==0)
                {
                 if(Year%100 ==0)
                 {
                     if(Year%400==0) // 윤년
                     {
                       yoon=1;
                     }
                 }
                 else //윤년
                 {
                   yoon=1;
                  }
                }

                if(Month ==1 || Month==3 || Month==5 || Month==7 || Month==8 || Month==10 || Month==12)
                {
                 if(Day>31)
                 {
                     Day-=31;
                     Month+=1;
                     if(Month==13)
                     {
                      Month-=12;
                      Year+=1;
                     }
                 }
                }
                else if(Month ==4 || Month == 6 || Month==9 || Month==11)
                {
                  if(Day>30)
                  {
                     Day-=30;
                     Month+=1;
                  }
                }
                else
                {
                    if(yoon==1)
                    {
                        if(Day>29)
                        {
                            Day-=29;
                            Month+=1;
                        }
                    }
                    else
                    {
                        if(Day>28)
                        {
                            Day-=28;
                            Month+=1;
                        }
                    }
                }

               }

               if(hour<10)
               {
                  hour.toString();
                  hour = "0"+hour;
                }
                if(Day < 10)
                {
                 Day.toString();
                 Day = "0"+Day;
                }

               if(Month<10)
               {
                   Month.toString();
                   Month = "0"+Month;
               }

               registDt = Year + "-" + Month + "-" + Day + " " + hour + ":" + min;
               let registInfo = appLrnTalk.list[i].registerInfo;
               let sortOrdr = appLrnTalk.list[i].sortOrdr;
               let gubun = appLrnTalk.list[i].gubun;
               if(sortOrdr == 0 && gubun=='2') // 질문 작성자가 학생
               {
                $('.alltxt').after(`

                 <ul class="talkreply">
                  <li class="suject">${message}</li>
                  <li class="date">${registDt}</li>
                  <li class="name">${registInfo}</li>
                  </ul>

               `);
                }
               else if(sortOrdr ==0 && gubun!='2') // 질문 작성자가 교수
               {
                $('.alltxt').after(`
                 <ul class="talkreply">
                  <ul class="talkreplyview">
                   <li class="suject">${message}</li>
                   <li class="date">${registDt}</li>
                   <li class="name">${registInfo}</li>
                  </ul>
                 </ul>
               `);
               }

               if(sortOrdr>0) // 질문에 대한 답변
               {
                $('.alltxt').after(`
                <ul class="talkreply">
                 <li class="reply">
                   <ul class="talkreplyview">
                      <span></span>
                      <li class="suject">${message}</li>
                      <li class="date">${registDt}</li>
                      <li class="name">${registInfo}</li>
                   </ul>
                 </li>
                </ul>
               `);
               }


           }

        });

		//온라인 강의리스트 및 출석 바로가기
		'/std/lis/evltn/LctrumHomeStdPage.do' : () => {
			lrnCerti.certiCheck = function(grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun){

appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
}
appModule.goVideo = function(param){
 linkUrl('OnlineCntntsStdPage.do',this.$data);
}

var tag = document.getElementsByClassName("title-text");
tag[2].innerHTML="출석"+ '<a class="more_btn" href="#"><i class="fas fa-list"></i></a>';
tag[2].onclick = function()
{
 linkUrl('https://klas.kw.ac.kr/std/ads/admst/KwAttendStdPage.do',this.$data);
}
tag[9].innerHTML = "온라인 강의리스트" + '<a class="more_btn" href="#"><i class="fas fa-list"></i></a>';
tag[9].onclick = function()
{
    linkUrl('OnlineCntntsStdPage.do',this.$data);
}
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
			class GPACalculator {
				constructor() {
					this._gradePointChanger = {
						'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'NP': 0
					};

					// 취득 학점
					this._earnedCredit = 0;

					// 평점을 계산하기 위한 변수 (F 포함)
					this._sumScoreF = 0;
					this._sumCreditF = 0;

					// 평점을 계산하기 위한 변수 (F 미포함)
					this._sumScore = 0;
					this._sumCredit = 0;
				}

				updateGPA(credit, gradePoint) {
					// P, R, 그 외 알 수 없는 학점의 경우
					if (!(gradePoint in this._gradePointChanger)) {
						if (gradePoint === 'P') this._earnedCredit += credit;
						return;
					}

					// F 미포함 계산
					if (gradePoint !== 'F' || gradePoint !== 'NP') {
						this._earnedCredit += credit;
						this._sumScore += credit * this._gradePointChanger[gradePoint];
						this._sumCredit += credit;
					}

					// F 포함 계산
					this._sumScoreF += credit * this._gradePointChanger[gradePoint];
					this._sumCreditF += credit;
				}

				getGPA() {
					let result = {
						earnedCredit: this._earnedCredit,
						includeF: this._sumCreditF === 0 ? '-' : floorFixed(this._sumScoreF / this._sumCreditF),
						notIncludeF: this._sumCredit === 0 ? '-' : floorFixed(this._sumScore / this._sumCredit)
					};

					return result;
				}
			}

			// 평점 계산
			appModule.$watch('sungjuk', function (newVal, oldVal) {
				let htmlCode = '';
				let trCode = '';

				for (let i = newVal.length - 1; i >= 0; i--) {
					let scoreInfo = newVal[i];
					let year = scoreInfo.thisYear;
					let semester = scoreInfo.hakgi;

					// 계절 학기의 경우 계산에서 제외
					if (semester > 2) {
						continue;
					}

					// 상황별 점수 정보
					let GPA = new GPACalculator();
					let majorGPA = new GPACalculator();
					let notMajorGPA = new GPACalculator();

					for (let subjectInfo of scoreInfo.sungjukList) {
						let codeName = subjectInfo.codeName1.trim();
						let credit = parseInt(subjectInfo.hakjumNum);
						let gradePoint = subjectInfo.getGrade.trim();

						// 전공 평점 계산
						if (codeName[0] === '전') {
							majorGPA.updateGPA(credit, gradePoint);
						}
						// 전공 외 평점 계산
						else {
							notMajorGPA.updateGPA(credit, gradePoint);
						}

						// 평균 평점 계산
						GPA.updateGPA(credit, gradePoint);
					}

					// 계산 결과 반영
					GPA = GPA.getGPA();
					majorGPA = majorGPA.getGPA();
					notMajorGPA = notMajorGPA.getGPA();

					trCode += `
						<tr>
							<td>${year}학년도 ${semester}학기</td>
							<td>${GPA.earnedCredit}</td>
							<td>${majorGPA.includeF}</td>
							<td>${majorGPA.notIncludeF}</td>
							<td>${notMajorGPA.includeF}</td>
							<td>${notMajorGPA.notIncludeF}</td>
							<td>${GPA.includeF}</td>
							<td>${GPA.notIncludeF}</td>
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
				let tableList = document.querySelectorAll('#hakbu > table');
				let divElement = createTag('div', `<br>${htmlCode}<br>`);

				for (let i = 0; i < tableList.length; i++) {
					if (parseInt(tableList[i].getAttribute('width')) === 100) {
						tableList[i].before(divElement);
						break;
					}
				}
			});
		},
		//지난 학기 석차 조회하기
		'std/cps/inqire/StandStdPage.do' : () => {
		  let state=0;
		       appModule.$watch('stand',function(newval,oldVal){
		       if(state==0)
		       {
			var info = prompt("석차를 조회하고자 하는 년도와 학기를 입력하세요(2016,1) : ").split(",");
			var params = {"selectYearhakgi":info[0]+','+info[1],"selectChangeYn":"Y"};
			state++;
		       }

		       if(state==1)
		       {
			    appModule.getData(params);
			    input++;
		       }


     });
		},
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// 온라인 강의 고유 번호 파싱
			appModule.$watch('list', function (newVal, oldVal) {
				let videoCodes = [];
				let videoCount = 0;

				// 디버깅을 위한 로그
				if (newVal.length > 0) {
					console.log(JSON.stringify(newVal));
				}

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

			// 2분 쿨타임 제거
			$('table:nth-of-type(1) > tbody').append(`
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
		}
	};

	// 태그에 삽입되지 않는 함수 목록
	// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요
	let internalPathFunctions = {
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// MutationObserver 삽입
			let observer = new MutationObserver(function (mutationList, observer) {
				// table 태그에 저장한 고유 번호 파싱
				let videoCodes = JSON.parse(mutationList[0].target.dataset.videoCodes);

				// 이미 생성된 다운로드 버튼 제거
				document.querySelectorAll('.btn-download').forEach(function (item) {
					item.style.display = 'none';
				});

				// 동영상 XML 정보 획득
				for (let videoInfo of videoCodes) {
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

									for (let videoName of documentXML.getElementsByTagName('main_media')) {
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
								let tdList = document.querySelectorAll(`#prjctList > tbody > tr:nth-of-type(${videoInfo.index + 1}) > td`);
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
		createTag.toString() +
		floorFixed.toString() +
		openLinkNewWindow.toString()
	));

	// externalPathFunctions 함수 삽입
	for (let path in externalPathFunctions) {
		if (path === location.pathname) {
			document.head.appendChild(createTag('script', `(${externalPathFunctions[path].toString()})();`));
		}
	}

	// internalPathFunctions 함수 실행
	for (let path in internalPathFunctions) {
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
	let tagElement = document.createElement(tagName);
	tagElement.innerHTML = htmlCode;
	return tagElement;
}

// 소수점 버림 함수
function floorFixed(number, decimalPlace = 2) {
	let pow10 = 10 ** decimalPlace;
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

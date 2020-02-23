// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      1.3.0
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-end
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @downloadURL  https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function() {
	'use strict';

/*	// 모든 페이지 헤더에 안내 문구 렌더링
	document.querySelector('header > .navbar').after(createTag('div',
		`<div style="background-color: #750A3E; color: white; padding: 15px 0 12px 0; text-align: center">` +
		`	<div style="font-size: 1.6em; font-weight: bold"><a href="https://github.com/nbsp1221/klas-helper" target="_blank" style="color: white">KLAS Helper</a> 사용 중</div>` +
		`	<div style="padding-top: 5px">유저 스크립트 Cross-origin 리소스 접근 경고 창이 나올 경우 <span style="color: yellow; font-weight: bold">도메인 항상 허용</span> 버튼을 눌러주셔야 정상적인 사용이 가능합니다.</div>` +
		`</div>`
	));*/

	let pathFunctions = {
		// 강의 계획서 조회 - 학부
		'/std/cps/atnlc/LectrePlanStdPage.do': () => {
			let waitSearch = false;

			// 인증 코드 개선 및 메시지 제거
			appModule.getSearch = function () {
				this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

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

				axios.post('CultureOptOneInfo.do', this.$data).then(function (response) {
					openLinkNewWindow(
						response.data.cultureOpt === null ? 'popup/LectrePlanStdView.do' : 'popup/LectrePlanStdFixedView.do',
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
				}.bind(this));
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
			let gradePointChanger = {
				'A+': 4.5, 'A0': 4.0, 'B+': 3.5, 'B0': 3.0, 'C+': 2.5, 'C0': 2.0, 'D+': 1.5, 'D0': 1.0, 'F': 0, 'NP': 0
			};

			// 평점 계산
			appModule.$watch('sungjuk', function (newVal, oldVal) {
				let htmlCode = '';
				let trCode = '';

				for (let i = newVal.length - 1; i >= 0; i--) {
					let year = newVal[i].thisYear;
					let semester = newVal[i].hakgi;
					let earnedCredits = 0;

					// 상황별 점수 정보
					let sumScore = 0, sumScoreF = 0;
					let sumCredit = 0, sumCreditF = 0;
					let sumMajorScore = 0, sumMajorScoreF = 0;
					let sumMajorCredit = 0, sumMajorCreditF = 0;
					let sumNotMajorScore = 0, sumNotMajorScoreF = 0;
					let sumNotMajorCredit = 0, sumNotMajorCreditF = 0;

					// 계절 학기의 경우 계산에서 제외
					if (semester > 2) {
						continue;
					}

					for (let j = 0; j < newVal[i].sungjukList.length; j++) {
						let codeName = newVal[i].sungjukList[j].codeName1.trim();
						let credit = parseInt(newVal[i].sungjukList[j].hakjumNum);
						let gradePoint = newVal[i].sungjukList[j].getGrade.trim();

						// P와 R 학점의 경우
						if (!(gradePoint in gradePointChanger)) {
							if (gradePoint === 'P') earnedCredits += credit;
							continue;
						}

						// 취득 학점 계산
						if (gradePoint !== 'F' || gradePoint !== 'NP') {
							earnedCredits += credit;
						}

						// 전공 평점 계산
						if (codeName[0] === '전') {
							if (gradePoint !== 'F' || gradePoint !== 'NP') {
								sumMajorScore += credit * gradePointChanger[gradePoint];
								sumMajorCredit += credit;
							}

							sumMajorScoreF += credit * gradePointChanger[gradePoint];
							sumMajorCreditF += credit;
						}
						// 전공 외 평점 계산
						else {
							if (gradePoint !== 'F' || gradePoint !== 'NP') {
								sumNotMajorScore += credit * gradePointChanger[gradePoint];
								sumNotMajorCredit += credit;
							}

							sumNotMajorScoreF += credit * gradePointChanger[gradePoint];
							sumNotMajorCreditF += credit;
						}

						// 평균 평점 계산
						if (gradePoint !== 'F' || gradePoint !== 'NP') {
							sumScore += credit * gradePointChanger[gradePoint];
							sumCredit += credit;
						}

						sumScoreF += credit * gradePointChanger[gradePoint];
						sumCreditF += credit;
					}

					trCode +=
						`<tr>` +
						`	<td>${year}학년도 ${semester}학기</td>` +
						`	<td>${earnedCredits}</td>` +
						`	<td>${sumMajorCreditF === 0 ? '-' : floorFixed(sumMajorScoreF / sumMajorCreditF)}</td>` +
						`	<td>${sumMajorCredit === 0 ? '-' : floorFixed(sumMajorScore / sumMajorCredit)}</td>` +
						`	<td>${sumNotMajorCreditF === 0 ? '-' : floorFixed(sumNotMajorScoreF / sumNotMajorCreditF)}</td>` +
						`	<td>${sumNotMajorCredit === 0 ? '-' : floorFixed(sumNotMajorScore / sumNotMajorCredit)}</td>` +
						`	<td>${sumCreditF === 0 ? '-' : floorFixed(sumScoreF / sumCreditF)}</td>` +
						`	<td>${sumCredit === 0 ? '-' : floorFixed(sumScore / sumCredit)}</td>` +
						`</tr>`;
				}

				htmlCode +=
					`<table class="tablegw">` +
					`	<colgroup>` +
					`		<col width="25%">` +
					`		<col width="15%">` +
					`		<col width="10%">` +
					`		<col width="10%">` +
					`		<col width="10%">` +
					`		<col width="10%">` +
					`		<col width="10%">` +
					`		<col width="10%">` +
					`	</colgroup>` +
					`	<thead>` +
					`		<tr>` +
					`			<th rowspan="2">학기</th>` +
					`			<th rowspan="2">취득 학점</th>` +
					`			<th colspan="2">전공 평점</th>` +
					`			<th colspan="2">전공 외 평점</th>` +
					`			<th colspan="2">평균 평점</th>` +
					`		</tr>` +
					`		<tr>` +
					`			<th>F 포함</th>` +
					`			<th>미포함</th>` +
					`			<th>F 포함</th>` +
					`			<th>미포함</th>` +
					`			<th>F 포함</th>` +
					`			<th>미포함</th>` +
					`		</tr>` +
					`	</thead>` +
					`	<tbody>` +
							trCode +
					`	</tbody>` +
					`</table>`;

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
		// 온라인 강의 컨텐츠 보기
		'/std/lis/evltn/OnlineCntntsStdPage.do': () => {
			// 온라인 강의 동영상 다운로드
			appModule.$watch('list', function (newVal, oldVal) {
				for (let i = 0; i < newVal.length; i++) {
					// 온라인 강의 고유 번호 파싱
					let videoCode = newVal[i].starting.split('/');
					videoCode = videoCode[videoCode.length - 1];
					// 고유 번호 저장
					document.querySelector(`#prjctList > tbody > tr:nth-of-type(${i + 1})`).setAttribute('data-video-code', videoCode);
				}
			});
		}
	};

	// 기본 함수 삽입
	let tag = document.createElement('script');
	tag.textContent = createTag.toString() + floorFixed.toString() + openLinkNewWindow.toString();
	document.head.appendChild(tag);

	for (let path in pathFunctions) {
		if (path === location.pathname) {
			// 함수 삽입
			let tag = document.createElement('script');
			tag.textContent = '(' + pathFunctions[path].toString() + ')();';
			document.head.appendChild(tag);
		}
	}
	// 온라인 강의 컨텐츠 보기
	if ('/std/lis/evltn/OnlineCntntsStdPage.do' === location.pathname) {
		// 온라인 강의 동영상 다운로드
		let observer = new MutationObserver(function (mutationList, observer) {
			for (let i = 0; i < mutationList.length; i++) {
				if (mutationList[i].addedNodes.length == 0 || mutationList[i].addedNodes[0].nodeName.toLowerCase() != 'tr') {	// tr 태그만
					continue;
				}
				// 온라인 강의 고유 번호 파싱
				let videoCode = mutationList[i].addedNodes[0].dataset.videoCode;

				// 온라인 강의 XML 정보 획득
				GM.xmlHttpRequest({
					method: 'GET',
					url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoCode,
					onload: function (response) {
						let videoName = response.responseXML.getElementsByTagName('main_media')[0].innerHTML;
						let videoURL = response.responseXML.getElementsByTagName('media_uri')[0].innerHTML.replace('[MEDIA_FILE]', videoName);

						// 다운로드 버튼 렌더링
						document.querySelector(`#prjctList > tbody > tr:nth-of-type(${i + 1}) > td:nth-of-type(9)`).appendChild(createTag('div',
							`<a href="${videoURL}" target="_blank" style="display: block; margin-top: 10px">` +
							`	<button type="button" class="btn2 btn-gray">다운로드</button>` +
							`</a>`
						));
					}
				});
			}
		});
		observer.observe(document.querySelector('#prjctList > tbody'), { childList: true });
	}
})();

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

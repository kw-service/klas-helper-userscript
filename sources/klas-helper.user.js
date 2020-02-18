// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      1.1.1
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-end
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	let pathFunctions = {
		// 강의 계획서 조회 - 학부
		'/std/cps/atnlc/LectrePlanStdPage.do': () => {
			// 인증 코드 개선 및 메시지 제거
			appModule.getSearch = function () {
				this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

				// 모든 강의 계획서 검색은 서버 부하 문제로 방지
				if (this.selectText === '' && this.selectProfsr === '' && this.selecthakgwa === '') {
					alert('과목명 또는 담당 교수를 입력하지 않은 경우 반드시 학과를 선택하셔야 합니다.');
					return false;
				}

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

			// 렌더링
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

			// 렌더링
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
						earnedCredits += credit;

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

				// 렌더링
				let tableList = document.querySelectorAll('#hakbu > table');
				let divElement = document.createElement('div');
				divElement.innerHTML = `<br>${htmlCode}<br>`;

				for (let i = 0; i < tableList.length; i++) {
					if (parseInt(tableList[i].getAttribute('width')) === 750) {
						tableList[i].before(divElement);
						break;
					}
				}
			});
		}
	};

	for (let path in pathFunctions) {
		if (path === location.pathname) pathFunctions[path]();
	}
})();

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
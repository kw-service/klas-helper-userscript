// ==UserScript==
// @name         KLAS Helper
// @namespace    https://github.com/nbsp1221
// @version      2.0.1
// @description  광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @match        https://klas.kw.ac.kr/*
// @run-at       document-start
// @homepageURL  https://github.com/nbsp1221/klas-helper
// @supportURL   https://github.com/nbsp1221/klas-helper/issues
// @updateURL    https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js
// @downloadURL  https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @author       nbsp1221
// @copyright    2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license      MIT
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// JavaScript 파일 캐시 문제 해결
function jsCache(filePath) {
	const nowDate = new Date();
	const cacheValue = nowDate.getYear() + nowDate.getMonth() + nowDate.getDay() + nowDate.getHours() + nowDate.getMinutes();
	return filePath + '?v=' + cacheValue;
}

(function () {
	'use strict';

	// 메인 파일 삽입
	// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함
	const scriptElement = document.createElement('script');
	scriptElement.setAttribute('src', jsCache('https://nbsp1221.github.io/klas-helper/dist/main.js'));
	document.head.appendChild(scriptElement);

	// 이미 window.onload 이벤트가 존재하는지 체크
	const onloadFunction = window.onload ? window.onload : (() => {});

	// window.onload 설정
	window.onload = () => {
		onloadFunction();

		// internalPathFunctions 함수 실행
		for (const path in internalPathFunctions) {
			if (path === location.pathname) {
				internalPathFunctions[path]();
			}
		}
	};
})();

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
			document.querySelectorAll('.btn-download').forEach(function (item) {
				item.style.display = 'none';
			});

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

							tdElement.appendChild(createElement('div', `
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
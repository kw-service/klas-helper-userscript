// ==UserScript==
// @name        KLAS Helper
// @version     2.2.1
// @author      nbsp1221
// @description 광운대학교 KLAS 사이트에 편리한 기능을 추가할 수 있는 유저 스크립트
// @homepage    https://github.com/nbsp1221/klas-helper#readme
// @supportURL  https://github.com/nbsp1221/klas-helper/issues
// @match       https://klas.kw.ac.kr/*
// @namespace   https://github.com/nbsp1221
// @updateURL   https://openuserjs.org/meta/nbsp1221/KLAS_Helper.meta.js
// @downloadURL https://openuserjs.org/install/nbsp1221/KLAS_Helper.user.js
// @grant       GM.xmlHttpRequest
// @copyright   2020, nbsp1221 (https://openuserjs.org/users/nbsp1221)
// @license     MIT
// @run-at      document-start
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnvTest = exports.isEnvDevelopment = exports.isEnvProduction = void 0;
if (false) {}
exports.isEnvProduction = "production" === 'production';
exports.isEnvDevelopment = "production" === 'development';
exports.isEnvTest = "production" === 'test';
const env = {
    NODE_ENV: "production"
};
exports.default = env;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.addListenerByTimer = exports.insertLibrary = exports.resolveCache = void 0;
/**
 * 파일 캐시 문제를 해결하기 위한 함수
 * @param duration 갱신 주기 (단위: 초)
 */
exports.resolveCache = (url, duration) => {
    return url + '?v=' + ((new Date()).getTime() / (duration * 1000)).toFixed(0);
};
/**
 * 의존성을 위한 라이브러리 삽입 함수
 */
exports.insertLibrary = (url) => {
    const splited = url.split('.');
    const extension = splited[splited.length - 1];
    let htmlElement;
    switch (extension) {
        case 'js':
            htmlElement = document.createElement('script');
            htmlElement.setAttribute('src', url);
            break;
        case 'css':
            htmlElement = document.createElement('link');
            htmlElement.setAttribute('rel', 'stylesheet');
            htmlElement.setAttribute('href', url);
            break;
        default:
            throw new Error('The extension of `url` is unexpected value.');
    }
    document.head.appendChild(htmlElement);
};
/**
 * 타이머를 이용한 리스너를 생성하는 함수
 * @param condition 조건 함수를 의미하며 주기적으로 이 함수를 호출하다가 `true` 값이 반환되면 `callback` 함수를 실행
 * @param callback 콜백 함수를 의미하며 조건 함수가 `true` 값을 반환했을 때 실행되는 함수
 */
exports.addListenerByTimer = (condition, callback) => {
    const listenerTimer = setInterval(() => {
        if (condition()) {
            clearTimeout(listenerTimer);
            callback();
        }
    }, 100);
    // 일정 시간이 지날 경우 타이머 해제
    setTimeout(() => {
        clearInterval(listenerTimer);
    }, 10000);
};


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_config_env__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1);
/* harmony import */ var _utils_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_utils_dom__WEBPACK_IMPORTED_MODULE_1__);


const mainURL = _config_env__WEBPACK_IMPORTED_MODULE_0__["isEnvProduction"] ? 'https://klas-helper.github.io/klas-helper/dist/main.js' : 'http://localhost:8080/main.js'; // 메인 파일 삽입
// 업데이트 시 즉각적으로 업데이트를 반영하기 위해 이러한 방식을 사용함

const scriptElement = document.createElement('script');
scriptElement.src = Object(_utils_dom__WEBPACK_IMPORTED_MODULE_1__["resolveCache"])(mainURL, 60);
document.head.appendChild(scriptElement); // window.onload 설정

window.addEventListener('load', () => {
  // internalPathFunctions 함수 실행
  for (const path in internalPathFunctions) {
    if (path === location.pathname) {
      internalPathFunctions[path]();
    }
  }
}); // 태그에 삽입되지 않는 함수 목록
// GM 기능을 사용하기 위해 유저 스크립트 내부의 함수가 필요

const internalPathFunctions = {
  // 온라인 강의 화면
  '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': () => {
    // 온라인 강의 동영상 다운로드
    const downloadVideo = videoCode => {
      GM.xmlHttpRequest({
        method: 'GET',
        url: 'https://kwcommons.kw.ac.kr/viewer/ssplayer/uniplayer_support/content.php?content_id=' + videoCode,
        onload: function (response) {
          const documentXML = response.responseXML;
          const videoList = []; // 분할된 동영상 등 다양한 상황 처리

          if (documentXML.getElementsByTagName('desktop').length > 0) {
            videoList.push({
              url: documentXML.getElementsByTagName('media_uri')[0].innerHTML,
              type: documentXML.getElementsByTagName('content_type')[0].innerHTML
            });
          } else {
            const mediaURI = documentXML.getElementsByTagName('media_uri')[0].innerHTML;
            const videoNames = documentXML.getElementsByTagName('main_media');
            const videoTypes = documentXML.getElementsByTagName('story_type');

            for (let i = 0; i < videoNames.length; i++) {
              videoList.push({
                url: mediaURI.replace('[MEDIA_FILE]', videoNames[i].innerHTML),
                type: videoTypes[i].innerHTML
              });
            }
          } // 다운로드 버튼 렌더링


          for (let i = 0; i < videoList.length; i++) {
            const videoURL = videoList[i].url;
            const videoType = videoList[i].type === 'video1' ? '동영상' : '오디오';
            const labelElement = document.createElement('label');
            labelElement.innerHTML = `
              <a href="${videoURL}" target="_blank" style="background-color: brown; padding: 10px; text-decoration: none">
                <span style="color: white; font-weight: bold">${videoType} 받기 #${i + 1}</span>
              </a>
            `;
            document.querySelector('.mvtopba > label:last-of-type').after(labelElement);
          }
        }
      });
    }; // 고유 번호를 받을 때까지 대기


    const waitTimer = setInterval(() => {
      const videoCode = document.body.getAttribute('data-video-code');

      if (videoCode) {
        clearInterval(waitTimer);
        downloadVideo(videoCode);
      }
    }, 100); // 일정 시간이 지날 경우 타이머 해제

    setTimeout(() => {
      clearInterval(waitTimer);
    }, 10000);
  }
};

/***/ })
/******/ ]);
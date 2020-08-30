/**
 * 파일 캐시 문제를 해결하기 위한 함수
 * @param duration 갱신 주기 (단위: 초)
 */
export const resolveCache = (url: string, duration: number): string => {
  return url + '?v=' + ((new Date()).getTime() / (duration * 1000)).toFixed(0);
};

/**
 * 의존성을 위한 라이브러리 삽입 함수
 */
export const insertLibrary = (url: string): void => {
  const splited = url.split('.');
  const extension = splited[splited.length - 1];
  let htmlElement: HTMLElement;

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
export const addListenerByTimer = (condition: () => boolean, callback: () => void): void => {
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
/**
 * 페이지 이름: 온라인 강의 화면
 * 페이지 주소: https://klas.kw.ac.kr/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do
 */

export default () => {
  // 단축키 안내 추가
  (() => {
    $('body').append(`
      <div id="modal-keyboard-shortcut" class="modal" style="font-size: 14px">
        <p><kbd>Enter</kbd> <kbd>F</kbd> : <strong>전체 화면 설정 / 해제</strong></p>
        <p><kbd>←</kbd> <kbd>→</kbd> : <strong>10초씩 이동</strong></p>
        <p><kbd>↑</kbd> <kbd>↓</kbd> : <strong>10%씩 볼륨 조절</strong></p>
        <p><kbd>M</kbd> : <strong>음소거 설정 / 해제</strong></p>
        <p><kbd>Backspace</kbd> <kbd>P</kbd> : <strong>페이지 단위로 이동 (이전 페이지)</strong></p>
        <p><kbd>N</kbd> : <strong>페이지 단위로 이동 (다음 페이지)</strong></p>
        <p><kbd>X</kbd> <kbd>C</kbd> : <strong>0.1 단위로 배속 조절</strong></p>
        <p><kbd>Z</kbd> : <strong>1.0 배속으로 초기화</strong></p>
      </div>
    `);

    $('#modal-keyboard-shortcut kbd').css({
      backgroundColor: '#eee',
      border: '1px solid #b4b4b4',
      borderRadius: '3px',
      boxShadow: '0 1px 1px rgba(0, 0, 0, 0.2), 0 2px 0 0 rgba(255, 255, 255, 0.7) inset',
      color: '#333',
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      fontWeight: 'bold',
      padding: '2px 4px',
      position: 'relative',
      top: '-1px'
    });

    $('#modal-keyboard-shortcut strong').css({
      position: 'relative',
      top: '1px'
    });

    $('.mvtopba > label:last-of-type').after(`
      <label>
        <a href="#modal-keyboard-shortcut" rel="modal:open" style="background-color: #8e44ad; padding: 10px; text-decoration: none">
          <span style="color: white; font-weight: bold; margin-left: 4px">단축키 안내</span>
        </a>
      </label>
    `);
  })();

  // 온라인 강의 고유 번호 파싱
  const videoURL = chkOpen.toString().split('https://kwcommons.kw.ac.kr/em/')[1].split('"')[0];
  document.body.setAttribute('data-video-code', videoURL);
};
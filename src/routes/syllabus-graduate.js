/**
 * 페이지 이름: 강의 계획서 조회 - 대학원
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanGdhlStdPage.do
 */

export default () => {
  let waitSearch = false;

  // 검색 함수 업그레이드
  appModule.getSearch = function () {
    if (!this.selectGdhlitem) {
      alert('대학원을 선택해 주세요.');
      return;
    }

    // 서버 부하 문제로 5초간 검색 금지
    if (waitSearch) {
      alert('서버 부하 문제를 방지하기 위해 5초 뒤에 검색이 가능합니다.');
      return;
    }

    // 5초 타이머
    waitSearch = true;
    setTimeout(() => { waitSearch = false; }, 5000);

    // 데이터 요청
    axios.post('LectrePlanDaList.do', this.$data).then((response) => {
      this.GdhlList = response.data;
    });
  };

  // 엔터로 강의 계획서 검색
  $('table:nth-of-type(1) input[type="text"]').keydown(event => {
    if (event.keyCode === 13) appModule.getSearch();
  });

  // 안내 문구 렌더링
  $('table:nth-of-type(1) tr:nth-of-type(4) > td').text('인증 코드를 입력하실 필요가 없습니다.');
};
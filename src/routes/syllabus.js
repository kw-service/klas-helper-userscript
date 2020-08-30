/**
 * 페이지 이름: 강의 계획서 조회 - 학부
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do
 */

export default () => {
  let waitSearch = false;

  // 검색 함수 업그레이드
  appModule.getSearch = function () {
    this.selectYearHakgi = this.selectYear + ',' + this.selecthakgi;

    // 서버 부하 문제로 모든 강의 계획서 검색 금지
    if (
      this.selectRadio === 'all' &&
      this.selectText === '' &&
      this.selectProfsr === '' &&
      this.cmmnGamok === '' &&
      this.selecthakgwa === ''
    ) {
      alert('과목명 또는 담당 교수를 입력하지 않은 경우 반드시 과목이나 학과를 선택하셔야 합니다.');
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
    axios.post('LectrePlanStdList.do', this.$data).then((response) => {
      this.list = response.data;
    });
  };

  // 엔터로 강의 계획서 검색
  $('table:nth-of-type(1) input[type="text"]').keydown(event => {
    if (event.keyCode === 13) appModule.getSearch();
  });

  // 안내 문구 렌더링
  $('table:nth-of-type(1) tr:nth-of-type(5) > td').text('인증 코드를 입력하실 필요가 없습니다.');
};
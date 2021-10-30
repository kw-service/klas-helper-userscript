/**
 * 페이지 이름: 없음 (강의 수강인원 조회 창)
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdNumPopup.do?
 */

export default () => {

  // 스타일링
  $("#appModule > div > div:nth-child(1)").after(`
    <div>
      * Klas-Helper를 이용하시면 인증코드 입력이 필요 없습니다 😉
    <div>
  `);
  $(".lft").children().eq(3).css("display", "none");
  $(".lft").children().eq(3).after(`
    <button type="button" id="custom-search-btn" class="btn2 btn-gray" style="float: right; margin-right: 10px;">조회</button>
  `);
  $(".lft").children().eq(1).css("display", "none");
  $(".lft").children().eq(0).css("display", "none");
  $("#appModule > div > div:nth-child(1)").css("display", "none");
  $(".lft").children().eq(2).css("width", "45%");
  $(".lft").children().eq(4).css("width", "45%");


  // 인증코드 자동 입력 및 제거
  appModule.numText = appModule.randomNum;

  // 조회 버튼 후킹
  // Method 1: 조회 버튼 누를때마다 인증코드 새로 발급해 확인하기
  // 반복해서 누르면 서버 부하가 일어날 가능성이 있어, 우선 주석 처리 했습니다.
  // $(".lft").children().eq(3).bind("click", function () {
  //   appModule.numText = appModule.randomNum;
  // });

  // Method 2: 커스텀 버튼 생성하기
  // 2초마다 1번씩 누를 수 있도록 했습니다.
  $("#custom-search-btn").click(() => {
    axios.post('/std/cps/atnlc/popup/LectrePlanStdCrtNum.do', appModule.$data)
      .then(function (response) {
        if(response.data == null && response.data == ''){
          return false;
        }
        appModule.currentNum =  response.data.currentNum;
        appModule.randomNumber();
        appModule.numText = appModule.randomNum;
        
        // 2초간 해당 버튼 disabled 해놓음.
        $("#custom-search-btn").attr('disabled', true);
        $("#custom-search-btn").addClass('btn-lightgray').removeClass('btn-gray');
        setTimeout(() => {
          $("#custom-search-btn").attr('disabled', false);
          $("#custom-search-btn").addClass('btn-gray').removeClass('btn-lightgray');
        }, 2000);
      });
  });
};
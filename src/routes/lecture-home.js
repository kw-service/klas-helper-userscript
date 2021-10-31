/**
 * 페이지 이름: 강의 종합
 * 페이지 주소: https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do
 */

export default () => {
  // 인증 팝업 무시
  lrnCerti.certiCheck = function (grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun) {
    // console.log(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog, gubun);
    this.grcode = grcode;
    this.subj = subj;
    this.weeklyseq = weeklyseq;
    this.gubun = gubun;
    axios.post('/std/lis/evltn/CertiStdCheck.do', this.$data)
      .then(function () {
        appModule.goViewCntnts(grcode, subj, year, hakgi, bunban, module, lesson, oid, starting, contentsType, weeklyseq, weeklysubseq, width, height, today, sdate, edate, ptype, totalTime, prog);
      }.bind(this));
  };

  // 2분 쿨타임 제거, 강의 숨기기 버튼 생성
  $("p:contains('온라인 강의리스트')").append(`
    <button type="button" class="btn2 btn-learn btn-cooltime">2분 쿨타임 제거</button>
    <button type="button" class="btn2 btn-gray btn-clean">강의 숨기기 On / Off</button>
  `);

  // 2분 쿨타임 제거 버튼에 이벤트 설정
  $('.btn-cooltime').click(() => {
    appModule.getLrnSttus = function () {
      axios.post('/std/lis/evltn/SelectLrnSttusStd.do', this.$data).then(function (response) {
        this.lrnSttus = response.data;

        if (response.data === 'Y' || response.data === 'N') {
          if (ios) {
            $('#viewForm').prop('target', '_blank').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit();
          }
          else {
            let popup = window.open('', 'previewPopup', 'resizable=yes, scrollbars=yes, top=100px, left=100px, height=' + this.height + 'px, width= ' + this.width + 'px');
            $('#viewForm').prop('target', 'previewPopup').prop('action', '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do').submit().prop('target', '');
            popup.focus();
          }
        }
        else if (response.request.responseURL.includes('LoginForm.do')) {
          linkUrl(response.request.responseURL);
        }
      }.bind(this));
    };

    alert('2분 쿨타임이 제거되었습니다.');
  });

  // 강의 숨기기 버튼에 이벤트 설정
  $('.btn-clean').click(() => {
    if (appModule.origin == undefined) {
      appModule.origin = appModule.cntntList;
      let copy = [];
      appModule.cntntList.forEach(item => {
        if (item.prog != '100') copy.push(item);
      });
      appModule.cntntList = copy;
    }
    else {
      appModule.cntntList = appModule.origin;
      appModule.origin = undefined;
    }

    $('.btn-clean').toggleClass('btn-green');
    $('.btn-clean').toggleClass('btn-gray');
  });

  // 과목 변경시 강의 숨기기 초기화
  $("select[name='selectSubj']").change(() => {
    appModule.origin = undefined;
    $('.btn-green').toggleClass('btn-green').toggleClass('btn-gray');
  });
};
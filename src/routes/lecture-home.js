/**
 * 페이지 이름: 강의 종합
 * 페이지 주소: https://klas.kw.ac.kr/std/lis/evltn/LctrumHomeStdPage.do
 */

// 강의 묻고답하기, 강의 공지사항 추가
const addBoard = async() => {
  const selectedSubj = $("input[name='selectedSubj']").val();
  const questionBoardUid = $("a[onclick*='BoardQnaListStdPage.do']").attr("onclick").split("linkUrl('/std/lis/sport/")[1].split("/")[0];
  const selectedYearhakgi = $("input[name='selectedYearhakgi']").val();
  let boardCount = 0;
  let isNew = false;
  const response = await axios.post(`/std/lis/sport/${questionBoardUid}/BoardStdList.do`, {
    "cmd": null,
    "pageInit": true,
    "selectYearhakgi": selectedYearhakgi,
    "selectSubj": selectedSubj,
    "selectChangeYn": "Y",
    "searchCondition": "ALL",
    "searchKeyword": "",
    "currentPage": 0,
  });
  const data = response.data;
  const totalPages = data.page.totalPages;
  const latestWrite = data.list.length > 0 ? new Date(data.list[0].registDt) : new Date(0, 0, 0);
  const today = new Date();
  // 1일 이내의 게시글이 있다면 새로운 게시글이 있다고 알림
  if ((today - latestWrite) < 1000 * 60 * 60 * 24) {
    isNew = true;
  }
  for (let i = 0; i < totalPages; i++) {
    const response = await axios.post(`/std/lis/sport/${questionBoardUid}/BoardStdList.do`, {
      "cmd": null,
      "pageInit": true,
      "selectYearhakgi": selectedYearhakgi,
      "selectSubj": selectedSubj,
      "selectChangeYn": "Y",
      "searchCondition": "ALL",
      "searchKeyword": "",
      "currentPage": i,
    })
    const data = response.data;
    boardCount += data.list.length;
  }
  if ($(".custom-boardcount").length > 0) {
    $(".custom-boardcount").text(boardCount);
  } else {
    $($(".subjectpresent")[0]).append(`
      <li><a href="#" onclick="linkUrl('/std/lis/sport/573f918c23984ae8a88c398051bb1263/BoardQnaListStdPage.do');">강의 묻고답하기${
        isNew ? ` <img v-if="prjctNewCnt > 0" src="/assets/modules/std/images/common/icon-new.png"> ` : ""
      } <!----><span class="oval custom-boardcount">${boardCount}</span></a></li>
    `);
  }
};

// 강의계획서 조회 버튼 추가
const addLecturePlan = async() => {
  const redirectLectureHandler = async() => {
    const selectedSubj = $("input[name='selectedSubj']").val();
    window.open('https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdView.do?selectSubj=' + selectedSubj, '', 'width=1000, height=800, scrollbars=yes, title=강의계획서 조회');
  };
  const lectureElem = $(`<span class="subjectLectureInfo">강의계획서 조회</span>`);
  // set style
  lectureElem.css({
    "margin-left": "15px",
  });
  lectureElem.click(redirectLectureHandler);
  $(".subtitle").append(lectureElem);
};


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
    setTimeout(addBoard, 500);
    
  });

  addLecturePlan();
  setTimeout(addBoard, 500); 
};
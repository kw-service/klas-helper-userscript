/**
 * 페이지 이름: 모든 페이지
 * 페이지 주소: https://klas.kw.ac.kr/*
 * 주의사항 : 이 파일의 스크립트는 klas.kw.ac.kr 도메인의 모든 사이트에 적용되므로 조건을 잘 체크해주세요.
 */

const renewSession = () => {
  // Call extern function
  // The extern function defines in HTML
  sessionExtensionCall();
  return;
}


export default () => {
  // 학번의 학과 번호별로 DB 저장
  const colleageDB = {
    706: { 'colleage': '전자정보공과대학', 'major': '전자공학과', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    707: { 'colleage': '전자정보공과대학', 'major': '전자통신공학과', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    742: { 'colleage': '전자정보공과대학', 'major': '전자융합공학과', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    732: { 'colleage': '전자정보공과대학', 'major': '전기공학과', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    734: { 'colleage': '전자정보공과대학', 'major': '전자재료공학과', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    741: { 'colleage': '전자정보공과대학', 'major': '로봇학부', 'colleageHomepage': "https://ei.kw.ac.kr/", 'majorHomepage': "https://ee.kw.ac.kr/" },
    
    202: { 'colleage': '소프트웨어융합대학', 'major': '컴퓨터정보공학부', 'colleageHomepage': "http://sw.kw.ac.kr/", 'majorHomepage': "http://ce.kw.ac.kr/" },
    203: { 'colleage': '소프트웨어융합대학', 'major': '소프트웨어학부', 'colleageHomepage': "http://sw.kw.ac.kr/", 'majorHomepage': "http://cs.kw.ac.kr/" },
    204: { 'colleage': '소프트웨어융합대학', 'major': '정보융합학부', 'colleageHomepage': "http://sw.kw.ac.kr/", 'majorHomepage': "http://ic.kw.ac.kr/" },

    127: { 'colleage': '공과대학', 'major': '건축학과', 'colleageHomepage': "", 'majorHomepage': "https://www.kwuarchitecture.com/" },
    117: { 'colleage': '공과대학', 'major': '건축공학과', 'colleageHomepage': "", 'majorHomepage': "http://archi.kw.ac.kr/" },
    114: { 'colleage': '공과대학', 'major': '화학공학과', 'colleageHomepage': "", 'majorHomepage': "http://chemng.kw.ac.kr/" },
    116: { 'colleage': '공과대학', 'major': '환경공학과', 'colleageHomepage': "", 'majorHomepage': "http://env.kw.ac.kr/" },

    603: { 'colleage': '자연과학대학', 'major': '수학과', 'colleageHomepage': "", 'majorHomepage': "" },
    610: { 'colleage': '자연과학대학', 'major': '전자바이오물리학과', 'colleageHomepage': "", 'majorHomepage': "" },
    605: { 'colleage': '자연과학대학', 'major': '화학과', 'colleageHomepage': "", 'majorHomepage': "http://chem.kw.ac.kr/" },
    613: { 'colleage': '자연과학대학', 'major': '스포츠융합과학과', 'colleageHomepage': "", 'majorHomepage': "http://sports.kw.ac.kr/" },
    612: { 'colleage': '자연과학대학', 'major': '정보콘텐츠학과', 'colleageHomepage': "", 'majorHomepage': "" },

    304: { 'colleage': '인문사회과학대학', 'major': '국어국문학과', 'colleageHomepage': "http://chss.kw.ac.kr/", 'majorHomepage': "" },
    322: { 'colleage': '인문사회과학대학', 'major': '영어산업학과', 'colleageHomepage': "http://chss.kw.ac.kr/", 'majorHomepage': "https://english.kw.ac.kr/" },
    323: { 'colleage': '인문사회과학대학', 'major': '미디어커뮤니케이션학부', 'colleageHomepage': "http://chss.kw.ac.kr/", 'majorHomepage': "https://www.kwmedia.info/" },
    311: { 'colleage': '인문사회과학대학', 'major': '산업심리학과', 'colleageHomepage': "http://chss.kw.ac.kr/", 'majorHomepage': "http://psy.kw.ac.kr/" },
    321: { 'colleage': '인문사회과학대학', 'major': '동북아문화산업학부', 'colleageHomepage': "http://chss.kw.ac.kr/", 'majorHomepage': "" },

    802: { 'colleage': '정책법학대학', 'major': '행정학과', 'colleageHomepage': "", 'majorHomepage': "http://kwpa.kw.ac.kr/" },
    804: { 'colleage': '정책법학대학', 'major': '국제학부', 'colleageHomepage': "", 'majorHomepage': "https://sjang21.wixsite.com/dois-kw" },
    803: { 'colleage': '정책법학대학', 'major': '법학부', 'colleageHomepage': "", 'majorHomepage': "https://law.kw.ac.kr/" },
    805: { 'colleage': '정책법학대학', 'major': '자산관리학과', 'colleageHomepage': "", 'majorHomepage': "" },

    508: { 'colleage': '경영대학', 'major': '경영학부', 'colleageHomepage': "http://biz.kw.ac.kr/", 'majorHomepage': "https://biz.kw.ac.kr/" },
    510: { 'colleage': '경영대학', 'major': '국제통상학부', 'colleageHomepage': "http://biz.kw.ac.kr/", 'majorHomepage': "https://biz.kw.ac.kr/" },

  }

  // Set interval to renew session
  setInterval(renewSession, 1000 * 60 * 5);
  // Delete session element
  $(".toplogo").css({ "max-width": "30%" })
  $(".navtxt").css({ "max-width": "70%", "min-width": "70%" })
  $("#remainingCounter").after($(`<span style="">자동 세션 갱신 중</span>`))
  $("#remainingCounter").remove();

  $(".fa-retweet").parent().remove();

  const topMenu = $(".topmenutxt");
  
  if (topMenu) {
    const myColleageNumber = parseInt($('a[href*="/std/ads/admst/MyInfoStdPage.do"]').text().split('(')[1].slice(4, 7))
    const myColleageDB = colleageDB[myColleageNumber]
    const classInfoUl = topMenu.children().eq(1).find('.depth02ul');

    const newLi = $(`<li>
      <a href="#" onclick="linkUrl('');">홈페이지 바로가기</a>                                                            
      <ul class="depth03ul">
        <li>
          <a href="#" onclick="linkWinOpen('https://www.kw.ac.kr/ko/index.jsp');">광운대학교 홈페이지</a>                                                            
        </li>
        <li>
          <a href="#" onclick="linkWinOpen('https://www.kw.ac.kr/ko/life/notice.jsp');">광운대학교 공지사항</a>                                                            
        </li>
        ${myColleageDB["colleageHomepage"] ?
          `<li>
            <a href="#" onclick="linkWinOpen('${myColleageDB["colleageHomepage"]}');">${myColleageDB["colleage"]} 홈페이지</a> 
           <li>
          ` : ``}
        ${myColleageDB["majorHomepage"] ?
        `<li>
            <a href="#" onclick="linkWinOpen('${myColleageDB["majorHomepage"]}');">${myColleageDB["major"]} 홈페이지</a> 
           <li>
          ` : ``}
      </ul>
    </li>`);
    classInfoUl.append(newLi);
  }
};
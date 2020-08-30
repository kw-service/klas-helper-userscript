/**
 * 페이지 이름: 석차 조회
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do
 */

export default () => {
  // 이전 석차 내역 불러오기 버튼 생성
  $('.tablegw').after(`
    <div style="margin-top: 10px">
      <button type="button" id="rank-button" class="btn2 btn-learn">이전 석차 내역 불러오기</button>
    </div>
  `);

  // 이전 석차 내역 불러오기 버튼에 이벤트 설정
  $('#rank-button').click(async () => {
    const promises = [];
    let year = appModule.$data.selectYear;
    let semester = appModule.$data.selectHakgi;
    const admissionYear = parseInt(appModule.$data.info[0].hakbun.substring(0, 4));

    // 버튼 숨기기
    $('#rank-button').hide();

    // 석차 정보를 가져올 주소 설정
    while (true) {
      if (semester === '2') {
        semester = '1';
      }
      else {
        year--;
        semester = '2';
      }

      if (year < admissionYear) {
        break;
      }

      const postDatas = {
        selectYearhakgi: year + ',' + semester,
        selectChangeYn: 'Y'
      };

      promises.push(axios.post('/std/cps/inqire/StandStdList.do', postDatas));
    }

    // 석차 조회
    await axios.all(promises).then((results) => {
      for (const response of results) {
        if (response.data) {
          $('table.AType > tbody').append(`
            <tr>
              <td>${response.data.thisYear}</td>
              <td>${response.data.hakgi}</td>
              <td>${response.data.applyHakjum}</td>
              <td>${response.data.applySum}</td>
              <td>${response.data.applyPoint}</td>
              <td>${response.data.pcnt}</td>
              <td>${response.data.classOrder} / ${response.data.manNum}</td>
              <td>${response.data.warningOpt || ''}</td>
            </tr>
          `);
        }
      }
    });
  });
};
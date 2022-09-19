/**
 * 페이지 이름: 수업시간표
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/TimetableStdPage.do
 */
const lectureStartTime = {
  0: '08:00', 1: '09:00', 2: '10:30', 3: '12:00', 4: '13:30',
  5: '15:00', 6: '16:30', 7: '18:00', 8: '18:50', 9: '19:40',
  10: '00:30', 11: '21:20'
};

const lectureEndTime = {
  0: '08:50', 1: '10:15', 2: '11:45', 3: '13:15', 4: '14:45',
  5: '16:15', 6: '17:45', 7: '18:45', 8: '19:35', 9: '20:25',
  10: '21:15', 11: '22:05'
};

const handleTimeTable = () => {
  const timeTable = appModule.$data.timeTableList;
  const lectureList = [];

  // 원본 소스에서 실제 그려지는 시간표를 파싱합니다
  for (const item of timeTable) {
    for (let i = 1; i < 10; i++) {
      const subjNm = item[`wtSubjNm_${i}`];
      const subjPrintSeq = item[`wtSubjPrintSeq_${i}`];
      const startTime = item[`wtTime`]; // 시작시간
      const spanTime = item[`wtSpan_${i}`]; // 강의시간
      if (subjNm !== undefined) {
        lectureList.push({
          subjNm,
          subjPrintSeq,
          startTime,
          spanTime
        });
      }
    }
  }
  
  // 파싱한 데이터를 통해 표에 그려진 값을 찾아가고, 거기에 시간을 추가합니다.
  for (const item of lectureList) {
    const subjPrintSeq = item.subjPrintSeq;
    const startTime = item.startTime;
    const spanTime = item.spanTime;
    const className = '.namecol' + String(subjPrintSeq).padStart(2,'0');
  
    $(className).each(function(idx, element) {
      const endTime = startTime + parseInt($(element).attr('class').split('lessontime')[1]) - 1;
      const currentLectureTime = parseInt($(element).closest('tr').eq(0).find('.time').eq(0).text());
      // 이미 시간이 그려진 강의이거나, 해당되는 강의 시간이 아니라면 그냥 넘어갑니다.
      if ($(element).find("span").length > 0 || currentLectureTime !== startTime) {
        // $(element).find("span").remove();
        return;
      }
      
      if (currentLectureTime !== 30) {
        $(element).append(
          `<span class="time">${lectureStartTime[currentLectureTime]} ~ ${lectureEndTime[currentLectureTime+spanTime-1]}</span>`
        );
      }
    });
        
  }
};

export default () => { setTimeout(handleTimeTable, 700); };
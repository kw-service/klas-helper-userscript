/**
 * 페이지 이름: 수업시간표
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/TimetableStdPage.do
 */
const lectureTime = {
    0: '08:00', 1: '09:00', 2: '10:30', 3: '12:00', 4: '13:30',
    5: '15:00', 6: '16:30', 7: '18:00', 8: '18:50', 9: '19:40',
    10: '00:30', 11: '21:20'
};
const handleTimeTable = () => {
    const timeTable = appModule.$data.timeTableList;
    const lectureList = []

    // 원본 소스에서 실제 그려지는 시간표를 파싱합니다
    for (const item of timeTable) {
        for (let i = 1; i < 10; i++) {
            const subjNm = item[`wtSubjNm_${i}`]
            const subjPrintSeq = item[`wtSubjPrintSeq_${i}`]
            const startTime = item[`wtTime`] // 시작시간
            if (subjNm !== undefined) {
                lectureList.push({
                    subjNm,
                    subjPrintSeq,
                    startTime
                })
            }
        }
    }

    // 파싱한 데이터를 통해 표에 그려진 값을 찾아가고, 거기에 시간을 추가합니다.
    for (const item of lectureList) {
        const subjPrintSeq = item.subjPrintSeq
        const startTime = item.startTime
        const className = '.namecol' + String(subjPrintSeq).padStart(2,'0');
        const endTime = startTime + parseInt($(className).attr('class').split('lessontime')[1]);
        const currentLectureTime = parseInt($(className).closest('tr').eq(0).find('.time').eq(0).text());

        // 이미 시간이 그려진 강의이거나, 해당되는 강의 시간이 아니라면 그냥 넘어갑니다.
        if ($(className).find("span").length > 0 || currentLectureTime !== startTime) {
            continue
        }
        $(className).append(
            `<span class="time">${lectureTime[startTime]} ~ ${lectureTime[endTime]}</span>`
        );
    }
};

export default () => { setTimeout(handleTimeTable, 1000) };
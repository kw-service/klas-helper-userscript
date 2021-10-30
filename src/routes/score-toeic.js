/**
 * 페이지 이름: 어학 성적 조회
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/inqire/ToeicStdPage.do
 */

import {
  addListenerByTimer
} from '../utils/dom';

const handleCalculateToeic = () => {
  const toeicData = [];
  const topelData = [];
  const topikData = [];
  const toeicSpeakingData = [];
  const opicData = [];
  const ieltsData = [];
  const tepsData = [];
  const languageData = [
    { title: "TOEIC", borderColor:'#EB373D', data: toeicData, meta:["score1", "score2"] },
    { title: "TOPEL", borderColor:'#22F0A9', data: topelData, meta:["score3"] },
    { title: "TOPIK", borderColor:'#117FFF', data: topikData, meta:["scoreD"] },
    { title: "TOEIC Speaking", borderColor:'#813BEB', data: toeicSpeakingData, meta:["score4"] },
    { title: "OPIC", borderColor:'#FF2E92', data: opicData, meta:["score5"] },
    { title: "IELTS", borderColor:'#37F05C', data: ieltsData, meta:["score6"] },
    { title: "TEPS", borderColor:'#FF9864', data: tepsData, meta:["score7"] }
  ];
  const scoreDatas = appModule.$data.list;
  const chartSettings = {
    borderWidth: 1,
    fill: false,
    lineTension: 0,
    pointBackgroundColor: 'white',
    pointRadius: 5
  };

  // 평점 계산을 위한 데이터 생성
  for (let i = scoreDatas.length - 1; i >= 0; i--) {
    const scoreData = scoreDatas[i];
    for (const language of languageData) {
      for (const metadata of language.meta) {
        if (scoreData[metadata] && scoreData[metadata] !== "-") {
          language.data.push({
            testDate: scoreData.testDate,
            score: scoreData[metadata],
          });
        }
      }
    }
  }

  // 차트 렌더링
  for (let i = languageData.length - 1; i >= 0; i--) {
    const languageItem = languageData[i];
    if (languageItem.data.length < 2) {
      continue;
    }
    $('.AType').after(`
      <div style="margin-bottom: 25px">
        <canvas id="score-chart-${languageItem.title}"></canvas>
      </div>
    `);

    const ctx = document.getElementById(`score-chart-${languageItem.title}`);
    ctx.height = 80;

    new Chart(ctx, {
      type: "line",
      data: {
        labels: languageItem.data.map(semester => semester.testDate),
        datasets: [{
          label: languageItem.title,
          data: languageItem.data.map(semester => semester.score),
          borderColor: languageItem.borderColor,
          ...chartSettings
        }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
      }
    });
  }
};

export default () => {
  addListenerByTimer(() => appModule?.$data.list.length > 0, handleCalculateToeic);
};
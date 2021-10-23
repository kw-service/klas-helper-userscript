/**
 * 페이지 이름: 어학 성적 조회
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/inqire/ToeicStdPage.do
 */

import {
  addListenerByTimer
} from '../utils/dom';
import {
  calculateGPA
} from '../utils/score';

const handleCalculateToeic = () => {
  const toeicData = [];
  const topelData = [];
  const topikData = [];
  const toeicSpeakingData = [];
  const opicData = [];
  const ieltsData = [];
  const tepsData = [];
  const languageData = [
    { title: "TOEIC", borderColor:'#EB373D', data: toeicData },
    { title: "TOPEL", borderColor:'#22F0A9', data: topelData },
    { title: "TOPIK", borderColor:'#117FFF', data: topikData },
    { title: "TOEIC Speaking", borderColor:'#813BEB', data: toeicSpeakingData },
    { title: "OPIC", borderColor:'#FF2E92', data: opicData },
    { title: "IELTS", borderColor:'#37F05C', data: ieltsData },
    { title: "TEPS", borderColor:'#FF9864', data: tepsData }
  ];
  const scoreDatas = appModule.$data.list;
  const chartSettings = {
    borderWidth: 1,
    fill: false,
    lineTension: 0,
    pointBackgroundColor: 'white',
    pointRadius: 5
  }

  // 평점 계산을 위한 데이터 생성
  for (let i = scoreDatas.length - 1; i >= 0; i--) {
    const scoreData = scoreDatas[i];
    if (scoreData.score1 && scoreData.score1 !== "-") {
      toeicData.push({
        testDate: scoreData.testDate,
        score: scoreData.score1,
      })
    }
    if (scoreData.score2 && scoreData.score2 !== "-") {
      toeicData.push({
        testDate: scoreData.testDate,
        score: scoreData.score2,
      })
    }
    if (scoreData.score3 && scoreData.score3 !== "-") {
      topelData.push({
        testDate: scoreData.testDate,
        score: scoreData.score3,
      })
    }
    if (scoreData.score4 && scoreData.score4 !== "-") {
      toeicSpeakingData.push({
        testDate: scoreData.testDate,
        score: scoreData.score4,
      })
    }
    if (scoreData.score5 && scoreData.score5 !== "-") {
      opicData.push({
        testDate: scoreData.testDate,
        score: scoreData.score5,
      })
    }
    if (scoreData.score6 && scoreData.score6 !== "-") {
      ieltsData.push({
        testDate: scoreData.testDate,
        score: scoreData.score6,
      })
    }
    if (scoreData.score7 && scoreData.score7 !== "-") {
      ieltsData.push({
        testDate: scoreData.testDate,
        score: scoreData.score7,
      })
    }
    if (scoreData.scoreD && scoreData.scoreD !== "-") {
      topikData.push({
        testDate: scoreData.testDate,
        score: scoreData.scoreD,
      })
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
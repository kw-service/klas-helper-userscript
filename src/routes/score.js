/**
 * 페이지 이름: 수강 및 성적 조회
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreStdPage.do
 */

import {
  addListenerByTimer
} from '../utils/dom';
import {
  calculateGPA
} from '../utils/score';

const handleCalculateGPA = () => {
  const semesters = [];
  const scoreDatas = appModule.$data.sungjuk;

  // 평점 계산을 위한 데이터 생성
  for (let i = scoreDatas.length - 1; i >= 0; i--) {
    semesters.push({
      year: parseInt(scoreDatas[i].thisYear, 10),
      semester: parseInt(scoreDatas[i].hakgi, 10),
      lectures: scoreDatas[i].sungjukList.map((value) => ({
        name: value.gwamokKname,
        classification: value.codeName1.trim(),
        credit: parseInt(value.hakjumNum, 10),
        grade: value.getGrade.trim().split(' ')[0]
      }))
    });
  }

  // 평점 계산
  const synthesisGPAs = calculateGPA(semesters);

  // 표 렌더링
  $('#hakbu > table:nth-of-type(4)').before(`
    <table id="synthesis-score-table" class="tablegw" style="margin: 25px 0">
      <colgroup>
        <col width="25%">
        <col width="15%">
        <col width="10%">
        <col width="10%">
        <col width="10%">
        <col width="10%">
        <col width="10%">
        <col width="10%">
      </colgroup>
      <thead>
        <tr>
          <th rowspan="2">학기</th>
          <th rowspan="2">취득 학점</th>
          <th colspan="2">전공 평점</th>
          <th colspan="2">전공 외 평점</th>
          <th colspan="2">평균 평점</th>
        </tr>
        <tr>
          <th>F 포함</th>
          <th>미포함</th>
          <th>F 포함</th>
          <th>미포함</th>
          <th>F 포함</th>
          <th>미포함</th>
        </tr>
      </thead>
      <tbody>
        ${synthesisGPAs.map((value) => `
          <tr style="${value.name === '전체 학기' ? 'font-weight: bold' : ''}">
            <td>${value.name}</td>
            <td>${value.credit}</td>
            <td>${value.majorGPA.includeF}</td>
            <td>${value.majorGPA.excludeF}</td>
            <td>${value.nonMajorGPA.excludeF}</td>
            <td>${value.nonMajorGPA.excludeF}</td>
            <td>${value.averageGPA.excludeF}</td>
            <td>${value.averageGPA.excludeF}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `);

  // 차트 렌더링을 위한 데이터 재구성
  synthesisGPAs.pop();

  // 차트 렌더링
  if (synthesisGPAs.length >= 2) {
    $('#synthesis-score-table').after(`
      <div style="margin-bottom: 25px">
        <canvas id="synthesis-score-chart"></canvas>
      </div>
    `);

    const ctx = document.getElementById('synthesis-score-chart');
    ctx.height = 80;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: synthesisGPAs.map(value => value.name.split(' ')),
        datasets: [{
          label: '전공 평점',
          data: synthesisGPAs.map(value => value.majorGPA.includeF),
          borderColor: '#e74c3c',
          borderWidth: 1,
          fill: false,
          lineTension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5
        }, {
          label: '전공 외 평점',
          data: synthesisGPAs.map(value => value.nonMajorGPA.includeF),
          borderColor: '#2980b9',
          borderWidth: 1,
          fill: false,
          lineTension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5
        }, {
          label: '평균 평점',
          data: synthesisGPAs.map(value => value.averageGPA.includeF),
          borderColor: '#bdc3c7',
          borderWidth: 2,
          fill: false,
          lineTension: 0,
          pointBackgroundColor: 'white',
          pointRadius: 5
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              suggestedMin: 2,
              suggestedMax: 4.5,
              stepSite: 0.5
            }
          }]
        },
        tooltips: {
          callbacks: {
            title: (tooltipItem) => {
              const xLabel = tooltipItem[0].xLabel;
              return xLabel[0] + ' ' + xLabel[1];
            }
          }
        }
      }
    });
  }
};

export default () => {
  addListenerByTimer(() => appModule?.$data.sungjuk.length > 0, handleCalculateGPA);
};
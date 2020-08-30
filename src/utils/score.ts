import {
  floorFixed
} from './math';

export type Classification = '전필' | '전선' | '기필' | '기선' | '교필' | '교선' | '일선';
export type Grade = 'A+' | 'A0' | 'B+' | 'B0' | 'C+' | 'C0' | 'D+' | 'D0' | 'F' | 'P' | 'NP';

export interface Semester {
  year: number;
  semester: number;
  lectures: Lecture[];
}

export interface Lecture {
  name?: string;
  classification: Classification;
  credit: number;
  grade: Grade;
}

export interface SynthesisGPA {
  name: string;
  credit: string;
  majorGPA: GPA;
  nonMajorGPA: GPA;
  averageGPA: GPA;
}

export interface GPA {
  includeF: string;
  excludeF: string;
}

export const checkMajor = (classification: Classification): boolean => ['전필', '전선'].includes(classification);
export const checkPass = (grade: Grade): boolean => ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'P'].includes(grade);
export const checkIncludeF = (grade: Grade): boolean => ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'NP'].includes(grade);
export const checkExcludeF = (grade: Grade): boolean => ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0'].includes(grade);

export const gradeToScore = (grade: Grade): number => {
  switch (grade) {
    case 'A+': return 4.5;
    case 'A0': return 4.0;
    case 'B+': return 3.5;
    case 'B0': return 3.0;
    case 'C+': return 2.5;
    case 'C0': return 2.0;
    case 'D+': return 1.5;
    case 'D0': return 1.0;
    case 'F':  return 0;
    case 'P':  return 0;
    case 'NP': return 0;
    default: throw new Error('`grade` is unexpected value.');
  }
};

export const calculateGPA = (semesters: Semester[]): SynthesisGPA[] => {
  const synthesisGPAs: SynthesisGPA[] = [];
  const averageScoreDatas: number[] = Array(13).fill(0);

  const pushToSynthesisGPAs = (name: string, scoreDatas: number[]): void => {
    const stringScoreDatas = scoreDatas.map((value, index) =>
      value ? (index === 0 ? value.toString() : floorFixed(value)) : '-'
    );

    synthesisGPAs.push({
      name: name,
      credit: stringScoreDatas[0],
      majorGPA: {
        includeF: stringScoreDatas[1],
        excludeF: stringScoreDatas[3]
      },
      nonMajorGPA: {
        includeF: stringScoreDatas[5],
        excludeF: stringScoreDatas[7]
      },
      averageGPA: {
        includeF: stringScoreDatas[9],
        excludeF: stringScoreDatas[11]
      }
    });
  };

  for (const semester of semesters) {
    // 계절 학기의 경우 계산에서 제외
    if (semester.semester > 2) {
      averageScoreDatas[0] += semester.lectures.reduce((previous, current) => previous + (checkPass(current.grade) ? current.credit : 0), 0);
      continue;
    }

    const scoreDatas = semester.lectures.reduce((previous: number[], current) => {
      const classification = current.classification;
      const credit = current.credit;
      const grade = current.grade;

      const isMajor = checkMajor(classification);
      const isPass = checkPass(grade);
      const isIncludeF = checkIncludeF(grade);
      const isExcludeF = checkExcludeF(grade);

      previous[0] += isPass ? credit : 0;                                         // 취득 학점
      previous[1] += isMajor && isIncludeF ? gradeToScore(grade) * credit : 0;    // 전공 총점 (F 포함)
      previous[2] += isMajor && isIncludeF ? credit : 0;                          // 전공 취득 학점 (F 포함)
      previous[3] += isMajor && isExcludeF ? gradeToScore(grade) * credit : 0;    // 전공 총점 (F 미포함)
      previous[4] += isMajor && isExcludeF ? credit : 0;                          // 전공 취득 학점 (F 미포함)
      previous[5] += !isMajor && isIncludeF ? gradeToScore(grade) * credit : 0;   // 전공 외 총점 (F 포함)
      previous[6] += !isMajor && isIncludeF ? credit : 0;                         // 전공 외 취득 학점 (F 포함)
      previous[7] += !isMajor && isExcludeF ? gradeToScore(grade) * credit : 0;   // 전공 외 총점 (F 미포함)
      previous[8] += !isMajor && isExcludeF ? credit : 0;                         // 전공 외 취득 학점 (F 미포함)
      previous[9] += isIncludeF ? gradeToScore(grade) * credit : 0;               // 전체 총점 (F 포함)
      previous[10] += isIncludeF ? credit : 0;                                    // 전체 취득 학점 (F 포함)
      previous[11] += isExcludeF ? gradeToScore(grade) * credit : 0;              // 전체 총점 (F 미포함)
      previous[12] += isExcludeF ? credit : 0;                                    // 전체 취득 학점 (F 미포함)

      return previous;
    }, Array(13).fill(0));

    for (let i = 0; i < averageScoreDatas.length; i++) {
      averageScoreDatas[i] += scoreDatas[i];
    }

    // 평점 계산
    for (let i = 1; i < scoreDatas.length; i += 2) {
      scoreDatas[i] = scoreDatas[i + 1] > 0 ? scoreDatas[i] / scoreDatas[i + 1] : 0;
    }

    pushToSynthesisGPAs(`${semester.year}학년도 ${semester.semester}학기`, scoreDatas);
  }

  // 전체 학기 평점 계산
  for (let i = 1; i < averageScoreDatas.length; i += 2) {
    averageScoreDatas[i] = averageScoreDatas[i + 1] > 0 ? averageScoreDatas[i] / averageScoreDatas[i + 1] : 0;
  }

  pushToSynthesisGPAs('전체 학기', averageScoreDatas);
  return synthesisGPAs;
};
import handleHome from './home';
import handleSyllabus from './syllabus';
import handleSyllabusGraduate from './syllabus-graduate';
import handleScore from './score';
import handleRank from './rank';
import handleLectureHome from './lecture-home';
import handleEvaluation from './evaluation';
import handleOnlineLecture from './online-lecture';
import handleTakeLecture from './take-lecture';
import handleLenturePlan from './lecture-plan-std';
import handleCalculateToeic from './score-toeic';
import handleTimeTable from './timetable';
import handleRootHomepage from './root';
import handleLogin from './login';
export default {
  '/std/cmn/frame/Frame.do': handleHome,
  '/std/cps/atnlc/LectrePlanStdPage.do': handleSyllabus,
  '/std/cps/atnlc/LectrePlanGdhlStdPage.do': handleSyllabusGraduate,
  '/std/cps/inqire/AtnlcScreStdPage.do': handleScore,
  '/std/cps/inqire/StandStdPage.do': handleRank,
  '/std/lis/evltn/LctrumHomeStdPage.do': handleLectureHome,
  '/std/cps/inqire/LctreEvlViewStdPage.do': handleEvaluation,
  '/std/lis/evltn/OnlineCntntsStdPage.do': handleOnlineLecture,
  '/spv/lis/lctre/viewer/LctreCntntsViewSpvPage.do': handleTakeLecture,
  '/std/cps/atnlc/popup/LectrePlanStdNumPopup.do': handleLenturePlan,
  '/std/cps/inqire/ToeicStdPage.do': handleCalculateToeic,
  '/std/cps/atnlc/TimetableStdPage.do': handleTimeTable,
  '/usr/cmn/login/LoginForm.do': handleLogin,
  '*': handleRootHomepage
};
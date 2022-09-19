/**
 * 페이지 이름: 광운대학교 로그인 페이지
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/atnlc/popup/LectrePlanStdNumPopup.do?
 */

const handleCapsLock = () => {
  // Capslock 키를 눌렀을 때 경고 메시지 출력
  console.log("load");
  const password = $('#loginPwd');
  const message = $("<span style='display: block; text-align: left; color: red;'> </span>");

  password[0].addEventListener('keyup', function (e) {
      if (e.getModifierState('CapsLock')) {
          message.text("CapsLock이 켜져있습니다.");
      } else {
          message.text("");
      }
  });
  $(".form-group:eq(1)").after(message);
};

export default () => {
  handleCapsLock();
};
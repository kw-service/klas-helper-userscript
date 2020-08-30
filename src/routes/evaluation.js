/**
 * 페이지 이름: 수업 평가
 * 페이지 주소: https://klas.kw.ac.kr/std/cps/inqire/LctreEvlViewStdPage.do
 */

export default () => {
  // 일괄 선택 기능
  $('.tablegw').before(`
    <div style="border: 1px solid #ddd; margin: 20px 0 35px 0">
      <div style="background-color: #d3e9f8; border-bottom: 1px solid #ddd; font-weight: bold; padding: 5px; text-align: center">일괄 선택 기능</div>
      <div style="overflow: hidden; padding: 10px 0; text-align: center">
        <div style="float: left; width: 25%">
          <input type="radio" name="auto" id="auto-2">
          <label for="auto-2" style="margin: 0">그렇지 않다</label>
        </div>
        <div style="float: left; width: 25%">
          <input type="radio" name="auto" id="auto-3">
          <label for="auto-3" style="margin: 0">보통이다</label>
        </div>
        <div style="float: left; width: 25%">
          <input type="radio" name="auto" id="auto-4">
          <label for="auto-4" style="margin: 0">그렇다</label>
        </div>
        <div style="float: left; width: 25%">
          <input type="radio" name="auto" id="auto-5">
          <label for="auto-5" style="margin: 0">정말 그렇다</label>
        </div>
      </div>
    </div>
  `);

  // 일괄 선택 기능에 이벤트 설정
  $('input[name="auto"]').change(function () {
    let value = parseInt(this.id.split('-')[1]);

    $(`.tablegw input[value="${value}"]`).each(function () {
      appModule[this.name] = value;
      appModule.checkValue(this.name);
    });
  });
};
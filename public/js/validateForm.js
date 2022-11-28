/**
 * 부트스트랩용 코드. 클라이언트 측에서 유효하지 않은 필드 입력이 있는 경우 폼 제출을 비활성화하고 사용자 정의 피드백 메시지를 출력하기 위한 자바스크립트.
 * novalidate 속성을 지정한 form에서 submit할 경우 해당 form을 아래 부트스트랩 자바스크립트에서 가로채간다 
 *  */  
(() => {
  "use strict";

  // 사용자 정의 validation을 적용시키고 싶은 form을 class 선택자로 가져옴.
  const forms = document.querySelectorAll(".needs-validation");

  // 폼 요소들을 순회하며 유효성 검사
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
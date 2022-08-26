// 내장 Error 클래스를 확장한 사용자 정의 에러 클래스
class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

module.exports = ExpressError;
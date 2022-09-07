// async 함수 에러 처리를 위한 래퍼 함수
// 사용이유 : 비동기로 동작하는 몽구스 쿼리를 동기적으로 처리하기 위해 라우트 핸들러에 async 함수 사용한다. 
// async 함수의 내부에서 일일히 try/catch로 에러를 처리하는 것보다 덜 번거롭고 관리하기 쉽도록
// 프로미스 후속 처리 메서드로 에러를 처리해주기 위해 async 함수를 호출하는 함수를 정의한다.
// (async 함수는 에러 발생시 내부에서 try/catch로 에러 처리를 해주지 않은 경우 에러를 reject한 프로미스를 반환한다.)
const asyncWrapper = fn => {
  return function (req, res, next) {
      fn(req, res, next).catch(err => next(err));
  };
};

module.exports = asyncWrapper;
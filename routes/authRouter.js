const express = require('express');
const router = express.Router();
const passport = require('passport');
const user = require('../controllers/authControl');

router.route('/signup')
  .get(user.renderSignup) // GET 회원가입 페이지
  .post(user.signup); // POST 회원가입

// GET 로그인 페이지
router.route('/login')
  .get(user.login) // GET 로그인 페이지
  .post(
    // POST 로그인
    // ↓ failureFlash: true일 경우 인증 에러시 플래시 메시지가 저장되는데 어떻게 내가만든 error 템플릿에 자동으로 출력이 되는가 확인해본 결과
    // => 사용자가 입력한 메시지가 있다면 해당 메시지가, failureFlash 값이 boolean 이라면 기본 메시지가 키 값'error'(req.flash('error')) 저장된다.
    // https://github.com/jaredhanson/passport  /blob/master/lib/middleware/authenticate.js 124번줄 참조
    // 그렇다면 req.flash는 connect-flash를 로드해야 사용 가능했는데, connect-flash와 passport의 관계는..?
    // => express 3.x에서 req.flash()가 제거됨. 따라서 3.x 이후 버전에선 connect-flash 모듈을 사용해줘야 플래시 메시지 옵션을 사용할 수 있다.
    passport.authenticate('local', {
      failureRedirect: '/users/login',
      failureFlash: '아이디 혹은 비밀번호가 다릅니다.',
      keepSessionInfo: true, // ※ 이 옵션 기본 값이 false여서 req.session.returnTo가 리셋 됨. 그래서 원래 페이지로 redirect가 안됐던 것.
    }),
    user.successLogin
  );

// 로그아웃
router.get('/logout', user.logout);

// 아이디 중복확인 라우터 하나 해야될듯

module.exports = router;

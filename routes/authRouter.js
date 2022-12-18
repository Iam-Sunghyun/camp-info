const express = require('express');
const router = express.Router();
const passport = require('passport')
// const catchAsyncError = require('../utils/catchAsyncError');
const User = require('../models/userModel');


// GET 회원가입 페이지
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// POST 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // email 값이 중복되면 mongodb에서 아래와 같은 error 발생시킨다
    // MongoServerError: E11000 duplicate key error collection
    const user = await User.register(new User({ username, email }), password);   // passport-local-mongoose 모델 static 메서드, username 중복 시 에러 발생시킨다
    // passport 메서드로 로그인 세션 생성(회원가입 후 자동 로그인)
    req.login(user, (err) => {
      if (err) return next(err);
      req.flash('success', '회원가입 성공!');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', '중복된 아이디입니다.');
    console.log(e)
    res.redirect('/users/signup');
  }
});

// GET 로그인 페이지
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// POST 로그인 
router.post('/login',
  // ↓ failureFlash: true일 경우 인증 에러시 플래시 메시지가 저장되는데 어떻게 내가만든 error 템플릿에 자동으로 출력이 되는가 확인해본 결과
  // => 사용자가 입력한 메시지가 있다면 해당 메시지가, failureFlash 값이 boolean 이라면 기본 메시지가 키 값'error'(req.flash('error')) 저장된다.
  // https://github.com/jaredhanson/passport  /blob/master/lib/middleware/authenticate.js 124번줄 참조
  // 그렇다면 req.flash는 connect-flash를 로드해야 사용 가능했는데, connect-flash와 passport의 관계는..?
  // => express 3.x에서 req.flash()가 제거됨. 따라서 3.x 이후 버전에선 connect-flash 모듈을 사용해줘야 플래시 메시지 옵션을 사용할 수 있다.
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: '아이디 혹은 비밀번호가 다릅니다.' }),
  (req, res) => {
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    req.flash('success', `${req.body.username}님 환영합니다!`);
    res.redirect(redirectUrl);
  }
);

// 로그아웃
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/campgrounds');
  });
})

// 아이디 중복확인 라우터 하나 해야될듯


module.exports = router;
const express = require('express');
const router = express.Router();
const passport = require('passport')
const catchAsyncError = require('../utils/catchAsyncError');
const User = require('../models/userModel');

// const validateUser = (req, res, next) => {
//   /** 
//    * 요청 body 데이터가 스키마에 맞는지 체크
//    * 정의한 스키마 유효성 검사에 통과하면 error에는 undefined가 할당되고
//    * 통과하지 못하면 에러 정보가 담긴 ValidationError 객체가 할당 됨
//    * joi 모듈 - https://joi.dev/api/?v=17.6.0#introduction
//    */
//   const { error } = campgroundSchema.validate(req.body);

//   if (error) {
//       // error 객체 details 프로퍼티의 모든 message 값을 가져와 커스텀 에러 클래스에 전달한다.
//       const msg = error.details.map(el => el.message).join(',');
//       throw new ExpressError(msg, 400);
//   } else {
//       next();
//   }
// };

// GET 회원가입 페이지
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// POST 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // email값이 중복되면 mongodb에서 아래와 같은 error 발생시킨다.. 흠
    // MongoServerError: E11000 duplicate key error collection
    await User.register(new User({ username, email }), password);   // passport-local-mongoose 모델 static 메서드
    req.flash('success', '회원가입 성공!');
    res.redirect('/campgrounds');
  } catch (e) {
    req.flash('error', e.message);
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
  // => req.flash('error')에 사용자가 입력한 failureFlash 메시지 혹은 기본 메시지가 저장되어 req.flash('error')로 참조 가능한 것.
  // https://github.com/jaredhanson/passport/blob/master/lib/middleware/authenticate.js 124번줄 참조
  // 그렇다면 req.flash는 connect-flash를 로드해야 사용 가능했는데, connect-flash와 passport의 관계는..?
  // => express 3.x에서 req.flash()가 제거됨. 따라서 connect-flash 모듈을 사용해줘야 플래시 메시지 옵션을 사용할 수 있다.
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: true }),
  (req, res) => {
    req.flash('success', `${req.body.username}님 환영합니다!`);
    res.redirect('/campgrounds');
  }
);

// 아이디 중복확인 라우터 하나 해야될듯


module.exports = router;
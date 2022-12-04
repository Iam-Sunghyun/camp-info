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
router.post('/signup', catchAsyncError(async (req, res) => {
  // passport-local-mongoose 모델 static 메서드
  await User.register(new User({ username: req.body.username }, req.body.password));
  res.redirect('/users/login');
}));

// GET 로그인 페이지
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// POST 로그인 
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  catchAsyncError(async (req, res) => {
  // await User.authenticate()(req.body.username, req.body.password); 이 방법도 가능한듯
}));

// 아이디 중복확인 라우터 하나 해야될듯


module.exports = router;
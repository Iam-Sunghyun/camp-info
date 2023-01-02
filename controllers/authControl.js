const User = require('../models/userModel');

module.exports.renderSignup = (req, res) => {
  res.render('auth/signup');
};

module.exports.signup = async (req, res) => {
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
};

module.exports.login = (req, res, next) => {
  if (req.isAuthenticated()) {
    req.flash('error', '로그인 상태입니다.');
    res.redirect('/campgrounds');
  }
  res.render('auth/login');
};

module.exports.successLogin = (req, res) => {
  const redirectUrl = req.session.returnTo || '/campgrounds'
  delete req.session.returnTo;
  req.flash('success', `${req.body.username}님 환영합니다!`);
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/campgrounds');
  });
};
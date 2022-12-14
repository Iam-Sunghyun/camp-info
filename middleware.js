// 로그인 확인용 미들웨어
module.exports = (req, res, next) => {
  // passport.authenticate() 성공 후 redirect 했을 시 req.user 유지가 안되는 문제
  console.log(req.user)
  if (!req.user) {
    req.flash('error', '로그인이 필요합니다.');
    return res.redirect('/users/login');
  }
  next();
}
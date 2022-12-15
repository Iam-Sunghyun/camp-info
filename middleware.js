// 로그인 확인용 미들웨어
const router = (req, res, next) => {
    // https://www.mongodb.com/community/forums/t/passport-js-not-sending-req-user-object-while-redirecting/153465
    if (!req.isAuthenticated()) {
      req.flash('error', '로그인이 필요합니다.');
      return res.redirect('/users/login');
    }
    next();
}
  
module.exports = router;



// passport-jwt랑 같이 jwt 인증 방식 사용할까?
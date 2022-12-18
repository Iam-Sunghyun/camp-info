// 로그인 확인용 미들웨어
const router = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 로그인한 사용자가 아니라면 요청 페이지 url 저장(로그인 후 요청 페이지로 보내기 위해)
    req.session.returnTo = req.originalUrl;
    req.flash("error", "로그인이 필요합니다.");
    return res.redirect("/users/login");
  }
  next();
};

module.exports = router;

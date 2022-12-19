const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campgroundModel');

// 로그인 확인용 미들웨어
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // 로그인한 사용자가 아니라면 세션에 요청 페이지 url 저장(로그인 후 요청 페이지로 보내기 위해)
    req.session.returnTo = req.originalUrl;
    req.flash("error", "로그인이 필요합니다.");
    return res.redirect("/users/login");
  }
  next();
};

// 게시물 작성자와 현재 로그인 유저 확인 미들웨어(웹 페이지가 아닌 postman, ajax로 요청된 경우 사용자 확인을 위함)
module.exports.isAuthor = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).populate('author');
  if (req.user && !campground.author.equals(req.user)) {
    return next(new ExpressError('권한이 없습니다', 400));
  }
  next();
};
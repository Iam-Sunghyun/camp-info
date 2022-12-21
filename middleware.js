const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campgroundModel');
const { campgroundSchema, reviewSchema } = require('./schemas'); // 서버 측 유효성 검사를 위한 joi 객체

/**
 * joi 모듈을 이용한 요청 페이로드 유효성 검증 미들웨어(새 캠핑장 추가)
 * - put, post요청 시 클라이언트 측에서 1차로 유효성 검증을 하지만 postman으로 페이로드에 필요한 일부 데이터를 누락시켜서 요청을 해도 그대로 동작을 하게된다.
 * 따라서 joi 모듈로 작성한 스키마로 2차로 서버 측에서 유효성 검사를 해준다.
 */
module.exports.validateCampground = (req, res, next) => {
  /** 
   * 요청 body 데이터가 스키마에 맞는지 체크
   * 정의한 스키마 유효성 검사에 통과하면 error에는 undefined가 할당되고
   * 통과하지 못하면 에러 정보가 담긴 ValidationError 객체가 할당 됨
   * joi 모듈 - https://joi.dev/api/?v=17.6.0#introduction
   */
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
      // error 객체 details 프로퍼티의 모든 message 값을 가져와 커스텀 에러 클래스에 전달한다.
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
  } else {
      next();
  }
};

// 리뷰 유효성 검증 미들웨어
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

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

// 리뷰 작성자 확인 미들웨어
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
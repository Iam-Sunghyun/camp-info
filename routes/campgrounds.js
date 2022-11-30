const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');

// 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const catchAsyncError = require('../utils/catchAsyncError');

// 서버 측 유효성 검사를 위한 joi 객체
const { campgroundSchema } = require('../schemas');

/**
 * joi 모듈을 이용한 요청 페이로드 유효성 검증 미들웨어(새 캠핑장 추가)
 * - put, post요청 시 클라이언트 측에서 1차로 유효성 검증을 하지만 postman으로 페이로드에 필요한 일부 데이터를 누락시켜서 요청을 해도 그대로 동작을 하게된다.
 * 따라서 joi 모듈로 작성한 스키마로 2차로 서버 측에서 유효성 검사를 해준다.
 */
const validateCampground = (req, res, next) => {
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

router.use((req, res, next) => {
  res.locals.success = req.flash('success');
  next();
})

// 캠핑장 페이지
router.get('/', catchAsyncError(async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

// 새 캠핑장 추가 페이지
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

// 새 캠핑장 추가
router.post('/', validateCampground, catchAsyncError(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash('success', 'new camp added!!!')
  res.redirect(`/campgrounds/${campground._id}`);
}));

// 캠핑장 삭제(mongoose 미들웨어로 달려있던 리뷰도 모두 삭제)
router.delete('/:id', catchAsyncError(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect('/campgrounds');
}));

// 특정 캠핑장 세부화면
router.get('/:id', catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).populate('review'); // Populate할 필드 지정
  res.render('campgrounds/show', { campground });
}));

// 특정 캠핑장 내용 수정 페이지
router.get('/:id/edit', catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
}));

// 특정 캠핑장 내용 수정
router.put('/:id', validateCampground, catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`);
}));

module.exports = router;
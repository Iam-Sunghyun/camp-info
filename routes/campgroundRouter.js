const express = require('express');
const router = express.Router();
const Campground = require('../models/campgroundModel');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


// 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const catchAsyncError = require('../utils/catchAsyncError');


// 캠핑장 페이지
router.get('/', catchAsyncError(async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
}));

// 새 캠핑장 추가 페이지
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// 새 캠핑장 추가
router.post('/', isLoggedIn, validateCampground, catchAsyncError(async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id; // 게시물에 작성자(현재 로그인 사용자) 정보 저장
  await campground.save();  
  req.flash('success', '새 캠핑장이 추가되었습니다.');
  res.redirect(`/campgrounds`);
}));

// 캠핑장 삭제(mongoose 미들웨어로 달려있던 리뷰도 모두 삭제)
router.delete('/:id', isLoggedIn, isAuthor, catchAsyncError(async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash('success', '캠핑장이 삭제되었습니다.');
  res.redirect('/campgrounds');
}));

// 특정 캠핑장 세부화면
router.get('/:id', catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id).populate('review').populate('author'); // Populate할 필드 지정
  if (!campground) {
    req.flash('error', 'not found page!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
}));

// 특정 캠핑장 내용 수정 페이지
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'not found page!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
}));

// 특정 캠핑장 내용 수정
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsyncError(async (req, res, next) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
  req.flash('success', '캠핑장 업데이트 완료!');
  res.redirect(`/campgrounds/${campground._id}`);
}));

module.exports = router;
const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const Review = require('../models/review');

// 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const catchAsyncError = require('../utils/catchAsyncError');

// 서버 측 유효성 검사를 위한 joi 객체
const { reviewSchema } = require('../schemas');

// 리뷰 유효성 검증 미들웨어
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
  } else {
      next();
  }
}

// 리뷰 추가
router.post('/', validateReview, catchAsyncError(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  campground.review.push(review);
  console.log(review, campground)
  await Promise.all([review.save(), campground.save()]);  
  res.redirect(`/campgrounds/${campground._id}`)
}));

// 리뷰 삭제
router.delete('/:reviewId', catchAsyncError(async (req, res, next) => {
  const { reviewId, id } = req.params;
  const campground = await Campground.findById(id);

  // $pull 연산자 -> 조건에 맞는 배열 필드의 요소를 모두 제거함.
  await Promise.all([ Campground.updateOne(campground, { $pull: { review: reviewId } }),
                      Review.findByIdAndDelete(reviewId),
                      campground.save()
                      ]);
  res.redirect(`/campgrounds/${campground._id}`)
}));

module.exports = router;
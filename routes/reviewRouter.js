const express = require('express');
const router = express.Router({ mergeParams: true }); // 중요※ 상위 라우터의 경로 매개변수(req.params) 값을 병합시킴. -> app.js의 라우터의 경로 매개변수를 사용할 수 있게 된다.
const review = require('../controllers/reviewControl');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');

// 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const catchAsyncError = require('../utils/catchAsyncError');

// 리뷰 추가
router.post('/', isLoggedIn, validateReview, catchAsyncError(review.addReview));

// 리뷰 삭제
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsyncError(review.deleteReview));

module.exports = router;
const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campground = require('../controllers/campgroundsControl')

// 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const catchAsyncError = require('../utils/catchAsyncError');


// 캠핑장 페이지
router.get('/', catchAsyncError(campground.index));

// 새 캠핑장 추가 페이지
router.get('/new', isLoggedIn, campground.renderCampgroundNew);

// 새 캠핑장 추가
router.post('/', isLoggedIn, validateCampground, catchAsyncError(campground.createNewCampground));

// 캠핑장 삭제(mongoose 미들웨어로 달려있던 리뷰도 모두 삭제)
router.delete('/:id', isLoggedIn, isAuthor, catchAsyncError(campground.deleteCampground));

// 특정 캠핑장 세부화면
router.get('/:id', catchAsyncError(campground.renderCampgroundDetail));

// 특정 캠핑장 내용 수정 페이지
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campground.renderCampgroundEdit));

// 특정 캠핑장 내용 수정
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsyncError(campground.editCampground));

module.exports = router;
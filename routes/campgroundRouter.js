const express = require('express');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campground = require('../controllers/campgroundsControl');
const catchAsyncError = require('../utils/catchAsyncError'); // 비동기(async) 라우트 핸들러 에러처리를 위한 모듈
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.route('/')
  .get(catchAsyncError(campground.index)) // 캠핑장 페이지
  // .post(isLoggedIn, validateCampground, catchAsyncError(campground.createNewCampground)); // 새 캠핑장 추가
  .post(upload.single('image'), (req, res) => {
    console.log(req.body, req.file)
    res.send('성공');
  });

// 새 캠핑장 추가 페이지
router.get('/new', isLoggedIn, campground.renderCampgroundNew);

router.route('/:id')
  .get(catchAsyncError(campground.renderCampgroundDetail)) // 특정 캠핑장 세부화면
  .put(isLoggedIn, isAuthor, validateCampground, catchAsyncError(campground.editCampground)) // 특정 캠핑장 내용 수정
  .delete(isLoggedIn, isAuthor, catchAsyncError(campground.deleteCampground)); // 캠핑장 삭제(mongoose 미들웨어로 달려있던 리뷰도 모두 삭제)

// 특정 캠핑장 내용 수정 페이지
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campground.renderCampgroundEdit));


module.exports = router;

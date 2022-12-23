const Review = require('../models/reviewModel');
const Campground = require('../models/campgroundModel');

module.exports.addReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.review.push(review);
  await Promise.all([review.save(), campground.save()]);
  req.flash('success', '리뷰가 성공적으로 등록되었습니다.');
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { reviewId, id } = req.params;
  // $pull 연산자 -> 조건에 맞는 배열 필드의 요소를 모두 제거함.
  await Promise.all([Campground.findByIdAndUpdate(id, { $pull: { review: reviewId } }),
  Review.findByIdAndDelete(reviewId),
  ]);
  req.flash('success', '리뷰가 성공적으로 삭제되었습니다.');
  res.redirect(`/campgrounds/${id}`);
};
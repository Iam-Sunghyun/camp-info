// Mongoose 모델 파일
const mongoose = require('mongoose');
const Review = require('./review');

const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

// findOneAndDelete은 findByIdAndDelete 쿼리 함수를 트리거한다.
// 캠핑장 삭제 시, 달려있던 리뷰도 모두 삭제하는 미들웨어
CampgroundSchema.post('findOneAndDelete', async (docs, next) => {
  if (docs) {
    await Review.deleteMany({ _id: { $in: docs.review } });
  } 
 
});

module.exports = mongoose.model('Campground', CampgroundSchema);
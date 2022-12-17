// Mongoose 모델 파일
const mongoose = require('mongoose');
const Review = require('./reviewModel');

const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }] // ref: -> Populate 시 참조할 모델(컬렉션) 명(대문자 단수형)
});

// findByIdAndDelete은 findOneAndDelete 함수를 트리거한다. -> findByIdAndDelete() 호출 시 아래 미들웨어 실행됨.
// 캠핑장 삭제 시, 달려있던 리뷰도 모두 삭제하는 미들웨어
CampgroundSchema.post('findOneAndDelete', async (docs, next) => {
  if (docs) {
    await Review.deleteMany({ _id: { $in: docs.review } });
  } 
 
});

module.exports = mongoose.model('Campground', CampgroundSchema);
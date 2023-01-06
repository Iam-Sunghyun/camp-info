// Mongoose 모델 파일
const mongoose = require('mongoose');
const Review = require('./reviewModel');


const imageSchema = new mongoose.Schema({
  url: String,
  filename: String
});

// cloudinary 참조 URL에 transformation 추가하는 가상 속성
imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_400,h_350');  
});

imageSchema.virtual('detailImage').get(function () {
  return this.url.replace('/upload', '/upload/w_500,h_550');  
});

const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: [imageSchema],
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        // required: true
      },
      coordinates: {
        type: [Number],
        // required: true
      }
    },
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
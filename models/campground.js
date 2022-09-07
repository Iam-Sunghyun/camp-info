// Mongoose 모델 파일
const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    review: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Riview' }]
});

module.exports = mongoose.model('Campground', CampgroundSchema);
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  eamil: { type: String, required: [true, 'require email'] },
  // username, hash, salt 값이 passport-local-mongoose에 의해 자동으로 추가 됨
});

// passport-local-mongoose
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
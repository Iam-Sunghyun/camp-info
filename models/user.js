const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'require email'],
    unique: true, // unique 옵션은 validator가 아니다. Mongodb 도큐먼트 고유 필드를 위한 옵션으로(primary key 같은 것) 이것 자체만으로 중복 저장을 검사하지 않음.
                  // Model.on('index') 이벤트를 사용하면 중복 저장 시도 시 에러를 발생시킨다.
                  // https://mongoosejs.com/docs/faq.html#unique-doesnt-work 참고..
  },
});

// passport-local-mongoose
// 스키마에 username, hash, salt 값이 passport-local-mongoose에 의해 자동으로 추가 됨.
// username이 중복 값인지 자동으로 체크한다고 함
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
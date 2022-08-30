// joi 모듈을 사용해 요청 데이터 스키마 유효성을 서버 측에서 검증한다.
const Joi = require('joi');

// 폼으로 전송되는 요청 body는 모두 campground[title], campground[price]..와 같이 전송하도록 했었다.
// 따라서 다음과 같이 객체 안에 campground 객체가 들어있는 형식을 띈다.
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});
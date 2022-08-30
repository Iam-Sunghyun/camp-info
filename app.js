const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // ejs 템플릿 엔진을 위한 Express.4.x 버전 레이아웃, 분할(particial), 블록(block) 함수 지원 모듈
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const ExpressError = require('./utils/ExpressError');
const catchAsyncError = require('./utils/catchAsyncError');

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/CampInfo')
    .then(() => {
        console.log("MongoDB 연결 완료");
    }).catch(err => {
        console.log("MongoDB 연결 실패");
        console.log(err);
    });

const app = express();

// 기본 템플릿 엔진, 템플릿 디렉토리 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ejs 템플릿 파싱에 ejs 기본 엔진이 아닌 ejs-mate를 사용하라고 설정하는 것(ejs 파일을 실행하거나 파싱할 때 사용되는 엔진은 여러 가지가 있다.).
app.engine('ejs', engine);

// 요청 페이로드 파싱 설정
app.use(express.urlencoded({ extended: true }));

// method-override 모듈 쿼리 스트링 설정
app.use(methodOverride('_method'));

// 서버 측 유효성 검사를 위한 모듈
const joi = require('joi');
const { campgroundSchema } = require('./schema');

// joi 모듈을 이용한 요청 페이로드 유효성 검증
// - put, post요청 시 클라이언트 측에서 1차로 유효성 검증을 하지만 postman으로 페이로드에 필요한 일부 데이터를 누락시켜서 요청을 해도 그대로 동작을 하게된다.
//   따라서 joi 모듈로 작성한 스키마로 2차로 서버 측에서 유효성 검사를 해준다.
//   https://joi.dev/api/?v=17.6.0#introduction
const validateCampground = (req, res, next) => {
    // 요청 body 데이터가 스키마에 맞는지 체크, 맞지 않다면 해당 error를 가져옴
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        // console.log(campgroundSchema.validate(req.body))
        // console.log(error)

        // error 객체 details 프로퍼티의 모든 message 값을 가져와 커스텀 에러 클래스에 전달한다.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// 이하 기본적인 라우팅(CRUD)
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/campgrounds', catchAsyncError(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsyncError(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsyncError(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// 잘못된 경로 요청 처리용 라우터
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});


app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});
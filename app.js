const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // ejs 템플릿 엔진을 위한 Express.4.x 버전 레이아웃, 분할(particial), 블록(block) 함수 지원 모듈
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const campgrounds = require('./routes/campgrounds');


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


// 이하 기본적인 라우팅(CRUD)
app.get('/', (req, res) => {
    res.send('홈 페이지');
});

app.use('/campgrounds', campgrounds );

// app.get('/campgrounds/new', (req, res) => {
//     res.render('campgrounds/new');
// });

// app.post('/campgrounds', validateCampground, catchAsyncError(async (req, res, next) => {
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);
// }));


// // 리뷰 추가
// app.post('/campgrounds/:id/review', validateReview, catchAsyncError(async (req, res) => {
//     const campground = await Campground.findById(req.params.id);
//     const review = new Review(req.body.review);
//     campground.review.push(review);
//     await Promise.all([review.save(), campground.save()]);  
//     res.redirect(`/campgrounds/${campground._id}`)
// }));

// // 리뷰 삭제
// app.delete('/campgrounds/:campId/review/:reviewId', catchAsyncError(async (req, res, next) => {
//     const { reviewId, campId } = req.params;
//     const campground = await Campground.findById(campId);
//     // const review = campground['review'].indexOf(req.params.reviewId);
//     // campground['review'].splice(review, 1);

//     // $pull 연산자 -> 조건에 맞는 배열 필드의 요소를 모두 제거함.
//     await Promise.all([ Campground.updateOne(campground, { $pull: { review: reviewId } }),
//                         Review.findByIdAndDelete(reviewId),
//                         campground.save()
//                         ]);
//     res.redirect(`/campgrounds/${campground._id}`)
// }));

// // 캠핑장 삭제(mongoose 미들웨어로 달려있던 리뷰도 모두 삭제)
// app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }));


// app.get('/campgrounds/:id', catchAsyncError(async (req, res, next) => {
//     const campground = await Campground.findById(req.params.id).populate('review');
//     res.render('campgrounds/show', { campground });
// }));

// app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res, next) => {
//     const campground = await Campground.findById(req.params.id);
//     res.render('campgrounds/edit', { campground });
// }));

// app.put('/campgrounds/:id', validateCampground, catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     res.redirect(`/campgrounds/${campground._id}`);
// }));

// app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     res.redirect('/campgrounds');
// }));

// 404 처리용 미들웨어
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});
// app.all('*', (req, res, next) => {
//     next(new ExpressError('Page Not Found', 404));
// });

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});


app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});


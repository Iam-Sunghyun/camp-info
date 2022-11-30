const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // ejs 템플릿 엔진을 위한 Express.4.x 버전 레이아웃, 분할(particial), 블록(block) 함수 지원 모듈
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const campgrounds = require('./routes/campgrounds');
const campgroundsReview = require('./routes/review');
const app = express();

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/CampInfo')
    .then(() => {
        console.log("MongoDB 연결 완료");
    }).catch(err => {
        console.log("MongoDB 연결 실패");
        console.log(err);
    });

app.set('view engine', 'ejs'); // 기본 템플릿 엔진, 템플릿 디렉토리 설정
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', engine); // ejs 템플릿 파싱에 ejs 기본 엔진이 아닌 ejs-mate를 사용하라고 설정하는 것(ejs 파일을 실행하거나 파싱할 때 사용되는 엔진은 여러 가지가 있다.).

app.use(express.urlencoded({ extended: true })); // 요청 페이로드 파싱 설정
app.use(express.static(path.join(__dirname, 'public'))); // 템플릿에서 사용할 정적 파일(이미지, 동영상, js파일 등) 디렉토리 설정
app.use(methodOverride('_method')); // method-override 모듈 쿼리 스트링 설정

const sessionConfig = {
    secret: 'thisIsEasySecret',
    resave: false,
    saveUninitialized: true, // resave, saveUnintialized 차이는?
    cookie: {
        // expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7),
        httpOnly: true,
        secure: false
    }
}
app.use(session(sessionConfig));
app.use(flash());

// 홈페이지
app.get('/', (req, res) => {
    res.send('홈 페이지');
});

// 캠핑장 라우터
app.use('/campgrounds', campgrounds); 

// 리뷰 라우터
app.use('/campgrounds/:id/reviews', campgroundsReview );


// 404 처리용 미들웨어
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});
/** ↓ 동일
 * app.all('*', (req, res, next) => {
 *   next(new ExpressError('Page Not Found', 404));
 * });
 */

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});


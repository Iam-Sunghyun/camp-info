const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // ejs 템플릿 엔진을 위한 Express.4.x 버전 레이아웃, 분할(particial), 블록(block) 함수 지원 모듈
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
// const LocalStrategy = require('passport-local');
const campgroundRouter = require('./routes/campgroundRouter');
const reviewRouter = require('./routes/reviewRouter');
const userRouter = require('./routes/authRouter');
const app = express();

// MongoDB 연결
mongoose.connect('mongodb://localhost:27017/CampInfo')
    .then(() => {
        console.log("MongoDB 연결 완료");
    }).catch(err => {
        console.log("MongoDB 연결 실패");
        console.log(err);
    });

// passport-local-mongoose 구성--------------------------
/**
const strategy = new LocalStrategy(
(username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) return done(err); 
      if (!user) return done(null, false);
      if (!user.verifyPassword(password)) return done(null, false);
      return done(null, user);
    });
  }
);
passport.use(strategy);
*/
const User = require('./models/userModel');
// passport-local-mongoose 0.2.1이상 버전의 createStrategy() 메서드는 strategy 객체( 올바른 옵션의 passport-local 객체 -> new LocalStrategy(verify function))의 역할을 한다.
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 
//---------------------------------------------


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

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); 
    next();
})
  
// 홈페이지
app.get('/', (req, res) => {
    res.send('홈 페이지');
});



// 캠핑장 라우터
app.use('/campgrounds', campgroundRouter); 

// 리뷰 라우터
app.use('/campgrounds/:id/reviews', reviewRouter);

// 회원가입 / 로그인
app.use('/users', userRouter);



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
    console.log(err.stack)
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000...');
});


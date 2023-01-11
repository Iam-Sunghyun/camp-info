// proccess.env.NODE_ENV는 환경 변수로 개발 환경인지, 프로덕션 환경인지를 식별하기 위함(지금은 개발 환경).
// 개발 환경의 경우 require('dotenv').config()는 .env 파일에 정의한 변수를 가져와서 process.env에 할당 한다.
// 프로덕션 환경의 경우 .env 파일이 아닌 프로덕션 환경 자체에 환경변수가 저장되어있을 것.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

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
const MongoStore = require('connect-mongo');
const app = express();
const dbUrl = process.env.MONGODB_URL;

// MongoDB 연결
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MongoDB 연결 완료");
    }).catch(err => {
        console.log("MongoDB 연결 실패");
        console.log(err);
    });

// passport-local-mongoose 설정--------------------------
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
// 세션에 데이터를 어떻게 저장하고 가져오는지 결정하는 메서드.
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

//---------------------------------------------


app.set('view engine', 'ejs'); // 기본 템플릿 엔진, 템플릿 디렉토리 설정
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', engine); // ejs 템플릿 파싱에 ejs 기본 엔진이 아닌 ejs-mate를 사용하라고 설정하는 것(ejs 파일을 실행하거나 파싱할 때 사용되는 엔진은 여러 가지가 있다.).

app.use(express.urlencoded({ extended: true })); // 요청 페이로드 파싱 설정
app.use(express.static(path.join(__dirname, 'public'))); // 템플릿에서 사용할 정적 파일(이미지, 동영상, js파일 등) 디렉토리 설정
app.use(methodOverride('_method')); // method-override 모듈 쿼리 스트링 설정

const store = MongoStore.create({
  mongoUrl: 'mongodb://localhost:27017/CampInfo',
  // 게으른 세션 업데이트(lazy session update)
  // 세션에 변경이 없으면 재저장이 24시간에 한번 씩 이루어짐
  touchAfter: 24 * 3600 
})

const sessionConfig = {
    store,  // connect-mongo 세션 정보 객체를 전달하여 세션 저장 위치 설정
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

app.use(session(sessionConfig)); // 세션 사용을 위한 express-session 로드

//※중요※ passport 기본 설정 (express-session 설정 다음에 위치해야됨)
// 이걸 빠트려서 req.isAuthenticated(), req.logout() 함수 호출이 안됐던 것..
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error'); 
    next();
})
  
// 홈페이지
app.get('/', (req, res) => {
    res.send('home');
    // res.render('/home');
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
    const { status = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    console.log(err.stack)
    res.status(status).render('error', { err, status });
});

app.listen(8080, () => {
    console.log(`Server listening on port 8080...`);
});


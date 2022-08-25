const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const engine = require('ejs-mate'); // ejs 템플릿 엔진을 위한 Express.4.x 버전 레이아웃, 분할(particial), 블록(block) 함수 지원
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

// ejs 기본 엔진이 아닌 ejs-mate를 사용하기 위해 Express에 설정하는 것(ejs 파일을 실행하거나 파싱할 때 사용되는 엔진은 여러 가지가 있다.).
app.engine('ejs', engine);

// 요청 페이로드 파싱 설정
app.use(express.urlencoded({ extended: true }));

// 메서드 재정의 미들웨어 로드
app.use(methodOverride('_method'));

// 이하 기본적인 라우팅(CRUD)
app.get('/', (req, res) => {
    res.render('home');
});
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

app.get('/campgrounds/:id', async (req, res,) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});



app.listen(3000, () => {
    console.log('Serving on port 3000');
});
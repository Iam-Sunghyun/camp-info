// DB 시드 데이터 생성용 파일
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB 연결 완료");
}).catch(err => {
        console.log("MongoDB 연결 실패");
        console.log(err);
    });;

const sample = array => array[Math.floor(Math.random() * array.length)];

// cities.js, seedHeplers.js 파일로 값 랜덤 조합
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
    consol.log('시드 데이터 삽입 완료')
});
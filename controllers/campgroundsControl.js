const Campground = require('../models/campgroundModel');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderCampgroundNew = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createNewCampground = async (req, res) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.image = req.files.map(f => ({
    url: f.path,
    filename: f.filename
  }));
  campground.author = req.user._id; // 게시물에 작성자(현재 로그인 사용자) 정보 저장
  await campground.save();
  req.flash('success', '새 캠핑장이 추가되었습니다.');
  res.redirect(`/campgrounds`);
};

module.exports.deleteCampground = async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash('success', '캠핑장이 삭제되었습니다.');
  res.redirect('/campgrounds');
};

module.exports.renderCampgroundDetail = async (req, res) => {
  const campground = await Campground.findById(req.params.id).populate({ // 중첩 Populating
    path: 'review',
    populate: 'author'
  }).populate('author'); // Populate할 필드 지정
  if (!campground) {
    req.flash('error', 'not found page!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/show', { campground });
};

module.exports.renderCampgroundEdit = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash('error', 'not found page!');
    return res.redirect('/campgrounds');
  }
  res.render('campgrounds/edit', { campground });
};

module.exports.editCampground = async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
  const addedFile = req.files.map(f => ({
    url: f.path,
    filename: f.filename
  }));
  campground.image.push(...addedFile);
  await campground.save();
  // 삭제할 이미지가 있는 경우
  if (req.body.deleteImage && req.body.deleteImage.length !== 0) {
    for (const filename of req.body.deleteImage) {
      // cloudinary에서 삭제
      await cloudinary.uploader.destroy(filename);
    }
  // $pull 연산자로 지정된 조건과 일치하는 campground 도큐먼트의 image 필드 배열의 요소들을 제거
  // 삭제 요소 조건은 image의 filename이 deleteImage[]의 요소 값과 일치하는 경우(deleteImagep[]의 요소는 사용자가 수정 페이지에서 체크박스로 체크한 이미지의 filename이다)
  // 즉 사용자가 수정 페이지에서 체크박스로 체크한 이미지들을 campground의 image 필드 배열에서 삭제함
    await campground.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } } } });
  }
  req.flash('success', '캠핑장 업데이트 완료!');
  res.redirect(`/campgrounds/${campground._id}`);
};
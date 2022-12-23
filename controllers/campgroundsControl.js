const Campground = require('../models/campgroundModel');

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
};

module.exports.renderCampgroundNew = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createNewCampground = async (req, res) => {
  const campground = new Campground(req.body.campground);
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
  req.flash('success', '캠핑장 업데이트 완료!');
  res.redirect(`/campgrounds/${campground._id}`);
};
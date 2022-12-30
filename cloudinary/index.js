// multer로 파싱한 파일을 cloudinary에 저장하기 위한 모듈
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// cloudinary 계정 연결을 위한 객체
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 요청에 전송된 multipart/form-data 파일을 cloudinary에 저장하는데 사용되는 객체(multer의 인수로 전달)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {   // cloudinary에 저장할 때 사용되는 매개변수 값들
    folder: 'CampInfo',
    allowedFormats : ['jpeg', 'jpg', 'png'], 
  },
});


module.exports = { cloudinary, storage };
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "demo",
  api_key: process.env.CLOUD_API_KEY || "demo",
  api_secret: process.env.CLOUD_API_SECRET || "demo"
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowed_formats: ["png", "jpg", "jpeg"]
  },
});

module.exports = {
    cloudinary,
    storage,
};
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'focus_room/avatars',
    allowed_formats: ['jpg', 'png', 'gif', 'jpeg', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
    
    }
});

export const upload = multer({ storage });
export default cloudinary;
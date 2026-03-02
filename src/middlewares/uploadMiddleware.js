const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Autenticação com o Cloudinary (usando as variáveis do .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuração do armazenamento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'estado_zero_vitrine', // Pasta organizada no Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }] // Padronização visual
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
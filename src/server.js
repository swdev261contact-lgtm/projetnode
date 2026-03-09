require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Erreur non gérée: ${err.message}`);
  server.close(() => process.exit(1));
});

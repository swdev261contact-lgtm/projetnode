const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');
const joueurRoutes = require('./routes/joueurRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const inscriptionRoutes = require('./routes/inscriptionRoutes');
const resultatRoutes = require('./routes/resultatRoutes');
const classementRoutes = require('./routes/classementRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard'
});

app.use('/api', limiter);

app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de gestion de compétitions de palets',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      clubs: '/api/clubs',
      joueurs: '/api/joueurs',
      competitions: '/api/competitions',
      inscriptions: '/api/inscriptions',
      resultats: '/api/resultats',
      classements: '/api/classements'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/joueurs', joueurRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/inscriptions', inscriptionRoutes);
app.use('/api/resultats', resultatRoutes);
app.use('/api/classements', classementRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} non trouvée`
  });
});

app.use(errorHandler);

module.exports = app;

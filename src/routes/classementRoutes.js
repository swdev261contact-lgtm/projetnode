const express = require('express');
const {
  getClassement,
  getClassementPersonnalise,
  getJoueurStats
} = require('../controllers/classementController');

const router = express.Router();

router.get('/', getClassement);

router.post('/personnalise', getClassementPersonnalise);

router.get('/joueur/:joueurId/stats', getJoueurStats);

module.exports = router;

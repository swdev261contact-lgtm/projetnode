const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  createResultat,
  getResultats,
  getResultat,
  updateResultat
} = require('../controllers/resultatController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'club'),
  upload.fields([
    { name: 'photosVainqueurs', maxCount: 10 },
    { name: 'photosEvenement', maxCount: 20 }
  ]),
  [
    body('competition').notEmpty().withMessage('L\'ID de la compétition est requis'),
    body('categorie').isIn(['individuHomme', 'individuFemme', 'junior', 'doublette']).withMessage('Catégorie invalide'),
    body('vainqueur').notEmpty().withMessage('Le vainqueur est requis'),
    validate
  ],
  createResultat
);

router.get('/', getResultats);

router.get('/:id', getResultat);

router.put(
  '/:id',
  protect,
  authorize('admin', 'club'),
  upload.fields([
    { name: 'photosVainqueurs', maxCount: 10 },
    { name: 'photosEvenement', maxCount: 20 }
  ]),
  updateResultat
);

module.exports = router;

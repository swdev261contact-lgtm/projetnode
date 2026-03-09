const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  createCompetition,
  getCompetitions,
  getCompetition,
  updateCompetition,
  deleteCompetition
} = require('../controllers/competitionController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin', 'club'),
  upload.single('affiche'),
  [
    body('nomEvenement').notEmpty().withMessage('Le nom de l\'événement est requis'),
    body('ville').notEmpty().withMessage('La ville est requise'),
    body('date').isDate().withMessage('Date invalide'),
    body('nombrePlaces').isInt({ min: 1 }).withMessage('Le nombre de places doit être au moins 1'),
    validate
  ],
  createCompetition
);

router.get('/', getCompetitions);

router.get('/:id', getCompetition);

router.put(
  '/:id',
  protect,
  authorize('admin', 'club'),
  upload.single('affiche'),
  updateCompetition
);

router.delete(
  '/:id',
  protect,
  authorize('admin', 'club'),
  deleteCompetition
);

module.exports = router;

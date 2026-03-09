const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  getJoueurs,
  getJoueur,
  updateJoueur,
  deleteJoueur,
  addClubToJoueur,
  removeClubFromJoueur
} = require('../controllers/joueurController');

const router = express.Router();

router.get('/', getJoueurs);

router.get('/:id', getJoueur);

router.put(
  '/:id',
  protect,
  authorize('admin', 'joueur'),
  updateJoueur
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteJoueur
);

router.post(
  '/:id/clubs',
  protect,
  authorize('admin', 'joueur'),
  [
    body('clubId').notEmpty().withMessage('L\'ID du club est requis'),
    validate
  ],
  addClubToJoueur
);

router.delete(
  '/:id/clubs',
  protect,
  authorize('admin', 'joueur'),
  [
    body('clubId').notEmpty().withMessage('L\'ID du club est requis'),
    validate
  ],
  removeClubFromJoueur
);

module.exports = router;

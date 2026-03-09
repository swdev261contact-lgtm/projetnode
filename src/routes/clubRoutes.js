const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createClub,
  getClubs,
  getClub,
  updateClub,
  deleteClub,
  getClubPlayers
} = require('../controllers/clubController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('nom').notEmpty().withMessage('Le nom du club est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('region').notEmpty().withMessage('La région est requise'),
    body('departement').notEmpty().withMessage('Le département est requis'),
    validate
  ],
  createClub
);

router.get('/', getClubs);

router.get('/:id', getClub);

router.put(
  '/:id',
  protect,
  authorize('admin', 'club'),
  updateClub
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteClub
);

router.get('/:id/joueurs', getClubPlayers);

module.exports = router;

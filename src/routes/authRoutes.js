const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const {
  registerJoueur,
  loginJoueur,
  loginClub,
  loginAdmin,
  getMe
} = require('../controllers/authController');

const router = express.Router();

router.post(
  '/joueur/register',
  [
    body('nom').notEmpty().withMessage('Le nom est requis'),
    body('prenom').notEmpty().withMessage('Le prénom est requis'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('dateNaissance').isDate().withMessage('Date de naissance invalide'),
    body('mainForte').isIn(['droitier', 'gaucher', 'ambidextre']).withMessage('Main forte invalide'),
    body('categorie').isIn(['homme', 'femme', 'junior']).withMessage('Catégorie invalide'),
    validate
  ],
  registerJoueur
);

router.post(
  '/joueur/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
    validate
  ],
  loginJoueur
);

router.post(
  '/club/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
    validate
  ],
  loginClub
);

router.post(
  '/admin/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
    validate
  ],
  loginAdmin
);

router.get('/me', protect, getMe);

module.exports = router;

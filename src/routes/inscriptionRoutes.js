const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createInscription,
  getInscriptions,
  getInscription,
  cancelInscription,
  getCompetitionParticipants
} = require('../controllers/inscriptionController');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('joueur'),
  [
    body('competitionId').notEmpty().withMessage('L\'ID de la compétition est requis'),
    body('categorieInscrite').isIn(['individuHomme', 'individuFemme', 'junior', 'doublette']).withMessage('Catégorie invalide'),
    validate
  ],
  createInscription
);

router.get('/', protect, getInscriptions);

router.get('/:id', protect, getInscription);

router.patch('/:id/cancel', protect, authorize('joueur', 'admin'), cancelInscription);

router.get('/competition/:competitionId/participants', getCompetitionParticipants);

module.exports = router;

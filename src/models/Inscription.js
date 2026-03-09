const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true
  },
  joueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur',
    required: true
  },
  categorieInscrite: {
    type: String,
    enum: ['individuHomme', 'individuFemme', 'junior', 'doublette'],
    required: true
  },
  partenaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur'
  },
  statut: {
    type: String,
    enum: ['confirmée', 'en attente', 'annulée'],
    default: 'confirmée'
  },
  dateInscription: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

inscriptionSchema.index({ competition: 1, joueur: 1 }, { unique: true });

module.exports = mongoose.model('Inscription', inscriptionSchema);

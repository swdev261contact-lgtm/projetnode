const mongoose = require('mongoose');

const resultatSchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true
  },
  categorie: {
    type: String,
    enum: ['individuHomme', 'individuFemme', 'junior', 'doublette'],
    required: true
  },
  vainqueur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur',
    required: true
  },
  deuxieme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur'
  },
  troisieme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur'
  },
  quatrieme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Joueur'
  },
  photosVainqueurs: [{
    type: String
  }],
  photosEvenement: [{
    type: String
  }],
  videoFinale: {
    type: String
  },
  pointsAttribues: {
    premier: { type: Number, default: 100 },
    deuxieme: { type: Number, default: 75 },
    troisieme: { type: Number, default: 50 },
    quatrieme: { type: Number, default: 25 }
  }
}, {
  timestamps: true
});

resultatSchema.index({ competition: 1, categorie: 1 }, { unique: true });

module.exports = mongoose.model('Resultat', resultatSchema);

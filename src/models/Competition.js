const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  nomEvenement: {
    type: String,
    required: [true, 'Le nom de l\'événement est requis'],
    trim: true
  },
  ville: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'La date est requise']
  },
  affiche: {
    type: String
  },
  nombrePlaces: {
    type: Number,
    required: [true, 'Le nombre de places est requis'],
    min: [1, 'Le nombre de places doit être au moins 1']
  },
  placesRestantes: {
    type: Number
  },
  categories: {
    individuHomme: {
      type: Boolean,
      default: false
    },
    individuFemme: {
      type: Boolean,
      default: false
    },
    junior: {
      type: Boolean,
      default: false
    },
    doublette: {
      type: Boolean,
      default: false
    }
  },
  clubOrganisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  statut: {
    type: String,
    enum: ['à venir', 'inscriptions ouvertes', 'complet', 'en cours', 'terminé'],
    default: 'à venir'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

competitionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.placesRestantes = this.nombrePlaces;
  }

  if (this.placesRestantes <= 0) {
    this.statut = 'complet';
  }

  next();
});

module.exports = mongoose.model('Competition', competitionSchema);

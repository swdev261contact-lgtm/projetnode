const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clubSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du club est requis'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  region: {
    type: String,
    required: [true, 'La région est requise'],
    trim: true
  },
  departement: {
    type: String,
    required: [true, 'Le département est requis'],
    trim: true
  },
  joursEntrainement: [{
    type: String,
    enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  }],
  horaires: {
    type: String,
    trim: true
  },
  contactReferent: {
    nom: String,
    telephone: String,
    email: String
  },
  disciplines: {
    paletFonteBois: {
      type: Boolean,
      default: false
    },
    paletFontePlomb: {
      type: Boolean,
      default: false
    },
    paletLaitonPlomb: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    default: 'club'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

clubSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clubSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Club', clubSchema);

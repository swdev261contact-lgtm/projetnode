const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const joueurSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
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
  dateNaissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  age: {
    type: Number
  },
  nationalite: {
    type: String,
    required: [true, 'La nationalité est requise'],
    default: 'France'
  },
  mainForte: {
    type: String,
    enum: ['droitier', 'gaucher', 'ambidextre'],
    required: [true, 'La main forte est requise']
  },
  categorie: {
    type: String,
    enum: ['homme', 'femme', 'junior'],
    required: [true, 'La catégorie est requise']
  },
  clubs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club'
  }],
  photo: {
    type: String
  },
  role: {
    type: String,
    default: 'joueur'
  },
  active: {
    type: Boolean,
    default: true
  },
  pointsTotal: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

joueurSchema.pre('save', function(next) {
  if (this.dateNaissance) {
    const today = new Date();
    const birthDate = new Date(this.dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.age = age;
  }
  next();
});

joueurSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

joueurSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

joueurSchema.pre('validate', function(next) {
  if (this.clubs && this.clubs.length > 3) {
    next(new Error('Un joueur ne peut être inscrit qu\'à un maximum de 3 clubs'));
  }
  next();
});

module.exports = mongoose.model('Joueur', joueurSchema);

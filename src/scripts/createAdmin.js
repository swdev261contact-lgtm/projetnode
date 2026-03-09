require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connecté');

    const existingAdmin = await Admin.findOne({ email: 'admin@davidjeux.com' });

    if (existingAdmin) {
      console.log('⚠ Un compte admin existe déjà avec cet email');
      console.log('Email: admin@davidjeux.com');
      process.exit(0);
    }

    const admin = await Admin.create({
      nom: 'Administrateur',
      email: 'admin@davidjeux.com',
      password: 'admin123'
    });

    console.log('\n✓ Compte admin créé avec succès!');
    console.log('\n--- Identifiants de connexion ---');
    console.log('Email: admin@davidjeux.com');
    console.log('Mot de passe: admin123');
    console.log('\n⚠ IMPORTANT: Changez ce mot de passe après la première connexion!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Erreur lors de la création du compte admin:');
    console.error(error.message);
    process.exit(1);
  }
};

createAdmin();

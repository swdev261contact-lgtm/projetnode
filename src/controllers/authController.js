const Admin = require('../models/Admin');
const Club = require('../models/Club');
const Joueur = require('../models/Joueur');
const generateToken = require('../utils/jwt');

exports.registerJoueur = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, dateNaissance, nationalite, mainForte, categorie } = req.body;

    const joueur = await Joueur.create({
      nom,
      prenom,
      email,
      password,
      dateNaissance,
      nationalite,
      mainForte,
      categorie
    });

    const token = generateToken(joueur._id, joueur.role);

    res.status(201).json({
      success: true,
      message: 'Joueur inscrit avec succès',
      data: {
        joueur: {
          id: joueur._id,
          nom: joueur.nom,
          prenom: joueur.prenom,
          email: joueur.email,
          role: joueur.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.loginJoueur = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const joueur = await Joueur.findOne({ email }).select('+password');

    if (!joueur) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const isMatch = await joueur.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const token = generateToken(joueur._id, joueur.role);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        joueur: {
          id: joueur._id,
          nom: joueur.nom,
          prenom: joueur.prenom,
          email: joueur.email,
          role: joueur.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.loginClub = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const club = await Club.findOne({ email }).select('+password');

    if (!club) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const isMatch = await club.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const token = generateToken(club._id, club.role);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        club: {
          id: club._id,
          nom: club.nom,
          email: club.email,
          role: club.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    const token = generateToken(admin._id, admin.role);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        admin: {
          id: admin._id,
          nom: admin.nom,
          email: admin.email,
          role: admin.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

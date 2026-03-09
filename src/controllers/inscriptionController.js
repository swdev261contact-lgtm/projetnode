const Inscription = require('../models/Inscription');
const Competition = require('../models/Competition');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.createInscription = async (req, res, next) => {
  try {
    const { competitionId, categorieInscrite, partenaire } = req.body;

    const competition = await Competition.findById(competitionId);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    if (competition.placesRestantes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Compétition complète, plus de places disponibles'
      });
    }

    if (!competition.categories[categorieInscrite]) {
      return res.status(400).json({
        success: false,
        message: 'Cette catégorie n\'est pas disponible pour cette compétition'
      });
    }

    const existingInscription = await Inscription.findOne({
      competition: competitionId,
      joueur: req.user._id
    });

    if (existingInscription) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà inscrit à cette compétition'
      });
    }

    const inscription = await Inscription.create({
      competition: competitionId,
      joueur: req.user._id,
      categorieInscrite,
      partenaire: categorieInscrite === 'doublette' ? partenaire : undefined
    });

    competition.placesRestantes -= 1;
    if (competition.placesRestantes === 0) {
      competition.statut = 'complet';
    }
    await competition.save();

    const populatedInscription = await Inscription.findById(inscription._id)
      .populate('competition', 'nomEvenement ville date')
      .populate('joueur', 'nom prenom email')
      .populate('partenaire', 'nom prenom email');

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: populatedInscription
    });
  } catch (error) {
    next(error);
  }
};

exports.getInscriptions = async (req, res, next) => {
  try {
    const { page, limit, competitionId } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = {};

    if (competitionId) {
      query.competition = competitionId;
    }

    if (req.user.role === 'joueur') {
      query.joueur = req.user._id;
    }

    const total = await Inscription.countDocuments(query);
    const inscriptions = await Inscription.find(query)
      .populate('competition', 'nomEvenement ville date statut')
      .populate('joueur', 'nom prenom email categorie')
      .populate('partenaire', 'nom prenom email')
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: inscriptions.length,
      pagination,
      data: inscriptions
    });
  } catch (error) {
    next(error);
  }
};

exports.getInscription = async (req, res, next) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate('competition', 'nomEvenement ville date statut')
      .populate('joueur', 'nom prenom email categorie')
      .populate('partenaire', 'nom prenom email');

    if (!inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: inscription
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelInscription = async (req, res, next) => {
  try {
    const inscription = await Inscription.findById(req.params.id);

    if (!inscription) {
      return res.status(404).json({
        success: false,
        message: 'Inscription non trouvée'
      });
    }

    if (req.user.role === 'joueur' && inscription.joueur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à annuler cette inscription'
      });
    }

    inscription.statut = 'annulée';
    await inscription.save();

    const competition = await Competition.findById(inscription.competition);
    if (competition) {
      competition.placesRestantes += 1;
      if (competition.statut === 'complet') {
        competition.statut = 'inscriptions ouvertes';
      }
      await competition.save();
    }

    res.status(200).json({
      success: true,
      message: 'Inscription annulée avec succès',
      data: inscription
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompetitionParticipants = async (req, res, next) => {
  try {
    const { page, limit, categorie } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = {
      competition: req.params.competitionId,
      statut: 'confirmée'
    };

    if (categorie) {
      query.categorieInscrite = categorie;
    }

    const total = await Inscription.countDocuments(query);
    const participants = await Inscription.find(query)
      .populate('joueur', 'nom prenom categorie clubs')
      .populate('partenaire', 'nom prenom categorie')
      .skip(skip)
      .limit(limitNumber)
      .sort({ dateInscription: 1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: participants.length,
      pagination,
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

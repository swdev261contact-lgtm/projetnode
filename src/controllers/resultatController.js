const Resultat = require('../models/Resultat');
const Joueur = require('../models/Joueur');
const Competition = require('../models/Competition');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.createResultat = async (req, res, next) => {
  try {
    const { competition, categorie, vainqueur, deuxieme, troisieme, quatrieme, videoFinale } = req.body;

    const comp = await Competition.findById(competition);
    if (!comp) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    const existingResultat = await Resultat.findOne({ competition, categorie });
    if (existingResultat) {
      return res.status(400).json({
        success: false,
        message: 'Les résultats pour cette catégorie existent déjà'
      });
    }

    const resultatData = {
      competition,
      categorie,
      vainqueur,
      deuxieme,
      troisieme,
      quatrieme,
      videoFinale
    };

    if (req.files) {
      if (req.files.photosVainqueurs) {
        resultatData.photosVainqueurs = req.files.photosVainqueurs.map(file => file.path);
      }
      if (req.files.photosEvenement) {
        resultatData.photosEvenement = req.files.photosEvenement.map(file => file.path);
      }
    }

    const resultat = await Resultat.create(resultatData);

    await Joueur.findByIdAndUpdate(vainqueur, {
      $inc: { pointsTotal: resultat.pointsAttribues.premier }
    });

    if (deuxieme) {
      await Joueur.findByIdAndUpdate(deuxieme, {
        $inc: { pointsTotal: resultat.pointsAttribues.deuxieme }
      });
    }

    if (troisieme) {
      await Joueur.findByIdAndUpdate(troisieme, {
        $inc: { pointsTotal: resultat.pointsAttribues.troisieme }
      });
    }

    if (quatrieme) {
      await Joueur.findByIdAndUpdate(quatrieme, {
        $inc: { pointsTotal: resultat.pointsAttribues.quatrieme }
      });
    }

    comp.statut = 'terminé';
    await comp.save();

    const populatedResultat = await Resultat.findById(resultat._id)
      .populate('competition', 'nomEvenement ville date')
      .populate('vainqueur', 'nom prenom')
      .populate('deuxieme', 'nom prenom')
      .populate('troisieme', 'nom prenom')
      .populate('quatrieme', 'nom prenom');

    res.status(201).json({
      success: true,
      message: 'Résultats enregistrés avec succès',
      data: populatedResultat
    });
  } catch (error) {
    next(error);
  }
};

exports.getResultats = async (req, res, next) => {
  try {
    const { page, limit, competition, categorie } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = {};

    if (competition) {
      query.competition = competition;
    }

    if (categorie) {
      query.categorie = categorie;
    }

    const total = await Resultat.countDocuments(query);
    const resultats = await Resultat.find(query)
      .populate('competition', 'nomEvenement ville date')
      .populate('vainqueur', 'nom prenom clubs')
      .populate('deuxieme', 'nom prenom clubs')
      .populate('troisieme', 'nom prenom clubs')
      .populate('quatrieme', 'nom prenom clubs')
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: resultats.length,
      pagination,
      data: resultats
    });
  } catch (error) {
    next(error);
  }
};

exports.getResultat = async (req, res, next) => {
  try {
    const resultat = await Resultat.findById(req.params.id)
      .populate('competition', 'nomEvenement ville date affiche')
      .populate('vainqueur', 'nom prenom clubs photo')
      .populate('deuxieme', 'nom prenom clubs photo')
      .populate('troisieme', 'nom prenom clubs photo')
      .populate('quatrieme', 'nom prenom clubs photo');

    if (!resultat) {
      return res.status(404).json({
        success: false,
        message: 'Résultat non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: resultat
    });
  } catch (error) {
    next(error);
  }
};

exports.updateResultat = async (req, res, next) => {
  try {
    const resultat = await Resultat.findById(req.params.id);

    if (!resultat) {
      return res.status(404).json({
        success: false,
        message: 'Résultat non trouvé'
      });
    }

    if (req.files) {
      if (req.files.photosVainqueurs) {
        req.body.photosVainqueurs = [
          ...resultat.photosVainqueurs,
          ...req.files.photosVainqueurs.map(file => file.path)
        ];
      }
      if (req.files.photosEvenement) {
        req.body.photosEvenement = [
          ...resultat.photosEvenement,
          ...req.files.photosEvenement.map(file => file.path)
        ];
      }
    }

    const updatedResultat = await Resultat.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('competition', 'nomEvenement ville date')
      .populate('vainqueur', 'nom prenom')
      .populate('deuxieme', 'nom prenom')
      .populate('troisieme', 'nom prenom')
      .populate('quatrieme', 'nom prenom');

    res.status(200).json({
      success: true,
      message: 'Résultat modifié avec succès',
      data: updatedResultat
    });
  } catch (error) {
    next(error);
  }
};

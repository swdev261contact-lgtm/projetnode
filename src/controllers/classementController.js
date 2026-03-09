const Joueur = require('../models/Joueur');
const Resultat = require('../models/Resultat');
const Club = require('../models/Club');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.getClassement = async (req, res, next) => {
  try {
    const { page, limit, categorie, region, departement } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = { active: true };

    if (categorie) {
      query.categorie = categorie;
    }

    if (region || departement) {
      const clubQuery = {};
      if (region) clubQuery.region = { $regex: region, $options: 'i' };
      if (departement) clubQuery.departement = { $regex: departement, $options: 'i' };

      const clubs = await Club.find(clubQuery).select('_id');
      const clubIds = clubs.map(club => club._id);

      query.clubs = { $in: clubIds };
    }

    const total = await Joueur.countDocuments(query);
    const joueurs = await Joueur.find(query)
      .populate('clubs', 'nom region departement')
      .select('-password')
      .skip(skip)
      .limit(limitNumber)
      .sort({ pointsTotal: -1, nom: 1 });

    const classement = joueurs.map((joueur, index) => ({
      position: skip + index + 1,
      joueur: {
        id: joueur._id,
        nom: joueur.nom,
        prenom: joueur.prenom,
        categorie: joueur.categorie,
        clubs: joueur.clubs,
        photo: joueur.photo
      },
      points: joueur.pointsTotal
    }));

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: classement.length,
      pagination,
      data: classement
    });
  } catch (error) {
    next(error);
  }
};

exports.getClassementPersonnalise = async (req, res, next) => {
  try {
    const { joueurIds } = req.body;

    if (!joueurIds || !Array.isArray(joueurIds) || joueurIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Liste de joueurs invalide'
      });
    }

    const joueurs = await Joueur.find({
      _id: { $in: joueurIds },
      active: true
    })
      .populate('clubs', 'nom region departement')
      .select('-password')
      .sort({ pointsTotal: -1, nom: 1 });

    const classement = joueurs.map((joueur, index) => ({
      position: index + 1,
      joueur: {
        id: joueur._id,
        nom: joueur.nom,
        prenom: joueur.prenom,
        categorie: joueur.categorie,
        clubs: joueur.clubs,
        photo: joueur.photo
      },
      points: joueur.pointsTotal
    }));

    res.status(200).json({
      success: true,
      count: classement.length,
      data: classement
    });
  } catch (error) {
    next(error);
  }
};

exports.getJoueurStats = async (req, res, next) => {
  try {
    const joueur = await Joueur.findById(req.params.joueurId)
      .populate('clubs', 'nom region departement')
      .select('-password');

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    const resultatsVictoires = await Resultat.find({ vainqueur: req.params.joueurId })
      .populate('competition', 'nomEvenement ville date');

    const resultatsDeuxieme = await Resultat.find({ deuxieme: req.params.joueurId })
      .populate('competition', 'nomEvenement ville date');

    const resultatsTroisieme = await Resultat.find({ troisieme: req.params.joueurId })
      .populate('competition', 'nomEvenement ville date');

    const resultatsQuatrieme = await Resultat.find({ quatrieme: req.params.joueurId })
      .populate('competition', 'nomEvenement ville date');

    const performances = [
      ...resultatsVictoires.map(r => ({
        competition: r.competition,
        position: 1,
        points: r.pointsAttribues.premier,
        categorie: r.categorie
      })),
      ...resultatsDeuxieme.map(r => ({
        competition: r.competition,
        position: 2,
        points: r.pointsAttribues.deuxieme,
        categorie: r.categorie
      })),
      ...resultatsTroisieme.map(r => ({
        competition: r.competition,
        position: 3,
        points: r.pointsAttribues.troisieme,
        categorie: r.categorie
      })),
      ...resultatsQuatrieme.map(r => ({
        competition: r.competition,
        position: 4,
        points: r.pointsAttribues.quatrieme,
        categorie: r.categorie
      }))
    ];

    performances.sort((a, b) => b.points - a.points);

    const top9Performances = performances.slice(0, 9);
    const pointsTop9 = top9Performances.reduce((sum, perf) => sum + perf.points, 0);

    res.status(200).json({
      success: true,
      data: {
        joueur: {
          id: joueur._id,
          nom: joueur.nom,
          prenom: joueur.prenom,
          categorie: joueur.categorie,
          clubs: joueur.clubs,
          photo: joueur.photo
        },
        statistiques: {
          pointsTotal: joueur.pointsTotal,
          pointsTop9: pointsTop9,
          nombreVictoires: resultatsVictoires.length,
          nombrePodiums: resultatsVictoires.length + resultatsDeuxieme.length + resultatsTroisieme.length,
          nombreCompetitions: performances.length
        },
        performances: performances,
        top9Performances: top9Performances
      }
    });
  } catch (error) {
    next(error);
  }
};

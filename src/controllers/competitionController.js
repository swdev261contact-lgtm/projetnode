const Competition = require('../models/Competition');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.createCompetition = async (req, res, next) => {
  try {
    const competitionData = {
      ...req.body,
      clubOrganisateur: req.user.role === 'club' ? req.user._id : req.body.clubOrganisateur
    };

    if (req.file) {
      competitionData.affiche = req.file.path;
    }

    const competition = await Competition.create(competitionData);

    res.status(201).json({
      success: true,
      message: 'Compétition créée avec succès',
      data: competition
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompetitions = async (req, res, next) => {
  try {
    const { page, limit, ville, search, statut, dateDebut, dateFin } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = { active: true };

    if (ville) {
      query.ville = { $regex: ville, $options: 'i' };
    }

    if (statut) {
      query.statut = statut;
    }

    if (search) {
      query.$or = [
        { nomEvenement: { $regex: search, $options: 'i' } },
        { ville: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateDebut || dateFin) {
      query.date = {};
      if (dateDebut) query.date.$gte = new Date(dateDebut);
      if (dateFin) query.date.$lte = new Date(dateFin);
    }

    const total = await Competition.countDocuments(query);
    const competitions = await Competition.find(query)
      .populate('clubOrganisateur', 'nom ville region')
      .skip(skip)
      .limit(limitNumber)
      .sort({ date: 1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: competitions.length,
      pagination,
      data: competitions
    });
  } catch (error) {
    next(error);
  }
};

exports.getCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id)
      .populate('clubOrganisateur', 'nom ville region departement contactReferent');

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: competition
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    if (req.user.role === 'club' && competition.clubOrganisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette compétition'
      });
    }

    if (req.file) {
      req.body.affiche = req.file.path;
    }

    const updatedCompetition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('clubOrganisateur', 'nom ville region');

    res.status(200).json({
      success: true,
      message: 'Compétition modifiée avec succès',
      data: updatedCompetition
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Compétition non trouvée'
      });
    }

    if (req.user.role === 'club' && competition.clubOrganisateur.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette compétition'
      });
    }

    await Competition.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Compétition supprimée avec succès',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

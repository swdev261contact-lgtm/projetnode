const Club = require('../models/Club');
const Joueur = require('../models/Joueur');
const generateToken = require('../utils/jwt');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.createClub = async (req, res, next) => {
  try {
    const club = await Club.create(req.body);

    const token = generateToken(club._id, club.role);

    res.status(201).json({
      success: true,
      message: 'Club créé avec succès',
      data: {
        club,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getClubs = async (req, res, next) => {
  try {
    const { page, limit, region, departement, search } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = { active: true };

    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }

    if (departement) {
      query.departement = { $regex: departement, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { ville: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Club.countDocuments(query);
    const clubs = await Club.find(query)
      .select('-password')
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: clubs.length,
      pagination,
      data: clubs
    });
  } catch (error) {
    next(error);
  }
};

exports.getClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id).select('-password');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: club
    });
  } catch (error) {
    next(error);
  }
};

exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Club modifié avec succès',
      data: club
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Club supprimé avec succès',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

exports.getClubPlayers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club non trouvé'
      });
    }

    const total = await Joueur.countDocuments({ clubs: req.params.id });
    const joueurs = await Joueur.find({ clubs: req.params.id })
      .select('-password')
      .skip(skip)
      .limit(limitNumber)
      .sort({ nom: 1 });

    const pagination = getPaginationData(total, page, limit);

    res.status(200).json({
      success: true,
      count: joueurs.length,
      pagination,
      data: joueurs
    });
  } catch (error) {
    next(error);
  }
};

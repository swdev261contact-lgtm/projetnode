const Joueur = require('../models/Joueur');
const { getPagination, getPaginationData } = require('../utils/pagination');

exports.getJoueurs = async (req, res, next) => {
  try {
    const { page, limit, search, categorie, club } = req.query;
    const { skip, limit: limitNumber } = getPagination(page, limit);

    let query = { active: true };

    if (categorie) {
      query.categorie = categorie;
    }

    if (club) {
      query.clubs = club;
    }

    if (search) {
      query.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { prenom: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Joueur.countDocuments(query);
    const joueurs = await Joueur.find(query)
      .populate('clubs', 'nom region departement')
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

exports.getJoueur = async (req, res, next) => {
  try {
    const joueur = await Joueur.findById(req.params.id)
      .populate('clubs', 'nom region departement')
      .select('-password');

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: joueur
    });
  } catch (error) {
    next(error);
  }
};

exports.updateJoueur = async (req, res, next) => {
  try {
    if (req.user.role === 'joueur' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce profil'
      });
    }

    const joueur = await Joueur.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('clubs', 'nom region departement')
      .select('-password');

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profil modifié avec succès',
      data: joueur
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteJoueur = async (req, res, next) => {
  try {
    const joueur = await Joueur.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Joueur supprimé avec succès',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

exports.addClubToJoueur = async (req, res, next) => {
  try {
    const { clubId } = req.body;
    const joueur = await Joueur.findById(req.params.id);

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    if (joueur.clubs.length >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Un joueur ne peut être inscrit qu\'à un maximum de 3 clubs'
      });
    }

    if (joueur.clubs.includes(clubId)) {
      return res.status(400).json({
        success: false,
        message: 'Joueur déjà inscrit à ce club'
      });
    }

    joueur.clubs.push(clubId);
    await joueur.save();

    const updatedJoueur = await Joueur.findById(req.params.id)
      .populate('clubs', 'nom region departement')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Club ajouté avec succès',
      data: updatedJoueur
    });
  } catch (error) {
    next(error);
  }
};

exports.removeClubFromJoueur = async (req, res, next) => {
  try {
    const { clubId } = req.body;
    const joueur = await Joueur.findById(req.params.id);

    if (!joueur) {
      return res.status(404).json({
        success: false,
        message: 'Joueur non trouvé'
      });
    }

    joueur.clubs = joueur.clubs.filter(club => club.toString() !== clubId);
    await joueur.save();

    const updatedJoueur = await Joueur.findById(req.params.id)
      .populate('clubs', 'nom region departement')
      .select('-password');

    res.status(200).json({
      success: true,
      message: 'Club retiré avec succès',
      data: updatedJoueur
    });
  } catch (error) {
    next(error);
  }
};

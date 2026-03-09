# API de Gestion de Compétitions de Palets

Backend REST API complet pour la gestion de compétitions de palets, développé avec Node.js, Express et MongoDB.

## Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par token
- **Bcrypt** - Hashage des mots de passe
- **Multer** - Upload de fichiers
- **Express Validator** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Cross-Origin Resource Sharing

## Structure du projet

```
src/
├── config/
│   ├── database.js       # Configuration MongoDB
│   └── multer.js         # Configuration upload fichiers
├── controllers/
│   ├── authController.js
│   ├── clubController.js
│   ├── joueurController.js
│   ├── competitionController.js
│   ├── inscriptionController.js
│   ├── resultatController.js
│   └── classementController.js
├── models/
│   ├── Admin.js
│   ├── Club.js
│   ├── Joueur.js
│   ├── Competition.js
│   ├── Inscription.js
│   └── Resultat.js
├── routes/
│   ├── authRoutes.js
│   ├── clubRoutes.js
│   ├── joueurRoutes.js
│   ├── competitionRoutes.js
│   ├── inscriptionRoutes.js
│   ├── resultatRoutes.js
│   └── classementRoutes.js
├── middleware/
│   ├── auth.js           # Authentification JWT
│   ├── errorHandler.js   # Gestion des erreurs
│   └── validator.js      # Validation des requêtes
├── utils/
│   ├── jwt.js            # Génération de tokens
│   └── pagination.js     # Utilitaires pagination
├── app.js                # Configuration Express
└── server.js             # Point d'entrée
```

## Installation

1. Cloner le dépôt
```bash
git clone <repository-url>
cd palets-competition-api
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```

Modifier le fichier `.env` avec vos paramètres :
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb://localhost:27017/palets-competition

JWT_SECRET=votre_secret_jwt_tres_complexe
JWT_EXPIRE=7d

UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880
```

4. Démarrer MongoDB
```bash
# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Ou utiliser MongoDB installé localement
mongod
```

5. Lancer le serveur
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## API Endpoints

### Authentication

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/auth/joueur/register` | Inscription joueur | Non |
| POST | `/api/auth/joueur/login` | Connexion joueur | Non |
| POST | `/api/auth/club/login` | Connexion club | Non |
| POST | `/api/auth/admin/login` | Connexion admin | Non |
| GET | `/api/auth/me` | Profil utilisateur | Oui |

### Clubs

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/clubs` | Créer un club | Admin |
| GET | `/api/clubs` | Liste des clubs | Non |
| GET | `/api/clubs/:id` | Détails d'un club | Non |
| PUT | `/api/clubs/:id` | Modifier un club | Admin/Club |
| DELETE | `/api/clubs/:id` | Supprimer un club | Admin |
| GET | `/api/clubs/:id/joueurs` | Joueurs d'un club | Non |

### Joueurs

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/joueurs` | Liste des joueurs | Non |
| GET | `/api/joueurs/:id` | Détails d'un joueur | Non |
| PUT | `/api/joueurs/:id` | Modifier un joueur | Admin/Joueur |
| DELETE | `/api/joueurs/:id` | Supprimer un joueur | Admin |
| POST | `/api/joueurs/:id/clubs` | Ajouter un club | Admin/Joueur |
| DELETE | `/api/joueurs/:id/clubs` | Retirer un club | Admin/Joueur |

### Compétitions

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/competitions` | Créer une compétition | Admin/Club |
| GET | `/api/competitions` | Liste des compétitions | Non |
| GET | `/api/competitions/:id` | Détails compétition | Non |
| PUT | `/api/competitions/:id` | Modifier compétition | Admin/Club |
| DELETE | `/api/competitions/:id` | Supprimer compétition | Admin/Club |

### Inscriptions

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/inscriptions` | S'inscrire | Joueur |
| GET | `/api/inscriptions` | Mes inscriptions | Joueur |
| GET | `/api/inscriptions/:id` | Détails inscription | Joueur |
| PATCH | `/api/inscriptions/:id/cancel` | Annuler inscription | Joueur/Admin |
| GET | `/api/inscriptions/competition/:id/participants` | Participants | Non |

### Résultats

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| POST | `/api/resultats` | Créer résultat | Admin/Club |
| GET | `/api/resultats` | Liste des résultats | Non |
| GET | `/api/resultats/:id` | Détails résultat | Non |
| PUT | `/api/resultats/:id` | Modifier résultat | Admin/Club |

### Classements

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| GET | `/api/classements` | Classement global | Non |
| POST | `/api/classements/personnalise` | Classement personnalisé | Non |
| GET | `/api/classements/joueur/:id/stats` | Stats d'un joueur | Non |

## Exemples d'utilisation

### Inscription d'un joueur

```bash
curl -X POST http://localhost:5000/api/auth/joueur/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "password": "password123",
    "dateNaissance": "1990-05-15",
    "nationalite": "France",
    "mainForte": "droitier",
    "categorie": "homme"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:5000/api/auth/joueur/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "password123"
  }'
```

### Créer une compétition

```bash
curl -X POST http://localhost:5000/api/competitions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nomEvenement": "Championnat de Bretagne 2026",
    "ville": "Rennes",
    "date": "2026-06-15",
    "nombrePlaces": 128,
    "categories": {
      "individuHomme": true,
      "individuFemme": true,
      "junior": true
    }
  }'
```

### S'inscrire à une compétition

```bash
curl -X POST http://localhost:5000/api/inscriptions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "competitionId": "COMPETITION_ID",
    "categorieInscrite": "individuHomme"
  }'
```

### Obtenir le classement

```bash
curl http://localhost:5000/api/classements?categorie=homme&region=Bretagne&page=1&limit=20
```

## Tests avec Postman

Importez le fichier `Postman_Collection.json` dans Postman pour tester tous les endpoints de l'API.

La collection inclut :
- Variables d'environnement (baseUrl, token, etc.)
- Scripts de test automatiques
- Exemples de requêtes pour tous les endpoints

## Système de points

Le système de classement fonctionne comme suit :

- 1er place : 100 points
- 2ème place : 75 points
- 3ème place : 50 points
- 4ème place : 25 points

**Important** : Seules les 9 meilleures performances sur 10 sont comptabilisées dans le classement final.

## Rôles utilisateurs

- **Admin** : Gestion complète (clubs, compétitions, résultats)
- **Club** : Créer/modifier ses propres compétitions
- **Joueur** : S'inscrire aux compétitions, gérer son profil

## Sécurité

- Mots de passe hashés avec bcrypt
- Authentification JWT
- Rate limiting (100 requêtes/10min)
- Helmet pour sécuriser les headers HTTP
- Validation des données entrantes
- Gestion des rôles et permissions

## Scripts disponibles

```bash
npm start       # Démarrer en production
npm run dev     # Démarrer en développement avec nodemon
```

## Auteur

DAVID Jeux

## Licence

ISC

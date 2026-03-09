# Guide de Dépannage

## Problème : Impossible de se connecter au compte admin

### Cause
Le compte admin n'existe pas encore dans la base de données MongoDB.

### Solution

#### Étape 1 : Démarrer MongoDB

Vous devez avoir MongoDB en cours d'exécution. Choisissez une option :

**Option A : Avec Docker (recommandé)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option B : MongoDB installé localement**
```bash
mongod
```

**Option C : Utiliser MongoDB Atlas (cloud)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Obtenez votre URL de connexion
4. Modifiez la variable `MONGODB_URI` dans le fichier `.env`

#### Étape 2 : Créer le compte admin

```bash
npm run create-admin
```

Ce script va créer un compte admin avec les identifiants suivants :
- **Email** : `admin@davidjeux.com`
- **Mot de passe** : `admin123`

#### Étape 3 : Démarrer le serveur

```bash
npm run dev
```

#### Étape 4 : Se connecter

Utilisez Postman ou curl pour vous connecter :

```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@davidjeux.com",
    "password": "admin123"
  }'
```

### Vérification

Si tout fonctionne, vous devriez recevoir une réponse avec un token JWT :

```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "admin": {
      "id": "...",
      "nom": "Administrateur",
      "email": "admin@davidjeux.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Autres problèmes courants

### Erreur : "MongoDB connecté: undefined"

Votre MongoDB n'est pas démarré. Suivez l'Étape 1 ci-dessus.

### Erreur : "Un compte admin existe déjà"

Le compte admin existe déjà. Utilisez les identifiants par défaut ou réinitialisez la base de données.

### Erreur : "Identifiants invalides"

Vérifiez que vous utilisez les bons identifiants :
- Email : `admin@davidjeux.com`
- Mot de passe : `admin123`

### Port déjà utilisé

Si le port 5000 est déjà utilisé, modifiez la variable `PORT` dans le fichier `.env`.

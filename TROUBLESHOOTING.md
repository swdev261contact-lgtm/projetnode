# Guide de Dépannage - Problème de Connexion Admin

## Problème
Impossible de se connecter au compte admin.

## Cause
Le compte admin n'existe pas encore dans MongoDB.

## Solution

### Étape 1 : S'assurer que MongoDB fonctionne

Vérifiez que MongoDB est en cours d'exécution sur votre machine :

**Option A : MongoDB installé localement**
```bash
mongod
```

**Option B : Avec Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option C : MongoDB Atlas (cloud)**
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Récupérez l'URL de connexion
4. Mettez à jour `MONGODB_URI` dans `.env`

### Étape 2 : Créer le compte admin

Une fois MongoDB démarré, exécutez :

```bash
npm run create-admin
```

Ce script crée automatiquement un compte admin avec :
- **Email** : `admin@davidjeux.com`
- **Mot de passe** : `admin123`

Vous devriez voir :
```
✓ MongoDB connecté
✓ Compte admin créé avec succès!

--- Identifiants de connexion ---
Email: admin@davidjeux.com
Mot de passe: admin123

⚠ IMPORTANT: Changez ce mot de passe après la première connexion!
```

### Étape 3 : Démarrer le serveur

```bash
npm run dev
```

### Étape 4 : Tester la connexion admin

Avec cURL :
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@davidjeux.com", "password": "admin123"}'
```

Ou avec Postman :
- URL : `POST http://localhost:5000/api/auth/admin/login`
- Body (JSON) :
```json
{
  "email": "admin@davidjeux.com",
  "password": "admin123"
}
```

**Réponse attendue** :
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

## Erreurs courantes

### "MongoDB connecté: undefined"
MongoDB n'est pas démarré. Lancez `mongod` ou Docker.

### "Un compte admin existe déjà"
Le compte existe déjà. Utilisez les identifiants par défaut ou supprimez la base MongoDB.

### "Identifiants invalides"
Vérifiez l'email et le mot de passe :
- Email : `admin@davidjeux.com`
- Mot de passe : `admin123`

### "Erreur de connexion à MongoDB"
1. Vérifiez que MongoDB écoute sur `localhost:27017`
2. Vérifiez `MONGODB_URI` dans le fichier `.env`

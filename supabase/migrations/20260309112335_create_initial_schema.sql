/*
  # Schéma initial pour l'application de gestion de compétitions de palets

  ## Description
  Création de toutes les tables nécessaires pour gérer les compétitions de palets,
  incluant les admins, clubs, joueurs, compétitions, inscriptions et résultats.

  ## Tables créées
  
  1. **admins**
     - id (uuid, clé primaire)
     - nom (text)
     - email (text, unique)
     - password (text, hashé)
     - role (text, défaut 'admin')
     - active (boolean, défaut true)
     - created_at (timestamptz)
     - updated_at (timestamptz)
  
  2. **clubs**
     - id (uuid, clé primaire)
     - nom (text, unique)
     - email (text, unique)
     - password (text, hashé)
     - region (text)
     - departement (text)
     - jours_entrainement (text[])
     - horaires (text)
     - contact_referent (jsonb)
     - disciplines (jsonb)
     - role (text, défaut 'club')
     - active (boolean, défaut true)
     - created_at (timestamptz)
     - updated_at (timestamptz)
  
  3. **joueurs**
     - id (uuid, clé primaire)
     - nom (text)
     - prenom (text)
     - email (text, unique)
     - password (text, hashé)
     - date_naissance (date)
     - age (integer)
     - nationalite (text, défaut 'France')
     - main_forte (text: droitier/gaucher/ambidextre)
     - categorie (text: homme/femme/junior)
     - clubs (uuid[])
     - photo (text)
     - role (text, défaut 'joueur')
     - active (boolean, défaut true)
     - points_total (integer, défaut 0)
     - created_at (timestamptz)
     - updated_at (timestamptz)
  
  4. **competitions**
     - id (uuid, clé primaire)
     - nom_evenement (text)
     - ville (text)
     - date (date)
     - affiche (text)
     - nombre_places (integer)
     - places_restantes (integer)
     - categories (jsonb)
     - club_organisateur (uuid, référence clubs)
     - statut (text)
     - active (boolean, défaut true)
     - created_at (timestamptz)
     - updated_at (timestamptz)
  
  5. **inscriptions**
     - id (uuid, clé primaire)
     - competition (uuid, référence competitions)
     - joueur (uuid, référence joueurs)
     - categorie_inscrite (text)
     - partenaire (uuid, référence joueurs)
     - statut (text, défaut 'confirmée')
     - date_inscription (timestamptz, défaut now())
     - created_at (timestamptz)
     - updated_at (timestamptz)
  
  6. **resultats**
     - id (uuid, clé primaire)
     - competition (uuid, référence competitions)
     - categorie (text)
     - vainqueur (uuid, référence joueurs)
     - deuxieme (uuid, référence joueurs)
     - troisieme (uuid, référence joueurs)
     - quatrieme (uuid, référence joueurs)
     - photos_vainqueurs (text[])
     - photos_evenement (text[])
     - video_finale (text)
     - points_attribues (jsonb)
     - created_at (timestamptz)
     - updated_at (timestamptz)

  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives selon le rôle utilisateur
  - Mots de passe hashés côté application
*/

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'admin',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  region text NOT NULL,
  departement text NOT NULL,
  jours_entrainement text[] DEFAULT '{}',
  horaires text,
  contact_referent jsonb DEFAULT '{}',
  disciplines jsonb DEFAULT '{"paletFonteBois": false, "paletFontePlomb": false, "paletLaitonPlomb": false}',
  role text DEFAULT 'club',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS joueurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  date_naissance date NOT NULL,
  age integer,
  nationalite text DEFAULT 'France',
  main_forte text NOT NULL CHECK (main_forte IN ('droitier', 'gaucher', 'ambidextre')),
  categorie text NOT NULL CHECK (categorie IN ('homme', 'femme', 'junior')),
  clubs uuid[] DEFAULT '{}',
  photo text,
  role text DEFAULT 'joueur',
  active boolean DEFAULT true,
  points_total integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_evenement text NOT NULL,
  ville text NOT NULL,
  date date NOT NULL,
  affiche text,
  nombre_places integer NOT NULL CHECK (nombre_places >= 1),
  places_restantes integer,
  categories jsonb DEFAULT '{"individuHomme": false, "individuFemme": false, "junior": false, "doublette": false}',
  club_organisateur uuid REFERENCES clubs(id) ON DELETE CASCADE,
  statut text DEFAULT 'à venir' CHECK (statut IN ('à venir', 'inscriptions ouvertes', 'complet', 'en cours', 'terminé')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition uuid REFERENCES competitions(id) ON DELETE CASCADE,
  joueur uuid REFERENCES joueurs(id) ON DELETE CASCADE,
  categorie_inscrite text NOT NULL CHECK (categorie_inscrite IN ('individuHomme', 'individuFemme', 'junior', 'doublette')),
  partenaire uuid REFERENCES joueurs(id) ON DELETE SET NULL,
  statut text DEFAULT 'confirmée' CHECK (statut IN ('confirmée', 'en attente', 'annulée')),
  date_inscription timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(competition, joueur)
);

CREATE TABLE IF NOT EXISTS resultats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition uuid REFERENCES competitions(id) ON DELETE CASCADE,
  categorie text NOT NULL CHECK (categorie IN ('individuHomme', 'individuFemme', 'junior', 'doublette')),
  vainqueur uuid REFERENCES joueurs(id) ON DELETE SET NULL,
  deuxieme uuid REFERENCES joueurs(id) ON DELETE SET NULL,
  troisieme uuid REFERENCES joueurs(id) ON DELETE SET NULL,
  quatrieme uuid REFERENCES joueurs(id) ON DELETE SET NULL,
  photos_vainqueurs text[] DEFAULT '{}',
  photos_evenement text[] DEFAULT '{}',
  video_finale text,
  points_attribues jsonb DEFAULT '{"premier": 100, "deuxieme": 75, "troisieme": 50, "quatrieme": 25}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(competition, categorie)
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE joueurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clubs can view all clubs"
  ON clubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view active clubs"
  ON clubs FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Clubs can update own profile"
  ON clubs FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Public can view active joueurs"
  ON joueurs FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Joueurs can update own profile"
  ON joueurs FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Public can view active competitions"
  ON competitions FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Authenticated users can view inscriptions"
  ON inscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Joueurs can create inscriptions"
  ON inscriptions FOR INSERT
  TO authenticated
  WITH CHECK (joueur::text = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Public can view resultats"
  ON resultats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_clubs_region ON clubs(region);
CREATE INDEX IF NOT EXISTS idx_clubs_departement ON clubs(departement);
CREATE INDEX IF NOT EXISTS idx_joueurs_categorie ON joueurs(categorie);
CREATE INDEX IF NOT EXISTS idx_joueurs_points ON joueurs(points_total DESC);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
CREATE INDEX IF NOT EXISTS idx_competitions_ville ON competitions(ville);
CREATE INDEX IF NOT EXISTS idx_inscriptions_competition ON inscriptions(competition);
CREATE INDEX IF NOT EXISTS idx_inscriptions_joueur ON inscriptions(joueur);
CREATE INDEX IF NOT EXISTS idx_resultats_competition ON resultats(competition);

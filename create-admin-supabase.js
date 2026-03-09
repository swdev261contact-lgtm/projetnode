require('dotenv').config();
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Mot de passe hashé généré:');
  console.log(hashedPassword);
  console.log('\nUtilisez cette valeur pour insérer dans la base de données Supabase');
  console.log('\nSQL à exécuter:');
  console.log(`
INSERT INTO admins (nom, email, password, role, active)
VALUES (
  'Administrateur',
  'admin@davidjeux.com',
  '${hashedPassword}',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
RETURNING id, nom, email, role;
  `);
}

createAdmin();

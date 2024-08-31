const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis la racine
app.use(express.static(__dirname));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Implémentez ici la vérification des identifiants
  if (username === 'user' && password === 'pass') {
    res.json({ success: true, message: 'Connexion réussie' });
  } else {
    res.status(401).json({ success: false, message: 'Identifiants incorrects' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Path per il file degli utenti
const usersFilePath = path.join(__dirname, 'users.txt');

// Assicurati che il file esista
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, '[]', 'utf8');
}

// Endpoint per ottenere tutti gli utenti
app.get('/api/users', (req, res) => {
    try {
        const users = fs.readFileSync(usersFilePath, 'utf8');
        res.json(JSON.parse(users));
    } catch (error) {
        console.error('Errore nella lettura del file:', error);
        res.status(500).json({ error: 'Errore nel recupero degli utenti' });
    }
});

// Endpoint per aggiungere un nuovo utente
app.post('/api/users', (req, res) => {
    try {
        const newUser = req.body;
        
        // Validazione dei dati
        if (!newUser.username || !newUser.email || !newUser.password) {
            return res.status(400).json({ error: 'Username, email e password sono richiesti' });
        }
        
        // Leggi utenti esistenti
        const usersContent = fs.readFileSync(usersFilePath, 'utf8');
        let users = [];
        
        try {
            users = JSON.parse(usersContent);
        } catch (parseError) {
            console.error('Errore nel parsing JSON:', parseError);
            users = [];
        }
        
        // Verifica se l'utente esiste già
        const existingUser = users.find(user => user.username === newUser.username || user.email === newUser.email);
        if (existingUser) {
            return res.status(400).json({ error: 'Username o email già in uso' });
        }
        
        // Aggiungi il nuovo utente
        users.push(newUser);
        
        // Salva il file aggiornato
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
        
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Errore nel salvataggio dell\'utente:', error);
        res.status(500).json({ error: 'Errore nel salvataggio dell\'utente' });
    }
});

// Endpoint per il login utente
app.post('/api/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validazione dei dati
        if (!username || !password) {
            return res.status(400).json({ error: 'Username e password sono richiesti' });
        }
        
        // Leggi utenti esistenti
        const usersContent = fs.readFileSync(usersFilePath, 'utf8');
        let users = [];
        
        try {
            users = JSON.parse(usersContent);
        } catch (parseError) {
            console.error('Errore nel parsing JSON:', parseError);
            return res.status(500).json({ error: 'Errore nel parsing degli utenti' });
        }
        
        // Verifica se l'utente esiste e la password è corretta
        const user = users.find(user => user.username === username && user.password === password);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenziali non valide o utente non registrato' });
        }
        
        // Invio dati utente (senza la password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({ 
            message: 'Login effettuato con successo',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({ error: 'Errore durante il login' });
    }
});

// Endpoint per eliminare un utente
app.delete('/api/users/:username', (req, res) => {
    try {
        const usernameToDelete = req.params.username;
        
        // Leggi utenti esistenti
        const usersContent = fs.readFileSync(usersFilePath, 'utf8');
        let users = [];
        
        try {
            users = JSON.parse(usersContent);
        } catch (parseError) {
            console.error('Errore nel parsing JSON:', parseError);
            return res.status(500).json({ error: 'Errore nel parsing degli utenti' });
        }
        
        // Filtra per rimuovere l'utente
        const initialLength = users.length;
        const filteredUsers = users.filter(user => user.username !== usernameToDelete);
        
        // Verifica se l'utente è stato trovato e rimosso
        if (filteredUsers.length === initialLength) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }
        
        // Salva il file aggiornato
        fs.writeFileSync(usersFilePath, JSON.stringify(filteredUsers, null, 2), 'utf8');
        
        res.json({ message: 'Utente eliminato con successo' });
    } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
        res.status(500).json({ error: 'Errore nell\'eliminazione dell\'utente' });
    }
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
    console.log(`File degli utenti: ${usersFilePath}`);
});

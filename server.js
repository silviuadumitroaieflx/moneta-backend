const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

let users = require('./users.json');

// Ruta pentru pagina principală
app.get("/", (req, res) => {
  res.send("✅ Moneta API e live!");
});

// Endpoint de înregistrare
app.post('/register', (req, res) => {
    const { name, surname, phone, email, address, password } = req.body;
    
    console.log("Register request received: ", req.body);

    if (!password || password.trim() === "") {
        return res.status(400).json({ message: "Parola nu poate fi goală!" });
    }

    const newUser = {
        id: users.users.length + 1,
        name,
        surname,
        phone,
        email,
        address,
        password,
        balance: 0
    };

    users.users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    
    res.status(201).json({ message: "Cont creat cu succes!", userId: newUser.id });
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log("Login request received: ", req.body);

    const user = users.users.find(user => user.email === email && user.password === password);

    if (user) {
        const token = `Bearer ${user.id}`;
        res.json({ message: "Autentificare reușită!", token });
    } else {
        res.status(401).json({ error: "Email sau parolă incorectă!" });
    }
});

// Endpoint pentru a obține soldul utilizatorului
app.get('/balance/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.users.find(user => user.id === userId);

    if (user) {
        res.json({ balance: user.balance });
    } else {
        res.status(404).json({ error: "Utilizatorul nu există!" });
    }
});

// Endpoint pentru a face un transfer
app.post('/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;

    const sender = users.users.find(user => user.id === fromId);
    const receiver = users.users.find(user => user.id === parseInt(toId));

    if (!sender || !receiver) {
        return res.status(404).json({ error: "Utilizator invalid!" });
    }

    if (sender.balance < amount) {
        return res.status(400).json({ error: "Fonduri insuficiente!" });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.json({ message: `Transfer de ${amount} RON realizat cu succes!` });
});

app.listen(PORT, () => {
    console.log(`Moneta API rulează pe http://localhost:${PORT}`);
});

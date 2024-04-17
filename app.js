const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const homeRoute = require('./routes/homeRoute');
// utils functions
const utils = require('./lib/utils');
require('dotenv').config();


const app = express();

app.use(cors({
    origin: 'https://finance.madanilab.site',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'CF-Access-Client-Id', 'CF-Access-Client-Secret'],
    credentials: true
}));

app.use(express.json());

app.options('/auth/authenticated', (req, res) => {
    // Respond with CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://finance.madanilab.site');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, CF-Access-Client-Id, CF-Access-Client-Secret');
    res.status(200).end();
});

// const options = {
//     key: fs.readFileSync('/path/to/private/key.pem'),
//     cert: fs.readFileSync('/path/to/certificate.pem')
// };
// const server = https.createServer(options, (req, res) => {
// res.writeHead(200);
// res.end('Hello, HTTPS World!');
// });

app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    // Set headers
    res.header('Content-Type', 'application/json');

    next();
});


// It's better to connect the db once here.
mongoose.connect(process.env.DB_URL_CONTAINER)
.then(() => {
console.log('Connected to MongoDB');
})
.catch((error) => {
console.error('Error connecting to MongoDB:', error);
});

app.use('/auth', authRoutes);

// protecting all /api routes
app.use('/api', utils.authMiddleware);

app.use('/api/transaction', transactionRoutes); 
app.use('/api/profile', profileRoutes); 
app.use('/api/space', spaceRoutes); 
app.use('/api/balance', balanceRoutes); 

app.use('/api/home', homeRoute);

const PORT = 3000;
app.listen(PORT);
console.log(`app is running on http://localhost:${PORT}`);
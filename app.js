const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const profileRoutes = require('./routes/profileRoutes');
const spaceRoutes = require('./routes/spaceRoutes');
const balanceRoutes = require('./routes/balanceRoutes');
const homeRoute = require('./routes/homeRoute');
const utils = require('./lib/utils');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    next();
});

// Load SSL certificate and private key
// const options = {
//     key: fs.readFileSync('./cert/private.pem'),
//     cert: fs.readFileSync('./cert/certificate.pem')
// };

app.use(cors({
    origin: ['https://finance.madanilab.site', /^http:\/\/192\.168\.1\.\d{1,3}$/, 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'CF-Access-Client-Id', 'CF-Access-Client-Secret', 'x-user-timezone'],
    credentials: true
}));

app.use(express.json());

app.options('*', (req, res) => {
    // Respond with CORS headers
    res.setHeader('Access-Control-Allow-Origin', ['https://finance.madanilab.site', /^http:\/\/192\.168\.1\.\d{1,3}$/, 'http://localhost:5173']);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, CF-Access-Client-Id, CF-Access-Client-Secret, x-user-timezone');
    res.status(200).end();
});

app.use(express.urlencoded({extended: true}));

// It's better to connect to the database once here.
mongoose.connect(process.env.DB_URL_CONTAINER)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Routes
app.use('/auth', authRoutes);
app.use('/api', utils.authMiddleware); // protecting all /api routes
app.use('/api/transaction', transactionRoutes); 
app.use('/api/profile', profileRoutes); 
app.use('/api/space', spaceRoutes); 
app.use('/api/balance', balanceRoutes); 
app.use('/api/home', homeRoute);

// Create HTTPS server using Express app
// const server = https.createServer(options, app);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`App is running on https://localhost:${PORT}`);
});



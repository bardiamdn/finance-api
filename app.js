const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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

// Allowed origins to cores: All
app.use(cors());



app.use(express.json());
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
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
const mysql = require('mysql');

require('dotenv').config();

// Inititalize the app and add middleware
app.set('view engine', 'pug'); // Setup the pug
app.use(bodyParser.urlencoded({extended: true})); // Setup the body parser to handle form submits
app.use(session({secret: 'super-secret'})); // Session setup

// Parse application/json
app.use(bodyParser.json());

// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100, // restricts the raw IP connections
    host           : process.env.DB_HOST,
    user           : process.env.DB_USER,
    password       : process.env.DB_PASS,
    database       : process.env.DB_NAME
});

// Connect to DB
pool.getConnection((err, connection) => {
    if(err) throw err; // not connected!
    console.log('Connected as ID ' + connection.threadId);
});

const routes = require("./server/routes/user");
app.use('/', routes);

/** App listening on port */
app.listen(port, () => {
    console.log(`MyBank app listening at http://localhost:${port}`);
  });
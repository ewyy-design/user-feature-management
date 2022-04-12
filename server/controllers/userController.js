const mysql = require('mysql');
const session = require('express-session');


// Connection Pool
const pool = mysql.createPool({
    connectionLimit: 100, // restricts the raw IP connections
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Login 
exports.login = (req, res) => {
    // Render login page
    res.render('login');
}

// Login Attempt
exports.loginAttempt = (req, res) => {
    const { username, password, id} = req.body

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        var signInUser = [];

        // User the connection
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], (err, results) => {
            // When done with the connection, release it
            connection.release();

            // If there is an error with the query, output the error
            if (err) throw err;

            // Check if account exists
            if (results.length > 0) {
                // Authenticate user
                req.session.isLoggedIn = true;
				req.session.username = username;
                req.session.id = id;

                // Loop details of signInUser
                for (var d = 0; d < results.length; d++) {
                    // Create an object to save the user data
                    var person = {
                        'id': results[d].id,
                        'username': results[d].username,
                        'password': results[d].password,
                        'email': results[d].email,
                        'balance': results[d].balance,
                        'accountNo': results[d].accountNo
                    };
                    // Add object to array
                    signInUser.push(person);
                };
                // Render dashboard.pug using array
                res.redirect('dashboard/' + person.id);
            } else {
                // If there is issue with the query, output the error
                res.render('login', { error: 'The username and password you entered did not match our records. Please double-check and try again.' });
            };
            console.log(signInUser)
        });
    });
};

// Logout
exports.logout = (req, res) => {
    req.session.isLoggedIn = false;
    res.redirect('/');
};

// Dashboard
exports.dashboard = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        var signInUser = [];

        // User the connection
        connection.query('SELECT * FROM accounts WHERE id= ?', [req.params.id], (err, results) => {
            // When done with the connection, release it
            connection.release();

            // If there is an error with the query, output the error
            if (err) throw err;
            
            // Loop details of signInUser
            for (var e = 0; e < results.length; e++) {
                // Create an object to save the user data
                var person = {
                    'id': results[e].id,
                    'username': results[e].username,
                    'password': results[e].password,
                    'email': results[e].email,
                    'balance': results[e].balance,
                    'accountNo': results[e].accountNo
                };
                // Add object to array
                signInUser.push(person);
            };
            res.render('dashboard', {'signInUser': signInUser});
        });
    });  
};

// View Users
exports.view = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        // Render home.pug page using array
        res.render('home')
    });
};

// Edit user
exports.edit = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        var chosenEmail = []

        // User the connection
        connection.query('SELECT id, email FROM accounts WHERE id= ?', [req.params.id], (err, results) => {
            // When done with connection, release it
            connection.release();
            if (!err) {
                // Loop check on each row
                for (var j = 0; j < results.length; j++) {
                    // Create an object to save email data
                    var person = {
                        'id': results[j].id,
                        'email': results[j].email
                    }
                    // Add object to array
                    chosenEmail.push(person)
                }
                // Render edit-user using array
                res.render('edit-email', { "chosenEmail": chosenEmail });
            } else {
                console.log(err);
            }
            console.log(chosenEmail);
        });
    });
};

// Update user
exports.update = (req, res) => {
    const { email } = req.body;

    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        // User the connection
        connection.query('UPDATE accounts SET email = ? WHERE id = ?', [email, req.params.id], (err, results) => {
            // When done with connection, release it
            connection.release();
            if (!err) {
                pool.getConnection((err, connection) => {
                    if (err) throw err; // not connected!
                    console.log('Connected as ID ' + connection.threadId);

                    var chosenEmail = []

                    // User the connection
                    connection.query('SELECT id, email FROM accounts WHERE id= ?', [req.params.id], (err, results) => {
                        // When done with connection, release it
                        connection.release();
                        if (!err) {
                            // Loop check on each row
                            for (var j = 0; j < results.length; j++) {
                                // Create an object to save email data
                                var person = {
                                    'id': results[j].id,
                                    'email': results[j].email
                                }
                                // Add object to array
                                chosenEmail.push(person)
                            }
                            // Render edit-user using array
                            res.render('edit-email', { "chosenEmail": chosenEmail, alert: 'Updated successfully.' });
                        } else {
                            console.log(err);
                        }
                        console.log(results);
                    });
                });
            };
        });
    });
};

// View All
exports.viewAll = (req, res) => {
    pool.getConnection((err, connection) => {
        if (err) throw err; // not connected!
        console.log('Connected as ID ' + connection.threadId);

        if (req.session.isLoggedIn === true) {
            var chosenPersonList = [];

            // User the connection
            connection.query('SELECT * FROM accounts WHERE id = ?', [req.params.id], (err, results) => {
                // When done with the connection, release it
                connection.release();
                if (!err) {
                     // Loop check on each row
                    for (var i = 0; i < results.length; i++) {
                        // Create an object to save current row data's data
                        var person = {
                            'id': results[i].id,
                            'username': results[i].username,
                            'password': results[i].password,
                            'email': results[i].email,
                            'balance': results[i].balance,
                            'accountNo': results[i].accountNo,
                        };
                        // Add object into arrray
                        chosenPersonList.push(person)
                    };
                    // Render home.pug page using array
                    res.render('view-user', { "chosenPersonList": chosenPersonList })
                };
            });
        } else {
            res.redirect('/login');
        };
        console.log(chosenPersonList);
    });
};    

// View contact
exports.contact = (req, res) => {
    res.render('contact');
};

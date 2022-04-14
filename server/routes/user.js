const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Main Page
router.get('/', userController.view);

// View Contact
router.get('/contact', userController.contact);

// Login
router.get('/login', userController.login);
router.post('/login', userController.loginAttempt);

// Dashboard
router.get('/dashboard/:id', userController.dashboard);

// Edit & View
router.get('/edit-email/:id', userController.edit);
router.post('/edit-email/:id', userController.update);
router.get('/view-user/:id', userController.viewAll);

// Logout
router.get('/logout', userController.logout)



module.exports = router;
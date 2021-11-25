const express = require('express');
const mongoose = require('mongoose');
const Auth = require('../controllers/auth.controller');
const bcrypt = require('bcryptjs');
const router = express.Router();

const saltRounds = 10;

// LOGOUT
router.get('/logout', async (req, res, next) => {
	req.session.destroy();
	res.redirect('/');
});

// LOGIN
router.get('/login', async (req, res, next) => {
	// if (req.session.user) {
	// 	res.redirect('/app');
	// } else {
	res.render('auth/login', { layout: 'auth/layout' });
	// }
});

router.post('/login', async (req, res, next) => {
	const { email, password } = req.body;
	try {
		validateLogin(email, password);
		const { userLogin, userWallet } = await Auth.login(email, password);
		req.session.user = userLogin;
		req.session.wallet = userWallet;
		res.redirect('/app');
	} catch (error) {
		res.status(500).render('auth/login', {
			layout: 'auth/layout',
			email: email,
			password: password,
			errorMessage: error.message,
		});
	}
});

// SIGNUP
router.get('/signup', async (req, res, next) => {
	res.render('auth/signup', { layout: 'auth/layout' });
});

router.post('/signup', async (req, res, next) => {
	const { name, email, password } = req.body;
	try {
		await validateSignup(name, email, password);
		const passwordHash = await bcrypt.hashSync(password, saltRounds);
		const { newUser, newWallet } = await Auth.signUp(name, email, passwordHash);
		req.session.user = newUser;
		req.session.wallet = newWallet;
		res.redirect('/app');
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			res.status(500).render('auth/signup', {
				layout: 'auth/layout',
				errorMessage: error.message,
			});
		} else if (error.code === 11000) {
			res.status(500).render('auth/signup', {
				layout: 'auth/layout',
				name: name,
				email: email,
				password: password,
				errorMessage: 'Email exist...',
			});
		} else {
			res.status(500).render('auth/signup', {
				layout: 'auth/layout',
				name: name,
				email: email,
				password: password,
				errorMessage: error.message,
			});
		}
	}
});

async function validateLogin(_email, _password) {
	if (!_email || !_password) {
		throw new Error('Email and password are mandatory');
	}
	validatePassword(_password);
}
async function validateSignup(_name, _email, _password) {
	if (!_name || !_email || !_password) {
		throw new Error('Name, email and password are mandatory');
	}
	validatePassword(_password);
}
async function validatePassword(_password) {
	const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
	if (!regex.test(_password)) {
		throw new Error(
			'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
		);
	}
}

module.exports = router;

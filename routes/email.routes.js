const express = require('express');
const router = express.Router();
const EmailCtrl = require('../controllers/email.controller');


/* GET home page */
router.get('/', async (req, res, next) => {
	
	res.render('/email', {
		layout: 'layout',
	
	});
});
//email route
router.post('/', EmailCtrl.sendEmail);

module.exports = router;
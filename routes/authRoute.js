const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const signUpValidation =
  require('../validators/authValidators').signUpValidation;
router.get('/sign-up', authController.getSignUp);

router.post('/sign-up', signUpValidation, authController.postSignUp);

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.logout);
module.exports = router;

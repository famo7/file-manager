const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validationResult } = require('express-validator');
const prisma = require('../prismaClient');

exports.getLogin = (req, res) => {
  res.redirect('/');
};

exports.getSignUp = (req, res) => {
  res.redirect('/');
};

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render('layout', {
        user: null,
        loginError: 'Invalid username or password',
        showLogin: true,
        body: '',
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
};

exports.postSignUp = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render('layout', {
      user: null,
      signupErrors: errors.array().map((err) => err.msg),
      oldInput: req.body,
      showSignup: true,
      body: '',
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.user.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.username,
        password: hashedPassword,
      },
    });

    return res.render('layout', {
      user: null,
      showLogin: true,
      body: '',
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};

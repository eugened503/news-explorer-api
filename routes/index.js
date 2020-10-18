/* eslint-disable */
const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRouter = require('./users');
const articleRouter = require('./articles');
const { login, createUser } = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.use('/users', auth, userRouter);
router.use('/articles', auth, articleRouter);

module.exports = router;

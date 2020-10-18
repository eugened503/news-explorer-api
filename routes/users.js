/* eslint-disable */
const userRouter = require('express').Router(); // создадим express router
const { celebrate, Joi } = require('celebrate');
const { getUser } = require('../controllers/users');

userRouter.get('/me', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
}), getUser);

module.exports = userRouter;

/* eslint-disable */
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const { JWT_SECRET, NODE_ENV } = process.env;

const User = require('../models/users');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const ConflictingRequest = require('../errors/conflicting-err');

module.exports.createUser = (req, res, next) => { //создать пользователя
  const { name, email, password } = req.body;
  User.findOne({ email })
    .then((newUser) => {
      if (newUser) {
        throw new ConflictingRequest('Электронная почта уже существует');
      }
      bcrypt.hash(password, 10)
        .then((hash) => User.create({ name, email, password: hash }))
        .then((user) => res.status(200).send({
          _id: user._id,
          name: user.name,
          email: user.email,
        }))
        .catch((err) => {
          console.log(err);
          if (err.name === 'ValidationError') {
            next(new ValidationError(err.message));
            return;
          }
          else {
            next(err);
          }
        });
    })
    .catch(next);
};

module.exports.getUser = (req, res, next) => {  //получить пользователя по id
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    throw new ValidationError('Некорректный id юзера');
  }
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // вернём токен
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
          secure: NODE_ENV === 'production',
        })
        .send({ token });
    })
    .catch((err) => {
      next(new Unauthorized(err.message));
      return;
    });
};

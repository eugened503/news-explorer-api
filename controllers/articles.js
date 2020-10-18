/* eslint-disable */
const mongoose = require('mongoose');
const Article = require('../models/articles');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const Forbidden = require('../errors/forbidden-err');

module.exports.createArticles = (req, res, next) => { //создаёт статью с переданными в теле
  const { keyword, title, text, date, source, link, image, owner = req.user._id } = req.body;
  Article.create({ keyword, title, text, date, source, link, image, owner })
    .then((article) => res.status(200).send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError(err.message));
        return;
      }
      else {
        next(err);
      }
    });
};

module.exports.getAllArticles = (req, res, next) => { //возвращает все сохранённые пользователем статьи
  Article.find({})
    .then(article => res.status(200).send(article))
    .catch(next);
};

module.exports.deleteArticles = (req, res, next) => { // удаляет сохранённую статью  по _id
  if (!mongoose.Types.ObjectId.isValid(req.params.articleId)) {
    throw new ValidationError('Некорректный id карточки');
  }
  Article.findById(req.params.articleId)
    .orFail(new Error('NotValidId'))
    .then((article) => {
      if (String(article.owner) !== String(req.user._id)) {
        next(new Forbidden('Вы не можете удалять чужие карточки'));
        return;
      }
      Article.findByIdAndRemove(req.params.articleId)
        .then(() => res.status(200).send(article))
        .catch(next);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new NotFoundError('Пользователя нет в базе'));
        return;
      } else {
        next(err);
      }
    });
};


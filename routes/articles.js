/* eslint-disable */
const articleRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { createArticles, getAllArticles, deleteArticles} = require('../controllers/articles');
const validateUrl = require('../constants/urlRegex');

articleRouter.get('/', getAllArticles);

articleRouter.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string().required().regex(validateUrl),
      image: Joi.string().required().regex(validateUrl),
  })
}), createArticles);

articleRouter.delete('/:articleId', celebrate({
  params: Joi.object().keys({
    articleId: Joi.string().length(24).hex(),
  }),
}), deleteArticles);


module.exports = articleRouter;

/* eslint-disable */
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const router = require('./routes/index');
const NotFoundError = require('./errors/not-found-err');
const allowedCors = [
  'https://api.news-line.students.nomoreparties.xyz',
  'http://api.news-line.students.nomoreparties.xyz',
  'localhost:3000'
];
const { PORT = 3000 } = process.env;
const app = express();
app.use(helmet());

mongoose.connect('mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // допустимый лимит: 100 запросов с одного IP
});

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger); // подключаем логгер запросов

app.use(function(req, res, next) {
  const { origin } = req.headers; // Записываем в переменную origin соответствующий заголовок

  if (allowedCors.includes(origin)) { // Проверяем, что значение origin есть среди разрешённых доменов
    res.header('Access-Control-Allow-Origin', origin);
  }
  next();
});

app.use('/', router);
app.use(errorLogger); // подключаем логгер ошибок

app.use((req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});
app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});


app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});

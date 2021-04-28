require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");

const {respWithData} = require('./utility/resCustom');

const crawlerRoutes = require('./routes/crawler');

const PORT = process.env.PORT || 8080;
const app = express();
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.5zjmf.mongodb.net/${process.env.MONGODB_NAME}`;

// body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body
// support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

// Clients & CORS Errors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/crawler", crawlerRoutes);

app.use((error, req, res, next) => {
  return res.status(error.statusCode).json(respWithData(error.statusCode, error.data));
})
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`http://localhost:${PORT}`);
    app.listen(PORT);
  })
  .catch((err) => {
    console.log(err);
  });

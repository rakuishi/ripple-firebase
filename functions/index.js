'use strict';

const functions = require('firebase-functions');
const express = require('express');
const app = express();
const axios = require('axios');

app.get('/balance', (req, res) => {
  axios.get('https://api.coinmarketcap.com/v2/ticker/52/?convert=JPY')
    .then(response => {
      const jpy = response.data.data.quotes.JPY.price;
      const json = JSON.stringify({ jpy: jpy });
      res.header('Content-Type', 'application/json');
      res.end(json);
      return json;
    })
    .catch(error => {
      console.error(error);
    });
});

exports.api = functions.https.onRequest(app);

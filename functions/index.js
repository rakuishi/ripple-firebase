'use strict';

const functions = require('firebase-functions');
const express = require('express');
const app = express();
const axios = require('axios');
const RippleAPI = new require('ripple-lib').RippleAPI;
const ripple = new RippleAPI({ server: 'wss://s1.ripple.com:443' });

app.get('/balance', (req, res) => {
  const promise = function(address) {
    return ripple.connect()
    .then(() => {
      return ripple.getAccountInfo(address);
    })
    .then(info => {
      return Number(info.xrpBalance);
    });
  }

  const promises = [];
  const addresses = req.query.address.split(',');
  addresses.forEach(address => { promises.push(promise(address)); })

  let sum = 0;
  Promise.all(promises)
    .then((balances) => {
      balances.forEach(value => { sum += value; })
      return sum;
    })
    .then(() => {
      return axios.get('https://api.coinmarketcap.com/v2/ticker/52/?convert=JPY');
    })
    .then(response => {
      const jpy = Number(response.data.data.quotes.JPY.price);
      const json = JSON.stringify({ balance: parseInt(sum * jpy) });
      res.header('Content-Type', 'application/json');
      res.end(json);
      return json;
    })
    .catch(error => {
      console.error(error);
      res.status(500).send(error);
    });
});

exports.api = functions.https.onRequest(app);

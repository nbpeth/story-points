const cors = require('cors');
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysqlClient = require('./mysqlClient')

const startServer = () => {
  app.use(express.static(__dirname + '/dist/story-points'));

  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(cors);

  app.post('/user', (req, res) => {

    mysqlClient.createUser(req.body, (err) => {
      if (err) {
        console.error(err)
        res.status(500);
        res.send({error: err})
      } else {
        res.send(req.body);
      }
    })
  })

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
  });


}

mysqlClient.initDB(startServer)

module.exports = app;

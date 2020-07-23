const cors = require('cors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.get('/port', (req, res) => res.send(`${process.env.PORT || 8080}`))

app.use(express.static(__dirname + '/dist/story-points'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors);

module.exports = app;

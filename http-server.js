const cors = require('cors');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(__dirname + '/dist/story-points'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors);

app.get('/*', (_, res) => {
  res.sendFile(path.join(__dirname + '/dist/story-points/index.html'));
});

module.exports = app;

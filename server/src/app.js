const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initPusher } = require('./utils/pusher')
const config = require('./config');

const app = express();
const port = config('express:port')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post("/paint", (req, res) => {
  const pusher = initPusher()
  pusher.trigger("painting", "draw", req.body);
  res.json(req.body);
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

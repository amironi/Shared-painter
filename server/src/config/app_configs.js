require('dotenv').config();

const config = {
  express: {
    port: parseInt(process.env.EXPRESS_PORT, 10) || 8080,
    host: process.env.EXPRESS_HOST || 'localhost',
  },
  pusher: {
    id: parseInt(process.env.PUSHER_APP_ID, 10),
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.CLUSTER
  }
};

config.express.url = `http://${config.express.host}:${config.express.port}`;

module.exports = config;

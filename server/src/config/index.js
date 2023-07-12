const nconf = require('nconf');
const config = require('./app_configs');
const env = process.env.NODE_ENV || 'dev';

nconf.use('memory');
nconf.argv().env(env);
nconf.set('env', env);
nconf.defaults(config);

const getConfig = (key) => nconf.get(key);

module.exports = getConfig;

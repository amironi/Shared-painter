const Pusher = require('pusher');
const config = require('../config');

/**
 * Initializes and returns a new Pusher instance.
 * @returns { Pusher } 
 */
const initPusher = () => {
    return new Pusher({
        appId: config('pusher:id'),
        key: config('pusher:key'),
        secret: config('pusher:secret'),
        cluster: config('pusher:cluster'),
        useTLS: true,
    });
}

module.exports = {
    initPusher
};
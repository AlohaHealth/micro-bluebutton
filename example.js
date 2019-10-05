const { send } = require('micro');
const microBlueButton = require('.');

const options = {
  dev: process.env.NODE_ENV !== 'production',
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/callback',
  path: '/auth/bluebutton',
};

const blueButtonAuth = microBlueButton(options);

const handler = async (req, res, auth) => {

  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    console.error(auth.err);
    return send(res, 403, 'Forbidden');
  }

  return JSON.stringify(auth.result, null, 2);
};

module.exports = blueButtonAuth(handler);

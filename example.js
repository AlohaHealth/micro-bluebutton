const { send } = require('micro');
const microBlueButton = require('.');

const options = {
  dev: process.env.NODE_ENV !== 'production',
  clientId: 'SaOsv29YMwhCGcfYEaRA99bPrvOc749pJ37ewJuO',
  clientSecret: 'nHJVUQwKKnZyQ1lCRAZskZw1flJDaRHpguplvaJl8jIDIA42nK1KYP13rITFMPzymXpMO3ehHfQ0xiiCmvSOj17GtU2euQ8TARGIDegtNtytJgYiX55WViMB6ISwL5H4',
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

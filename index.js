const querystring = require('querystring');
const url = require('url');

const uuid = require('uuid');
const rp = require('request-promise');
const redirect = require('micro-redirect');

const provider = 'bluebutton';

const BLUEBUTTON_PROD = 'https://bluebutton.cms.gov'
const BLUEBUTTON_DEV = 'https://sandbox.bluebutton.cms.gov'

const microAuthBlueButton = ({ clientId, clientSecret, callbackUrl, path = '/auth/bluebutton', dev = true }) => {

  const bbHost = dev ? BLUEBUTTON_DEV : BLUEBUTTON_PROD

  const getRedirectUrl = state => {
    return `${bbHost}/v1/o/authorize/?client_id=${clientId}&redirect_uri=${callbackUrl}&state=${state}&response_type=code`
  };

  const states = [];

  return fn => async (req, res, ...args) => {
    const { pathname, query } = url.parse(req.url);

    if (pathname === path) {
      try {
        const state = uuid.v4();
        const redirectUrl = getRedirectUrl(state);
        states.push(state);
        return redirect(res, 302, redirectUrl);
      } catch (err) {
        args.push({ err, provider });
        return fn(req, res, ...args);
      }
    }

    const callbackPath = url.parse(callbackUrl).pathname;
    if (pathname === callbackPath) {
      try {
        const { state, code } = querystring.parse(query);

        if (!states.includes(state)) {
          const err = new Error('Invalid state');
          args.push({ err, provider });
          return fn(req, res, ...args);
        }

        // Pop Terminated State
        states.splice(states.indexOf(state), 1);

        // Request Access Token
        const token = await rp({
          method: 'POST',
          uri: `${bbHost}/v1/o/token/`,
          auth: {
            user: clientId,
            pass: clientSecret,
            sendImmediately: true,
          },
          form: {
            code,
            // eslint-disable-next-line camelcase
            grant_type: 'authorization_code',
            // eslint-disable-next-line camelcase
            redirect_uri: callbackUrl,
          },
          json: true
        });

        if (token.error) {
          args.push({ err: token.error, provider });
          return fn(req, res, ...args);
        }

        // Request User Info & Verify Token
        const user = await rp({
          uri: `${bbHost}/v1/connect/userinfo`,
          headers: {
            Authorization: `Bearer ${token.access_token}`
          },
          json: true
        });

        // Add Auth result to context
        const result = {
          provider,
          token,
          user,
        };

        args.push({ result });
        return fn(req, res, ...args);
      } catch (err) {
        args.push({ err, provider });
        return fn(req, res, ...args);
      }
    }

    return fn(req, res, ...args)
  }
};

module.exports = microAuthBlueButton;

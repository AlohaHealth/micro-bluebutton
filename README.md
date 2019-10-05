# micro-bluebutton

## [BlueButton 2.0](https://bluebutton.cms.gov) OAuth Client for [ZEIT micro](https://github.com/zeit/micro/)

Add [CMS BlueButton 2.0](https://bluebutton.cms.gov) authentication to your [micro](https://github.com/zeit/micro/) service in just a few keystrokes.

> This module is graciously borrowed from, but not affiliated with the [microauth](https://github.com/microauth/microauth) collection.

## Installation

```sh
npm install --save @alohahealth/micro-bluebutton
# or
yarn add @alohahealth/micro-bluebutton
```

## Usage

1. Register your application client on the [Developer Sandbox](https://sandbox.bluebutton.cms.gov/v1/o/applications/)
1. Create the following micro app as `app.js`:

```js
const { send } = require('micro')
const microBlueButton = require('micro-bluebutton')

const options = {
  dev: process.env.NODE_ENV !== 'production',
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/bluebutton/callback',
  path: '/auth/bluebutton',
}

const blueButtonAuth = microBlueButton(options)

// Third `auth` argument will provide error or the results of authentication
// so it will { err: errorObject } or
// { result: {
//     provider: 'bluebutton',
//     token: { /token response object },
//     user: { /userinfo response object },
// }}
const handler = async (req, res, auth) => {
  if (!auth) {
    return send(res, 404, 'Not Found')
  }

  if (auth.err) {
    // Error handler
    console.error(auth.err)
    return send(res, 403, 'Forbidden')
  }

  return `Hello ${auth.result.user.name}`
}

module.exports = blueButtonAuth(handler)
```

Run:

```sh
micro app.js
```

1. Visit `http://localhost:3000/auth/bluebutton`
1. Enter USERNAME: `BBUser00000` and PASSWORD: `PW00000!`
1. Click the ALLOW button when prompted by Blue Button
1. See `Hello Jane Doe` as the response

## Author

[Adam Barry](https://github.com/ajbarry)

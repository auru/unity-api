# Unity API

[![Travis-CI](https://api.travis-ci.org/auru/unity-api.svg?branch=master)](https://travis-ci.org/auru/unity-api)
[![npm version](https://badge.fury.io/js/unity-api.svg)](https://badge.fury.io/js/unity-api)
[![Scrutinizer](https://scrutinizer-ci.com/g/auru/unity-api/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/auru/unity-api/)
[![Deps](https://david-dm.org/auru/unity-api/status.svg)](https://david-dm.org/auru/unity-api)
[![Deps-Dev](https://david-dm.org/auru/unity-api/dev-status.svg)](https://david-dm.org/auru/unity-api)

> REST-API helper, wrapped around `fetch`.

# Table of Contents
  * [Installation](#installation)
  * [API](#usage)
    * [createAPI](createapiresources-middleware-apiprefix-fetchoptions)
  * [Example](#example)
  * [License](#license)

# Installation

```bash
npm i --save unity-api
```

# API
## createAPI(resources, middleware, APIPrefix, fetchOptions);

**Returns:** {Object}

Use module's `default export` to create our API object.
### Resources {Object} *Optional*

### Middleware {Array} *Optional*

**Example logger middleware:**
```js
export default next => async (mwOptions, apiParams, resource, method) => {
    console.log('args', {mwOptions, apiParams, resource, method}); // eslint-disable-line no-console
    const result = await next();
    console.log('result', result); // eslint-disable-line no-console
    return result;
};
```

### APIPrefix {String} *Optional*

**Default:** `'api'`

### fetchOptions {Object} *Optional*

**Default:**

```js
{
   method: 'GET',
   mode: 'cors',
   cache: 'default',
   credentials: 'include'
}
```

API-wide default `fetch` [options](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters).

# Example
```js
import createAPI from 'unity-api';

const resources = {
  user: {
    prefix: 'user',
    methods: {
      get: () => ({}),
      delete: () => ({}),
    }
  }
}

const API = createAPI(resources);

export default API;
```

# License
MIT © AuRu

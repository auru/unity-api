# Unity API

[![Travis-CI](https://api.travis-ci.org/auru/unity-api.svg?branch=master)](https://travis-ci.org/auru/unity-api)
[![npm version](https://badge.fury.io/js/unity-api.svg)](https://badge.fury.io/js/unity-api)
[![Scrutinizer](https://scrutinizer-ci.com/g/auru/unity-api/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/auru/unity-api/)
[![Deps](https://david-dm.org/auru/unity-api/status.svg)](https://david-dm.org/auru/unity-api)
[![Deps-Dev](https://david-dm.org/auru/unity-api/dev-status.svg)](https://david-dm.org/auru/unity-api)

> REST-API helper, wrapped around `fetch`.

# Table of Contents
  * [Installation](#installation)
  * [API](#api)
    * [createAPI](#createapiresources-middleware-namespace-fetchoptions)
  * [Example](#example)
  * [License](#license)

# Installation

```bash
npm i --save unity-api
```

# API
## createAPI(resources, middleware, namespace, fetchOptions);

**Returns:** {Object}

Use module's `default export` to create an API object.

### resources {Object} *Optional*

An API would be redundant without the resources defined. 

Each resource represents an entity in your REST-API as an `object` with the following properties:

#### namespace {String} *Optional*

Namespace of an entity. E.g.: example.com/api/**user**/get

#### methods {Object}

Dictionary of facade-methods that transform your api calls to `fetch` calls.
Each method should return a plain `object` with the following properties:

##### path {Array|String} *Optional*
**Default:**' `''`

If path is an `array`, items will be joined ad normalized.

##### query {Object} *Optional*
**Default:**' `{}`

Query-like object.

##### options {Object} *Optional*
**Default:**' `{}`

`fetch` [options](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters).

##### method {string} *Optional*
**Default:**' `'json'`

Method to be called on feth's response.

```js
const userResource = {
  namespace: 'user',

  methods: {
    
    // id = 1, extanted = true
    // GET: /api/user/get/1?extended=true
    getUser: ({ id, extended }) => ({ path: ['get', id], query: { extended: !!extended } }),
    
    save: ({ id, firstname, lastname }) => {
            const formData = new FormData();

            formData.append('firstname', firstname);
            formData.append('lastname', lastname);

            return {
                path: 'edit',
                options: {
                    method: 'POST',
                    body: formData
                }
            };
        }
  }
}
```

### middleware {Array} of {Function} *Optional*

An array of middleware functions, that can manipulate an api call, its params and its result, along with options for the remaning middleware in chain.

```js 
const myMiddleware = next => async (options, params, resource, method) => { return await next() }
```
#### next {Function}

An `async` function, that calls next middleware in chain, or, in case of last middleware, the api method itself.

#### options {Object} *Optional*

Middleware parameters, that an api call was made with.

#### params {Object} *Optional*

Parameters, that an api call was made with.

#### resource {String} *Optional*

Name of the resource, whose method was called.

#### method {String} *Optional*

Name of the method called

**Example logger middleware:**
```js
export default next => async (middlewareOptions, apiCallParams, resource, method) => {
    console.log('args', { middlewareOptions, apiCallParams, resource, method }); // eslint-disable-line no-console
    const result = await next();
    console.log('result', result); // eslint-disable-line no-console
    return result;
};
```

### namespace {String} *Optional*

**Default:** `'api'`

Usually you would want to proxy api calls from the SPA to the backend using some common namespace like that:
example.com/**api**/user/get

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

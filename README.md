# Unity API

[![Travis-CI](https://api.travis-ci.org/auru/unity-api.svg?branch=master)](https://travis-ci.org/auru/unity-api)
[![Coverage Status](https://coveralls.io/repos/github/auru/unity-api/badge.svg?branch=master)](https://coveralls.io/github/auru/unity-api?branch=master)
[![npm version](https://badge.fury.io/js/unity-api.svg)](https://badge.fury.io/js/unity-api)
[![Scrutinizer](https://scrutinizer-ci.com/g/auru/unity-api/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/auru/unity-api/)
[![Deps](https://david-dm.org/auru/unity-api/status.svg)](https://david-dm.org/auru/unity-api)
[![Deps-Dev](https://david-dm.org/auru/unity-api/dev-status.svg)](https://david-dm.org/auru/unity-api)
[![Dependency Status](https://dependencyci.com/github/auru/unity-api/badge)](https://dependencyci.com/github/auru/unity-api)

> REST-API helper, wrapped around `fetch`.

# Table of Contents

* [Installation](#installation)
* [API](#api)
* [Usage](#usage)
* [Example](#example)
* [Contributing](#contributing)
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

An API would be redundant without any of resources defined. 

Each resource represents an entity in your REST-API as an `object` with the following properties:

#### namespace {String} *Optional*

Namespace of an entity. *e.g.*: example.com/api/**user**/get

#### methods {Object}

Dictionary of facade-methods that transform your api calls params to `fetch` calls params.
Each method should return a plain `object` with the following properties:

##### path {Array|String} *Optional*
**Default:** `''`

If path is an `array`, items will be joined and normalized.

##### query {Object} *Optional*
**Default:** `{}`

Query-like object.

##### options {Object} *Optional*
**Default:** `{}`

`fetch` [options](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch#Parameters).

##### method {string} *Optional*
**Default:** `'json'`

Method to be called on `fetch`'s response.

##### headers {Object|Headers}

Additional headers to be sent to the server

##### body {string|FormData}

Requests's body


Alternatively you can use provided shortcuts for [every HTTP method](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)

**Example:**
```js
import { GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH } from 'unity-api';

const userResource = {
  namespace: 'user',

  methods: {
    // id = 1, extanted = true
    // GET: /api/user/1?extended=true
    get: ({ id, extended }) => ({ path: [id], query: { extended: !!extended } }),

    // POST: /api/user/1/edit
    save: ({ id, firstname, lastname }) => {
        const formData = new FormData();

        formData.append('firstname', firstname);
        formData.append('lastname', lastname);

        return POST({
            path: [id, 'edit'],
            headers: { 'x-csrf-token': 'blah' }
            body: formData
        });
    },

    // DELETE: /api/user/1
    delete: ({ id }) => DELETE({ path: [id] })
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

Usually you would want to proxy api calls from the SPA to the backend using some common namespace. *e.g.* example.com/**api**/user/get

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

# Usage

You can call your API methods like so: 
`API[resource][method](methodParams, middlewareOptions)`

# Example

Create API module:

```js
// api.js
import createAPI from 'unity-api';

const resources = {
  user: {
    namespace: 'user',
    methods: {
      get: ({ id }) => ({ path: id }),
      delete: ({ id }) => ({ path: id, options: { method: 'DELETE' } }),
    }
  }
}

const logger = next => async (middlewareOptions, apiCallParams, resource, method) => {
    const { log } = middlewareOptions;
    
    if (log) {
       console.log('args', { middlewareOptions, apiCallParams, resource, method }); // eslint-disable-line no-console
    }
    
    const result = await next();
    
    if (log) {
       console.log('result', result); // eslint-disable-line no-console
    }
    
    return result;
};

const middleware = [
  logger
]

fetchOptions = {
  method: 'GET',
  mode: 'cors',
  cache: 'default',
  credentials: 'include'
}
const API = createAPI(resources, middleware, 'api', fetchOptions);

export default API;
```

Use it in your application:

```js
// index.js
import API from './api';

const user = await API.user.get({ id: 1 }, { log: true });

```

# Contributing

* Provide [conventional commit messages](https://github.com/conventional-changelog/conventional-changelog-angular/blob/master/convention.md) by using `npm run commit` instead of `git commit`.
* **Core contributors:** use GitHub's *Rebase and merge* as a default way of merging PRs.

# License
MIT © AuRu

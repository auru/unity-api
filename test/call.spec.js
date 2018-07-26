import test from 'ava';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import callAPI from '../src/call';
import errorAPI from '../src/error';
import abortAPI from '../src/abort';

const matcher = '*';

const Response200 = new Response(
    { sample: 'data'},
    {
        status: 200
    }
);

const Response201 = new Response(
    null,
    {
        status: 201
    }
);

const Response400 = new Response(
    { sample: 'not found'},
    {
        status: 400
    }
);

const Response500 = new Response(
    null,
    {
        status: 500
    }
);

test.serial('default params', async t => {
    fetchMock.get(matcher, {});
    await callAPI();

    t.is(fetchMock.lastUrl(matcher), '/api', 'correct url');
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'include',
        method: 'GET',
        mode: 'cors',
        signal: abortAPI.getSignal()
    }, 'correct options');

    fetchMock.restore();
});

test.serial('200 reponse', async t => {
    fetchMock.get(matcher, Response200);
    const result = await callAPI();

    t.is(result.status, Response200.status, 'correct status');
    t.is(result.statusText, Response200.statusText, 'correct statusText');
    t.deepEqual(result.body, Response200.body, 'correct response body');

    fetchMock.restore();
});

test.serial('201 reponse', async t => {
    fetchMock.get(matcher, Response201);
    const result = await callAPI();

    t.is(result.status, Response201.status, 'correct status');
    t.is(result.statusText, Response201.statusText, 'correct statusText');
    t.deepEqual(result.body, Response201.body, 'correct response body');

    fetchMock.restore();
});

test.serial('400 reponse', async t => {
    fetchMock.get(matcher, Response400);

    const result = await callAPI();

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof errorAPI, 'instance of APIError');
    t.deepEqual(result.body, { sample: 'not found'}, 'correct error body');

    fetchMock.restore();
});

test.serial('500 reponse', async t => {
    fetchMock.get(matcher, Response500);

    const result = await callAPI();

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof errorAPI, 'instance of APIError');

    fetchMock.restore();
});

test.serial('400 reponse with fullResponse option', async t => {
    fetchMock.get(matcher, Response400);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'POST' };
    const methodOptions = { path: 'path' };
    const responseOptions = { fullResponse: true };

    const result = await callAPI(APINamespace, namespace, fetchOptions, methodOptions, responseOptions);

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof errorAPI, 'instance of APIError');
    t.deepEqual(result.body, { sample: 'not found'}, 'correct error body');

    fetchMock.restore();
});

test.serial('500 reponse with fullResponse option', async t => {
    fetchMock.get(matcher, Response500);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'POST' };
    const methodOptions = { path: 'path' };
    const responseOptions = { fullResponse: true };

    const result = await callAPI(APINamespace, namespace, fetchOptions, methodOptions, responseOptions);

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof errorAPI, 'instance of APIError');

    fetchMock.restore();
});

test.serial('fetch options', async t => {
    fetchMock.post(matcher, Response200, { overwriteRoutes: false });

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const cancelNamespace = 'cancel';
    const methodOptions = {
        path: 'path',
        query: { edit: true },
        options: {
            credentials: 'omit',
            method: 'POST'
        },
        method: 'text'
    };
    const spyResponse200Text = sinon.spy(Response200, 'text');

    fetchMock.post(matcher, {}, { overwriteRoutes: false });

    await callAPI('uuid-1', APINamespace, namespace, cancelNamespace, methodOptions);

    t.is(fetchMock.lastUrl(matcher), '/rest-api/user/path?edit=true', 'correct url');
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'omit',
        method: 'POST',
        mode: 'cors',
        signal: abortAPI.getSignal('uuid-1')
    }, 'correct options');
    t.true(spyResponse200Text.calledOnce);

    const newMethodOptions = {
        ...methodOptions,
        type: 'json',
        headers: new Headers(),
        body: 'body'
    };
    const spyResponse200Json = sinon.spy(Response200, 'json');
    await callAPI('uuid-2', APINamespace, namespace, cancelNamespace, newMethodOptions);

    t.true(spyResponse200Json.calledOnce);
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'omit',
        method: 'POST',
        mode: 'cors',
        headers: newMethodOptions.headers,
        body: newMethodOptions.body,
        signal: abortAPI.getSignal('uuid-2')
    }, 'correct options');

    spyResponse200Text.restore();
    spyResponse200Json.restore();
    fetchMock.restore();
});

test.serial('unsupported Response method', async t => {
    fetchMock.get(matcher, Response200);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'POST'};
    const methodOptions = {
        path: 'path',
        options: {
            credentials: 'omit'
        },
        method: 'undefined'
    };
    const responseOptions = {};

    const result = await callAPI(APINamespace, namespace, fetchOptions, responseOptions, methodOptions);

    t.true(result instanceof Error);
    t.true(result instanceof TypeError);
    t.false(result instanceof errorAPI);

    fetchMock.restore();
});

test.serial('returns full response object', async t => {
    fetchMock.get(matcher, Response200);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'POST' };
    const methodOptions = { path: 'path' };
    const responseOptions = { fullResponse: true };

    const result = await callAPI(APINamespace, namespace, fetchOptions, responseOptions, methodOptions);
    const mockedResult = {
        body: { sample: 'data' },
        bodyUsed: true,
        headers: (new Response()).headers,
        ok: true,
        redirected: undefined,
        status: 200,
        statusText: 'OK',
        type: undefined,
        url: undefined,
        useFinalURL: undefined
    };

    t.false(result instanceof Error);
    t.false(result instanceof TypeError);
    t.false(result instanceof errorAPI);
    t.deepEqual(result, mockedResult, 'correct response');

    fetchMock.restore();
});
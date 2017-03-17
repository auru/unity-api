import test from 'ava';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import callAPIMethod from '../src/callAPIMethod';
import APIError from '../src/error';

const matcher = '*';

const Response200 = new Response(
    JSON.stringify({ sample: 'data'}),
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
    JSON.stringify({ sample: 'not found'}),
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
    await callAPIMethod();

    t.is(fetchMock.lastUrl(matcher), '/api', 'correct url');
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'include',
        method: 'GET',
        mode: 'cors'
    }, 'correct options');

    fetchMock.restore();
});

test.serial('200 reponse', async t => {
    fetchMock.get(matcher, Response200);
    const result = await callAPIMethod();

    t.deepEqual(result, { sample: 'data' }, 'correct response body');

    fetchMock.restore();
});

test.serial('201 reponse', async t => {
    fetchMock.get(matcher, Response201);
    const result = await callAPIMethod();

    t.is(result, null, 'incorrect response body');

    fetchMock.restore();
});

test.serial('400 reponse', async t => {
    fetchMock.get(matcher, Response400);

    const result = await callAPIMethod();

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof APIError, 'instance of APIError');
    t.deepEqual(result.body, { sample: 'not found'}, 'correct error body');

    fetchMock.restore();
});

test.serial('500 reponse', async t => {
    fetchMock.get(matcher, Response500);

    const result = await callAPIMethod();

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof APIError, 'instance of APIError');

    fetchMock.restore();
});

test.serial('fetch options', async t => {
    fetchMock.post(matcher, Response200);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'GET'};
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

    fetchMock.post(matcher, {});

    await callAPIMethod(APINamespace, fetchOptions, namespace, methodOptions);

    t.is(fetchMock.lastUrl(matcher), '/rest-api/user/path?edit=true', 'correct url');
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'omit',
        method: 'POST',
        mode: 'cors'
    }, 'correct options');
    t.true(spyResponse200Text.calledOnce);

    const newMethodOptions = {
        ...methodOptions,
        type: 'json',
        headers: new Headers(),
        body: 'body'
    };
    const spyResponse200Json = sinon.spy(Response200, 'json');
    await callAPIMethod(APINamespace, fetchOptions, namespace, newMethodOptions);

    t.true(spyResponse200Json.calledOnce);
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'omit',
        method: 'POST',
        mode: 'cors',
        headers: newMethodOptions.headers,
        body: newMethodOptions.body
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

    const result = await callAPIMethod(APINamespace, namespace, fetchOptions, methodOptions);

    t.true(result instanceof Error);
    t.true(result instanceof TypeError);
    t.false(result instanceof APIError);

    fetchMock.restore();
});
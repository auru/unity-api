import test from 'ava';
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
import callAPIMethod from '../src/callAPIMethod';
import APIError from '../src/error';

const matcher = '*';

const ResponseGood = new Response(
    JSON.stringify({ sample: 'data'}),
    {
        status: 200
    }
);

const ResponseBad = new Response(null, {
    status: 500
});

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
    fetchMock.get(matcher, ResponseGood);
    const result = await callAPIMethod();

    t.deepEqual(result, { sample: 'data' }, 'correct response body');

    fetchMock.restore();
});


test.serial('500 reponse', async t => {
    fetchMock.get(matcher, ResponseBad);

    const result = await callAPIMethod();

    t.true(result instanceof Error, 'instance of Error');
    t.true(result instanceof APIError, 'instance of APIError');

    fetchMock.restore();
});

test.serial('fetch options', async t => {
    fetchMock.post(matcher, ResponseGood);

    const APINamespace = 'rest-api';
    const namespace = 'user';
    const fetchOptions = { method: 'POST'};
    const methodOptions = {
        path: 'path',
        query: { edit: true },
        options: {
            credentials: 'omit'
        },
        method: 'text'
    };
    const spyResponseGood = sinon.spy(ResponseGood, 'text');

    fetchMock.post(matcher, {});

    await callAPIMethod(APINamespace, fetchOptions, namespace, methodOptions);

    t.is(fetchMock.lastUrl(matcher), '/rest-api/user/path?edit=true', 'correct url');
    t.deepEqual(fetchMock.lastOptions(matcher), {
        cache: 'default',
        credentials: 'omit',
        method: 'POST',
        mode: 'cors'
    }), 'correct options';
    t.true(spyResponseGood.calledOnce);

    spyResponseGood.restore();
    fetchMock.restore();
});

test.serial('unsupported Response method', async t => {
    fetchMock.get(matcher, ResponseGood);

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
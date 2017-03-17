import test from 'ava';
import {
    GET,
    HEAD,
    POST,
    PUT,
    DELETE,
    CONNECT,
    OPTIONS,
    TRACE,
    PATCH
} from '../src/shortcuts';

const dummy = {
    path: ['path', 'to', 'resource'],
    query: { param: 'value' },
    options: { credentials: 'include' },
    type: 'text'
};

test('should set correct HTTP method', t => {
    t.deepEqual(GET(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'GET' },
        type: 'text'
    }, 'GET');
    t.deepEqual(HEAD(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'HEAD' },
        type: 'text'
    }, 'HEAD');
    t.deepEqual(POST(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'POST' },
        type: 'text'
    }, 'POST');
    t.deepEqual(PUT(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'PUT' },
        type: 'text'
    }, 'PUT');
    t.deepEqual(DELETE(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'DELETE' },
        type: 'text'
    }, 'DELETE');
    t.deepEqual(CONNECT(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'CONNECT' },
        type: 'text'
    }, 'CONNECT');
    t.deepEqual(OPTIONS(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'OPTIONS' },
        type: 'text'
    }, 'OPTIONS');
    t.deepEqual(TRACE(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'TRACE' },
        type: 'text'
    }, 'TRACE');
    t.deepEqual(PATCH(dummy), {
        path: ['path', 'to', 'resource'],
        query: { param: 'value' },
        options: { credentials: 'include', method: 'PATCH' },
        type: 'text'
    }, 'PATCH');
});

test('should add method even when nothing is passed', t => {
    const result = GET();
    t.deepEqual(result, { options: { method: 'GET'} });
});

test('should not take precedence over passed params', t => {
    const result = PUT({ options: { method: 'POST' } });
    t.deepEqual(result, { options: { method: 'POST'} });
});
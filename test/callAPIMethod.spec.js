import test from 'ava';
import { getAPIPrefix, getFullPath } from '../src/callAPIMethod';

test('getAPIPrefix', t => {
    t.is(getAPIPrefix('api'), '/api', 'relative path');
    t.is(getAPIPrefix('/api'), '/api', 'absolute path');
    t.is(getAPIPrefix('http://api.example.com'), 'http://api.example.com', 'http url');
    t.is(getAPIPrefix('https://api.example.com'), 'https://api.example.com', 'http url');
    t.is(getAPIPrefix('//api.example.com'), '//api.example.com', 'protocol-less url');
    t.is(getAPIPrefix('https://localhost:8080'), 'https://localhost:8080', 'localhost');
});

test('getFullPath', t => {
    t.is(getFullPath('api'), '/api', 'relative path');
    t.is(getFullPath('/api'), '/api', 'absolute path');
    t.is(getFullPath('http://example.com', '/test'), 'http://example.com/test', 'url');
    t.is(getFullPath('http://example.com///', '/test/'), 'http://example.com/test/', 'url with slashes');
    t.is(getFullPath('https://localhost:8080', '/test///'), 'https://localhost:8080/test/', 'localhost');
});
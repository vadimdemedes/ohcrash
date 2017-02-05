'use strict';

const listen = require('test-listen');
const micro = require('micro');
const test = require('ava');
const got = require('got');
const generateIssueBody = require('../lib/generate-issue-body');
const mockCreateIssue = require('./helpers/mock-create-issue');
const mockFindIssues = require('./helpers/mock-find-issues');

const token = process.env.GITHUB_TOKEN = 'token';
const user = process.env.GITHUB_USER = 'user';
const repo = process.env.GITHUB_REPO = 'repo';

require('async-to-gen/register')({includes: /index\.js$/});
const app = require('../'); // eslint-disable-line import/order

test('report error', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error('Error message');
	err.props = {runtime: 'Node.js'};

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: []
	});

	const createReq = mockCreateIssue({
		token,
		user,
		repo,
		title: 'Error: Error message',
		body: generateIssueBody(err)
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			name: err.name,
			message: err.message,
			stack: err.stack,
			props: err.props
		})
	});

	t.true(findReq.isDone());
	t.true(createReq.isDone());
	t.is(res.body, '');
});

test('report error if issue exists but closed', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error('Error message');
	err.props = {runtime: 'Node.js'};

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: [{title: 'Error: Error message', state: 'closed'}]
	});

	const createReq = mockCreateIssue({
		token,
		user,
		repo,
		title: 'Error: Error message',
		body: generateIssueBody(err)
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			name: err.name,
			message: err.message,
			stack: err.stack,
			props: err.props
		})
	});

	t.true(findReq.isDone());
	t.true(createReq.isDone());
	t.is(res.body, '');
});

test('ignore error if issue is already open', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error('Error message');
	err.props = {runtime: 'Node.js'};

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: [{title: 'Error: Error message', state: 'open'}]
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			name: err.name,
			message: err.message,
			stack: err.stack,
			props: err.props
		})
	});

	t.true(findReq.isDone());
	t.is(res.body, '');
});

test('report error without name', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error('Error message');
	err.name = undefined;
	err.props = {runtime: 'Node.js'};

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: []
	});

	const createReq = mockCreateIssue({
		token,
		user,
		repo,
		title: 'Error: Error message',
		body: generateIssueBody(Object.assign(err, {name: 'Error'}))
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			message: err.message,
			stack: err.stack,
			props: err.props
		})
	});

	t.true(findReq.isDone());
	t.true(createReq.isDone());
	t.is(res.body, '');
});

test('report error without message', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error();
	err.props = {runtime: 'Node.js'};

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: []
	});

	const createReq = mockCreateIssue({
		token,
		user,
		repo,
		title: 'Error: No error message',
		body: generateIssueBody(Object.assign(err, {message: 'No error message'}))
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			name: err.name,
			stack: err.stack,
			props: err.props
		})
	});

	t.true(findReq.isDone());
	t.true(createReq.isDone());
	t.is(res.body, '');
});

test('report error without props', async t => {
	const service = micro(app);
	const url = await listen(service);

	const err = new Error('Error message');

	const findReq = mockFindIssues({
		token,
		user,
		repo,
		issues: []
	});

	const createReq = mockCreateIssue({
		token,
		user,
		repo,
		title: 'Error: Error message',
		body: generateIssueBody(Object.assign(err, {props: {}}))
	});

	const res = await got(url, {
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({
			name: err.name,
			message: err.message,
			stack: err.stack
		})
	});

	t.true(findReq.isDone());
	t.true(createReq.isDone());
	t.is(res.body, '');
});

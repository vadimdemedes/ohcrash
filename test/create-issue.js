'use strict';

const test = require('ava');
const createIssue = require('../lib/create-issue');
const mockCreateIssue = require('./helpers/mock-create-issue');

test('send request to create issue', async t => {
	const options = {
		token: 'token',
		user: 'avajs',
		repo: 'ava',
		title: 'title',
		body: 'body',
		labels: ['priotity', 'bug']
	};

	const req = mockCreateIssue(options);
	await createIssue(options);
	t.true(req.isDone());
});

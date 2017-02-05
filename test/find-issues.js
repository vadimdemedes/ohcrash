'use strict';

const test = require('ava');
const findIssues = require('../lib/find-issues');
const mockFindIssues = require('./helpers/mock-find-issues');

test('find issues', async t => {
	const token = 'token';
	const user = 'avajs';
	const repo = 'ava';

	const ghIssues = ['a', 'b', 'c'];
	const req = mockFindIssues({token, user, repo, issues: ghIssues});

	const issues = await findIssues({token, user, repo});
	t.true(req.isDone());
	t.deepEqual(issues, ghIssues);
});

test('fetch all pages', async t => {
	const token = 'token';
	const user = 'avajs';
	const repo = 'ava';

	const firstPage = mockFindIssues({
		token,
		user,
		repo,
		issues: ['a', 'b'],
		headers: {link: `<https://api.github.com/repos/${user}/${repo}/issues?page=2&per_page=100>; rel="next"`}
	});

	const secondPage = mockFindIssues({
		token,
		user,
		repo,
		query: {
			page: 2,
			per_page: 100 // eslint-disable-line camelcase
		},
		issues: ['c', 'd']
	});

	const issues = await findIssues({token, user, repo});
	t.true(firstPage.isDone());
	t.true(secondPage.isDone());
	t.deepEqual(issues, ['a', 'b', 'c', 'd']);
});

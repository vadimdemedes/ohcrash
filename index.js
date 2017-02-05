'use strict';

const {json} = require('micro');
const generateIssueBody = require('./lib/generate-issue-body');
const normalizeError = require('./lib/normalize-error');
const findIssues = require('./lib/find-issues');
const createIssue = require('./lib/create-issue');

const token = process.env.GITHUB_TOKEN;
const user = process.env.GITHUB_USER;
const repo = process.env.GITHUB_REPO;

if (!token) {
	console.log('GitHub token is required. Set `GITHUB_TOKEN` environment variable.');
	process.exit(1); // eslint-disable-line unicorn/no-process-exit
}

if (!user) {
	console.log('GitHub user name is required. Set `GITHUB_USER` environment variable.');
	process.exit(1); // eslint-disable-line unicorn/no-process-exit
}

if (!repo) {
	console.log('GitHub repository name is required. Set `GITHUB_REPO` environment variable.');
	process.exit(1); // eslint-disable-line unicorn/no-process-exit
}

module.exports = async req => {
	const data = await json(req);
	const err = normalizeError(data);

	const title = `${err.name}: ${err.message}`;
	const body = generateIssueBody(err);

	const issues = await findIssues({token, user, repo});
	const isDuplicate = issues.some(issue => {
		return issue.title === title && issue.state === 'open';
	});

	if (!isDuplicate) {
		await createIssue({
			token,
			user,
			repo,
			title,
			labels: err.props.labels,
			body
		});
	}

	return null;
};

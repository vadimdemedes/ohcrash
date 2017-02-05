'use strict';

const stripIndent = require('strip-indent');
const StackUtils = require('stack-utils');
const test = require('ava');
const generateIssueBody = require('../lib/generate-issue-body');
const normalizeError = require('../lib/normalize-error');

const stackUtils = new StackUtils({
	internals: StackUtils.nodeInternals()
});

test('essential info', t => {
	const err = normalizeError(new Error('Error message'));
	err.props.runtime = 'runtime';

	const issue = generateIssueBody(err);

	t.is(issue, stripIndent(`
		Hey, [OhCrash](https://github.com/vadimdemedes/ohcrash) just reported an error 🔥!
		Here are the relevant details:

		**Error name:** \`Error\`
		**Message:** \`Error message\`

		**Runtime**: \`runtime\`

		**Stack trace:**

		\`\`\`js
		${stackUtils.clean(err.stack)}
		\`\`\`

		Best of luck!
	`).trim());
});

test('ignore labels', t => {
	const err = normalizeError(new Error('Error message'));
	err.props.runtime = 'runtime';
	err.props.labels = ['bug', 'priority'];

	const issue = generateIssueBody(err);

	t.is(issue, stripIndent(`
		Hey, [OhCrash](https://github.com/vadimdemedes/ohcrash) just reported an error 🔥!
		Here are the relevant details:

		**Error name:** \`Error\`
		**Message:** \`Error message\`

		**Runtime**: \`runtime\`

		**Stack trace:**

		\`\`\`js
		${stackUtils.clean(err.stack)}
		\`\`\`

		Best of luck!
	`).trim());
});

test('missing stack trace', t => {
	const err = normalizeError(new Error('Error message'));
	err.props.runtime = 'runtime';
	err.stack = undefined;

	const issue = generateIssueBody(err);

	t.is(issue, stripIndent(`
		Hey, [OhCrash](https://github.com/vadimdemedes/ohcrash) just reported an error 🔥!
		Here are the relevant details:

		**Error name:** \`Error\`
		**Message:** \`Error message\`

		**Runtime**: \`runtime\`

		**Stack trace:**

		\`\`\`js
		No stack trace
		\`\`\`

		Best of luck!
	`).trim());
});

test('custom props', t => {
	const err = normalizeError(new Error('Error message'));
	err.props = {
		env: 'development',
		version: '1.0.0'
	};

	const issue = generateIssueBody(err);

	t.is(issue, stripIndent(`
		Hey, [OhCrash](https://github.com/vadimdemedes/ohcrash) just reported an error 🔥!
		Here are the relevant details:

		**Error name:** \`Error\`
		**Message:** \`Error message\`

		**Env**: \`development\`
		**Version**: \`1.0.0\`

		**Stack trace:**

		\`\`\`js
		${stackUtils.clean(err.stack)}
		\`\`\`

		Best of luck!
	`).trim());
});

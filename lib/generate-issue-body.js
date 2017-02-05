'use strict';

const StackUtils = require('stack-utils');
const stripIndent = require('strip-indent');
const objectToMap = require('object-to-map');
const humanize = require('humanize-string');

const stackUtils = new StackUtils({
	internals: StackUtils.nodeInternals()
});

module.exports = err => {
	const stack = err.stack ? stackUtils.clean(err.stack) : 'No stack trace';
	const props = [];

	// labels are handled by `lib/create-issue`,
	// no need to display them in issue body
	delete err.props.labels;

	for (let [key, value] of objectToMap(err.props)) {
		props.push(`**${humanize(key)}**: \`${value}\``);
	}

	return stripIndent(`
		Hey, [OhCrash](https://github.com/vadimdemedes/ohcrash) just reported an error 🔥!
		Here are the relevant details:

		**Error name:** \`${err.name}\`
		**Message:** \`${err.message}\`

		${props.join('\n\t\t')}

		**Stack trace:**

		\`\`\`js
		${stack}
		\`\`\`

		Best of luck!
	`).trim();
};

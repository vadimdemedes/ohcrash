'use strict';

const nock = require('nock');

module.exports = ({token, user, repo, query, headers, issues}) => {
	return nock('https://api.github.com', {
		reqheaders: {authorization: `token ${token}`}
	})
	.get(`/repos/${user}/${repo}/issues`)
	.query(query)
	.reply(200, issues, headers);
};

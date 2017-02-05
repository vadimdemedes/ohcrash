'use strict';

const nock = require('nock');

module.exports = ({token, user, repo, title, body, labels}) => {
	const headers = {
		authorization: `token ${token}`,
		'content-type': 'application/json'
	};

	return nock('https://api.github.com', {reqheaders: headers})
		.post(`/repos/${user}/${repo}/issues`, {title, body, labels})
		.reply(201);
};

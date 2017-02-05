'use strict';

const got = require('got');

module.exports = ({token, user, repo, title, body, labels}) => {
	return got(`https://api.github.com/repos/${user}/${repo}/issues`, {
		method: 'post',
    json: true,
		headers: {
			'authorization': 'token ' + token,
			'content-type': 'application/json'
		},
		body: JSON.stringify({title, body, labels})
	});
};

'use strict';

const parseLinkHeader = require('parse-link-header');
const got = require('got');

const loadUrl = (url, token) => {
	return got(url, {
		headers: {
			'authorization': `token ${token}`
		},
		json: true
	});
};

module.exports = ({token, user, repo}) => {
	const repos = [];

	const next = url => {
		return loadUrl(url, token).then(res => {
			repos.push.apply(repos, res.body);

			if (res.headers.link) {
				const link = parseLinkHeader(res.headers.link);

				if (link.next) {
					return next(link.next.url);
				}
			}
		});
	};

	return next(`https://api.github.com/repos/${user}/${repo}/issues`)
		.then(() => repos);
};

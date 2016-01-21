'use strict';

/**
 * Dependencies
 */

const parseLinkHeader = require('parse-link-header');
const got = require('got');


/**
 * Github API helpers
 */

function findIssues (accessToken, user, repo) {
	let repos = [];

	function next (url) {
		return loadUrl(url, accessToken).then(res => {
			repos.push.apply(repos, res.body);

			if (res.headers.link) {
				let link = parseLinkHeader(res.headers.link);

				if (link.next) {
					return next(link.next.url);
				}
			}
		});
	}

	return next('https://api.github.com/repos/' + user + '/' + repo + '/issues')
		.then(function () {
			return repos;
		});
}

exports.findIssues = findIssues;

function createIssue (accessToken, user, repo, body) {
	return got('https://api.github.com/repos/' + user + '/' + repo + '/issues', {
		method: 'post',
		headers: {
			'authorization': 'token ' + accessToken,
			'content-type': 'application/json'
		},
		body: JSON.stringify(body)
	});
}

exports.createIssue = createIssue;

function loadUrl (url, accessToken) {
	return got(url, {
		headers: {
			'Authorization': 'token ' + accessToken
		},
		json: true
	});
}

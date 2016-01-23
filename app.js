'use strict';

/**
 * Dependencies
 */

const StackUtils = require('stack-utils');
const Firebase = require('firebase');
const route = require('koa-route');
const parse = require('co-body');
const cors = require('koa-cors');
const ejs = require('ejs');
const got = require('got');
const koa = require('koa');
const fs = require('fs');

const github = require('./lib/github');

const stackUtils = new StackUtils({
	internals: StackUtils.nodeInternals()
});

const template = fs.readFileSync('template.ejs', 'utf8');


/**
 * App
 */

let app = koa();

app.use(cors());
app.use(route.post('/v1/errors', function * () {
	yield authorize(this);

	let body = yield parse(this);

	queue({
		project: this.project,
		user: this.user,
		err: body
	});

	this.body = '';
}));


/**
 * Auth middleware
 */

function * authorize (context) {
	let auth = context.headers['authorization'];

	if (!auth) {
		let err = new Error('Unauthorized');
		err.status = 401;
		throw err;
	}

	let parts = auth.split(' ');

	if (parts.length !== 2) {
		let err = new Error('Unauthorized');
		err.status = 401;
		throw err;
	}

	let apiKey = parts[1];

	if (!apiKey) {
		let err = new Error('Unauthorized');
		err.status = 401;
		throw err;
	}

	let data = yield get('refs/' + apiKey);

	if (!data) {
		let err = new Error('Forbidden');
		err.status = 403;
		throw err;
	}

	let related = yield {
		user: get('users/' + data.user),
		project: get('projects/' + data.user + '/' + data.project)
	};

	context.user = related.user;
	context.project = related.project;
	context.project.id = data.project;
}


/**
 * Queue
 */

let isRunning = false;
let items = [];

function queue (item) {
	items.unshift(item);

	if (!isRunning) {
		run();
	}
}

function run () {
	isRunning = true;

	if (items.length === 0) {
		isRunning = false;
		return;
	}

	let item = items[items.length - 1];

	github.findIssues(item.user.githubAccessToken, item.user.username, item.project.name)
		.then(function (issues) {
			return issues.filter(function (issue) {
				return issue.title === (item.err.name + ': ' + item.err.message) && issue.state === 'open';
			});
		})
		.then(function (issues) {
			if (issues.length > 0) {
				items.pop();
				isRunning = false;
				return run();
			}

			rootRef.child('projects/' + item.user.id + '/' + item.project.id).child('updatedAt').set(new Date());

			return github.createIssue(process.env.GITHUB_AUTH_TOKEN, item.user.username, item.project.name, {
				title: item.err.name + ': ' + item.err.message,
				body: issue(item.err),
				labels: item.err.props.labels || []
			});
		})
		.then(function () {
			items.pop();
			isRunning = false;
			run();
		})
		.catch(function (err) {
			console.log(err, err.stack);
		});
}


/**
 * Issue template
 */

function issue (err) {
	delete err.props.labels;

	err.cleanStack = stackUtils.clean(err.stack);

	return ejs.render(template, err);
}


/**
 * Set up firebase
 */

const rootRef = new Firebase('https://ohcrash.firebaseio.com');
rootRef.authWithCustomToken(process.env.FIREBASE_AUTH_TOKEN, function (err) {
	app.listen(process.env.PORT || 3000);
});

function get (path) {
	return new Promise(function (resolve) {
		rootRef.child(path).once('value', function (snapshot) {
			resolve(snapshot.val());
		});
	});
}

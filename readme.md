<h1 align="center">
	<br>
	<img width="200" src="https://cdn.rawgit.com/vadimdemedes/ohcrash/master/media/logo.svg" alt="OhCrash">
	<br>
	<br>
</h1>

[![Build Status](https://travis-ci.org/vadimdemedes/ohcrash.svg?branch=master)](https://travis-ci.org/vadimdemedes/ohcrash)

A microservice, which creates issues in a GitHub repository for each reported error.
Think of it as barebones [BugSnag](https://bugsnag.com), but errors are reported straight to GitHub Issues.

You can effortlessly deploy your own instance of OhCrash using [now](https://zeit.co/now).

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/vadimdemedes/ohcrash&env=GITHUB_TOKEN&env=GITHUB_USER&env=GITHUB_REPO)


## Usage

OhCrash microservice requires a GitHub token, username and a repository name.
You can obtain your personal access token [here](https://github.com/settings/tokens).
Make sure to select `public_repo` scope to create issues in a public repository or `repo` for private repositories.

If you want to run OhCrash locally:

```bash
$ npm install --global ohcrash
$ export GITHUB_TOKEN="your token"
$ export GITHUB_USER="your username"
$ export GITHUB_REPO="target repository name"
$ ohcrash
```

`ohcrash` command accepts the same options as [micro](https://github.com/zeit/micro).

After OhCrash instance is up, use [ohcrash-client](https://github.com/vadimdemedes/ohcrash-client) module to start reporting errors!
It catches uncaught exceptions and unhandled rejections out-of-the-box.
Errors can also be reported manually, using a `report()` method.

```js
const ohcrash = require('ohcrash-client').register('http://localhost:3000');

const err = new Error('Custom error handling');
ohcrash.report(err);
```

Learn more about the client at [ohcrash-client](https://github.com/vadimdemedes/ohcrash-client) repository.


## Deployment

OhCrash can (and should 😄) be easily deployed to [now](https://github.com/zeit/now) by Zeit.
Assuming you've got `now` all set up:

```
$ now -e GITHUB_TOKEN=token -e GITHUB_USER=user -e GITHUB_REPO=repo vadimdemedes/ohcrash
```

Alternatively, deploy `ohcrash` without even leaving the browser:

[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/vadimdemedes/ohcrash&env=GITHUB_TOKEN&env=GITHUB_USER&env=GITHUB_REPO)

Make sure to set a persistent alias using `now alias` for your deployment.
Execute `now help alias` for information on how to do this.
Later, use that URL as an endpoint for [ohcrash-client](https://github.com/vadimdemedes/ohcrash-client).

```js
require('ohcrash-client').register('https://my-ohcrash.now.sh');
```

## License

MIT © [Vadim Demedes](https://vadimdemedes.com)

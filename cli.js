#!/usr/bin/env node

const {spawn} = require('child_process');

const args = process.argv.slice(2);
spawn('npm', ['start', '--'].concat(args), {
	cwd: __dirname,
	stdio: 'inherit'
});

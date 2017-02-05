'use strict';

module.exports = err => {
	if (!err.name) {
		err.name = 'Error';
	}

	if (!err.message) {
		err.message = 'No error message';
	}

	if (!err.props) {
		err.props = {};
	}

	return err;
};

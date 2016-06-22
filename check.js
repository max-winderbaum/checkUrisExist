var request = require('request');
var countFound = 0;
var countAll = 0;
var domainFile = './domains.txt';
var domainPostfix = '/framebust.html';

function _testUrl(Url, callback) {
	request({
		url: 'https://' + Url,
		timeout: 1000,
	}, function (error, response, body) {
		if (!error && response.statusCode == 200 && isFramebustHtml(body)) {
			callback(true);
		} else {
			request({
				url: 'http://' + Url,
				timeout: 1000,
			}, function (error, response, body) {
				if (!error && response.statusCode == 200 && isFramebustHtml(body)) {
					callback(true);
				} else {
					callback(false);
				}
			})
		}
	})
}

function isFramebustHtml(body) {
	return body.indexOf('mixpo.com') > -1;
}

function testUrl(url, next) {
	countAll++;
	_testUrl(url, function (found) {
		var status = 'missing';
		if (found) {
			countFound++;
			status = 'found'
		}
		console.log(url + ': ' + status);
		next();
	});
}

var domains = [];
var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream(domainFile)
});

lineReader.on('line', function (line) {
	domains.push(line + domainPostfix);
});

lineReader.on('close', processDomains);

function processDomains() {
	var index = 0;

	function recurseIndexes() {
		if (index >= domains.length) {
			complete();
		} else {
			testUrl(domains[index], function () {
				index++;
				recurseIndexes();
			});
		}
	}

	recurseIndexes();
}

function complete() {
	console.log('Found: ', countFound);
	console.log('All: ', countAll);
}

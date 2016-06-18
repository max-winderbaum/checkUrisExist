var countFound = 0;
var countAll = 0;
var domainFile = './domains.txt';
var domainPostfix = '/framebust.html';

function _testUrl(Url, callback) {
	var http = require('http'),
		url = require('url'),
		callbackCalled = false;
	var options = {
		method: 'HEAD',
		host: url.parse(Url).host,
		port: 80,
		path: url.parse(Url).pathname
	};
	var req = http.request(options, function (r) {
		if (!callbackCalled) {
			callback(r.statusCode == 200);
			callbackCalled = true;
		}
		req.abort();
	});
	req.on('error', function () {
		if (!callbackCalled) {
			callback(false);
			callbackCalled = true;
		}
		req.abort();
	});
	req.setTimeout(1000, function () {
		req.abort();
	});
	req.end();
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
	domains.push('http://' + line + domainPostfix);
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

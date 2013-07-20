#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio .eaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - http://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = "TBD";


var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
};


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


var coerce_url = function(url) {

    return url;

};

var check_url = function(url, checksfile) {

    var inurl = url.toString();
    var inchecksfile = checksfile.toString();

    var temp_file = "temp.html";

    //console.log("func: URL: %s", inurl);
    //console.log("func: checksfile: %s", inchecksfile);

    rest.get(url).on('complete', function(result, url, checks) {

	//console.log("In rest.get(): url: %s, checks: %s", inurl, inchecksfile);

	if (result instanceof Error) {
	    console.error('Error (%s): reading URL (%s), exiting.', result.message, inurl);
	    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	} else {
	    //console.error("Writing file: %s", "new_check_file.html");
	    var str = util.format(result);
	    fs.writeFileSync(temp_file, str);

	    var checkJson = checkHtmlFile(temp_file, inchecksfile);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);

	    fs.unlinkSync(temp_file);
	};
    });

};


if (require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-u, --url <url>', 'URL', clone(coerce_url), URLFILE_DEFAULT)
	.parse(process.argv);

    //util.puts("Checks: " + program.checks);
    //util.puts("URL: " + program.url);

    //util.puts("check_file.html retrieved from URL: " + program.url);

    check_url(program.url, program.checks.toString());

} else {
    exports.checkHtmlFile = checkHtmlFile;
}

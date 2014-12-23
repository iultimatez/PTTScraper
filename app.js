var cheerio = require("cheerio");
var fs = require('fs');
var S = require('string');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var filewalker = require('filewalker');

var args = process.argv;

var allFiles = [];
var basicPath = './' + args[2] + '/';
var destinationPath = './' + args[3] + '/';

var summary = {};
var summaryArray = [];

filewalker(basicPath)
  .on('dir', function(p) {
    //console.log('dir:  %s', p);
  })
  .on('file', function(p, s) {
    //console.log('file: %s, %d bytes', p, s.size);
    if (S(p).right(5).s == '.html') {
    	allFiles.push(p);
    	parseFile(p);
    	console.log(p + ' parsed.');
    }else{
    	console.log(p);
    }
  })
  .on('error', function(err) {
    console.error(err);
  })
  .on('done', function() {
    console.log('%d dirs, %d files, %d bytes', this.dirs, this.files, this.bytes);
    console.log('Generating summary file.');
    allFiles = _.map(allFiles, function(name){ 
    	return S(name).chompRight('html').s + 'json'; 
    });
    var tempDes = destinationPath + 'files.json';
    fs.writeFileSync(tempDes, JSON.stringify(allFiles));
    _.map(summary, function(obj, key){
		var oneUser = {};
		oneUser["user"] = key;
		oneUser["posts"] = obj;
		summaryArray.push(oneUser);
	});
	tempDes = destinationPath + 'summary.json';
	fs.writeFileSync(tempDes, JSON.stringify(summaryArray));
    console.log('Finished.');
  })
.walk();

function parseFile(fileName){
	
	$ = cheerio.load(fs.readFileSync(basicPath + fileName));

	var info = $(".article-meta-value");
	var titleInfo = info.eq(2).text().split(' ');
	var authorInfo = info.eq(0).text().split(' ');

	var category = S(titleInfo[0]).chompLeft('[').s;
	category = S(category).chompRight(']').s;
	//console.log(authorInfo[0]);

	//console.log(titleInfo[0]);

	var allPushes = $('.push');

	var organizedPushes = {};

	allPushes.each(function(i, element){
		var pushTag = S($(this).find('.push-tag').text()).collapseWhitespace().s;
		var userid = $(this).find('.push-userid').text();
		var content = S($(this).find('.push-content').text()).chompLeft(': ').s;
		if (_.has(organizedPushes, userid)) {
			//console.log("exists");
			var temp = {};
			temp["type"] = pushTag;
			temp["content"] = content;
			organizedPushes[userid].push(temp);
		}else{
			var temp = {};
			temp["type"] = pushTag;
			temp["content"] = content;
			var biggerTemp = [];
			biggerTemp.push(temp);
			organizedPushes[userid] = biggerTemp;
		}
		//console.log(pushTag + userid + content);
	});

	//console.log(organizedPushes);

	var mainContainer = $('#main-content');
	mainContainer.find('div').remove();
	mainContainer.find('span').remove();
	mainContainer.find('a').remove();
	//console.log(mainContainer.text());

	var user = authorInfo[0];

	var singlePost = {};
	singlePost["category"] = category;
	singlePost["title"] = info.eq(2).text();
	singlePost["author"] = user;
	if (category == '新聞') {
		singlePost["content"] = "";
	}else{
		singlePost["content"] = mainContainer.text();
	}

	singlePost["pushes"] = [];

	_.map(organizedPushes, function(obj, key){
		var oneUser = {};
		oneUser["user"] = key;
		oneUser["replies"] = obj;
		singlePost["pushes"].push(oneUser);
	});

	if (_.has(summary, user)) {
		summary[user].push(singlePost);
	}else{
		summary[user] = [];
		summary[user].push(singlePost);
	}

	//console.log(singlePost["pushes"][0]);

	mkdirp.sync(destinationPath);
	var newName = S(fileName).chompRight(".html").s;
	var destination = destinationPath + newName + '.json';
	fs.writeFileSync(destination, JSON.stringify(singlePost));
}



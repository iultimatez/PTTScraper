var casper = require('casper').create();
var mouse = require("mouse").create(casper);
var basicUrl = 'http://www.ptt.cc'

var destination = casper.cli.get(0);
var resultFolder = casper.cli.get(2);

var count = 0;
var limit = parseInt(casper.cli.get(1));
var nextUrl = basicUrl;
var allLinks = [];

var fs = require('fs');

function getNavigationLinks() {
    var links = document.querySelectorAll('div.pull-right a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

function getLinks() {
    var links = document.querySelectorAll('div.title a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}

var toParse = basicUrl + '/bbs/' + destination + '/index.html';

casper.start(toParse, function() {
    this.echo(this);
});

casper.viewport(1440, 900);

casper.then(function() {
  if (this.visible(".btn-big")) {
    this.mouse.click(".btn-big");
  }
});

casper.then(function() {
    nextUrl = this.getCurrentUrl();
    console.log( "Current: " + nextUrl);
});

function goThrough(){
  if (count < limit) {
    this.thenOpen(nextUrl, function(){
        this.echo(this);
        links = this.evaluate(getLinks);
        allLinks = allLinks.concat(links);
        navLinks = this.evaluate(getNavigationLinks);
        this.echo(links.length + ' links found:');
        this.echo(' - ' + links.join('\n - '));
        this.echo("navs: " + navLinks[1]);
        nextUrl = basicUrl + navLinks[1];
        count ++;
        casper.then(goThrough);
      });
  }
}

casper.then(goThrough);

casper.then(function(){
  console.log(allLinks.length);
  for (var i = 0; i < allLinks.length; i++) {
      console.log(allLinks[i]);
      var tempUrl = basicUrl + allLinks[i];
      console.log(tempUrl);
      
      this.thenOpen(tempUrl, function(){
        this.echo(this.getTitle());
        var j;
        var fullUrl = this.getCurrentUrl();
        for (j = fullUrl.length - 1; j >= 0; j--) {
          if (fullUrl[j] == '/') {
            break;
          }
        };

        var tempFileName =  "./" + resultFolder + "/";

        for (var k = j + 1; k < fullUrl.length; k++) {
          tempFileName += fullUrl[k];
        };
        fs.write(tempFileName, this.getHTML(), 'w');
      });
    };
})

casper.run();
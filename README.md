#PTTScraper
##Intro
This is an app that can be used to scrap content from PTT website.

##Requirement
Before running this app, you should install [Node.js](http://nodejs.org/) and [CasperJS](http://casperjs.org/) first. (Here I use CasperJS 1.1 beta)

##Usage
After cloning this project don't forget to run this command first.

	npm install

Scraping contains 2 steps.

###Step 1: download web pages

	casperjs scraper.js BOARDNAME PAGES DESTINATONFOLDER -engine=slimerjs
	
Example:

	casperjs scraper.js Gossiping 5 result -engine=slimerjs
	//Download latest 5 pages in the board "Gossiping" and store them in the folder "result".
	
###Step 2: analyze content

	node app.js WEBPAGEFOLDER JSONFOLDER
Example:

	node app.js result json
	//Walk through all html files in folder "result" and store result json files in folder "json"
	
Every html will be transform into a json file. There will be 2 extra json files, one is "summary.json" which aggregates all the data, the other is "files.json" which tells you all the file names in the folder.
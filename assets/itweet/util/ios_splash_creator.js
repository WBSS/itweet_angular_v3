/**
 * Created by administrator on 23/12/15.
 * Automating app icon and splash screen creation by phantomjs
 * Run it: phantomjs generateicons.js <output folder> <icon source> <splash source>
 * Link: http://tqclarkson.com/2013/04/30/automate-icon-creation/
 */

var fs = require("fs");
var system = require('system');
var page = require("webpage").create();

var destinationFolder = system.args[1];
var iconSource = system.args[2];
var splashSource = system.args[3];

function generate(url, w, h, fn, callback) {

    console.log ("url:", url);

    page.viewportSize = {
        width: w,
        height: h
    };

    page.open(url, function() {
        console.log ("destination", destinationFolder + "/" + fn);
        page.render(destinationFolder + "/" + fn);
        callback();
    });

}

generate(splashSource, 320, 480, "Default~iphone.png", function() {
    generate(splashSource, 640, 960, "Default@2x~iphone.png", function() {
        generate(splashSource, 768, 1024, "Default-Portrait~ipad.png", function() {
            generate(splashSource, 1536, 2048, "Default-Portrait@2x~ipad.png", function() {
                generate(splashSource, 1024, 768, "Default-Landscape~ipad.png", function() {
                    generate(splashSource, 2048, 1536, "Default-Landscape@2x~ipad.png", function() {
                        generate(splashSource, 640, 1136, "Default-568h@2x~iphone.png", function() {
                            generate(splashSource, 750, 1334, "Default-667h.png", function() {
                                generate(splashSource, 1242, 2208, "Default-736h.png", function() {
                                    generate(splashSource, 2208, 1242, "Default-Landscape-736h.png", function() {
                                        console.log ("Done exit phantomsjs");
                                        phantom.exit();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
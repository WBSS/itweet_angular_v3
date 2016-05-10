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
    console.log ("width:", w);
    console.log ("height:", h);

    //page.clipRect = { top: 0, left: 0, width: w, height: h };

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

/*
generate(splashSource,1280, 1920, "splash-port-xxxhdpi.png", function() {
    console.log ("Done exit phnatomjs");
    phantom.exit();
});
*/

generate(splashSource,1280 , 1920, "splash-port-xxxhdpi.png", function() {
    generate(splashSource,960 , 1600, "splash-port-xxhdpi.png", function() {
        generate(splashSource, 720, 1280, "splash-port-xhdpi.png", function() {
            generate(splashSource, 480, 800, "splash-port-hdpi.png", function() {
                generate(splashSource, 320, 480, "splash-port-mdpi.png", function() {
                    generate(splashSource, 200, 230, "splash-port-ldpi.png", function() {
                        console.log ("Done exit phnatomjs");
                        phantom.exit();
                    });
                });
            });
        });
    });
});

/*
See: https://github.com/phonegap/phonegap/wiki/App-Splash-Screen-Sizes
Dimensions

LDPI:
    Portrait: 200x320px
    Landscape: 320x200px
MDPI:
    Portrait: 320x480px
    Landscape: 480x320px
HDPI:
    Portrait: 480x800px
    Landscape: 800x480px
XHDPI:
    Portrait: 720px1280px
    Landscape: 1280x720px
XXHDPI:
    Portrait: 960px1600px
    Landscape: 1600x960px
XXXHDPI:
    Portrait: 1280px1920px
    Landscape: 1920x1280px
*/
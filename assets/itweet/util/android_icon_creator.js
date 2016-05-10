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
generate(iconSource, 512, 512, "icon-512_google_store.png", function() {
    generate(iconSource, 192, 192, "icon-port-xxxhdpi.png", function() {
        generate(iconSource, 144, 144, "icon-port-xxhdpi.png", function() {
            generate(iconSource, 96, 96, "icon-port-xhdpi.png", function() {
                generate(iconSource, 72, 72, "icon-port-hdpi.png", function() {
                    generate(iconSource, 48, 48, "icon-port-mdpi.png", function() {
                        generate(iconSource, 36, 36, "icon-port-ldpi.png", function() {
                            console.log ("Done exit phnatomjs");
                            phantom.exit();
                        });
                    });
                });
            });
        });
    });
});
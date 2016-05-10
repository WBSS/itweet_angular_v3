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
generate(iconSource, 60, 60, "icon-60.png", function() {
    generate(iconSource, 120, 120, "icon-60@2x.png", function() {
        generate(iconSource, 76, 76, "icon-76.png", function() {
            generate(iconSource, 152, 152, "icon-76@2x.png", function() {
                generate(iconSource, 40, 40, "icon-40.png", function() {
                    generate(iconSource, 80, 80, "icon-40@2x.png", function() {
                        generate(iconSource, 57, 57, "icon.png", function() {
                            generate(iconSource, 114, 114, "icon@2x.png", function() {
                                generate(iconSource, 72, 72, "icon-72.png", function() {
                                    generate(iconSource, 144, 144, "icon-72@2x.png", function() {
                                        generate(iconSource, 29, 29, "icon-small.png", function() {
                                            generate(iconSource, 58, 58, "icon-small@2x.png", function() {
                                                generate(iconSource, 50, 50, "icon-50.png", function() {
                                                    generate(iconSource, 100, 100, "icon-50@2x.png", function() {
                                                        generate(iconSource, 180, 180, "icon-60@3x.png", function() {
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
                });
            });
        });
    });
});


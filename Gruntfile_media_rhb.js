var log;

log = require('util').log;
var _ = require('underscore');

// build with grund
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  // do grunt configuration
  var config = {
    // grund shell wrapper (http://grunt-tasks.com/grunt-exec/)
    exec: {
      // create icon android
      //--------------------------------//
      helper_icon_android: {
        cmd: 'phantomjs assets/rhb/util/android_icon_creator.js assets/rhb/icon_android/ assets/rhb/source/rhb_icon_logo.png assets/rhb/source/rhb_train_splash_768x1024.png'
      },
      // create icon ios
      //--------------------------------//
      helper_icon_ios: {
        cmd: 'phantomjs assets/rhb/util/ios_icon_creator.js assets/rhb/icon_ios/ assets/rhb/source/rhb_splash_logo.png assets/rhb_splash_logo.png assets/rhb_train_splash_1536x2048.png'
      },
      // create splash android
      //--------------------------------//
      splash_android_port_ldpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x230 -gravity center -crop 200x230+0+0 +repage assets/rhb/splash_android/splash-port-ldpi.png'
      },
      splash_android_port_mdpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x480 -gravity center -crop 320x480+0+0 +repage assets/rhb/splash_android/splash-port-mdpi.png'
      },
      splash_android_port_hdpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x800 -gravity center -crop 480x800+0+0 +repage assets/rhb/splash_android/splash-port-hdpi.png'
      },
      splash_android_port_xhdpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1280 -gravity center -crop 720x1280+0+0 +repage assets/rhb/splash_android/splash-port-xhdpi.png'
      },
      splash_android_port_xxhdpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1600 -gravity center -crop 960x1600+0+0 +repage assets/rhb/splash_android/splash-port-xxhdpi.png'
      },
      splash_android_port_xxxhdpi: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1920 -gravity center -crop 1280x1920+0+0 +repage assets/rhb/splash_android/splash-port-xxxhdpi.png'
      },

      // create splash android
      //--------------------------------//
      splash_ios_Default_iphone: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x480 -gravity center -crop 320x480+0+0 +repage assets/rhb/splash_ios/Default~iphone.png'
      },
      splash_ios_Default2x_iphone: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x960 -gravity center -crop 640x960+0+0 +repage assets/rhb/splash_ios/Default@2x~iphone.png'
      },
      splash_ios_Default_Portrait_ipad: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1024 -gravity center -crop 768x1024+0+0 +repage assets/rhb/splash_ios/Default-Portrait~ipad.png'
      },
      splash_ios_Default_Portrait2x_ipad: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x2048 -gravity center -crop 1536x2048+0+0 +repage assets/rhb/splash_ios/Default-Portrait@2x~ipad.png'
      },
      splash_ios_Default_Landscape_ipad: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1024 -gravity center -crop 1024x768+0+0 +repage assets/rhb/splash_ios/Default-Landscape~ipad.png'
      },
      splash_ios_Default_Landscape2x_ipad: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x2048 -gravity center -crop 2048x1536+0+0 +repage assets/rhb/splash_ios/Default-Landscape@2x~ipad.png'
      },
      splash_ios_Default_568h2x_iphone: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1136 -gravity center -crop 640x1136+0+0 +repage assets/rhb/splash_ios/Default-568h@2x~iphone.png'
      },
      splash_ios_Default_667h: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x1134 -gravity center -crop 750x1134+0+0 +repage assets/rhb/splash_ios/Default-667h.png'
      },
      splash_ios_Default_736h: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x2208 -gravity center -crop 1242x2208+0+0 +repage assets/rhb/splash_ios/Default-736h.png'
      },
      splash_ios_Default_Landscape_736h: {
        cmd: 'convert assets/rhb/source/rhb_train_splash_1536x2048.png -resize x2208 -gravity center -crop 2208x1242+0+0 +repage assets/rhb/splash_ios/Default-Landscape-736h.png'
      }

    }
  };

  //  do add grunt configuration
  grunt.initConfig(config);

  // load grunt pluging
  grunt.loadNpmTasks('grunt-exec');

  // create icon&splashes
  // icon_android, images_ios
  //---------------//
  grunt.registerTask('helper_create_icon_android', ['exec:helper_icon_android']);
  grunt.registerTask('helper_create_splash_android', ['exec:splash_android_port_ldpi','exec:splash_android_port_mdpi','exec:splash_android_port_hdpi','exec:splash_android_port_xhdpi','exec:splash_android_port_xxhdpi','exec:splash_android_port_xxxhdpi']);
  grunt.registerTask('helper_create_icon_ios', ['exec:helper_icon_ios']);
  grunt.registerTask('helper_create_splash_ios', ['exec:splash_ios_Default_iphone','exec:splash_ios_Default2x_iphone','exec:splash_ios_Default_Portrait_ipad','exec:splash_ios_Default_Portrait2x_ipad','exec:splash_ios_Default_Landscape_ipad',
    'exec:splash_ios_Default_Landscape2x_ipad','exec:splash_ios_Default_568h2x_iphone','exec:splash_ios_Default_667h','exec:splash_ios_Default_736h','exec:splash_ios_Default_Landscape_736h']);

  return grunt.registerTask('default', ['dev']);
};

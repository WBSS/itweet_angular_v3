var log;

log = require('util').log;
var _ = require('underscore');

/* sign android apk */
var android_sign_zipalign = '/Users/administrator/Library/Android/sdk/build-tools/23.0.2/zipalign';

// load templates
var templateconfig = function (config) {

  var template_files = {
    'www/index.html': ['src/templates/index.html'],
    'config.xml': ['src/templates/config_rhb.xml'],
    'mediagen-config.json': ['src/templates/mediagen-config.json']
  };

  // define object
  var resp = {};

  // app configuration (array of hash map)
  var platforms = [{
    appName: 'RhB',
    appID: 'rhbswiss',
    appPackage: 'ch.wbss.rhb.qs',
    itweetURL: 'https://rhbapp.itweet.ch/mvc/mobile/rhb/1/',
    appVersion: '0.8.3'
    //splash: 'rhb_splash_logo.png',
    //icon: 'icon_android.png',
    //bgcolor: 'e6041b'
  }, {
    appName: 'RhB_UTA',
    appID: 'rhbswiss',
    appPackage: 'ch.wbss.rhb.qs.uta',
    itweetURL: 'https://sandbox.itweet.ch/mvc/mobile/rhb/1/',
    appVersion: '0.8.3'
    //splash: 'rhb_splash_logo.png',
    //icon: 'icon_android.png',
    //bgcolor: 'e6041b'
  }, {
    appName: 'RhB_DEV',
    appID: 'rhbswiss',
    appPackage: 'ch.wbss.rhb.qs.dev',
    itweetURL: 'https://rhbappdev.itweet.ch/mvc/mobile/rhb/1/',
    //itweetURL: 'http://192.168.192.37/mvc/mobile/rhb/1/',
    appVersion: '0.8.3',
    //splash: 'rhb_splash_logo.png',
    //icon: 'icon_android.png',
    //bgcolor: 'e6041b'
  }
  ];

  // loop over platform array and configure templates
  platforms.forEach(function (elem) {

    // add
    var data = _({}).extend(elem, {
      js_dist: 'js/dist_min.js'
    });
    // add objects to resp
    resp['prod_' + elem.appPackage] = {
      options: {
        data: data
      },

      files: template_files
    };
    // add for debugging of dev version
    data = _({}).extend(elem, {
      js_dist: 'js/dist.js'
    });
    // dev template
    resp['uta_' + elem.appPackage] = {
      options: {
        data: data
      },
      files: template_files
    };
    // dev template
    resp['dev_' + elem.appPackage] = {
      options: {
        data: data
      },
      files: template_files
    };

  });

  // add reps object as template to config
  config.template = resp;
};

// build with grund
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  // do grunt configuration
  var config = {
    // define http server fo local development
    express: {
      server: {
        options: {
          bases: 'www',
          port: 9000,
          hostname: '0.0.0.0',
          livereload: true
        }
      }
    },
  clean: {
    options: {
      'no-write': false
    },
    folder_build: ['build/**'],
    folder_www: ['www/**/'],
    contents: ['config.xml']
  },
    symlink: {
      options: {
        overwrite: true
      },
      link_ts: {
        dest: 'src/_all.ts',
        src: 'src/_rhb.ts'
      }
    },
    /*
     typescript: {
       base: {
       src: "src/_all.ts",
       dest: "build/ts.js",
       options: {
         module: 'amd', //or commonjs
         target: 'es5', //or es3,
         sourceMap: false,
         declaration: false,
         rootDir : "src"
       }
     },
     */
    ts: {
      default : {
        src: ["src/_all.ts"],
        out: "build/ts.js",
        default: {
          // specifying tsconfig as a boolean will use the 'tsconfig.json' in same folder as Gruntfile.js
          tsconfig: true
        }
      }
    },
    // Converting translated .po files into angular-compatible JavaScript files (https://angular-gettext.rocketeer.be/dev-guide/compile/)
    nggettext_compile: {
      all: {
        files: {
          "build/translations.js": ["po/*.po"]
        }
      }
    },
    // extract labels to translate
    nggettext_extract: {
      pot: {
        files: {
          "po/template.pot": ["src/**/*.html","build/ts.js"]
        }
      }
    },
    // minifying, combining, and automatically caching your HTML templates with $templateCache.
    ngtemplates: {
      templates: {
        cwd: "src",
        src: ["**/*.html"],
        dest: "build/templates.js",
        options: {
          standalone: true,
          htmlmin: {
            collapseWhitespace: true,
            collapseBooleanAttributes: true
          }
        }
      }
    },
    // detects file changes and runs after change task
    watch: {
      all: {
        files: 'src/**/*',
        options: {
          livereload: false
        },
        tasks: ['_compile']
      }
    },
    // concat all css file in one
    concat_css: {
      all: {
        src: ['src/**/*.css'],
        dest: "www/css/app.css"
      }
    },
    // minify file www/js/dist.js
    uglify: {
      dist: {
        files: {
          'www/js/dist_min.js': ['www/js/dist.js']
        }
      }
    },
    // grund shell wrapper (http://grunt-tasks.com/grunt-exec/)
    exec: {
      //----- cordova taks
      //------------------------------------//
      builder_android_release: {
        cmd: 'cordova build --release android'
      },
      builder_ios_release: {
        cmd: 'cordova build --release ios'
      },
      runner_android: {
        // cmd: 'cordova run android --device --debug'
        cmd: 'cordova run android --debug'
      },
      runner_ios: {
        //cmd: 'cordova run ios --device  --codeSignIdentitiy="iPhone Development" --provisioningProfile="b73af506-6d3b-4461-81a6-d6aea106a3f4'
        cmd: 'cordova run ios --device --debug'
      },
      cleaner_platform_android: {
        cmd: 'cordova clean android'
      },
      cleaner_platform_ios: {
        cmd: 'cordova clean ios'
      },
      tester: {
        cmd: 'ls -l **'
      },
      signer_android: {
        cmd: 'cd platforms/android/build/outputs/apk/ && echo itweet | jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 ' +
        '-keystore ../../../../../publish/wbss_mobileapps.keystore android-armv7-release-unsigned.apk wbss_mobileapps && ' +
        android_sign_zipalign + ' -v 4 android-armv7-release-unsigned.apk  android.apk '
      },
      mediagen: {
        cmd: 'mediagen'
      }
    },
    // automatic concatenation of installed Bower components (https://www.npmjs.com/package/grunt-bower-concat)
    //----------------------------------//
    bower_concat: {
      all: {
        dest: {
          'js': 'www/js/dist.js',
          'css': 'www/css/dist.css'
        },
        exclude: [
          'angular-i18n',
          'labjs'
        ],
        mainFiles: {
          roboto: ['2014/roboto-woff.css'],
          "ng-clustered-map": ['dist/ng-clustered-map.js']
        },
        dependencies: {
          'ng-clustered-map': 'angular'
        },
        bowerOptions: {
          relative: false
        }
      }
    },
    copy: {
      main: {
        files: [
          // includes files&dir within path
          {expand: true, cwd: 'assets/app/icons/', src: ['**/*.png'], dest: 'www/img'},
          {expand: true, cwd: 'assets/app/icons/', src: ['**/*.svg'], dest: 'www/img'},
          {expand: true, cwd: 'assets/app/fonts/', src: ['**'], dest: 'www/css'}
        ]
      }
    },
    // Concatenate files (https://github.com/gruntjs/grunt-contrib-concat)
    concat: {
      de: {
        src: 'bower_components/angular-i18n/angular-locale_de.js',
        dest: 'www/js/de.js'
      },
      en: {
        src: 'bower_components/angular-i18n/angular-locale_en.js',
        dest: 'www/js/en.js'
      },
      it: {
        src: 'bower_components/angular-i18n/angular-locale_it.js',
        dest: 'www/js/it.js'
      },
      fr: {
        src: 'bower_components/angular-i18n/angular-locale_fr.js',
        dest: 'www/js/fr.js'
      },
      labjs: {
        src: "bower_components/labjs/LAB.min.js",
        dest: "www/js/labjs.js"
      },
      app: {
        src: ["build/**/*.js"],
        dest: "www/js/app.js",
        sourceMap: false
      }
    }
  };

  // config templates
  templateconfig(config);

  //  do add grunt configuration
  grunt.initConfig(config);

  // load grunt pluging
  grunt.loadNpmTasks('grunt-exec');
  //grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-contrib-symlink');
  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-angular-templates');


  // register tasks -------------------------------//
  //-----------------------------------------------//

  // add images to www/img
  //------------------//
  grunt.registerTask('_add_assets_files', ['copy:main:files']);

  // clean tasks (handle  carefull file delete)
  //------------------//
  grunt.registerTask('_clean_build', ['clean:folder_build','clean:folder_www','clean:contents']);

  // compile tasks / create www folder with all dependencies
  //------------------//
  // Folder: build (nggettext_compile, ngtemplates, link folder, typescript)
  // Folder: www (bower_concat (creates dist.js, dist.css), concat (creates app.js from folder build, ..), concat_css (creates app.css)
  grunt.registerTask('_compile', ['nggettext_compile', 'ngtemplates', 'symlink:link_ts', 'ts', 'bower_concat', 'concat', 'concat_css', '_add_assets_files']);


  // prepare tasks / compile & optimize for production
  //----------------//
  //grunt.registerTask('_prepare', ['compile', 'uglify', 'exec:mediagen']);
  grunt.registerTask('_prepare', ['_compile', 'uglify']);


  // clean tasks / compile & optimize for production
  //----------------//
  grunt.registerTask('_clean_platform_android', ['exec:cleaner_platform_android']);
  grunt.registerTask('_clean_platform_ios', ['exec:cleaner_platform_ios']);


  // development tasks
  //-----------------------------------------------//

  // autobuild for development on local browser
  grunt.registerTask('run-on-local-server_dev_ch.wbss.rhb.dev', ['_clean_build','template:dev_ch.wbss.rhb.qs.dev', '_compile', 'express', 'watch']);

  // build&deploy local device (USB adapter)
  // run default android
  grunt.registerTask('_compile-and-run_android', ['_prepare', 'exec:runner_android']);
  grunt.registerTask('_compile-and-run_android_release', ['_prepare', 'exec:runner_android_release']);

  // run default ios
  grunt.registerTask('_compile-and-run_ios', ['_prepare', 'exec:runner_ios']);

  // build&deploy on local device (USB adapter)
  //---------------------------------------------//
  // android
  grunt.registerTask('run-android_prod', ['_clean_build','template:prod_ch.wbss.rhb.qs','_clean_platform_android','_compile-and-run_android']);
  grunt.registerTask('run-android_uta', ['_clean_build','template:uta_ch.wbss.rhb.qs.uta','_clean_platform_android','_compile-and-run_android']);
  grunt.registerTask('run-android_dev', ['_clean_build','template:dev_ch.wbss.rhb.qs.dev','_clean_platform_android','_compile-and-run_android']);
  // ios
  grunt.registerTask('run-ios_prod', ['_clean_build','template:prod_ch.wbss.rhb.qs','_clean_platform_ios','_compile-and-run_ios']);
  grunt.registerTask('run-ios_uta', ['_clean_build','template:uta_ch.wbss.rhb.qs.uta','_clean_platform_ios','_compile-and-run_ios']);
  grunt.registerTask('run-ios_dev', ['_clean_build','template:dev_ch.wbss.rhb.qs.dev','_clean_platform_ios','_compile-and-run_ios']);


  // production tasks
  //-----------------------------------------------//

  // build&sign apk file for google play store and enterprise deployment
  //----------------------------------------------//
  // compile&sign android apk
  grunt.registerTask('_compile-and-sign_android_release', ['_prepare', 'exec:builder_android_release', 'exec:signer_android']);
  // sign android apk
  grunt.registerTask('sig_android_apk-file', ['exec:signer_android']);
  // build&sign to folder platform (cordova android)
  grunt.registerTask('build_sign-android_release_prod', ['_clean_build','template:prod_ch.wbss.rhb.qs','_clean_platform_android','_compile-and-sign_android_release']);
  grunt.registerTask('build_sign-android_release_uta', ['_clean_build','template:uta_ch.wbss.rhb.qs.uta','_clean_platform_android', '_compile-and-sign_android_release']);
  grunt.registerTask('build_sign-android_release_dev', ['_clean_build','template:dev_ch.wbss.rhb.qs.dev','_clean_platform_android','_compile-and-sign_android_release']);

  // build&sign to folder platform (cordova ios)
  // compile&sign android apk
  grunt.registerTask('_compile-and-build_ios_release', ['_prepare', 'exec:builder_ios_release']);
  grunt.registerTask('build_ios_release_prod', ['_clean_build','template:prod_ch.wbss.rhb.qs','_clean_platform_ios','_compile-and-build_ios_release']);
  grunt.registerTask('build_ios_release_uta', ['_clean_build','template:uta_ch.wbss.rhb.qs.uta','_clean_platform_ios','_compile-and-build_ios_release']);
  grunt.registerTask('build_ios_release_dev', ['_clean_build','template:dev_ch.wbss.rhb.qs.dev','_clean_platform_ios','_compile-and-build_ios_release']);

  return grunt.registerTask('default', ['dev']);
};
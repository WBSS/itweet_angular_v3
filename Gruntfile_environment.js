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
      // cordova
      //--------------------------------//
      show_node_version:{
        cmd: 'node -v'
      },
      show_npm_version:{
        cmd: 'npm -v'
      },
      show_bower_version:{
        cmd: 'bower -v'
      },
      show_cordova_version:{
        cmd: 'cordova -version'
      },
      show_cordova_plugins_version:{
        cmd: 'cordova plugings'
      },
      show_bower_dependencies:{
        cmd: 'bower list'
      },
      show_npm_gobal_packages:{
      cmd: 'npm list -g --depth=0'
      },
      show_npm_local_packages:{
        cmd: 'npm ls --depth 0'
      },
      intstall_cordova_version_5_4_1:{
        cmd: 'sudo npm install -g cordova@5.4.1'
      }

    }
  };

  //  do add grunt configuration
  grunt.initConfig(config);

  // load grunt pluging
  grunt.loadNpmTasks('grunt-exec');

  // Register tasks
  //---------------//
  grunt.registerTask('show_environment', ['exec:show_node_version','exec:show_npm_version','exec:show_bower_version','exec:show_cordova_version']);

  return grunt.registerTask('default', ['dev']);
};

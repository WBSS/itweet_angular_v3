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
      //create_doc_itweet:{
        //cmd: 'typedoc --out ./doc/itweet./temp/**/*.ts --name "iTweet App" --verbose --target ES5 --module amd --excludeExternals'
      //},
      //create_doc_rhb:{
        //cmd: 'typedoc --out ./doc/rhb ./temp/**/*.ts --name "QS-Mobile App" --verbose --target ES5 --module amd --excludeExternals'
      //}
    },
    clean: {
      options: {
        'no-write': false
      },
      folder_temp: ['temp/**']
    },
    symlink: {
      options: {
        overwrite: true
      },
      link_ts_itweet: {
        dest: 'src/_all.ts',
        src: 'src/_itweet.ts'
      },
      link_ts_rhb: {
        dest: 'src/_all.ts',
        src: 'src/_rhb.ts'
      }
    },
    copy: {
      main_itweet: {
        files: [
          // includes files&dir within path
          {expand: true, cwd: 'src/', src: ['**/*.*', '!**/ext_rhb/**'], dest: 'temp/'}
        ]
      },
      main_rhb: {
        files: [
          // includes files&dir within path
          {expand: true, cwd: 'src/', src: ['**/*.*', '!**/ext_itweet/**'], dest: 'temp/'}
        ]
      }
    }
 };

  //  do add grunt configuration
  grunt.initConfig(config);

  // load grunt pluging
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Register tasks
  //---------------//
  grunt.registerTask('show_environment', ['exec:show_node_version','exec:show_npm_version','exec:show_bower_version','exec:show_cordova_version']);

  // create doc tasks
  //---------------//
  grunt.registerTask('copy_temp_doc_itweet', ['clean:folder_temp','symlink:link_ts_itweet','copy:main_itweet']);
  grunt.registerTask('copy_temp_doc_rhb', ['clean:folder_temp','symlink:link_ts_rhb','copy:main_rhb']);

  return grunt.registerTask('default', ['dev']);
};

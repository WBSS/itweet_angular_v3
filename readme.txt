Instruction&Pitfalls

[uk 20160516] Create src doc:
1. run grunt task (Gruntfile_project): copy_temp_doc_itweet or copy_temp_doc_rhb
2. run doc creator:
typedoc --out ./doc/rhb ./temp/**/*.ts --name 'QS-Mobile App' --verbose --target ES5 --module amd --excludeExternals
or
typedoc --out ./doc/itweet ./temp/**/*.ts --name 'itweet App' --verbose --target ES5 --module amd --excludeExternals

[uk 20160606] Create plugin/platform
- Delete folder "plugin", "platform"
- Create platform $>cordova platform android@5.1.1 (Creates plugin folder)
- Copy /assest/plugin/cordova-plugin-media to "plugin" folder (Dave hack aac)
- Remove android platform $>cordova platform rm android
- Create platform $>cordova platform android@5.1.1 (This add's the cordova-plugin-media to the android platform)
- add other platforms

# itweet_angular_v3
itweet app project initial

Platforms: ios, android

Create project:

Delete files / directories / platforms
1. delete files if exists in /plugin
2. delete directory if exists /bower_components
3. delete directory if exists /node_modules
4. remove all platforms if exists: cordova platform remove android/ios

Add files / directories / platforms
1. Copy plugin assets/plugin/cordova-plugin-media to /plugin
2. Do npm install
3. Do bower install
4. Create platform cordova platform add ios@3.9.2
(Creates also all used plugins in folder /plugin)
5. Create platform cordova platform add android@5.1.1

Project tool versions:
cordova CLI: vesion 6.1.1
Node.js: 4.2.1


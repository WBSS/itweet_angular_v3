/**
 * All angular modules used in rhh app
 * Default entry point at app startup is: app.default_route
 * uk: 2016-05-03
 */
var app = app ||  {};
app.angular_modules = ['gettext', 'ui.router', 'ngMaterial',
    'itweet.login',
    'itweet.app',
    'templates',
    //'itweet.map',
    'itweet.settings',
    'itweet.help',
    'itweet.disclaimer',
    'itweet.alltweets',
    'itweet.mytweets',
    'itweet.config',
    'itweet.network',
    'itweet.context',
    'itweet.category',
    'itweet.text',
    'itweet.photo',
    'itweet.audio',
    'itweet.overview',
    'itweet.navigation',
    'itweet.media',
    'itweet.menu',
     // rhb
    'itweet.multicategory',
    'itweet.rhb.mydata',
    'itweet.rhb.location',
    'itweet.rhb.attributeInvolvedPersons',
    'itweet.rhb.attributeTime',
    'itweet.rhb.attributeTrain',
    'itweet.rhb.visibility',
    'ngIOS9UIWebViewPatch'
];
app.default_route = '/app/mydatarhbdata';
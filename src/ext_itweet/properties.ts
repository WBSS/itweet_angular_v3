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
    'itweet.map',
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
    'itweet.register',
    'itweet.menu',
    'ngIOS9UIWebViewPatch'
];
app.default_route = '/app/register';
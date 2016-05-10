/// <reference path='../_all.ts' />

module itweet.model {
    enum HttpMethods { GET, POST, PUT }

    export class ServiceFactory {
        public loginService: LoginService;
        public contextService: ContextService;
        public categoryService: CategoryService;
        public pingService: PingService;
        public iTweetService: iTweetService;
        public iTweetUploader: iTweetUploader;
        public fileUploader: FileUploader;
        public brandService: BrandService;
        public retryableRequest: BasicService<any>[] = [];
        public online: boolean;
        public foreground: boolean = true;

        CACHE_NAME = "request_cache";
        CACHE_CAPACITY = 20;

        public static $inject = [
            '$http', 'ItweetConfig', '$q', '$window',
            '$rootScope', 'ItweetStorage', '$timeout', '$log', 'gettextCatalog'
        ];

        runAll() {
            angular.forEach(this.retryableRequest, (request) => {
                request.getResponseData();
            })
        }
        reset() {
            this.resetRetry();
            this.runAll();
            this.contextService.runAll();
        }
        resetRetry() {
            this.retryableRequest.forEach((req) => {
                req.reset();
            });
        }

        constructor(public $http, public config: BaseConfig, public $q: angular.IQService,
            public $window: angular.IWindowService, public $rootScope: angular.IRootScopeService,
            public ItweetStorage: StorageService,
            public $timeout: angular.ITimeoutService,
            public $log: angular.ILogService,
            public gettextCatalog) {


            this.ItweetStorage.resetable.push(this);

            this.online = $window.navigator.onLine;
            this.online = true;

            $window.addEventListener("offline", () => {
                $rootScope.$apply(() => {
                    this.online = false;
                });
            }, false);
            $window.addEventListener("online", () => {
                $rootScope.$apply(() => {
                    this.online = true;
                    this.runAll();
                });
            }, false);
            document.addEventListener("pause", () => {
                $rootScope.$apply(() => {
                    this.foreground = false;
                    $rootScope.$broadcast("pause");
                });
            }, false);
            document.addEventListener("resume", () => {
                $rootScope.$apply(() => {
                    this.foreground = true;
                    this.online = $window.navigator.onLine;
                    if (this.online) {
                        this.runAll();
                        this.contextService.runAll();
                    }
                    $rootScope.$broadcast("resume");
                });
            }, false);

            this.loginService = new LoginService(this);
            this.contextService = new ContextService(this);
            this.categoryService = new CategoryService(this);
            this.brandService = new BrandService(this);
            this.pingService = new PingService(this);
            this.iTweetService = new iTweetService(this);
            this.iTweetUploader = new iTweetUploader(this, gettextCatalog);
            this.fileUploader = new FileUploader(this);
            this.contextService.runAll();

        }

    }

    export class BasicService<T> {
        public responseData: T;   /* response data */
        public responseError: any;  /* response error */
        public lastFetched: number; /*last timestamp */
        private lastToken: any /* last token */
        public loading: angular.IDeferred<any>; /* defered, can cancle current request */

        reset() {
            this.lastToken = undefined;
        }

        getToken(): string {
            return JSON.stringify(this.setupRequest());
        }


        contextToken() {
            return itweet.model.Tweet.getCurrentContextToken(this.runner.ItweetStorage.currentTweet, this.runner.ItweetStorage.user);
        }

        initData() {
            this.responseData = <T>{};
        }

        saveData() {
        }

        getResponseData(): T { /* return the data for get request */
            if (this.getToken() != this.lastToken) {
                this.cancel();
                this.initData();
                this.lastToken = this.getToken();
                this.lastFetched = 0;
            }

            if (Date.now() - this.lastFetched > 60 * 5 * 1000 && this.loading == undefined) {
                this.run();
            }
            return this.responseData;
        }

        cancel() {
            if (this.loading) {
                this.loading.resolve("new Parameters");
                this.loading = undefined;
            }
        }


        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()): angular.IPromise<any> {/* used for post request like login etc */
            if (!this.runner.online) {
                this.runner.$timeout(() => {
                    currentLoading.reject("offline");
                    if (this.loading == currentLoading) {
                        this.loading = undefined;
                    }
                }, 1000);
                this.loading = currentLoading;
                return currentLoading.promise;
            }

            var config = this.setupRequest();
            this.loading = currentLoading;
            config.timeout = this.loading.promise;
            this.responseError = null;
            var done = () => {
                if (this.loading && this.loading == currentLoading) {
                    //  this.loading.resolve();
                    this.loading = undefined;
                }
            };
            var resp = this.runner.$http(config)
            resp
                .then((response) => {
                    this.responseData = response.data;
                    this.lastFetched = Date.now();
                    this.saveData();
                    done();
                }, (response) => {
                    if (response.status == 401) {
                        this.runner.loginService.logout();
                    }
                    this.responseError = response.statusText;
                    this.runner.$timeout(done, 1000);
                });
            return resp;

        }

        setupRequest(): angular.IRequestConfig { return null; } /* setup the request, MUST OVERRIDE */

        constructor(protected runner: ServiceFactory, public reload: boolean) {
            if (reload) {
                runner.retryableRequest.push(this);
            }
        }

    }

    export class LoginData {
        public username: string;
        public password: string;
        public langISO: string;
        public countryISO: string;
        public appId: string;
    }

    export class LoginService extends BasicService<LoginResponse>{
        public data: LoginData;
        constructor(protected runner: ServiceFactory) {
            super(runner, false);
        }

        logout() {
            this.runner.ItweetStorage.user.showContext = true;
            this.runner.ItweetStorage.user.token = undefined;
            this.runner.ItweetStorage.user.createMessageAllowed = true;
            if (this.data) {
                this.data.username = undefined;
                this.data.password = undefined;
            }
            // this.runner.ItweetNavigation.logout();
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()): angular.IPromise<any> {
            return super.run(currentLoading).then(() => {
                this.runner.ItweetStorage.clearCache();
                this.runner.ItweetStorage.user.showContext = this.responseData.showContext;
                this.runner.ItweetStorage.user.token = this.responseData.loginToken;
                this.runner.ItweetStorage.user.createMessageAllowed = this.responseData.createMessageAllowed;
            });
        }

        setupRequest(): angular.IRequestConfig {
            this.data.langISO = this.runner.config.langISO;
            this.data.countryISO = this.runner.config.countryISO;
            this.data.appId = this.runner.config.appId;

            return <angular.IRequestConfig>{
                method: "PUT",
                url: this.runner.config.endpoint_login,
                data: this.data
            }
        }
    }

    export class BrandService extends BasicService<BrandResponse> {
        constructor(protected runner: ServiceFactory, retry: boolean = true) {
            super(runner, retry);
        }
        private colorSubheader: string="#ffffff";

        initData() {
            super.initData();
            if (angular.equals({}, this.responseData)) {
                // empty, load all
                var storage = this.runner.ItweetStorage.brandStore;
                this.responseData = this.runner.ItweetStorage.brandStore[this.contextToken()] || {};
            }
        }

        getColor(key: string) {
            var hex = this.getResponseData()[key];
            if (!hex) {
                hex=this.colorSubheader;
            }
            var a, r, g, b: number;
            a = 255;
            if (hex.length == 6) {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            } else {
                a = parseInt(hex.substring(0, 2), 16);
                r = parseInt(hex.substring(2, 4), 16);
                g = parseInt(hex.substring(4, 6), 16);
                b = parseInt(hex.substring(6, 8), 16);
            }
            return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
        }

        getSubheaderStyle() {
            return "color:" + this.getColor('subheaderColorText') + ";background-color:rgba(226,0,26,216);margin-right:0px;;overflow: hidden;";
        }

        getFooterStyle() {
            return "color:" + this.getColor('footerButtonColorText') + ";background-color:" + this.getColor('footerButtonColor') + ";";
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            var token = this.contextToken();
            return super.run(currentLoading).then(() => {
                this.runner.ItweetStorage.brandStore[token] = this.responseData;
            });
        }

        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "GET",
                url: this.runner.config.endpoint_brand +
                this.runner.config.langISO + "/" +
                this.runner.config.countryISO + "/" +
                this.runner.config.platform + "/" +
                this.contextToken()
            }
        }
    }

    export class PingService extends BasicService<any>{
        public responseTime: Number = NaN;
        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "GET",
                url: this.runner.config.endpoint_ping
            }
        }

        constructor(protected runner: ServiceFactory) {
            super(runner, false);
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            var start = Date.now();
            return super.run(currentLoading).then(() => {
                this.responseTime = Date.now() - start;
            });
        }
    }

    export class FileUploader extends BasicService<any>{
        private mime;
        private data;
        private sha1;

        constructor(protected runner: ServiceFactory) {
            super(runner, false);
        }

        readData(fileSystemURI) {
            return new this.runner.$q((resolve, reject) => {
                window.resolveLocalFileSystemURL(fileSystemURI, (entry) => {
                    entry.file((file) => {
                        var reader = new FileReader();
                        reader.onload = (readresult: any) => {
                            resolve(readresult.target.result)
                        }
                        reader.onerror = (error: any) => {
                            reject(error.target.error.code);
                        }
                        reader.readAsArrayBuffer(file);
                    }, reject);
                });
            });
        }

        setupAndRun(media: MediaStorageElement) {
            return this.readData(media.url).then((data) => {
                this.data = data;
                this.sha1 = media.sha1;
                this.mime = media.mime;
                return this.run();
            });
        }

        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "PUT",
                url: this.runner.config.endpoint_media + this.sha1,
                data: new Uint8Array(this.data),
                transformRequest: [],
                headers: {
                    "Content-Type": this.mime
                }
            }
        }
    }

    export class iTweetUploader {

        constructor(
            protected runner: ServiceFactory,
            private gettextCatalog) {
        }

        upload(tweets: Tweet[], currentLoading: angular.IDeferred<any> = this.runner.$q.defer(), ourData: ProgressDialogData = new ProgressDialogData(undefined, undefined, undefined, undefined)) {
            ourData.text = this.gettextCatalog.getString("upload_status_connect");

            var promise = this.runner.pingService.run(currentLoading).then(() => {
                if (this.runner.pingService.responseTime > this.runner.config.ping_threshold || !this.runner.pingService.responseTime) {
                    ourData.title = this.gettextCatalog.getString("general_info_high_ping_title");
                    ourData.text = this.gettextCatalog.getString("general_info_high_ping_message");
                    return this.runner.$q.reject("timeout in ping");
                }
            }, (data) => { return this.runner.$q.reject("timeout in ping"); });
            tweets.forEach((tweet) => {
                Object.keys(tweet.mediaStore).forEach((key: any, index) => {
                    promise = promise.then(() => {
                        ourData.title = this.gettextCatalog.getString("upload_status_title");
                        ourData.text = (key == 0 ? this.gettextCatalog.getString("upload_status_speech") : this.gettextCatalog.getString("upload_status_image"));
                        if (key > 0) {
                            ourData.extension = key;
                        } else {
                            ourData.extension = "";
                        }
                        return this.runner.fileUploader.setupAndRun(tweet.mediaStore[key]);
                    }, (data) => { return this.runner.$q.reject(data) });
                });

                promise = promise.then(() => {
                    ourData.title = this.gettextCatalog.getString("upload_status_title");
                    ourData.text = this.gettextCatalog.getString("upload_status_tweet");
                    ourData.extension = "";
                    this.runner.iTweetService.tweet = tweet;
                    this.runner.iTweetService.undo = false;
                    return this.runner.iTweetService.run(currentLoading);
                }, (data) => { return this.runner.$q.reject(data) });
            });
            var timepromise = this.runner.$timeout(() => {
            }, this.runner.config.min_upload_time);
            currentLoading.promise.then(() => {
                this.runner.$timeout.cancel(timepromise);
            });

            return this.runner.$q.all([promise, timepromise]);
        }

    }

    export class iTweetService extends BasicService<any> {
        public tweet: Tweet;
        public undo: boolean;
        setupRequest(): angular.IRequestConfig {
            if (this.undo) {
                return <angular.IRequestConfig>{
                    method: "DELETE",
                    url: this.runner.config.endpoint_itweet + this.tweet.guid,
                }
            } else {
                var copy = Tweet.prepareForTransmission(this.tweet, this.runner.config, this.runner.ItweetStorage.user);
                return <angular.IRequestConfig>{
                    method: "PUT",
                    url: this.runner.config.endpoint_itweet + this.tweet.guid,
                    data: copy
                }
            }
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            return super.run(currentLoading).then(() => {
                this.tweet.sent = true;
                this.runner.ItweetStorage.deleteTweet(this.tweet);
            });
        }

        constructor(protected runner: ServiceFactory) {
            super(runner, false);
        }
    }


    export class ContextService extends BasicService<Context[]>{
        constructor(protected runner: ServiceFactory) {
            super(runner, true);
        }

        initData() {
            super.initData();
            if (angular.equals({}, this.responseData)) {
                // empty, load all
                var storage = this.runner.ItweetStorage.contextStore;
                this.responseData = Object.keys(storage).map(function(key) {
                    return storage[key];
                });
            }
        }

        runAll() {
            return this.run().
                then(() => {
                    return this.runner.$q.all(
                        Object.keys(this.runner.ItweetStorage.contextStore).map((token) => {
                            var req = new CategoryServiceRefresher(this.runner, token);
                            return req.run();
                        }).concat(
                            Object.keys(this.runner.ItweetStorage.contextStore).map((token) => {
                                var req = new BrandServiceRefresher(this.runner, token);
                                return req.run();
                            })
                            ));

                }).then(() => {
                    this.runner.resetRetry();
                });
        }

        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "GET",
                url: this.runner.config.endpoint_contexts +
                this.runner.config.appId + "/" +
                this.runner.ItweetStorage.currentTweet.lat + "/" +
                this.runner.ItweetStorage.currentTweet.lng + "/" +
                this.runner.config.langISO + "/" +
                this.runner.config.countryISO + "/" +
                this.runner.config.platform + "/" +
                this.runner.ItweetStorage.user.token
            }
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            return super.run(currentLoading).then(() => {
                angular.forEach(this.responseData, (elem: itweet.model.Context) => {
                    if (!this.runner.ItweetStorage.contextStore[elem.contextToken]) {
                        this.runner.ItweetStorage.contextStore[elem.contextToken] = new Context();
                    }
                    angular.extend(this.runner.ItweetStorage.contextStore[elem.contextToken], elem);
                });
            }, (reason) => { return this.runner.$q.reject(reason) });
        }
    }

    export class CategoryService extends BasicService<CategoriesResponse>{
        constructor(protected runner: ServiceFactory, retry: boolean = true) {
            super(runner, retry);
        }

        initData() {
            super.initData();
            if (angular.equals({}, this.responseData)) {
                // empty, load all
                var storage = this.runner.ItweetStorage.contextStore[this.contextToken()];
                if (storage) {
                    //                    this.responseData.displayName = storage.displayname;
                    storage = storage.categories;
                    this.responseData.categories = Object.keys(storage).map(function(key) {
                        return storage[key];
                    });
                }
            }
        }

        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "GET",
                url: this.runner.config.endpoint_categories +
                this.runner.config.langISO + "/" +
                this.contextToken()
            }
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            var contextToken = this.contextToken();
            if (!contextToken) {
                return this.runner.$q.reject("no token");
            }

            return super.run(currentLoading).then(() => {

                if (contextToken) {
                    if (!this.runner.ItweetStorage.contextStore[contextToken]) {
                        this.runner.ItweetStorage.contextStore[contextToken] = new Context();
                    }
                    this.runner.ItweetStorage.contextStore[contextToken].categories = {};
                    angular.forEach(this.responseData.categories, (elem: itweet.model.Category) => {

                        this.runner.ItweetStorage.contextStore[contextToken].categories[elem.id] = elem;
                    });
                }
            });
        }

        getCategoryName(tweet: itweet.model.Tweet = this.runner.ItweetStorage.currentTweet): string {
            var token = itweet.model.Tweet.getCurrentContextToken(tweet, this.runner.ItweetStorage.user);
            if (token && this.runner.ItweetStorage.contextStore[token] && this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId]) {
                return this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId].name;
            } else {
                return "undefined"
            }
        }

        getSubcategoryName(tweet: itweet.model.Tweet = this.runner.ItweetStorage.currentTweet): string {
            //Base implementation has no subcategories
            return null;
        }
    }


    class CategoryServiceRefresher extends CategoryService {
        contextToken() {
            return this.token;
        }

        constructor(protected runner: ServiceFactory, public token: string) {
            super(runner, false);
        }
    }
    class BrandServiceRefresher extends BrandService {
        contextToken() {
            return this.token;
        }

        constructor(protected runner: ServiceFactory, public token: string) {
            super(runner, false);
        }
    }
}
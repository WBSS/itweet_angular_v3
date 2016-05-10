module itweet.model {
	
    export class RHBServiceFactory extends ServiceFactory {
        public metadataService: MetadataService;
        
        constructor(public $http, public config: BaseConfig, public $q: angular.IQService,
            public $window: angular.IWindowService, public $rootScope: angular.IRootScopeService,
            public ItweetStorage: StorageService,
            public $timeout: angular.ITimeoutService,
            public $log: angular.ILogService,
            public gettextCatalog) {
                super($http, config, $q, $window, $rootScope, ItweetStorage, $timeout, $log, gettextCatalog);
                this.metadataService = new MetadataService(this);
                this.categoryService = new RHBCategoryService(this);
            }
    }
    
    export class RHBCategoryService extends CategoryService {
        
        constructor(protected runner: ServiceFactory, retry: boolean = true) {
            super(runner, retry);
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
            var token = itweet.model.Tweet.getCurrentContextToken(tweet, this.runner.ItweetStorage.user);
            if (token && this.runner.ItweetStorage.metdataStore[token] && this.runner.ItweetStorage.metdataStore[token].categoriesQs) {
                var _tItem = this.runner.ItweetStorage.metdataStore[token].categoriesQs.filter(function(v) {
                    return v.id === tweet.itemQs.refItemCategoryQsId; // filter out appropriate one
                })[0];
                if (_tItem) {
                    let parentId = _tItem.id;
                    var append = "";
                    var i = 0;
                    while (parentId) {
                        if (i > 20) break;
                        i += 1;
                        var item = this.runner.ItweetStorage.metdataStore[token].categoriesQs.filter(function(v) {
                            return v.id === parentId; // filter out appropriate one
                        })[0];
                        append = item.name + (append ? " / " + append : "");
                        parentId = item.parentId;
                    }
                    return append;

                } else return null;
            }
            else return null;
        }
    }
    
    export class MetadataService extends BasicService<MetadataResponse> {
        constructor(protected runner: ServiceFactory, retry: boolean = true) {
            super(runner, retry);
        }
        initData() {
            super.initData();
            if (angular.equals({}, this.responseData)) {
                // empty, load all
                var storage = this.runner.ItweetStorage.metdataStore;
                this.responseData = this.runner.ItweetStorage.metdataStore[this.contextToken()] || {};
            }
        }

        run(currentLoading: angular.IDeferred<any> = this.runner.$q.defer()) {
            var token = this.contextToken();
            return super.run(currentLoading).then(() => {
                this.runner.ItweetStorage.metdataStore[token] = this.responseData;
            });
        }

        setupRequest(): angular.IRequestConfig {
            return <angular.IRequestConfig>{
                method: "GET",
                url: this.runner.config.endpoint_metadata +
                this.runner.config.langISO + "/" +
                this.contextToken()
            }
        }
    }
}
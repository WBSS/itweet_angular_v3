
declare var device:any;

module itweet.model {
    export class Platform {
        static android = "Android";
        static ios = "ios";
    }
    export class BaseConfig {
        base_url: string;
        domain: string;
        default_referer = "http://ch.wbss.itweet";
        // rhb category iades&proposal
        CATEGORY_IDEAS_PROPOSAL: number = 86;

        endpoint_itweet: string;
        endpoint_myitems: string;
        endpoint_categories: string;
        endpoint_media: string;
        endpoint_ping: string;
        endpoint_login: string;
        endpoint_contexts: string;
        endpoint_brand: string;
        endpoint_metadata:string;
        app_help_version = "1.0";

        ping_threshold = 3000;
        web_container_timeout = 30000;
        min_upload_time = 2000;
        image_width = 640;
        image_height = 640;
        audio_max_length = 45;
        assets_storage_folder = "itweetAssets";

        langISO = document.lang;
        countryISO = "CH";
        appId = document.appID;
        platform = (typeof device != 'undefined') ? (device.platform == "iOS" ? Platform.ios : Platform.android) : Platform.android;


        extractDomain(url) {
            let domain;
            //find & remove protocol (http, ftp, etc.) and get domain
            if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
            }
            else {
                domain = url.split('/')[0];
            }

            //find & remove port number
            domain = domain.split(':')[0];

            return domain;
        }

        constructor() {
            this.base_url = document.itweetURL;
            this.domain = this.extractDomain(this.base_url);
            this.setup();
        }

        setup() {
            this.endpoint_itweet = this.base_url + "item/";
            this.endpoint_myitems = this.base_url + "items/";
            this.endpoint_categories = this.base_url + "categories/";
            this.endpoint_login = this.base_url + "login/";
            this.endpoint_media = this.base_url + "media/"
            this.endpoint_ping = this.base_url + "ping/";
            this.endpoint_contexts = this.base_url + "contexts/"
            this.endpoint_brand = this.base_url + "brand/"
            this.endpoint_metadata = this.base_url + "meta/"
        }

        HelpUrl(): string {
            var rs = "https://" + this.domain + "/help/app/" + this.platform + "/" + this.app_help_version + "/" + this.langISO + "/help.html";
            return rs.toLowerCase();
        }

    }
    angular.module("itweet.config", []).service("ItweetConfig", BaseConfig);
}
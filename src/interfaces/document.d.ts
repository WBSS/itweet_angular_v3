/// <reference path='../_all.ts' />

interface Document {
    lang: string;
    itweetURL:string;
	appID: string;
}

interface Navigator {
	camera:any;
}

interface Window {
	resolveLocalFileSystemURL:any;
	requestFileSystem:any;
}

interface Media{
	release:any;
	startRecord:any;
	stopRecord:any;
	play:any;
	getCurrentPosition:any;
	stop:any;
	getDuration:any;
}

interface cordova{
	getAppVersion:any;
}
declare var cordova:any;


declare var Rusha:any;
declare var Media:any;
declare var Camera:any;
declare var LocalFileSystem:any;
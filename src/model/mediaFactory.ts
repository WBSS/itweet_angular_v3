module itweet.model {
    //export enum MediaStates {start, recording, recorded, playback, paused, stopped }

    export class MediaFactory {
        public static $inject = [
            '$rootScope', '$log', '$interval', 'ItweetStorage', '$q', 'ItweetConfig', '$timeout'
        ];
        public mediaService: MediaService;
        public recorderService: RecorderService;

        constructor(public $rootScope: angular.IRootScopeService, public $log: angular.ILogService, public $interval: angular.IIntervalService,
            public ItweetStorage: StorageService, public $q: angular.IQService, public config: itweet.model.BaseConfig, public $timeout: angular.ITimeoutService) {
            this.mediaService = new MediaService(this);
            this.recorderService = new RecorderService(this);
        }
        isIos() {
            return this.config.platform == itweet.model.Platform.ios;
        }

        saveFile(fileSystemURI: string) {
            return new this.$q((resolve, reject) => {
                window.resolveLocalFileSystemURL(fileSystemURI, (entry) => {
                    entry.file((file) => {
                        var reader = new FileReader();
                        reader.onload = (readresult: any) => {
                            var r = new Rusha();
                            var digest = r.digestFromArrayBuffer(readresult.target.result);
                            var ext = StorageService.extFromUrl(fileSystemURI) || "jpg";
                            var newFileName = digest + "." + ext;
                            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fileSys) => {
                                //The folder is created if doesn't exist
                                fileSys.root.getDirectory(this.config.assets_storage_folder,
                                    { create: true, exclusive: false },
                                    (directory) => {

                                        directory.getFile(newFileName, { create: true }, (newFileEntry) => {
                                            newFileEntry.createWriter((fileWriter) => {
                                                fileWriter.onwriteend = () => { resolve(newFileEntry.toURL()); };
                                                fileWriter.onerror = reject;
                                                var blob = new Blob([new Uint8Array(readresult.target.result)], {});
                                                fileWriter.write(blob);
                                            }, reject);
                                        }, reject);
                                        //--> SHA it
                                        /*  entry.copyTo(directory, newFileName, (entry) => {
                                                  resolve(entry.toInternalURL());
                                              },
                                              reject);*/
                                    },
                                    reject);
                            },
                                reject);
                        };
                        reader.onerror = (error: any) => {
                            reject(error.target.error.code);
                        }
                        reader.readAsArrayBuffer(file);
                    },
                        reject);
                }, reject)
            });
        }

    }

    /** Dave: move to own Factory? */
    export class MediaService {
        //service.dataAudio = store.get("audio") || [];

        constructor(protected runner: MediaFactory) {
        }


        dataImages() {
            return this.runner.ItweetStorage.images();
        }

        deleteImage(index: number) {
            return this.runner.ItweetStorage.setImage(index, 0);
        }

        containsImage(): boolean {
            var resp = false;
            this.runner.ItweetStorage.images().forEach((elem) => {
                if (elem) {
                    resp = true;
                }
            });
            return resp;
        }

        saveImage(fileSystemUri: string, index: number) {
            if (fileSystemUri.indexOf("file://") === -1) {
                fileSystemUri = "file://" + fileSystemUri;
            }
            return this.runner.saveFile(fileSystemUri).then((internalUri) => {
                this.runner.$timeout(() => {
                    this.runner.ItweetStorage.setImage(index, internalUri);
                    this.runner.$log.debug("did save file to " + internalUri);
                }, 0);
            }, (error) => { this.runner.$log.error("Failed to write File:" + JSON.stringify(error)) });
        }

    }


    /**
     * https://github.com/gomobile/sample-phonegap-audio/blob/master/www/js/mediaHandlers.js
     */
    export class RecorderService {
        public recorder: Media;
        public player: Media;
        public playerStatus: number = 0;
        public mediaTime: number = 0;
        public mediaTimeMax: number;
        public mediaRecFilename: string;
        public mediaFileFullName: string;
        public MediaStates = { start: 1, recording: 2, recorded: 3, playback: 4, paused: 5, stopped: 6 }
        public mediaState;

        private progressTimer: ng.IPromise<any>;
        private playerTimer: ng.IPromise<any>;

        constructor(protected runner: MediaFactory) {
            this.recorder = undefined;
            /* FIXME: AAC for android */
            this.mediaRecFilename = "temp_recording.aac"; //ios will only support WAV it seems
            
            this.initState();
        }

        initState(): void {
            this.mediaFileFullName = this.runner.ItweetStorage.getAudio();
            this.runner.$log.debug("initState audio file: " + this.mediaFileFullName);
            this.mediaState = this.mediaFileFullName ? this.MediaStates.recorded : this.MediaStates.start;
            this.mediaTimeMax = this.runner.config.audio_max_length;
            this.mediaTime = 0;
            if (this.mediaFileFullName) {
                this.preparePlayer();
                //if(this.player){
                //    this.mediaTimeMax =  this.player.getDuration();
                //}
            }
        }

        deleteAudio() {
            this.runner.ItweetStorage.setAudio(0);
        }

        getAudio() {
            this.runner.ItweetStorage.getAudio();
        }

        saveAudio(fileSystemUri: string) {
            return this.runner.saveFile(fileSystemUri).then((internalUri: string) => {
                this.runner.$log.debug(" Saved to internal storage: " + internalUri);
                this.runner.ItweetStorage.setAudio(internalUri);
                this.mediaFileFullName = internalUri;
            },
                (error) => {
                    this.runner.$log.debug("Failed to write to internal:" + error);
                });
        }

        toggleRecording() {
            if (this.mediaState == this.MediaStates.recording) {
                this.stopRecording();
            } else if (this.mediaState == this.MediaStates.start) {
                this.startRecording();
            } else {
                this.runner.$log.debug(" unsupported state in toggleRecord: " + this.mediaState);
            }
        }

        toggleReplay() {
            if (this.mediaState == this.MediaStates.recorded) {
                this.playback();
            } else if (this.mediaState == this.MediaStates.playback) {
                this.stopPlayback();
            } else {
                this.runner.$log.debug(" unsupported state in toggleReplay: " + this.mediaState);
            }
        }

        deleteRecording() {
            //mit dem knüppel
            this.stopPlayback();
            this.mediaState = this.MediaStates.start;
            this.mediaTimeMax = this.runner.config.audio_max_length;
            this.mediaTime = 0;
            this.deleteAudio();
        }


        /** used to start Recording from UI **/
        startRecording() {


            this.runner.$log.debug("start recording!");

            if (this.mediaState == this.MediaStates.recording || angular.isDefined(this.progressTimer)) {
                this.stopRecording();
                return;
            }

            this.runner.$log.debug("recording: is media start recording: " + this.MediaStates.recording);

            this.mediaState = this.MediaStates.recording;

            // create media object - overwrite existing recording
            this.runner.$log.debug("recording: create media object - overwrite existing recordin");
            if (angular.isDefined(this.recorder)) {
                this.recorder.release();
            }

            this.runner.$log.debug("recording: chrome check");
            // chrome check
            if (typeof LocalFileSystem === 'undefined') {
                return;
            }

            this.runner.$log.debug(" onsuccess fileSystem");

            this.runner.$log.debug("is iOS: " + this.runner.isIos() );

            // create file
            window.requestFileSystem(this.runner.isIos() ? LocalFileSystem.TEMPORARY : LocalFileSystem.PERSISTENT, 0,
                (fileSystem) => {
                    this.runner.$log.debug(" onsuccess fileSystem");
                    
                    //mit der Brechstange
                    fileSystem.root.getFile(
                        this.mediaRecFilename,
                        { create: true, exclusive: false },
                        (fileEntry) => {
                            this.runner.$log.debug("Media: File created " + this.mediaRecFilename + " at " + fileEntry.toURL());
                            this.mediaFileFullName = this.runner.isIos() ? fileEntry.nativeURL : fileEntry.toURL();

                        },
                        (error) => {
                            this.runner.$log.error("Media: Could not create file");
                        });
                },
                (error) => {
                    this.runner.$log.error("Media: Error on requestFileSystem() " + error);
                });

            this.recorder = new Media(this.mediaRecFilename, () => this.onMediaCallSuccess(), (error) => this.onMediaCallError(error));
            this.runner.$log.debug("***test: new Media() for all platform ***");
            this.recordNow();
                            
            // else if (phoneCheck.windowsphone) {
            //     my_recorder = new Media(this.mediaRecFilename, onMediaCallSuccess, onMediaCallError);
            //     this.runner.$log.debug("***test: new Media() for Windows Phone ***");

            //     recordNow();
            // }
            // else if (phoneCheck.ios) {
            // //first create the file
            //     checkFileOnly = false;
            //     window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccessFileSystem, function() {
            //     this.runner.$log.debug("***test: failed in creating media file in requestFileSystem");
            //     });

            //     this.runner.$log.debug("***test: new Media() for ios***");
            // }
        }


        recordNow() {
            this.runner.$log.debug("recording Now()");
            if (angular.isDefined(this.recorder)) {
                this.recorder.startRecord();
                this.runner.$log.debug("***test:  recording started: in startRecording()***");
            }
            else
                this.runner.$log.debug("***test:  recorder==null: in startRecording()***");

            // reset the recTime every time when recording
            this.mediaTime = 0;

            this.progressTimer = this.runner.$interval(
                () => {
                    this.mediaTime = this.mediaTime + 1;
                    if (this.mediaTime >= 45) {
                        this.stopRecording();
                    }
                    this.runner.$log.debug("***test: interval-func()***");
                }, 1000
                );
        }

        stopRecording() {
            this.runner.$log.debug("stop Recording()");
            this.mediaState = this.MediaStates.recorded;

            if (this.recorder) {
                this.recorder.stopRecord(); // the file should be moved to "/sdcard/"+this.mediaRecFilename
                this.saveAudio(this.mediaFileFullName);
                this.mediaTimeMax = this.mediaTime;
            }

            this.clearProgressTimmer();

            this.runner.$log.debug("***test: recording stopped***");
        }


        preparePlayer() {

            this.runner.$log.debug("  Play Recording has to look on sdcard");
            // the existing medail should be on /sdcard/ for android.
            if (true) { //phoneCheck.android) {
                this.player = new Media(
                    //"/sdcard/" + this.mediaRecFilename,
                    this.mediaFileFullName,
                    () => this.onMediaCallSuccess(),
                    (error) => this.onMediaCallError(error),
                    (status) => { this.playerStatus = status; }
                    );

                this.player.play();
                this.player.stop();
                this.playerTimer = this.runner.$interval(
                    () => {
                        var duration = this.player.getDuration();
                        this.runner.$log.debug("Media time read from file: " + duration);
                        if (duration >= 0) {
                            this.mediaTimeMax = duration;
                            this.clearTimer(this.playerTimer);
                        }
                    },
                    100, 300);


                this.runner.$log.debug("***test:  Open file:" + this.mediaFileFullName);
            }
            // } else if (phoneCheck.windowsphone) // windows phone
            //     this.player = new Media(this.mediaRecFilename, onMediaCallSuccess, onMediaCallError);
            // else if (phoneCheck.ios) {
            //     this.player = new Media(mediaFileFullName, onMediaCallSuccess, onMediaCallError);
            // }
            /*} else {
                this.runner.$log.debug("  Play Recording: Player Still exists");
            }*/
        }

        playback() {
            if (!angular.isDefined(this.player)) { // play existing media recorded from previous session
                this.preparePlayer();
            }
            // Play audio
            if (this.player) {
                this.player.play();
                this.mediaState = this.MediaStates.playback;
                this.mediaTime = 0;

                // Update media position every second
                this.clearProgressTimmer();
                this.progressTimer = this.runner.$interval(
                    () => {
                        this.mediaTime += 1;
                        if (this.playerStatus != 2 && this.playerStatus != 1) { //not starting and not running
                            this.clearProgressTimmer();
                            this.mediaTime = 0;
                            this.mediaState = this.MediaStates.recorded;
                        }
                        // wer braucht das schon
                        // this.player.getCurrentPosition(
                        //         if (position < 0){
                        
                    },
                    1000);

            }
        }

        stopPlayback() {
            if (this.player) {

                this.clearProgressTimmer();
                if (this.playerStatus != 4) {
                    this.runner.$log.debug(" *** Stoping player");
                    this.player.stop();
                }
                this.runner.$log.debug(" *** Clearing player");
                // should not be necessary, but it is needed in order to play again.
                this.player.release();
                this.player = undefined;

                this.mediaTime = 0;
                this.mediaState = this.MediaStates.recorded;
            }
        }

        // Media() success callback
        onMediaCallSuccess() {
            this.runner.$log.debug("***test: new Media() succeeded ***");
            if (this.player) {
                var duration = this.player.getDuration();
                this.runner.$log.debug("Media time read from file: " + duration);
                this.mediaTimeMax = duration;
            }
        }

        // Media() error callback
        onMediaCallError(error) {
            this.runner.$log.debug("***test: new Media() failed ***");
            this.runner.$log.debug(error);
        }

        clearTimer(timer: ng.IPromise<any>) {
            if (angular.isDefined(timer)) {
                this.runner.$interval.cancel(timer);
            }
        }

        clearProgressTimmer() {
            this.clearTimer(this.progressTimer);
            this.progressTimer = undefined;
        }
    }
    angular.module("itweet.media", []).service("itweetMedia", MediaFactory)
        .config(['$compileProvider', function($compileProvider) {
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|data|cdvfile):/);
        }]);
}
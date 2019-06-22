var videoDownload = (function(Vue, extendAM) {
    var videoDownload = {};
    var VueToast = window.vueToasts ? window.vueToasts.default || window.vueToasts : window.vueToasts;
    videoDownload.createVm = function(res) {
        this.vm = new Vue({
            el: '#videoWrapper',
            data: {
                headPath: 'http://127.0.0.1:5000/',
                videoList: [],
                videoListCopy: [],
                showModal: false,
                modalType: 'addTask',
                // tablist: ['status', 'details', 'file24s', 'peers', 'options'],
                tablist: ['Status', 'Details', 'Log'],
                showTab: 'Status',
                stateCounter: {
                    all: 0,
                    downloading: 0,
                    finished: 0,
                    paused: 0,
                    invalid: 0
                },
                modalData: {
                    add: {
                        url: '',
                        ydl_opts: {}
                    },
                    remove: {
                        removeFile: false
                    },
                    preference: {
                        youtube_dl: {
                            fomart: '',
                            proxy: ''
                        },
                        general: {
                            download_dir: '',
                            db_path: '',
                            log_size: ''
                        }
                    },
                },
                currentSelected: null,
                taskDetails: {},
                taskInfoUrl: null,
                status: 'all',
                maxToasts: 4,
                position: 'bottom right',
                theme: 'error',
                timeLife: 3500,
                closeBtn: false,
                isAutoResumeOn: false
            },
            components: {
                'modal': {
                    template: '#modal-template'
                },
                VueToast
            },
            watch: {
                stateCounter: {
                    handler(val, oldVal) {
                        val.all = val.downloading +
                            val.finished +
                            val.paused +
                            val.invalid;

                    },
                    deep: true
                },
                //modalData.preference.youtube_dl.format
                'modalData.preference.youtube_dl.format': {
                    handler(val, oldVal) {
                        this.modalData.add.ydl_opts.format = val;
                    },
                    deep: true
                }
            },
            mounted: function() {
                this.resetOptions();
                this.headPath = window.location.protocol + '//' + window.location.host + '/';
                setInterval(this.timeOut, 5000);
                setInterval(this.resumeFailedTask, 30000);
            },
            methods: {
                autoResumeTask() {
                    this.isAutoResumeOn = !this.isAutoResumeOn;
                },
                timeOut() {
                    this.getTaskList();
                    this.getTaskInfoById();
                },
                resumeFailedTask() {
                    if (this.isAutoResumeOn && this.stateCounter.invalid > 0 && this.stateCounter.downloading <= 2) {
                        this.filterTasks('invalid');
                        if (this.videoList.length > 0 && this.status === 'invalid') {
                            let resumeVideoId = this.videoList[0].tid;
                            this.resumeTask(resumeVideoId);
                        }
                    }

                },
                getTaskList() {
                    let _self = this;
                    var url = this.headPath + 'task/list';
                    url = url + '?state=' + _self.status;
                    Vue.http.get(url).then(function(res) {
                        var resData = JSON.parse(res.body);
                        _self.videoList = resData.detail;
                        _self.stateCounter = resData.state_counter;
                    }, function(err) {
                        _self.showAlertToast('Network connection lost', 'error');
                    });
                },
                showAddTaskModal: function() {
                    this.preference();
                    this.modalData.add.url = '';
                    this.showModal = true;
                    this.modalType = 'addTask';
                    console.log(this.modalData);
                    this.$nextTick(function() {
                        this.$refs.url.focus();
                    });
                },
                execFunction: function() {
                    switch (this.modalType) {
                        case 'addTask':
                            this.addTask();
                            break;
                        case 'removeTask':
                            this.removeTask();
                            break;
                        case 'updatePreference':
                            this.updatePreference();
                            break;
                    }
                },
                showRemoveTaskModal: function() {
                    this.modalData.remove.removeFile = false;
                    this.showModal = true;
                    this.modalType = 'removeTask';
                },
                addTask: function() {
                    var _self = this;
                    var url = _self.headPath + 'task';
                    console.dir(_self.modalData.add.ydl_opts);
                    for (var key in _self.modalData.add.ydl_opts) {
                        if (_self.modalData.add.ydl_opts[key].trim() == '')
                            delete _self.modalData.add.ydl_opts[key];
                    }
                    Vue.http.post(url, _self.modalData.add, {
                        emulateJSON: false
                    }).then(function(res) {
                        _self.showModal = false;
                        _self.getTaskList();
                    }, function(err) {
                        _self.showAlertToast(err, 'error');
                    });
                },
                updatePreference: function() {
                    var _self = this;
                    var url = _self.headPath + 'config';
                    Vue.http.post(url, _self.modalData.preference, {
                        emulateJSON: false
                    }).then(function(res) {
                        console.log("Successfully");
                    }, function(err) {
                        _self.showAlertToast(err, 'error');
                    });
                },
                removeTask: function() {
                    var _self = this;
                    var url = _self.headPath + 'task/tid/' + (_self.videoList[_self.currentSelected] && _self.videoList[_self.currentSelected].tid);
                    if (_self.modalData.remove.removeFile) {
                        url += '?del_file=true';
                    }
                    Vue.http.delete(url).then(function(res) {
                        _self.showAlertToast('Task Delete', 'info');
                        _self.videoList.splice(_self.currentSelected, _self.currentSelected + 1);
                        _self.showModal = false;
                        _self.getTaskList();
                    }, function(err) {
                        _self.showAlertToast(err, 'error');
                    });
                },
                removeData: function() {
                    this.modalData.remove.removeFile = true;
                    this.removeTask();
                },
                pauseTask: function() {
                    var _self = this;
                    var url = _self.headPath + 'task/tid/' + (_self.videoList[_self.currentSelected] && _self.videoList[_self.currentSelected].tid) + '?act=pause';
                    Vue.http.put(url).then(function(res) {
                        _self.showAlertToast('Task Pause', 'info');
                        _self.getTaskList();
                    }, function(err) {
                        _self.showAlertToast(err, 'error');
                    });
                },
                resumeTask: function(videoId) {
                    var _self = this;
                    videoId = videoId && typeof videoId === 'string' ? videoId : (_self.videoList[_self.currentSelected] && _self.videoList[_self.currentSelected].tid);
                    if (videoId) {
                        var url = _self.headPath + 'task/tid/' + videoId + '?act=resume';
                        Vue.http.put(url).then(function(res) {
                            _self.showAlertToast('Task Resume', 'info');
                            _self.getTaskList();
                        }, function(err) {
                            _self.showAlertToast(err, 'error');
                        });
                    } else {
                        throw Error(`Resume task failed, the video ID is undefined. Video id: ${videoId}.`);
                    }
                },
                about: function() {
                    this.showModal = true;
                    this.modalType = 'about';
                },
                preference: function() {
                    var _self = this;
                    var url = _self.headPath + 'config';

                    this.showModal = true;
                    this.modalType = 'updatePreference';
                    Vue.http.get(url).then(function(res) {
                        var responseJSON = JSON.parse(res.data);
                        if (responseJSON.status === 'error') {
                            return false;
                        } else {
                            config = responseJSON['config'];
                            Vue.set(_self.modalData.preference.general, 'download_dir', config.general.download_dir);
                            Vue.set(_self.modalData.preference.general, 'db_path', config.general.db_path);
                            Vue.set(_self.modalData.preference.general, 'log_size', config.general.log_size);
                            Vue.set(_self.modalData.preference.youtube_dl, 'format', config.youtube_dl.format);
                            Vue.set(_self.modalData.preference.youtube_dl, 'proxy', config.youtube_dl.proxy);

                            // _self.modalData.preference.general.download_dir = config.general.download_dir;
                            // _self.modalData.preference.general.db_path = config.general.db_path;
                            // _self.modalData.preference.general.log_size = config.general.log_size;
                            // _self.modalData.preference.youtube_dl.format = config.youtube_dl.format;
                            // _self.modalData.preference.youtube_dl.proxy = config.youtube_dl.proxy;
                        }
                    });
                },
                selected: function(index) {
                    var _self = this;
                    this.currentSelected = index;
                    _self.taskInfoUrl = _self.headPath + 'task/tid/' + (_self.videoList[_self.currentSelected] && _self.videoList[_self.currentSelected].tid) + '/status';
                    _self.getTaskInfoById();
                },
                getTaskInfoById: function() {
                    var _self = this;
                    if (!_self.taskInfoUrl) return false;
                    Vue.http.get(_self.taskInfoUrl).then(function(res) {
                        var responseJSON = JSON.parse(res.data);
                        if (responseJSON.status === 'error') {
                            return false;
                        }
                        _self.taskDetails = responseJSON.detail;
                    }, function(err) {
                        _self.showAlertToast('Network connection lost', 'error');
                    });
                },
                filterTasks: function(filterStatus) {
                    var _self = this;
                    _self.status = filterStatus;
                    _self.getTaskList();
                },
                speedConv: function(state, value) {
                    if (state == 'paused' || state == 'invalid')
                        return '0 B/s';
                    else if (state == 'finished')
                        return 'Done';
                    return this.bitsToHuman(value) + '/s';
                },
                etaConv: function(state, value) {
                    if (state == 'paused' || state == 'invalid' || state == 'finished')
                        return 'NaN';
                    return this.secondsToHuman(value);
                },
                progressConv: function(state, value) {
                    if (state == 'finished')
                        return 'Done';
                    return value;
                },
                bitsToHuman: function(value) {
                    var tmp = value,
                        count = 0;
                    var metricList = [' B', ' KB', ' M', ' G', ' T', ' P', ' E', ' Z'];

                    while (tmp / 1024 > 1) {
                        tmp = tmp / 1024;
                        count++;
                    }
                    return tmp.toFixed(2) + metricList[count];
                },
                secondsToHuman: function(value) {
                    var tmp = '';
                    tmp = value % 60 + 's';
                    value = value / 60;
                    if (value > 1) {
                        tmp = parseInt(value % 60) + 'm' + tmp;
                        value = value / 60;
                        if (value > 1) {
                            tmp = parseInt(value % 60) + 'h' + tmp;
                            value = value / 24;
                            if (value > 1) {
                                tmp += parseInt(value % 24) + 'd' + tmp;
                            }
                        }
                    }
                    return tmp;
                },
                stateIcon: function(state) {
                    if (state == 'downloading')
                        return {
                            'icon': 'fa-arrow-circle-o-down',
                            'color': 'blue'
                        };
                    else if (state == 'paused')
                        return {
                            'icon': 'fa-pause-circle-o',
                            'color': 'green'
                        };
                    else if (state == 'finished')
                        return {
                            'icon': 'fa-check-circle-o',
                            'color': 'grey'
                        };
                    else
                        return {
                            'icon': 'fa-times-circle-o',
                            'color': 'red'
                        };
                },
                tsToLocal: function(timeStamp) {
                    if (typeof timeStamp == 'undefined' || Number(timeStamp) < 10)
                        return '';

                    var options = {
                        year: "numeric",
                        month: "short",
                        hour12: false,
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    };
                    var d = new Date(0);
                    d.setUTCSeconds(timeStamp);
                    return d.toLocaleString('en-US', options);
                },
                resetOptions() {
                    this.$refs.toast.setOptions({
                        delayOfJumps: this.delayOfJumps,
                        maxToasts: this.maxToasts,
                        position: this.position
                    });
                },
                showAlertToast(msg, theme) {
                    this.$refs.toast.showToast(msg, {
                        theme: theme,
                        timeLife: this.timeLife,
                        closeBtn: this.closeBtn
                    });
                }
            }
        });
    };


    videoDownload.init = function() {
        this.createVm();
        this.vm.getTaskList();
    }

    return videoDownload;
})(Vue, {});


videoDownload.init();
// ==UserScript==
// @name        Amateur Voat Enhancements beta
// @author      Horza
// @date        2016-03-01
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @exclude     *://*.voat.co/api*
// @exclude     *://voat.co/api*
// @version     2.36.13.36
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_openInTab
// @run-at      document-start
// @updateURL   https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/beta/Amateur-Voat-Enhancements_beta_meta.user.js
// @downloadURL https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/beta/Amateur-Voat-Enhancements_beta.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://github.com/domchristie/to-markdown/raw/master/dist/to-markdown.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// ==/UserScript==

/// Init ///
var AVE = {};
AVE.Modules = {};

AVE.Init = {
    stopLoading: false,
    Start: function () {

        var _this = this,
            ModLoad = {
                Start: [],
                HeadReady: [],
                BannerReady: [],
                ContainerReady: [],
                DocReady: [],
                WinLoaded: []
            };

        AVE.Utils.EarlySet();

        print("AVE: Devmode > " + AVE.Utils.DevMode, true);
        print("AVE: POST > "+JSON.stringify(AVE.Utils.POSTinfo), true);

        print("AVE: Current page > " + AVE.Utils.currentPageType);

        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) === -1) {

            $.each(AVE.Modules, function () {
                if (!this.RunAt || this.RunAt === "ready") {
                    ModLoad.DocReady.push(this.ID);
                } else if (this.RunAt === "start") {
                    ModLoad.Start.push(this.ID);
                } else if (this.RunAt === "head") {
                    ModLoad.HeadReady.push(this.ID);
                } else if (this.RunAt === "banner") {
                    ModLoad.BannerReady.push(this.ID);
                } else if (this.RunAt === "container") {
                    ModLoad.ContainerReady.push(this.ID);
                } else { //(this.RunAt === "load") {
                    ModLoad.WinLoaded.push(this.ID);
                }
            });

            //Start as soon as possible
            print("Init: Starting as soon as possible", true);
            $.each(ModLoad.Start, function () {
                _this.LoadModules(this);
            });

            //On head ready
            $("head").ready(function () {
                //By /u/Jammi: voat.co/v/AVE/comments/421861
                if (document.title === 'Checking your bits' || document.title === 'Play Pen Improvements') { // Add CDN error page
                    print("AVE: this is an error page, no more modules will be started");
                    if (~document.cookie.indexOf('theme=dark')) {
                        $.each(["body background #333", "body color #dfdfdf", "#header background #333", "#header-container background #333", "#header-container borderBottomColor #555", "#header-container borderTopColor #555", ".panel-info background #222", ".panel-heading background #222", ".panel-heading borderColor #444", ".panel-title background #222", ".panel-title color #dfdfdf", ".panel-body background #222", ".panel-body borderColor #444"],
                            function () { var _this = this.split(" "); $(_this[0]).css(_this[1], _this[2]); });
                    }
                    this.stopLoading = true;
                    return;
                }//Error pages that are empty

                AVE.Utils.LateSet();
                print("Init: Starting on Head ready", true);
                $.each(ModLoad.HeadReady, function () {
                    _this.LoadModules(this);
                });
            });

            //On Banner ready
            $("div#header").ready(function () {
                print("Init: Starting on Banner ready", true);
                $.each(ModLoad.BannerReady, function () {
                    _this.LoadModules(this);
                });
            });

            //On container ready
            $("div#container").ready(function () {
                print("Init: Starting on Container ready", true);
                $.each(ModLoad.ContainerReady, function () {
                    _this.LoadModules(this);
                });
            });

            //On doc ready
            $(document).ready(function () {
                print("Init: Starting on Doc ready", true);
                print("AVE: Current style > " + AVE.Utils.CSSstyle, true);
                
                $.each(ModLoad.DocReady, function () {
                    _this.LoadModules(this);
                });
            });
            //On window loaded
            var loadModuleOnLoadComplete = function () {
                print("Init: Starting on Window loaded (last)", true);
                if (this.stopLoading){return;}
                $.each(ModLoad.WinLoaded, function () {
                    _this.LoadModules(this);
                });
            };

            //$(window).load's callback isn't triggered if it is processed as the page's readystate already is "complete"
            if (document.readyState === "complete") { loadModuleOnLoadComplete(); }
            else { $(window).load(function () { loadModuleOnLoadComplete(); }); }
        } else {
            print("AVE: Current page > no idea, sorry. Maybe tell /u/HorzaDeservedBetter about it?");
        }
    },

    LoadModules: function (ID) {
        if (this.stopLoading){return;}
        var module = AVE.Modules[ID];
        print("  AVE: Loading: " + module.Name + " (RunAt: " + (module.RunAt || "ready" ) + ")", true);

        if (AVE.Utils.DevMode){
            var time = Date.now();
            AVE.Modules[ID].Load();
            print("    Loaded > " + ID + " (" + (Date.now() - time) + "ms)");
        } else {
            try { AVE.Modules[ID].Load(); }
            catch (e) {
                print("AVE: Error loading " + ID);
                //if (true) { console.error(e); }
                var Opt = JSON.parse(AVE.Storage.GetValue(AVE.Storage.Prefix + ID, "{}"));
                Opt.Enabled = false;
                AVE.Storage.SetValue(AVE.Storage.Prefix + ID, JSON.stringify(Opt));
                alert("AVE: Error loading module \"" + ID +"\"\nIt has been disabled, reload for the change to be effective");
            }
        }
    },

    UpdateModules: function () {
        $.each(AVE.Modules, function () {
            var time = Date.now();
            
            if (typeof this.Update === "function") {
                this.Update();

                print("updated > " + this.Name + " (" + (Date.now() - time) + "ms)", true);
            }
        });
    }
};
/// END Init ///

/// Utils ///
AVE.Utils = {
    regExpSet: /([^:]*):([0-9]*)/i,
    regExpTag: /([^:]*):([^:]*)/i,
    subverseName: "",
    isPageSubverse: "",
    CSSstyle: "",
    currentPageType: "",
    DevMode: false,
    POSTinfo: {},

    _CurrUsername: "",
    CurrUsername: function () {
        // "" means that it is not set
        if (this._CurrUsername === "") {
            // is the header-account block already loaded?
            if ($("div#header-account").length > 0){
                var profil = $("span.user > a[title='Profile']");
                // is the user logged-in
                if (profil.length > 0) {
                    this._CurrUsername = profil.text();
                } else { // If not null is returned
                    this._CurrUsername = null;
                }
                // else "" is returned until the banner is DOM ready
            }
        }
        return this._CurrUsername;
    },
    
    LateSet: function () {
        this.CSSstyle = this.CSS_Style();
    },

    EarlySet: function () {
        this.DevMode = this.GetDevMode();
        this.subverseName = this.GetSubverseName();
        this.isPageSubverse = this.GetPageSubverse();
        this.currentPageType = this.Page();
        this.ParsePOSTinfo();
    },

    CSS_Style: function () {
        return $('link[rel="stylesheet"][href^="/Content/Dark"]').length > 0 ? "dark" : "light";
        //return $("body").attr("class"); //Doesn't work because the class is added after DOMready and this is evaluated before DOMload
    },

    MetaData: null,

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(new)?(\?[^#]+)*(#[^\\\/]*)?$/i,
            //front_guest: /voat.co\/?(new)?(\?frontpage=guest)?(\?page=[0-9]*)?(#[^\\\/]*)?$/i,
            submissions: /voat.co\/user\/[\w\d-]*\/submissions/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            comments: /voat.co\/user\/[\w\d-]*\/comments/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            sub_rel: /voat.co\/v\/[a-z]*\/[a-z]+/i,
            register: /voat.co\/account\/register/i,
            userShort: /voat.co\/u\/[\w\d-]*\/?$/i,
            modlog: /voat.co\/v\/[a-z]*\/modlog/i,
            about: /voat.co\/v\/[a-z]*\/about/i,
            sub_new: /voat.co\/v\/[a-z]*\/new/i,
            sub_top: /voat.co\/v\/[a-z]*\/top/i,
            user: /voat.co\/user\/[\w\d-]*\/?$/i,
            manage: /voat.co\/account\/manage/i,
            saved: /voat.co\/user\/.*\/saved/i,
            login: /voat.co\/account\/Login/i,
            account_rel: /voat.co\/account/i,
            subverses: /voat.co\/subverses/i,
            messaging: /voat.co\/messaging/i,
            search: /voat.co\/search\?q=/i,
            domain: /voat.co\/domains\//i,
            submit: /voat.co\/submit/i,
            set: /voat.co\/set\/\d*/i,
            mySet: /voat.co\/mysets/i,
            sets: /voat.co\/sets/i,
            api: /voat.co\/api/i
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
        //if (RegExpTypes.front_guest.test(url)) { return "frontpage"; }
        if (RegExpTypes.api.test(url)) { return "api"; }
        if (RegExpTypes.thread.test(url)) { return "thread"; }
        if (RegExpTypes.sub_new.test(url)) { return "subverse"; }
        if (RegExpTypes.sub_top.test(url)) { return "subverse"; }
        if (RegExpTypes.submit.test(url)) { return "submit"; }
        if (RegExpTypes.modlog.test(url)) { return "modlog"; }
        if (RegExpTypes.about.test(url)) { return "about"; }
        if (RegExpTypes.sub_rel.test(url)) { return "sub_related"; }
        if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        if (RegExpTypes.domain.test(url)) { return "domain"; }
        if (RegExpTypes.set.test(url)) { return "set"; }
        if (RegExpTypes.search.test(url)) { return "search"; }
        if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        if (RegExpTypes.sets.test(url)) { return "sets"; }
        if (RegExpTypes.user.test(url)) { return "user"; }
        if (RegExpTypes.userShort.test(url)) { return "user"; }
        if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        if (RegExpTypes.manage.test(url)) { return "user-manage"; }
        if (RegExpTypes.saved.test(url)) { return "saved"; }
        if (RegExpTypes.register.test(url)) { return "account-register"; }
        if (RegExpTypes.login.test(url)) { return "account-login"; }
        if (RegExpTypes.account_rel.test(url)) { return "account-related"; }

        return "none";
    },

    ParsePOSTinfo: function () {
        var url, l, _this;
        _this = this;
        url = window.location.href.split("?");

        if (url.length == 1){return;}

        url = url[1].split("#")[0];
        url = url.split("&");

        $.each(url, function (idx, str) {
            l = str.split("=");
            _this.POSTinfo[l[0]] = l[1];
        });
    },

    GetDevMode: function () {
        return AVE.Storage.GetValue(AVE.Storage.Prefix+"DevMode", "0") === "1" ? true : false;
    },

    GetPageSubverse: function () {
        if (this.subverseName)
        { return true; }

        return false;
    },

    GetSubverseName: function () {
        var m = new RegExp(/voat\.co\/v\/([\w\d]*)/).exec(window.location.href);

        if (!m) { return null; }
        return m[1].toLowerCase();
    },

    ParseQuotedText: function (text) {
        var converter = { filter: 'span', replacement: function () { return ''; } };
        return toMarkdown(text, { converters: [converter] }).replace(/^(.)/img, "> $1");
    },

    GetBestFontColour: function (r,g,b) {
        //from http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
        var o = Math.round(((parseInt(r, 10) * 299) + (parseInt(g, 10) * 587) + (parseInt(b, 10) * 114)) / 1000);
        return (o > 125) ? 'black' : 'white';
    },

    GetRGBvalues: function (colour) {
        var r, g, b;
        //from www.javascripter.net/faq/hextorgb.htm
        r = parseInt(colour.substring(1, 3), 16);
        g = parseInt(colour.substring(3, 5), 16);
        b = parseInt(colour.substring(5, 7), 16);

        return [r, g, b];
    },

    AddStyle: function (StyleStr) {
        if ($("style[for='AVE']").length === 0) { $("head").append('<style for="AVE"></style>'); }
        $("style[for='AVE']").append("\n" + StyleStr);
    }
};

(function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    $.fn.OnAttrChange = function (callback) {
        if (MutationObserver) {
            var options = {
                attributes: true,
                attributeOldValue: true,
            };

            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    if (e.attributeName) {
                        callback.call(e.target, e);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    };
}($));
(function ($) {
    //Thanks to Mr Br @ https://stackoverflow.com/questions/1950038/jquery-fire-event-if-css-class-changed#answer-24284069
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    $.fn.OnNodeChange = function (callback) {
        if (MutationObserver) {
            var options = {
                subtree: true,
                childList: true,
                characterData: true,//needed for it to work in Chrome
            };

            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    if (e.addedNodes) {
                        callback.call(e.target);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    };
}($));
function print(str, dev) {if(dev && !AVE.Utils.DevMode){return;} console.log(str); }
//Thanks to Paolo Bergantino https://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector#answer-965962
jQuery.expr[':'].parents = function (a, i, m) { return jQuery(a).parents(m[3]).length < 1; };
//Thanks to Narnian https://stackoverflow.com/questions/6673777/select-link-by-text-exact-match#answer-8447189
jQuery.expr[':'].textEquals = function(a, i, m) { return jQuery(a).text().match("^" + m[3] + "$"); };
    //Thanks to digiguru https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another#answer-7180095
AVE.Utils.move = function(arr, from, to) { arr.splice(to, 0, arr.splice(from, 1)[0]);};
//Might be overkill, but I need to be able to disconnect the listener before updating.
var OnNodeChange = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var cls = function (t, c) {
        this.options = {
            subtree: true,
            childList: true,
        };
        this.observed = [];
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.addedNodes) {
                    c.call(e.target, e);
                }
            });
        });

        this.observe = function () {
            var _this = this;
            return this.targets.each(function () {
                if ($.inArray(this, _this.observed) === -1) {
                    _this.observer.observe(this, _this.options);
                    _this.observed.push(this);
                }
            });
        };

        this.disconnect = function () {
            this.observer.disconnect();
        };
    };

    return cls;
}());
var OnAttrChange = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var cls = function (t, c) {
        this.options = {
            attributes: true,
            attributeOldValue: true,
        };
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.attributeName) {
                    c.call(e.target, e);
                }
            });
        });

        this.observe = function () {
            var _this = this;
            return this.targets.each(function () {
                _this.observer.observe(this, _this.options);
            });
        };

        this.disconnect = function () {
            this.observer.disconnect();
        };
    };

    return cls;
}());
/// END Utils ///

/// Storage ///
AVE.Storage = {
    Prefix: "AVE_",

    Data: null,

    GetValue: function (key, def) {
        if (!this.Data) { return null; }
        //AVE.Utils.SendMessage({ request: "Storage", type: "GetValue", key: key});

        var val = this.Data[key];
        if (!val) {
            if (!def) {
                return null;
            } return def;
        } return val;
    },

    SetValue: function (key, val) {
        if (!this.Data) { return null; }
        AVE.Utils.SendMessage({ request: "Storage", type: "SetValue", key: key, value: val });

        this.Data[key] = val;
    },

    DeleteValue: function (key) {
        if (!this.Data) { return null; }
        AVE.Utils.SendMessage({ request: "Storage", type: "DeleteValue", key: key });

        delete this.Data[key];
    },

    Update: function () {
        AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
    }
};
/// END Storage ///

/// Preference manager:  Manage AVE\'s stored data. ///
AVE.Modules['PreferenceManager'] = {
    ID: 'PreferenceManager',
    Name: 'Preference manager',
    Desc: 'Manage AVE\'s stored data.',
    Category: 'Manager',

    Index: 0,

    Store: {},

    Options: {
        LossChangeNotification: {
            Type: 'boolean',
            Desc: "Show a warning if you are trying to exit the Preference Manager after having modified one or more preferences.",
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = this;

        delete POST[_this.ID]["AVE_DevMode"];
        delete POST[_this.ID]["Enabled"];
        delete POST[_this.ID]["AVE_ExportToJSON"];
        delete POST[_this.ID]["AVE_ImportFromJSON"];
        delete POST[_this.ID]["AVE_ResetAllData"];
        delete POST[_this.ID]["AVE_file_ImportFromJSON"];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key" +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();
        this.Start();
    },

    Start: function () {
        var _this = this;
        this.MngWinStyle = '\
            div.overlay{\
                z-index: 1000 !important;\
                position: fixed;\
                top: 0px;\
                left: 0px;\
                right: 0px;\
                bottom: 0px;\
                background-color: rgba(0, 0, 0, 0.65);\
            }\
            div.MngrWin{\
                z-index: 1000 !important;\
                background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F4F4F4") + ';\
                color: #' + (AVE.Utils.CSSstyle === "dark" ? "5452A8" : "404040") + ';\
                margin: 10px;\
                right:0;\
                left: 0px;\
                bottom: 0px;\
                top: 0px;\
                position:fixed;\
                font-size: 14px;\
                border-radius: 3px;\
            }\
            div.MngWinHeader{\
                margin: 0px 0px;\
                padding: 4px 2px;\
                font-size: 16px;\
                background: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
                border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F4F4F4") + ';\
                border-bottom:0px;\
                border-bottom-right-radius: 0px;\
                border-bottom-left-radius: 0px;\
            }\
            span.MngrWinTitle{\
                margin-left:5px;\
                font-weight:bold;\
            }\
            div.TopButtons{\
                float:right;\
            }\
            a.MngrWinButton, a.MngrWinButton:hover, a.MngrWinButton:after, a.MngrWinButton:before{\
                text-decoration:none;\
                color:inherit;\
            }\
            div#CloseWinMngr{\
                margin-left:20px;\
                margin-right:-4px;\
                margin-top:-6px;\
                float:right;\
                cursor:pointer;\
                font-weight:bold;\
                background-color:#b0dbf4;\
                border:2px solid black;\
                padding-left:5px;\
                padding-right:5px;\
            }\
            section#ModuleSectionToggles {\
                position:absolute;\
                left:5px;\
                float:left;\
                margin-top:25px;\
                margin-right:0px;\
                width:122px;\
                height:552px;\
            }\
            \
            div.ModuleToggle{\
                margin: 5px 0px 0px 5px;\
                border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F4F4F4") + ';\
                padding-left:5px;\
                text-align:left;\
                color: #' + (AVE.Utils.CSSstyle === "dark" ? "DFDFDF" : "404040") + ';\
                background: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
                border-radius: 5px;\
            }\
            div.ModuleToggle:hover {\
                background: #b0dbf4;\
                background: linear-gradient(to right,  #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F4F4F4") + ' 0%, #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ' 100%);\
            }\
            div.ModuleToggle:active {\
                background: #91c3e0;\
                background: linear-gradient(to right,  #' + (AVE.Utils.CSSstyle === "dark" ? "202020" : "ededed") + ' 0%, #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ' 100%);\
            }\
            \
            section.ModulePref{\
                font-size:12px;\
                position:absolute;\
                right:5px;\
                float:left;\
                margin-top:10px;\
                margin-left: 10px;\
                padding-left: 10px;\
                padding-right: 10px;\
                padding-top: 10px;\
                background: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
                color: #' + (AVE.Utils.CSSstyle === "dark" ? "AAA" : "404040") + ';\
                border-radius: 5px;\
                overflow-y:auto;\
                left: 115px;\
                bottom: 10px;\
                top: 40px;\
                right: 10px;\
            }\
            div.ModuleBlock{\
                margin-bottom: 10px;\
            }\
            div.ModuleTitleBlock{\
                font-size:12px;\
                border-bottom: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "222" : "DDD") + ';\
            }\
            label.ModuleTitle{\
                font-size:14px;\
            }\
            .dark label.ModuleTitle{\
                color: #967aff;\
            }\
            .light label.ModuleTitle{\
                color: #4aabe7;\
            }\
            span.ModuleState{\
                font-size:10px;\
                font-weight: bold;\
            }\
            span.ModuleState.Enabled:after{\
                color: #68c16b;\
                content:"Enabled";\
            }\
            span.ModuleState.Disabled:after{\
                color: #dd5454;\
                content:"Disabled";\
            }\
            span.ModuleDesc{\
                font-size:11px;\
            }\
            div.AVE_ModuleCustomInput{\
                border-left:2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD") + ';\
                margin-top: 5px;\
                margin-left: 10px;\
                padding-left: 4px;\
            }';

        this.MngWinHTML = '\
            <div class="overlay">\
                <div class="MngrWin" id="MngWin">\
                    <div class="MngWinHeader">\
                        <span class="MngrWinTitle">\
                            <a target="_blank" href="/v/AVE">AVE</a></span>\
                        <span style="cursor:pointer;font-size:10px;" id="AVE_Version">Version @{version}</span>\
                        <span style="font-size: 10px;margin-left: 25px;"><a target="_blank" href="/account/manage#dashboard">Dashboard</a></span>\
                        <div class="TopButtons">\
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-unsub" id="SaveData">Save Changes</a>\
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default" id="CloseWinMngr">x</a>\
                        </div>\
                    </div>\
                    <section class="ModulePref" Module="null">\
                    </section>\
                    <section id="ModuleSectionToggles">\
                    </section>\
                </div>\
            </div>';

        $.each(AVE.Modules, function () {
            if ($.inArray(this.ID, _this.Modules) === -1) {
                _this.Modules.push(this.ID);
            }
        });
        this.Modules.sort();

        this.AppendToPage();
        this.Listeners();
    },

    MngWinStyle: '',
    MngWinHTML: '',
    ModuleHTML: '',

    Categories: ["General", "Subverse", "Thread", "Posts", "Domains", "Account", "Style", "Misc", "Manager", "ModTools"],//Available Categories to show
    Modules: [],//List of modules
    ModifiedModules: [],//Modules whose options have been modified and should be saved

    AppendToPage: function () {
        AVE.Utils.AddStyle(this.MngWinStyle);
        var LinkHTML;

        if ($("span.user:contains('Manage')").length > 0) {
            LinkHTML = '<span class="user"><a style="font-weight:bold;" id="AVE_PrefMngr" href="javascript:void(0)" id="" title="AVE Preference Manager">AVE</a></span> <span class="separator">|</span> ';
            $(LinkHTML).insertBefore("span.user:contains('Manage')");
        } else { //If the user isn't logged in
            LinkHTML = '<span class="user"> - <a style="font-weight:bold;" href="javascript:void(0)" id="" title="AVE Preference Manager">AVE</a></span>';
            $(LinkHTML).insertAfter("span.user:first");
        }
    },

    Listeners: function () {
        var _this = this;
        $("a[title='AVE Preference Manager']").on("click", function () {
            if ($(".MngrWin").length > 0) {
                $(".MngrWin").show();
            }
            else { _this.BuildManager(); }
            $(".overlay").show();

            $("body").css("overflow", "hidden");
        });

        $(window).on("keyup", function (e) {
            if (e.which === 27 && $(".MngrWin#MngWin").is(":visible")) {
                var val = $(e.target).attr("value");
                if (!($(e.target).is(":button") && (val))) {
                    $("#CloseWinMngr").click();
                }
            }
        });
    },

    BuildManager: function () {
        var _this = this;
        var MngWinHTML = _this.MngWinHTML.replace('@{version}', AVE.Utils.MetaData.version);
        $(MngWinHTML).appendTo("body");
        $(".MngrWin").show();

        $.each(_this.Categories, function () {
            //Make it into a function to be used more easily by the reset function
            var cat = this;
            //Create category togglers
            $("section#ModuleSectionToggles").append('<div module="' + cat + '" class="ModuleToggle">' + cat + '</div>');
            //Insert all category sections
            $("section.ModulePref").append('<form cat="' + cat + '"></form>');
            $("form[cat='" + cat + "']").hide();
            //And populate them
            var module;

            $.each(_this.Modules, function () {
                module = AVE.Modules[this];
                
                if (module.Category != cat) { return; }

                _this.AddModule(module, cat);
            });
        });

        $("div.ModuleToggle").on("click", function () {
            $("div.ModuleToggle").each(function () {
                $(this).css("border-top-right-radius", "");
                $(this).css("border-bottom-right-radius", "");
                $(this).css("border-right", "");
                $(this).css("margin-right", "10px");
                $("form[cat*='" + $(this).text() + "']").hide();
            });
            $(this).css("border-top-right-radius", "0px");
            $(this).css("border-bottom-right-radius", "0px");
            $(this).css("border-right", "0px");
            $(this).css("margin-right", "0px");
            $("form[cat*='" + $(this).text() + "']").show();
        });
        $("div.ModuleToggle:first").click();
        //Show changelog when clicking the version number
        $("span#AVE_Version").on("click", function () {
            if (AVE.Modules['VersionNotifier'] && !$("div.VersionBox").is(":visible")) {
                AVE.Modules['VersionNotifier'].Trigger = "changelog";
                AVE.Modules['VersionNotifier'].Start();
                $("p.VersionBoxToggle").click();
            }
        });

        //Exit the prefMngr
        $("#CloseWinMngr").on("click", function (event) {
            if (_this.Options.LossChangeNotification.Value && $("div.TopButtons > a#SaveData").hasClass("btn-sub")) {
                if (!confirm("You have unsaved changes.\n\nAre you sure you want to exit?"))
                { return; }
            }
            $(".MngrWin").hide();
            $(".overlay").hide();
            $("body").css("overflow", "");

            event.stopPropagation();
        });

        //Save Data
        $(".MngWinHeader > .TopButtons > a#SaveData").on("click", function () {
            var moduleForms = $("form[cat] > div.ModuleBlock");
            _this.SaveModule(moduleForms, 0);
        });

        //Close the pref Manager with a click outside of it.
        $(".overlay").on("click", function (e) {
            if ($(e.target).attr("class") === "overlay") {
                $("#CloseWinMngr").click();
            }
        });

        this.ChangeListeners();
    },

    ChangeListeners: function () {
        var _this = this;
        var JqId = $("section.ModulePref");
        JqId.find(":input").on("change", function () {
            _this.AddToModifiedModulesList($(this).parents("div.ModuleBlock:first").attr("id"));
            _this.ToggleSaveButtonActive();
        });

        JqId.find("input").on("input", function () {
            _this.AddToModifiedModulesList($(this).parents("div.ModuleBlock:first").attr("id"));
            _this.ToggleSaveButtonActive();
        });
        JqId.find("a").on('click', function () {
            _this.AddToModifiedModulesList($(this).parents("div.ModuleBlock:first").attr("id"));
            _this.ToggleSaveButtonActive();
        });
    },

    ToggleSaveButtonActive: function () {
        if ($("div.TopButtons > a#SaveData").hasClass("btn-sub")) { return; }
        //$("section.ModulePref").find("input").off("change"); //Can't use off here because it removes custom event listeners
        $("div.TopButtons > a#SaveData").addClass("btn-sub")
                                        .removeClass("btn-unsub");
        //if save btn has btn-sub class prompt confirmation
    },
    AddToModifiedModulesList: function (ID) {
        if ($.inArray(ID, this.ModifiedModules) === -1) {
            this.ModifiedModules.push(ID);
        }
    },

    SaveModule: function (ModuleFormsList, idx) {
        var _this = this;

        var module = ModuleFormsList[idx];
        var ModKey = $(module).attr("id");

        if (!ModKey) { return;}

        if ($.inArray(ModKey, this.ModifiedModules) !== -1) {

            $("div.TopButtons > a#SaveData").text("Saving " + ModKey);
            var POST = {};
            POST[ModKey] = {};

            $(module).find(":input").each(function () {
                var key = $(this).prop("id");

                if ($(this).is("button")){return true;}
                else if (key === AVE.Modules[ModKey].Name) {POST[ModKey].Enabled = $(this).is(":checked");}
                else if (key === "") { /* continue/pass */ }
                else if ($(this).attr("type") && $(this).attr("type").toLowerCase() === "checkbox") {
                    POST[ModKey][key] = $(this).is(":checked");
                } else {
                    POST[ModKey][key] = $(this).val();
                }
            });
            //Send new pref to module
            if (AVE.Modules[ModKey] && typeof AVE.Modules[ModKey].SavePref === "function") {
                AVE.Modules[ModKey].SavePref(POST);
            } else { print("AVE: error saving module " + ModKey); }
        }

        idx++;
        if (idx < ModuleFormsList.length) {
            if ($.inArray(ModKey, this.ModifiedModules) !== -1) {
                //Just enough delay to notice the saving process
                setTimeout(function () { _this.SaveModule(ModuleFormsList, idx); }, 50);
            } else {
                //Don't set a time out if the previous module didn't need to be saved
                _this.SaveModule(ModuleFormsList, idx);
            }
        } else {
            this.ModifiedModules = [];
            $("div.TopButtons > a#SaveData").text("Save Changes")
                                            .removeClass("btn-sub")
                                            .addClass("btn-unsub");
            $("#CloseWinMngr").click();
        }
    },

    AddModule: function (module, cat, pos) {
        var _this = this;
        var enabled, alwaysEnabled;

        if (module.Options.Enabled) {
            enabled = module.Options.Enabled.Value;
            alwaysEnabled = false;
        }
        else {
            //If Module.Enabled doesn't exist, that means it cannot be deactivated
            enabled = true;
            alwaysEnabled = true;
        }

        var html =
            '<div id="' + module.ID + '" class="ModuleBlock">\
                <div class="ModuleTitleBlock">\
                    <input id="' + module.Name + '" ' + (alwaysEnabled ? 'disabled="true"' : '') + ' type="checkbox" class="ToggleEnable" ' + ((enabled || alwaysEnabled) ? 'Checked="true"' : '') + ' /> \
                    <label for="' + module.Name + '" class="ModuleTitle">' + module.Name + '</label> \
                    <span class="ModuleState ' + ((enabled || alwaysEnabled) ? 'Enabled' : 'Disabled') + '"></span>\
                </div>\
                <span class="ModuleDesc">' + module.Desc + '</span>\
                ' + (typeof module.ResetPref === "function" ? '<a href="javascript:void(0)" id="ResetModule" style="float:right">reset</a>' : '') + '\
            </div>';

        if (pos === undefined) {
            $("form[cat='" + cat + "']").append(html);
        } else {
            if (pos > 0) { //if the position isn't first of its category
                $(html).insertAfter("form[cat='" + cat + "'] > div.ModuleBlock:nth(" + (pos - 1) + ")");
            } else {
                if ($("form[cat='" + cat + "'] > div.ModuleBlock").length > 0) {
                    $(html).insertBefore("form[cat='" + cat + "'] > div.ModuleBlock:nth(0)");
                } else { //if it is alone in its category
                    $(html).appendTo("form[cat='" + cat + "']");
                }
            }
        }

        //Get special form element from the modules themselves.
        if (typeof module.AppendToPreferenceManager === "object") {
            if (typeof module.AppendToPreferenceManager.html === "function") {
                var JqId = $("form[cat='" + cat + "']").find("div[id='" + module.ID + "']");
                JqId.append('<div class=AVE_ModuleCustomInput></div>');
                try {
                    html = module.AppendToPreferenceManager.html();
                    JqId.find("div.AVE_ModuleCustomInput").append(html);
                    if (typeof module.AppendToPreferenceManager.callback === "function") {
                        module.AppendToPreferenceManager.callback();
                    }
                }
                catch (e) {
                    if(!AVE.Utils.DevMode){
                        print("AVE: PreferenceManager > Error importing custom settings for " + module.ID +"! Aborting.");
                        JqId.find("div.AVE_ModuleCustomInput").html('<span style="font-size:18px;font-weight:bold;">Error importing custom settings. Operation aborted.</span>');
                    } else {
                        console.error(e);
                    }
                }
            }
        }

        if (typeof module.ResetPref === "function") {
            //Event listener to reset the module's data
            $("div.ModuleBlock[id='" + module.ID + "'] > a#ResetModule").on("click", function () {
                var ID = $(this).parent().attr('id');
                var position = $(this).parents(".ModuleBlock:first").index();
                var category = $(this).parents("form:first").attr("cat");

                $(this).parents(".ModuleBlock:first").remove();
                AVE.Modules[ID].ResetPref();
                //_this.SaveModule(ID);
                _this.AddModule(AVE.Modules[ID], category, position);
            });
        }

        $("div.ModuleBlock[id='" + module.ID + "'] > div.ModuleTitleBlock > input.ToggleEnable").change(function () {
            var JqId = $(this).parent().find("span[class*='ModuleState']");
            if (this.checked) {
                JqId.addClass("Enabled");
                JqId.removeClass("Disabled");
            } else {
                JqId.addClass("Disabled");
                JqId.removeClass("Enabled");
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['PreferenceManager'];
            var htmlStr = "";

            htmlStr += '<input ' + (_this.Options.LossChangeNotification.Value ? 'checked="true"' : "") + ' id="LossChangeNotification" type="checkbox"/><label style="display: inline;" for="LossChangeNotification"> ' + _this.Options.LossChangeNotification.Desc + '</label><br />';
            htmlStr += '<input ' + (AVE.Utils.DevMode ? 'checked="true"' : "") + ' id="AVE_DevMode" type="checkbox"/><label style="display: inline;" for="AVE_DevMode"> Enable Dev Mode.</label><br />';

            htmlStr += '<br />Export all stored data as a JSON file: <input style="font-weight:bold;" value="Export" id="AVE_ExportToJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON">';
            htmlStr += '<br />Import settings/data from a JSON file: <input style="font-weight:bold;" value="Import" id="AVE_ImportFromJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON">\
                        <input style="display:none;"value="file_Import" id="AVE_file_ImportFromJSON" type="file"><br /><br /><br />';
            htmlStr += 'Reset all data stored: <input style="font-weight:bold;" value="Reset" id="AVE_ResetAllData" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Warning: this will delete your preferences, shortcut list and all usertags!">';
            htmlStr += '<br/><span style="font-weight:bold;" id="AVE_Mng_Info"></span>';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['PreferenceManager'];

            $("input#AVE_DevMode").on("change", function () {
                var v = $(this).is(":checked");
                AVE.Storage.SetValue(AVE.Storage.Prefix+"DevMode", v ? "1": "0");

                var lab = $(this).next("label:first");

                lab.css("backgroundColor", "rgba(89, 204, 85, 0.5)");
                setTimeout(function () {
                    lab.css("backgroundColor", "");
                }, 1500);
            });
            $("input#AVE_ExportToJSON").on("click", function () {
                _this.ExportToJSON();
            });
            $("input#AVE_ImportFromJSON").on("click", function () {
                _this.ImportFromJSON();
            });
            $("input#AVE_ResetAllData").on("click", function () {
                _this.RemoveAllData();
            });

            $("input#AVE_file_ImportFromJSON").on("change", function (e) {
                //var DataReader = new FileReader();
                var Data = "";
                var f = e.target.files[0];

                if (!f) {
                    return true;
                } else if (f.name.substr(f.name.length - 4, 4) !== "json") {//Only plain text/JSON
                    _this.ShowInfo("The selected file\'s format isn\'t JSON", "failed");
                    return true;
                }
                var reader = new FileReader();
                reader.addEventListener("load", function (event) {
                    var textFile = event.target;
                    Data = JSON.parse(textFile.result);
                    //trigger copy to Storage
                    var c = 0;
                    $.each(Data, function (k, v) {
                        c++;
                        if (k.substr(0, 3) !== "AVE") {
                            print("AVE: importing preferences -> Failed: " + k);
                            return true;
                        }
                        _this.Store.SetValue(k, v);
                    });
                    _this.ShowInfo(c + " values copied! Reload to see changes.", "success");
                });
                reader.readAsText(f);
            });
        },
    },

    RemoveAllData: function () {
        if (confirm("Are you really sure you want to delete all data stored by AVE?")) {
            for (var val in this.Store.Data) { this.Store.DeleteValue(val); }
            if (this.Store.Data.length > 0) {
                alert("AVE: Reset data > an error occured, not all data were removed.")
            } else {
                this.ShowInfo("Done!", "success");
            }
        }
    },

    ShowInfo: function (text, status) {
        var JqId = $("span#AVE_Mng_Info");
        JqId.finish();
        JqId.show();
        JqId.text(text);
        JqId.css("color", status == "success" ? "#68C16B" : "#DD5454");
        JqId.delay(5000).fadeOut(300);
    },

    ImportFromJSON: function () {
        if (!window.File && !window.FileReader && !window.FileList && !window.Blob) {
            alert("AVE: Importing settings and data is not supported by your browser.");
            return;
        }

        $("input#AVE_file_ImportFromJSON").click();
    },

    ExportToJSON: function () {
        try {
            var isFileSaverSupported = !!new Blob;
        } catch (e) { alert("AVE: Saving settings and data to JSON is not supported by your browser."); return; }

        var _this = AVE.Modules['PreferenceManager'];
        var data = {};
        $.each(_this.Store.Data, function (k, v) { data[k] = v; });
        var blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
        saveAs(blob, "AVE_Data_" + (new Date().toLocaleDateString().replace(/\//g, "_")) + ".json");
    }
};
/// END Preference manager ///

/// Version notifier:  Show a short notification the first time a new version of AVE is used. ///
AVE.Modules['VersionNotifier'] = {
    ID: 'VersionNotifier',
    Name: 'Version notifier',
    Desc: 'Show a short notification the first time a new version of AVE is used.',
    Category: 'General',

    Index: 0.5,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        //this.Store.DeleteValue(this.Store.Prefix + this.ID + "_Version")

        if (this.Enabled) {
            if (this.Store.GetValue(this.Store.Prefix + this.ID + "_Version") !== AVE.Utils.MetaData.version) {
                this.Start();
            }
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    LabelNew: "New Version downloaded:",
    LabelShow: "Changelog, version",
    Trigger: "new",

    ChangeLog: [
        "V2.36.13.36",
        "   UpdateAfterLoadingMore:",
        "       Fixed bug",
        "       Forgot to remove debug info",
        "   ContributionDeltas:",
        "       Fixed bug",
        "   AccountSwitcher:",
        "       No longer shows the account you are currently logged-in with",
        "   General maintenance",
        "V2.36.11.33",
        "   UserTag:",
        "       Implemented options to choose the vote balance gradient's lower and upper limits",
        "       Fixed bug with the colour gradient and negative vote balances",
        "   FixContainerWidth:",
        "       fixed issue in prefmngr where the width value wasn't displayed when loaded",
        "   HideSubmissions:",
        "       Fixed issue with the options that were supposed to hide posts right as they are maked hidden",
        "   HideUsername:",
        "       Now starts when the banner is ready",
        "   Firefox extension:",
        "       New tabs are opened in the background",
        "   Chromium extension:",
        "       Fixed issue in the communication between the main script and the content scripts",
        "   ToggleCustomStyle:",
        "       Fixed bug that happened when the MutationObserver was set up after the element of interest was added",
        "   UserInfoFixedPos:",
        "       Fixed issue where the user block's width was saved before other modules, that could modify it, were loaded",
        "V2.36.9.26",
        "   IgnoreUsers:",
        "       Fixed bug in anonimized subverses",
        "   AppendQuote:",
        "       Fixed issue where the quote link would be added in the wrong list element",
        "       The quote link is now inserted as the second element in a post's flat-list",
        "   UserTag:",
        "       In the dashboard, the paging options aren't empty by default anymore (shows tags and ignored, but not all votes registered)",
        "   SelectPost:",
        "       Fixed critical bug related to the SetOptionsFromPref function",
        "   HttpWarning:",
        "       Submission's title attribute replaced with a warning",
        "   CSSEditor:",
        "       Fixed scrollbars not appearing",
        "   AccountSwitcher:",
        "       Is Enabled by default",
        "       The Voat icon will now be at the right of the username by default, but can be changed",
        "       Fixed bug related to a Jquery selector that wouldn't appropriately detect a div's class",
        "       The manager block element will now be positioned coherently below the account element when the latter is divided",
        "       The width of the manager block is now set to 200px",
        "   AccountSwitcher, UserInfoFixedPos, HeaderFixedPos:",
        "       Added conditonals to catch an error related to the CDN error page",
        "   Init:",
        "       Will look for error pages sooner (on head ready)",
        "V2.36.8.14",
        "   PreferenceManager:",
        "       Fixed issue where buttons are considered inputs and were saved along with the actual options value",
        "   General:",
        "       Added a failsafe in the function responsible for loading settings for each module",
        "   SelectPost:",
        "       The shortcut I took in this case to save its options was not compatible anymore with the failsafe systems",
        "       Forgot to clean up after debugging",
        "V2.36.8.10",
        "   Init:",
        "       If a module crashes when loading it will be automatically deactivated",
        "   UserTag:",
        "       Corrected an embarrassing bug that essentially would have prevented new users from using the beta version with a fresh install",
        "       Fixed an error with the way the migration value was saved (would reset occasionally)",
        "   HideSubmissions:",
        "       option to hide a submission after clicking its link",
        "   ShowSubmissionVoatBalance:",
        "       Finally working thanks to a script by /u/dubbelnougat",
        "   PreferenceManager:",
        "       If a module encounters an error when importing its custom options it will show an error instead of crashing the whole preference manager",
        "       It is now possible to enable/disable a module by clicking its title",
        "   ShortKeys:",
        "       Fixed interference with CSSEditor",
        "   New feature: CSSEditor",
        "       First modtool, edit your custom CSS stylesheets from within the page itself (by /u/j_ and /u/dubbelnougat)",
        "   New feature: httpWarning",
        "       This module shows a warning for submissions that link to HTTP URL instead of HTTPS(ecure)",
        "       Added option to choose to show a warning icon and/or change the titles' CSS style",
        "   Init:",
        "       Added loading step \"BannerReady\"",
        "       Moved AVE.Utils.LateSet() to be triggered as soon as Head is loaded",
        "   New feature: AccountSwitcher",
        "       Store information for several accounts and switch between them quickly",
        "       Will start when the header/banner is ready",
        "   HeaderFixedPos:",
        "       Fixed issue that prevented this module from working when the module InjectCustomStyle was disabled",
        "       Optimized JQuery's selectors",
        "       Will now be loaded when the banner element is ready",
        "   UserInfoFixedPos:",
        "       Added back an old feature:",
        "           The user block smoothly follows the scrolling from its original position,",
        "           It doesn't stick to the right side anymore, only to the top",
        "           It will adapt to custom style modifications",
        "           It will adapt to the window being resized",
        "       Optimized JQuery's selectors",
        "       Will now be loaded when the banner element is ready",
        "V2.33.18.30",
        "   New module category: Modtools",
        "       Misc tools made for helping our dedicated mods (all disabled by default)",
        "   PreferenceManager:",
        "       Added category Modtools",
        "       Renamed category \"Fixes\" to \"Misc\"",
        "   NeverEndingVoat",
        "       Parses fetched page and updates the current mail status and CCP/SCP (Module ContributionDeltas is not updated with the new info)",
        "       \" or a NSFW random subverse\" part is no longer left behind",
        "       This module will now also activate in user-comments and user-submissions",
        "   RememberCommentCount:",
        "       Since user-comments pages can now be read with NeverEndingVoat the process can no longer be repeated twice for the same post ID",
        "   UpdateAfterLoadingMore:",
        "       Will now only start and update when the current page is a thread",
        "   Shortkey:",
        "       Pressing the expand key in a thread with the OP's self-text submission selected will toggle all media within it",
        "       Ctrl+Return can be used to submit comments (key non-configurable)",
        "V2.33.14.26",
        "   Many linguistical improvements",
        "       by LudwikJaniuk",
        "   General:",
        "       Changed some print instances to use DevMode",
        "   FixContainerWidth:",
        "       Will now start at container DOM ready",
        "   Domaintag:",
        "       Forgot to implement the removeTag function",
        "       Updated code for links to subverse domains (used to be self.sub, now v/sub)",
        "   General:",
        "       Implemented DevMode console.log option",
        "   NeverEndingVoat:",
        "       Added support for POST info in general",
        "           Next loaded page will remember info like \"time\", \"page\", \"frontpage=guest\", etc.",
        "   Utils:",
        "       Implemented POST info parser",
        "V2.33.13.20",
        "   General:",
        "       Added support for the new guest frontpage",
        "   HideSubmissions:",
        "       Added reference to the key used to hide posts in the preference manager",
        "   ShortKeys:",
        "       Added option to open external link with archive.is",
        "   ArchiveSubmission:",
        "       Enabled in threads",
        "V2.33.11.18",
        "   ArchiveSubmission:",
        "       No link added to posts linking to archive.is",
        "       Added option (def.: false) to archive self-posts",
        "V2.33.11.16",
        "   New feature: ThemeSwitcher",
        "       Switch between the light and dark themes without reloading",
        "   HeaderFixedPos & UserInfoFixedPos:",
        "       Changed rules choosing the best background colour (fallbacks in case it is transparent because of a custom style)",
        "   New feature: ArchiveSubmission",
        "       Add a link to open an archived version of the submission link",
        "   ShortKeys:",
        "       Linked with HideSubmissions to hide posts with the keyboard (def.: h)",
        "       Automatically select the next submission after hiding one",
        "   New feature: HideSubmissions",
        "       Hide submissions you voted on",
        "       Hide with H",
        "       Insert a \"hide\" button",
        "       If the submission isn't removed as soon as marked hidden, \"hide\" becomes \"unhide\"",
        "   New feature: SingleClickOpener",
        "       Adds '[l+c]' link to submissions, opens link and comment pages.",
        "   Usertags:",
        "       Dashboard:",
        "           Fixed issue with tags having no colour value (e.g. only an ignore value)",
        "           Added options to display data",
        "           Added vote colour gradient",
        "   Utils:",
        "       Fixed bug that prevented AVE from detecting the current page if it was a userpage of someone with an hyphen",
        "   DomainFilter:",
        "       Moved to the Domains tab in the prefmanager",
        "       Linked to the DomainTags module for the ignore feature",
        "       Enabled in user-submissions and saved pages",
        "   Shorcuts:",
        "       Dashboard support",
        "       Adding your first subverse into the list now replaces the default ones",
        "   DomainTags:",
        "       Dashboard support",
        "       Change box's position so that it doesn't get offscreen",
        "       Started implementing ignore option (not functional yet)",
        "           In: dashboard, box",
        "V2.29.6.6",
        "   New feature: DomainTags",
        "       Choose tags to characterize domains",
        "       Added possibility to tag subverses too (i.e. domains like: self.whatever)",
        "       New tab in the PrefMngr: Domains",
        "   UserTag:",
        "       Only used data will be saved for optimization's sake. E.g. upvoting someone will no longer save a new and complete UserTagObj but a simple object containing a username and a votebalance",
        "       Context is a new element saved with the tag. When tagging a user, a link will now be added as context of the tag (permalink to submission or comment)",
        "       An empty votebalance span is not displayed anymore, this is so that it doesn't show an empty space after the tag/username",
        "   RememberCommentCount:",
        "       Comments made by the user will no longer be highlighted",
        "       Comments made by the user will automatically increment the comment count of the thread",
        "       Added comment count in user-comment pages (voat.co/user/username/comments)",
        "       Attempt at fixing a highlighting error related to Voat displaying comment's dates in CET (GMT+1) (can be disabled in the preferences)",
        "       Changed default highlight colour for the dark theme to #423C3C",
        "   Dashboard:",
        "       In the Usertags section, added context entry",
        "       Added dashboard for Domaintags (empty for the moment)",
        "   PreferenceManager:",
        "       You can no longer open several changelogs by clicking the version number multiple times",
        "   BuilDep.js files",
        "       Added callback option to SendMessage (postMessage) function",
        "   Utils:",
        "       Added new Jquery filter",
        "V2.28.3.7",
        "   Usertag:",
        "       New option to add a background colour to vote balances (green to red)",
        "       Added a border radius of 2px to the previous background colour",
        "   Dashboard:",
        "       In the Usertags section, modifying the colour is now done with a colour palette",
        "V2.28.2.5",
        "   Dashboard:",
        "       Displaying the dashboard changes the page's title",
        "       Usertag: fixed issue with arrow keys changing page even while editing a value",
        "V2.28.2.3",
        "   UserInfoFixedPos:",
        "       Renamed module and changed its description to be more general",
        "       Added option to always hide contribution points in the userblock",
        "V2.28.1.2",
        "   Dashboard:",
        "       Implemented a manager for the Usertag module",
        "V2.28.0.2",
        "   New feature: Dashboard",
        "       Use it to manage your saved data",
        "   RememberCommentCount:",
        "       The purging function will now delete 1/8th of the maximum stored values at once every time this max is reached",
        "   VersionNotifier:",
        "       The changelog box can now be closed by pressing \"Escape\"",
        "V2.27.0.2",
        "   RememberCommentCount:",
        "       Changed default highlight colour for the light theme to #ffffcf",
        "V2.27.0.1",
        "   New feature: RememberCommentCount",
        "       For all visited threads show the number of new comments since the last time they were opened (and hilight them)",
        "   ContributionDelta:",
        "       Replaced browser-specific function with shared one",
        "V2.26.1.14",
        "   ToggleMedia:",
        "       Fixed bug preventing the module from detecting any media in submissions' pages",
        "V2.26.1.13",
        "   Filter modules:",
        "     Fixed bug where (starting with two filters) removing the first filter, reloading, adding a new one would have the now first one be erased.",
        "     Fixed issues with new or modified filters not triggering the PrefMngr's save function",
        "   NeverEndingVoat",
        "       Fixed typo that would stop the Load more button from working",
        "   ContributionDelta:",
        "       Fixed bug crashing AVE, relative to the use of the 'let' keyword",
        "V2.26.1.9",
        "   FixContainerWidth:",
        "       Fixed bug that would set the container's width when opening the PrefMngr even when disabled",
        "   ContributionDeltas:",
        "       Fixed bug related to the PrefMngr trying to display values related to a user that didn't exist yet",
        "   UserTag:",
        "       Quick fix",
        "   ContributionDeltas:",
        "       Added option to show mutliple delta in tooltip (hour, day, week)",
        "V2.26.0.6",
        "   New feature: ContributionDeltas",
        "       Show the difference in contribution points between now and X ago",
        "   Preference manager:",
        "       The mngr will now be displayed with full width and height",
        "       Scrolling is deactivated for the rest of the page while the manager is displayed",
        "       Press Escape to close the mngr",
        "   IgnoreUsers:",
        "       Small optimizations",
        "       Corrected a CSS value",
        "   FixContainerWidth:",
        "       Fixed bug in the setting that stopped the slider from updating the page's width live",
        "V2.25.3.6",
        "   NeverEndingVoat:",
        "       Fixed a bug related to expando buttons not appearing in Chrome and preventing more modules from updating",
        "V2.25.3.5",
        "   New feature: Domain filter",
        "       Use filters to remove submissions linking to particular domains",
        "   InjectCustomStyle:",
        "       Added option to inject style without removing the original subverse's custom style",
        "       Added option to inject the external style after the subverse's custom style",
        "   ToggleCustomStyle:",
        "       This module will now start when InjectCustomStyle is enabled but RemoveSubverseStyle is set to false",
        "   UserInfoFixedPost:",
        "       To reduce bugs and improve compatibility with custom styles the user block is now set once regardless of any scrolling by the user",
        "   ToggleMedia & NeverEndingVoat:",
        "       Fixed bug where media in new pages weren't expanded but those already expanded were toggled off and on",
        "   AppendQuote & ReplyWithQuote:",
        "       Didn't work anymore because a DOM id has changed and needed to be updated in the code",
        "   ShortKeys:",
        "       Expand key:",
        "           If the window is scrolled below a submission title and its media is being collapsed the view will scroll up just above the title",
        "   VersionNotifier:",
        "       Purged all previous changelog entries but the last three versions. Past entries can be found on GitHub",
        "V2.24.6.6",
        "   InjectCustomStyle & ToggleCustomStyle:",
        "       Thanks to a fix by /u/FuzzyWords these modules will now identify custom styles way faster",
        "   FixExpandImage:",
        "       Added back fix for reply box's buttons positioned below the sidebar",
        "   Init:",
        "       AVE will now stop loading modules only if the page's title is exactly that of error pages",
        "       Beware: Choosing an error message as the title of a subverse would be a very efficient way of disabling AVE",
        "   UserTag:",
        "       Fixed bug where the vote balance would be updated for the first username found in the self-text when the submission is made in an anonymised subverse",
        "   Updated source with JSlint recommendations",
        "V2.24.2.3",
        "   New feature: Inject custom style",
        "       Apply a custom style everywhere on Voat. Choose from a list or input your own CSS from an URL",
        "   FixExpandImage:",
        "       Trying a simpler solution to the CSS fix",
        "   UserInfoFixedPos & HeaderFixedPos",
        "       Those modules now have more possiblities available when trying to choose a background color.",
        "   ToggleMedia:",
        "       Fixed bug where, in threads, media that were expanded when the user loaded more content weren't detected by the module, thus couldn't be collapsed back.",
        "   FixContainerWidth:",
        "       The module used to update the container's width when starting the prefMngr even if disabled.",
                "V2.23.2.2",
        "   New feature: Hide username",
        "       Options to hide or replace references to your username (not in posts)",
        "   PreferenceManager:",
        "       Added \"style\" tab",
        "       Added visual of the saving process",
        "       In order to save processing time, instead of saving all modules, only those which pref have been modified will be saved now",
        "   ToggleMedia",
        "       Corrected fix that prevented module from detecting media in self-text posts"],

    AppendToPage: function () {
        var CSSstyle = 'div.VersionBox' +
                      '{background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F6F6F6") + ';' +
                       'border:1px solid black;' +
                       'z-index: 1000 ! important;' +
                       'position:fixed;' +
                       'right:0px;' +
                       'top:64px;' +
                       'width:250px;' +
                       'font-size:12px;' +
                       '}' +
                    'p.VersionBoxTitle' +
                       '{background-color: ' + (AVE.Utils.CSSstyle === "dark" ? "#575757" : "#D5D5D5") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#BFBFBF" : "535353") + ';' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle === "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'text-align: center;' +
                       'font-weight: bold;' +
                       '}' +
                    'p.VersionBoxInfo' +
                       '{' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#AAA" : "#565656") + ';' +
                       'margin-top: 5px;' +
                       'padding: 5px;' +
                       '}' +
                    'p.VersionBoxToggle' +
                       '{padding: 5px;}' +
                    'div.VersionBoxClose{' +
                       'border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "5452A8" : "D1D0FE") + ';' +
                       'background-color:#' + (AVE.Utils.CSSstyle === "dark" ? "304757" : "F4FCFF") + ';' +
                       'font-size:12px;' +
                       'text-align: center;' +
                       'color:#6CA9E4;' +
                       'font-weight:bold;' +
                       'float: right;' +
                       'margin: 0 5px 5px 0;' +
                       'cursor: pointer;' +
                       'width:50px;' +
                       '}' +
                    'textarea.VersionBoxText{' +
                       'resize:none;' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle === "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#BFBFBF" : "535353") + ';' +
                       'font-size:12px;' +
                       'font-weight:bold;' +
                       'width:100%;' +
                       'padding:10px;' +
                       'padding-bottom:10px;' +
                       '}';
        var notifierHTML = '<div class="VersionBox">' +
                                '<p class="VersionBoxTitle">' + AVE.Utils.MetaData.name + '</p>' +
                                '<p class="VersionBoxInfo">' + (this.Trigger === "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px;">' + AVE.Utils.MetaData.version + '</strong></p>' +
                                '<p class="VersionBoxToggle"><a href="javascript:void(0)" id="ShowChangelog">See Changelog?</a><p>' +
                                '<div class="VersionBoxClose">Close</div>' +
                            '</div>';

        $('<style id="AVE_Version_notif"></style>').appendTo("head").html(CSSstyle);
        $("body").append(notifierHTML);
    },

    Listeners: function () {
        var _this = AVE.Modules['VersionNotifier'];
        var ChangeLog = this.ChangeLog;
        var VersionBox = $(".VersionBox");

        $("p.VersionBoxToggle").on("click", function () {
            var ChangeLogHTML = '<textarea class="VersionBoxText" readonly="true">';
            //for (var idx in ChangeLog) {
            //    ChangeLogHTML += ChangeLog[idx] + "\n";
            //}
            ChangeLogHTML += ChangeLog.join("\n");

            ChangeLogHTML += '</textarea>';
            $(this).remove();
            $(ChangeLogHTML).insertAfter(VersionBox.find("p.VersionBoxInfo"));

            $("textarea.VersionBoxText").animate({
                height: "370px"
            }, 1000);
            VersionBox.animate({
                width: "85%",
                height: "450px"
            }, 1000);
        });
        $("div.VersionBoxClose").on("click", function () {
            VersionBox.hide("slow");
            _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Version", AVE.Utils.MetaData.version);
        });

        $(window).on("keyup", function (e) {
            if (e.which === 27 && $("div.VersionBox").is(":visible")) {
                $("div.VersionBoxClose").trigger("click");
            }
        });
    }
};
/// END Version notifier ///

/// Update after loading more:  Updates other modules when a thread is continued. ///
AVE.Modules['UpdateAfterLoadingMore'] = {
    ID: 'UpdateAfterLoadingMore',
    Name: 'Update after loading more',
    Desc: 'Updates other modules when a thread is continued.',
    Category: 'Thread',//Maybe Subverses/Sets later

    Index: 1,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") {this.Enabled = false;}

        if (this.Enabled) {
            this.Start();
        }
    },

    obsReplies: null,
    obsComm: null,
    CommentLen: 0,

    Start: function () {
        var _this = this,
            JqId = "div[class*='id-']";

        this.CommentLen = JqId.length;

        //More Comments
        if (this.obsComm) { this.obsComm.disconnect(); }
        this.obsComm = new OnNodeChange($("div.sitetable#siteTable"), function (e) {
            if (e.addedNodes.length > 0 && e.removedNodes.length === 0) {
                if ($(JqId).length > _this.CommentLen) {
                    _this.CommentLen = $(JqId).length;

                    setTimeout(AVE.Init.UpdateModules, 500);
                }
            }
        });
        this.obsComm.observe();
        this.Listeners();
    },

    Listeners: function () {
        //More Replies
        if (this.obsReplies) { this.obsReplies.disconnect(); }
        this.obsReplies = new OnNodeChange($("a[id*='loadmore-']").parents("div[class*='id-']:visible"), function (e) {
            if (e.removedNodes.length === 1) {
                if (e.removedNodes[0].tagName === "DIV" && e.removedNodes[0].id === "") {
                    setTimeout(AVE.Init.UpdateModules, 500);
                }
            }
        });
        this.obsReplies.observe();
    },

    Update: function () {
        if (AVE.Utils.currentPageType === "thread") {this.Listeners();}
    }
};
/// END Update after loading more ///

/// User tagging:  Tag Voat users with custom labels. ///
AVE.Modules['UserTag'] = {
    ID: 'UserTag',
    Name: 'User tagging',
    Desc: 'Tag Voat users with custom labels.',
    Category: 'General',

    Index: 3,
    Enabled: false,

    Store: {},

    StorageName: "",
    usertags: {},
    style: "",
    html: "",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        VoteBalance: {
            Type: 'boolean',
            Desc: 'Track votes and display the vote balance next to usernames.',
            Value: true
        },
        ShowBalanceWithColourGradient: {
            Type: 'boolean',
            Desc: 'Show vote balances over a colour gradient going from green to red according to its positivity.',
            Value: true
        },
        ColourGradientRangePos: {
            Type: "int",
            Desc: "Positive vote balance above which the colour cannot get greener.",
            Value: 100
        },
        ColourGradientRangeNeg: {
            Type: "int",
            Desc: "Negative vote balance below which the colour cannot get redder.",
            Value: -100
        },
        ColourGradientMaxWhite: { //Show example of min value (1, -1) beside
            Type: "int",
            Desc: "The colour displayed are between red/green and white. How white do you want it to be at most? (0, 255)",
            Value: 210
        }
    },

    //Possible issues with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance, context) {
        this.t = tag.toString();
        this.col = colour;
        this.i = (typeof ignored === "boolean" ? ignored : false);
        this.b = (typeof balance === "number" ? balance : 0);
        this.con = context ? context.toString() : "";
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        $.each(Opt, function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.style = '\
div#UserTagBox{\
    background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
    ' + (AVE.Utils.CSSstyle === "dark" ? "" : "color: #707070;") + '\
    z-index: 1000 !important;\
    position:absolute;\
    left:0px;\
    top:0px;\
    border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
    border-radius:3px;\
    width:280px;\
}\
div#UserTagHeader{\
    font-weight:bold;   \
    height:20px;\
    border-bottom: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
    padding-left:5px;\
}\
div#UserTagHeader > span#username{\
    display: inline-block;\
    width: 170px;\
    overflow: hidden;\
    vertical-align: middle;\
    text-overflow: ellipsis;\
}\
input.UserTagTextInput{\
    background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
    border: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
    border-radius:2px;\
    height:20px;\
    padding-left:5px;\
}\
td > span#PreviewBox {\
    display: inline-block;\
    max-width: 130px;\
    overflow: hidden;\
    white-space: nowrap;\
    text-overflow: ellipsis;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "484848") + ';\
    border-radius:3px;\
}\
span.AVE_UserTag{\
    font-weight:bold;\
    cursor:pointer;\
    margin-left:4px;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "484848") + ';\
    color:#' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "000") + ';\
    border-radius:3px;\
    font-size:10px;\
}\
span.AVE_UserTag:empty{\
    border:0px;\
    height: 14px;\
    width: 14px;\
    margin: 0px 0px -3px 4px;\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '%22%20d%3D%22M5%2C0H0v5l9%2C9l5-5L5%2C0z%20M3%2C4C2.447%2C4%2C2%2C3.553%2C2%2C3s0.447-1%2C1-1s1%2C0.447%2C1%2C1S3.553%2C4%2C3%2C4z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E") !important;\
    background-repeat: no-repeat;\
    display: inline-block;\
}\
span.AVE_UserBalance{\
    margin: 0px 4px;\
    font-size: 10px;\
    border-radius: 2px;\
}\
span.AVE_UserBalance:empty{\
    padding: 0px;\
}\
table#formTable{\
    border-collapse: separate;\
    border-spacing: 5px;\
    margin: 0 auto;\
    font-size:12px;\
}';
            this.html = '\
<div id="UserTagBox">\
    <div id="UserTagHeader">Set tag for <span id="username"></span><span style="margin-right:5px;float:right;"><a id="CloseTagWin" href="javascript:void(0)">Close</a></span></div>\
    <div id="UserTagBody">\
        <table id="formTable">\
            <tr id="SetTag">\
                <td>Tag</td>\
                <td style="width:10px;"></td>\
                <td>\
                    <input class="UserTagTextInput" type="text" value="" id="ChooseTag" style="width:170px;"/>\
                </td>\
            </tr>\
            <tr id="SetColour">\
                <td>Colour</td>\
                <td style="width:10px;"></td>\
                <td><input name="color" type="color" title="Click me!" id="ChooseColor" style="width:60px;" /></td>\
            </tr>\
            <tr id="ShowPreview">\
                <td>Preview</td>\
                <td style="width:10px;"></td>\
                <td><span id="PreviewBox"></span></td>\
            </tr>\
            <tr id="SetIgnore">\
                <td>Ignore</td>\
                <td style="width:10px;"></td>\
                <td><input type="checkbox" id="ToggleIgnore" class="tagInput" /></td>\
            </tr>\
            <tr id="SetContext">\
                <td>Context <a target="_blank" style="display:none;" href="">[link]</a></td>\
                <td style="width:10px;"></td>\
                <td>\
                    <input class="UserTagTextInput" type="text" value="" id="ChooseContext" style="width:170px;"/>\
                </td>\
            </tr>\
            <tr id="SetBalance">\
                <td>Vote balance</td>\
                <td style="width:10px;"></td>\
                <td><input style="width:80px;" class="UserTagTextInput" type="number" id="voteBalance" class="tagInput" value="0" step="1" />\
                <a href="javascript:void(0)" style="position: absolute;right: 5px;font-weight:bold;" id="SaveTag">Save</a>\
                </td>\
            </tr>\
        </table>\
    </div>\
</div>';
            this.StorageName = this.Store.Prefix + this.ID + "_Tags";
            //this.Store.DeleteValue(this.StorageName);

            if (this.Store.GetValue(this.Store.Prefix + this.ID + "_migration", "0") === "0"){
                this.Migrate();
            }

            this.usertags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Start();
        }
    },

    Migrate: function () {
        var _this = this;
        var data = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));

        print("AVE: UserTag > migrating (a one-time process)");
        
        $.each(data, function (key, val) {
            if(val.hasOwnProperty("t") || !val.hasOwnProperty("tag") || Object.keys(val).length === 0){return true;}
            data[key] = new _this.UserTagObj(data[key].tag, data[key].colour, data[key].ignore, data[key].balance, data[key].context);
            if(!val.tag){
                delete data[key].t;
                delete data[key].col;
            }
            if (!val.balance){
                delete data[key].b;
            }
            if (!val.ignored){
                delete data[key].i;
            }
            if (!val.context){
                delete data[key].con;
            }
        });

        this.Store.SetValue(this.StorageName, JSON.stringify(data));
        this.Store.SetValue(this.Store.Prefix + this.ID + "_migration", "1");
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        //Username in userpages
        //if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) >= 0) {
        //    name = $(".alert-title").text().split(" ")[3].replace(".", "").toLowerCase();
        //    tag = this.GetTag(name);
        //    Tag_html = '<span style="font-weight:bold;background-color:"' + tag.colour + ';border:1px solid #FFF;border-radius:3px;font-size:10px;" class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "+" : tag.tag) + '</span>';
        //    $(".alert-title").html("Profile overview for " + name + Tag_html + ".");
        //}
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        var _this = this;
        var Tag_html, name, tag;

        $("a[href^='/user/'],a[href^='/u/']").each(function () {
            if ($(this).next("span.AVE_UserTag").length > 0) { return true; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username

            if ($(this).attr('href').split("/")[2].toLowerCase() !== name) { return true; } //don't add if this is a link whose label isn't the username

            tag = _this.GetTag(name) || {};// || new _this.UserTagObj("",  "", false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '">' + (tag.t || "") + '</span>';
            if (_this.Options.VoteBalance.Value) {
                if (tag.b && tag.b !== 0) {
                    var valence = tag.b > 0;
                    var sign = valence ? "+" : "";
                    var style = "";

                    if (_this.Options.ShowBalanceWithColourGradient.Value){
                        var r, g, b;

                        var limit = _this.Options.ColourGradientRangePos.Value;
                        var progValence = valence ?
                            Math.min(_this.Options.ColourGradientRangePos.Value, tag.b) : Math.max(_this.Options.ColourGradientRangeNeg.Value, tag.b);
                        if (!valence){
                            limit = _this.Options.ColourGradientRangeNeg.Value;
                        }

                        r = g = b = parseInt(210 - progValence/limit * 210, 10);
                        if (valence) { g = 255; }
                        else { r = 255; }
                        style = 'style="color:#262626;background-color:rgb('+r+','+g+','+b+');" ';
                    }

                    Tag_html += '<span '+style+' class="AVE_UserBalance" id="' + name + '">[ ' + sign + tag.b + ' ]</span>';
                } else {
                    Tag_html += '<span style="display:none;" class="AVE_UserBalance" id="' + name + '"></span>';
                }
            }
            $(Tag_html).insertAfter($(this));

            if (tag.t) {
                var c = AVE.Utils.GetRGBvalues(tag.col);

                $(this).next(".AVE_UserTag").css("background-color", tag.col);
                $(this).next(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(c[0], c[1], c[2]));
            }

            if (AVE.Modules['IgnoreUsers'] && tag.i) {
                if ($.inArray(name, AVE.Modules['IgnoreUsers'].IgnoreList) === -1) {
                    AVE.Modules['IgnoreUsers'].IgnoreList.push(name);
                }
            }
        });

        if ($("#UserTagBox").length === 0) {
            AVE.Utils.AddStyle(_this.style);
            $(_this.html).appendTo("body");
            $("#UserTagBox").hide();
        }
    },

    obsVoteChange: null,

    Listeners: function () {
        var _this = this;
        var JqId1, JqId2;

        JqId1 = $("tr#SetTag > td > input.UserTagTextInput#ChooseTag");
        JqId2 = $("tr#SetColour > td > input#ChooseColor");
        $(".AVE_UserTag").off("click")
                         .on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = _this.usertags[username] || {};

            var position = $(this).offset();
            position.top += 20;
            $("#UserTagBox").css(position)
                            .show();

            $("div#UserTagHeader > span#username").text(username);

            if (!usertag.t){
                //if comment
                if ($(this).parents("div.comment:first").length > 0){
                    usertag.con = $(this).parent().parent().find("ul.flat-list.buttons").find("a.bylink").attr("href");
                }
                //if submission
                else if ($(this).parents("div.submission:first").length > 0){
                    usertag.con = $(this).parent().next("ul.flat-list.buttons").find("a.comments.may-blank").attr("href")           //in submission page
                               || $(this).parent().parent().next("ul.flat-list.buttons").find("a.comments.may-blank").attr("href"); //in thread page
                } else {
                    usertag.con = "";
                }
            }

            $("tr#SetContext > td > input.UserTagTextInput#ChooseContext").val(usertag.con);
            if (usertag.con !== ""){
                $("tr#SetContext > td:first-child > a").attr("href", usertag.con).show();
            } else {
                $("tr#SetContext > td:first-child > a").hide();
            }

            JqId1.val(oldTag === "+" ? "" : oldTag);
            $("tr#ShowPreview > td > span#PreviewBox").text(oldTag === "+" ? "" : oldTag);
            if (usertag !== undefined) {
                JqId2.val(usertag.col ? usertag.col : (AVE.Utils.CSSstyle === "dark" ? "#d1d1d1" : "#e1fcff"));
                JqId2.change();
                if (usertag.i) { $("tr#SetIgnore > td > input#ToggleIgnore").prop('checked', "true"); }
                $("tr#SetBalance > td > input#voteBalance").val(usertag.b);
            } else {
                JqId2.val((AVE.Utils.CSSstyle === "dark" ? "#d1d1d1" : "#e1fcff"));
                JqId2.change();
            }
            JqId1.focus();
            JqId1.select();
        });

        if (_this.Options.VoteBalance.Value) {
            if (_this.obsVoteChange) { _this.obsVoteChange.disconnect(); }
            _this.obsVoteChange = new OnAttrChange($("div[class*='midcol']"), function (e) {
                if (!e.oldValue || e.oldValue.split(" ").length !== 2) { return true; }
                _this.ChangeVoteBalance(e.target, e.oldValue);
            });
            this.obsVoteChange.observe();
        }

        //Close button
        $("div#UserTagHeader > span > a#CloseTagWin")
            .off("click")
            .on("click",
            function () {
                $("#UserTagBox").hide();
        });
        //Show the tag in the preview box
        JqId1.off('keyup')
             .on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
        JqId2.off('change')
             .on('change', function () {
            var c = AVE.Utils.GetRGBvalues($(this).val());

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val())
                                                      .css("color", AVE.Utils.GetBestFontColour(c[0], c[1], c[2]));
        });
        //Saving tag
        $("tr#SetBalance > td > a#SaveTag").off("click")
                                           .on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                t: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                col: $("tr#SetColour > td > input#ChooseColor").val(),
                i: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                b: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10),
                con: $("tr#SetContext > td > input.UserTagTextInput#ChooseContext").val()
            };

            if (isNaN(opt.b)) { opt.b = 0; }

            if (!opt.t){
                //opt.con= "";
                opt.col = "";
            }

            if (opt.t.length === 0 && opt.i === false && opt.b === 0) {
                _this.RemoveTag(opt.username);
            } else {
                _this.SetTag(opt);
            }

            _this.UpdateUserTag(opt);

            $("#UserTagBox").hide();
        });

        //If Enter/Return is pressed while the focus is on one of the two text input, we save the tag.
        //$(document).off("keyup"); // Not a good idea to remove all "keyup" listeners bound to document
        $(document).on("keyup", function (e) {
            if (e.which === 13) {
                if ($(e.target).attr("class") === "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
            if (e.which === 27 && $("#UserTagBox").is(":visible")) {
                //$("div#UserTagHeader > span > a#CloseTagWin").click();
                $("#UserTagBox").hide();
            }
        });
    },

    //Because the .click JQuery event triggered by the shortkeys in ShortKeys.js triggers an OnAttrChange with false mutation values (oldValue, attributeName),
    //      we use a second function that keypresses in ShortKeys.js can invoke directly.
    // Ten minutes later it works perfectly well. Maybe, voat's current instability was to blame. I'm not changing it back, anyway...
    ChangeVoteBalance: function (target, oldValue) {
        //print("target: "+target);
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find("p.tagline").find(".AVE_UserTag:first");
        if (!username) { return; } //If we couldn't find a username in the tagline that means this is
        username = username.attr("id").toLowerCase();
        if (!username) { return; }

        var tag = this.GetTag(username);
        var opt = { username: username, t: tag.t || '', col: tag.col || "#d1d1d1", i: tag.i || false, b: tag.b || 0, con: tag.con };

        //If the previous status was "unvoted"
        if (oldValue === "midcol unvoted") {
            if ($(target).hasClass('likes')) { opt.b += 1; }
            else if ($(target).hasClass('dislikes')) { opt.b -= 1; }
        }
        else {
            //If the previous status was "upvoted"
            if (oldValue === "midcol likes") {
                if ($(target).hasClass('unvoted')) { opt.b -= 1; }
                else if ($(target).hasClass('dislikes')) { opt.b -= 2; }
            }
                //If the previous status was "downvoted"
            else if (oldValue === "midcol dislikes") {
                if ($(target).hasClass('likes')) { opt.b += 2; }
                else if ($(target).hasClass('unvoted')) { opt.b += 1; }
            }
        }

        this.SetTag(opt);
        this.UpdateUserTag(opt);
    },

    UpdateUserTag: function (tag) {
        var _this = this;
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {

            if (tag.t !== "") {
                $(this).text(tag.t);

                var c = AVE.Utils.GetRGBvalues(tag.col);

                $(this).css("background-color", tag.col);
                $(this).css("color", AVE.Utils.GetBestFontColour(c[0], c[1], c[2]));
            }
            else {
                $(this).text("");
                $(this).removeAttr("style");
            }

            if (_this.Options.VoteBalance.Value) {
                if (tag.b !== 0) {
                    var valence = tag.b > 0;
                    var sign = valence ? "+" : "";
                    var style = "";

                    if (_this.Options.ShowBalanceWithColourGradient.Value){
                        var r, g, b;

                        var limit = _this.Options.ColourGradientRangePos.Value;
                        var progValence = valence ?
                            Math.min(_this.Options.ColourGradientRangePos.Value, tag.b) : Math.max(_this.Options.ColourGradientRangeNeg.Value, tag.b);
                        if (!valence){
                            limit = _this.Options.ColourGradientRangeNeg.Value;
                        }

                        r = g = b = parseInt(210 - progValence/limit * 210, 10);
                        if (valence) { g = 255; }
                        else { r = 255; }
                        style = 'color:#262626;background-color:rgb('+r+','+g+','+b+');';
                    }

                    $(this).nextAll("span.AVE_UserBalance:first")
                        .text('[ ' + sign + tag.b + ' ]')
                        .attr("style", style)
                        .show();
                } else {
                    $(this).nextAll("span.AVE_UserBalance:first").text("").hide();
                }
            }
        });
    },

    RemoveTag: function (username) {
        delete this.usertags[username];

        this.Store.SetValue(this.StorageName, JSON.stringify(this.usertags));
        print("AVE > Usertag: removed tag associated with user: " + username);
    },

    SetTag: function (opt) {
        this.usertags[opt.username] = new this.UserTagObj(opt.t, opt.col, opt.i, opt.b, opt.con);

        if(!this.usertags[opt.username].t){
            delete this.usertags[opt.username].t;
            delete this.usertags[opt.username].col;
        }
        if (!this.usertags[opt.username].b){
            delete this.usertags[opt.username].b;
        }
        if (!this.usertags[opt.username].i){
            delete this.usertags[opt.username].i;
        }
        if (!this.usertags[opt.username].con){
            delete this.usertags[opt.username].con;
        }

        //print(JSON.stringify(this.usertags[opt.username]));

        this.Store.SetValue(this.StorageName, JSON.stringify(this.usertags));
    },

    GetTag: function (userName) {
        return this.usertags[userName] || false;
    },

    GetTagCount: function () {
        return this.usertags.length;
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['UserTag'];
            if (_this.Enabled) {
                var TagLen = 0, VoteLen = 0, IgnoreLen = 0;
                var htmlStr = "";

                $.each(_this.usertags, function (key, value) {
                    if (value.t) { TagLen++; }
                    if (value.b) { VoteLen++; }
                    if (value.i) { IgnoreLen++; }
                });

                htmlStr += '<ul style="list-style:inside circle;"><li>You have tagged <strong>' + TagLen + '</strong> users.</li>';
                htmlStr += "<li>You have voted on submissions made by <strong>" + VoteLen + "</strong> users.</li>";
                htmlStr += "<li>You have chosen to ignore <strong>" + IgnoreLen + "</strong> users.</li></ul>";

                htmlStr += '<br /><input id="VoteBalance" ' + (_this.Options.VoteBalance.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="VoteBalance"> ' + _this.Options.VoteBalance.Desc + '</label><br>';
                htmlStr += '<input id="ShowBalanceWithColourGradient" ' + (_this.Options.ShowBalanceWithColourGradient.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowBalanceWithColourGradient"> ' + _this.Options.ShowBalanceWithColourGradient.Desc + '</label><br><br>';
                //Add option to remove oldest tags.
                //  Seeing as this.usertags is ordered oldest first, propose to remove X tags at the beginning of the list.

                htmlStr += '<input style="width: 60px;" id="ColourGradientRangeNeg" type="number" name="ColourGradientRangeNeg" value="'+_this.Options.ColourGradientRangeNeg.Value+'"> <label style="display:inline;" for="ColourGradientRangeNeg"> ' + _this.Options.ColourGradientRangeNeg.Desc + '</label><br>';
                htmlStr += '<input style="width: 60px;" id="ColourGradientRangePos" type="number" name="ColourGradientRangePos" value="'+_this.Options.ColourGradientRangePos.Value+'"> <label style="display:inline;" for="ColourGradientRangePos"> ' + _this.Options.ColourGradientRangePos.Desc + '</label>';

                return htmlStr;
            }
        }
    },
    
    AppendToDashboard: {
        tableCSS: '',
        initialized: false,
        module: {},
        usertags: [],

        StorageName: "",

        tagsperpage: 20,
        currpage: 0,

        ShowTag: true,
        ShowIgnore: true,
        ShowVoteBalance: false,

        CSSselector: "",

        MouseOverColours: [],
        //' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '
        init: function () {
            this.tableCSS = '\
                table#AVE_Dashboard_usertags_table{\
                    width: 100%;\
                }\
                fieldset#AVE_Dashboard_usertags_options{\
                    width: 250px;\
                    margin-left:10px;\
                    margin-bottom:20px;\
                    border-radius: 4px;\
                    border: 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    padding: 5px;\
                }\
                fieldset#AVE_Dashboard_usertags_options > legend{\
                    color: #'+(AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB")+';\
                    width: auto;\
                    border: 0px none;\
                    font-size: 14px;\
                    margin-bottom: 0px;\
                    padding: 0px 10px;\
                    cursor:pointer;\
                }\
                fieldset#AVE_Dashboard_usertags_options > input[type="checkbox"]{\
                    vertical-align: sub;\
                    margin-left: 10px;\
                }\
                table#AVE_Dashboard_usertags_table > thead > tr {\
                    font-size: 14px;\
                    padding-bottom: 10px;\
                    margin-bottom: 20px;\
                }\
                table#AVE_Dashboard_usertags_table > thead > tr > th{\
                    text-align: center;\
                    font-weight: bold;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr:hover {\
                    background-color: '+(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9")+';\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td{\
                    padding-top: 5px;\
                    border-top : 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    text-align: center;\
                    margin\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(1){\
                    /* Username */\
                    font-weight: bold;\
                    text-align: left;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(2){\
                    /* Tag */\
                    text-align: left;\
                    width: 100px;\
                    max-width: 150px;\
                    overflow: hidden;\
                    text-overflow: ellipsis;\
                    white-space: nowrap;\
                    padding-right: 10px;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td[data="context"][title]{\
                    /* context non-null*/\
                    /* SVG from Jquery Mobile Icon Set */\
                    background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '%22%20d%3D%22M12%2C0H2C0.896%2C0%2C0%2C0.896%2C0%2C2v7c0%2C1.104%2C0.896%2C2%2C2%2C2h1v3l3-3h6c1.104%2C0%2C2-0.896%2C2-2V2C14%2C0.896%2C13.104%2C0%2C12%2C0z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td[data="context"]{\
                    /* context default */\
                    height: 14px;\
                    width: 14px;\
                    /* SVG from Jquery Mobile Icon Set */\
                    background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "444" : "f2f2f2" ) + '%22%20d%3D%22M12%2C0H2C0.896%2C0%2C0%2C0.896%2C0%2C2v7c0%2C1.104%2C0.896%2C2%2C2%2C2h1v3l3-3h6c1.104%2C0%2C2-0.896%2C2-2V2C14%2C0.896%2C13.104%2C0%2C12%2C0z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
                    background-repeat: no-repeat;\
                    background-position: center;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(7){\
                    /* Preview */\
                    width: 140px;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:last-child{\
                    /* Delete */\
                    height: 14px;\
                    width: 14px;\
                    /* SVG from Jquery Mobile Icon Set */\
                    background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + '%22%20points%3D%2214%2C3%2011%2C0%207%2C4%203%2C0%200%2C3%204%2C7%200%2C11%203%2C14%207%2C10%2011%2C14%2014%2C11%2010%2C7%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
                    background-repeat: no-repeat;\
                    cursor: pointer;\
                    background-position: center;\
                }\
                a#AVE_Dashboard_navigate_tags[role]{\
                    margin: 0px 5px 10px 0px;\
                }\
                td > span#PreviewBox {\
                    margin: -2px 0px -2px 0px;\
                }';
            AVE.Utils.AddStyle(this.tableCSS);

            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9");
            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#534040" : "#FFC9C9");

            this.module = AVE.Modules['UserTag'];

            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";

            this.StorageName = this.module.Store.Prefix + this.module.ID + "_Dashboard_options";
            this.GetOptions();

            this.initialized = true;
        },

        GetOptions: function () {
            var options = JSON.parse(this.module.Store.GetValue(this.StorageName, "[false, true, true, 20]"));

            this.ShowVoteBalance = !!options[0];
            this.ShowIgnore = options[1] ? true : false;
            this.ShowTag = options[2] ? true : false;
            this.tagsperpage = parseInt(options[3],10) || 20;
        },

        SaveOptions: function () {
            var options = [];
            options[0] = this.ShowVoteBalance;
            options[1] = this.ShowIgnore;
            options[2] = this.ShowTag;
            options[3] = this.tagsperpage;

            this.currpage = 0;

            this.module.Store.SetValue(this.StorageName, JSON.stringify(options));
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Empty container
            this.usertags = [];

            var _this, tempObj, tempUsertags, keys, htmlStr, start;
            _this = this;
            start  = this.currpage*this.tagsperpage;
            htmlStr = "";

            AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
            tempUsertags = JSON.parse(this.module.Store.GetValue(this.module.StorageName, "{}"));
            keys = Object.keys(tempUsertags);
            keys.sort();

            //Remove all tags (prompt confirm)
            //Add a list of tags in JSON format (accept as long as the tag property exists) -> prompt input -> confirm (add X new tags?)
            //Add a list of tags (accept as long as the tag property exists) -> prompt input (format=("name1:tag1,name2:tag2 name3:tag3;name4:tag4")) -> confirm (add X new tags?)
            //  Try to parse as JSON first
            //Export everything: prompt("Copy the value below:", value)
            //Batch delete:
            //  replaces crosses with checkboxes at the right side and adds a remove button below above and below the table (right side)
            //Remove a batch from a list of username -> prompt input (sep=[ ,;])
            //Search function (by name, tag, colour, ignored, vote balance (< and >)
            //  Process _this.usertags to keep only usertags matching the search
            //  Paging function returning this.paging(0, this.tagsperpage);
            //Order by: username, tag, ignored, votebalance (username default and secondary always)
            //Paging function (default)

            $.each(keys, function (idx, key) {
                var disp = false;
                tempObj = tempUsertags[key];

                if (_this.ShowVoteBalance && tempObj.b){
                    disp = true;
                } else if (_this.ShowIgnore && tempObj.i){
                    disp = true;
                } else if (_this.ShowTag && tempObj.t){
                    disp = true;
                }

                if (!disp) { return true; }

                tempObj.name = key;
                tempObj.i = tempObj.i ? "Yes" : "No";
                tempObj.b = tempObj.b || 0;
                tempObj.con = tempObj.con || "";
                _this.usertags.push( JSON.stringify( tempObj ) );
            });

            var htmlNavButtons = this.navbuttons();

            htmlStr += '<fieldset id="AVE_Dashboard_usertags_options"><legend title="Click to toggle">Options</legend>' +
                        '   <label for="elperpage" style="vertical-align:inherit;padding-right:5px;">Entries per page </label><input type="number" id="elperpage" min="1" style="width:40px;text-align: center;" value="'+_this.tagsperpage+'"/><br>' +
                        '   <span>Show: </span><input type="checkbox" '+ (_this.ShowTag ? "checked" : "") +' id="tag"/><label for="tag"> tags </label>' +
                        '   <input type="checkbox" '+ (_this.ShowIgnore ? "checked" : "") +' id="ignore"/><label for="ignore"> ignored </label>' +
                        '   <input type="checkbox" '+ (_this.ShowVoteBalance ? "checked" : "") +' id="balance"/><label for="balance"> votes </label><br>' +
                        '   <a href="javascript:void(0)" id="save" class="btn-whoaverse-paging btn-xs btn-default btn-sub">Save</a>' +
                       '</fieldset>';

            htmlStr += htmlNavButtons;

            htmlStr += '<input style="display:none;" id="AVE_Dashboard_usertag_quickedit" data="colour" style="width:50px;" type="color" original="#FFFFFF" value="#FFFFFF">';

            var htmlTable = "";
            htmlTable += '<table id="AVE_Dashboard_usertags_table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th>Username</th>' +       //click to go to user page
                                    '<th>Tag</th>' +            //click to show input box
                                    '<th>Colour</th>' +         //click to show color picker
                                    '<th>Ignored</th>' +        //click to toggle ignore
                                    '<th>Vote</th>' +           //click to show input box
                                    '<th>Context</th>' +        //click to show Context box
                                    '<th>Preview</th>' +
                                    '<th role="remove"></th>' + //click to remove entire tag
                                '</tr>' +//ADD context (as [link] click to go to, icon to edit (prompt alert)
                            '</thead>';
            htmlTable +=    this.paging(start, this.tagsperpage);
            htmlTable += "</table>";

            htmlStr += htmlTable;

            htmlStr += '<div style="text-align:right;margin-bottom:10px;">Showing entries '+ (start+1) +' to '+ Math.min(this.usertags.length, start+this.tagsperpage) +' ('+this.usertags.length+' total)</div>';

            htmlStr += htmlNavButtons;

            htmlStr +='<br><div style="margin-top:20px;font-weight:bold;">Click on a value to modify it.'+
                '<br> Click the buttons on either sides to navigate through the table pages or use the arrow keys (+Ctrl to go to the first or last page)';

            htmlStr += '<br>Context: <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#'+(AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB")+'"d="M12,0H2C0.896,0,0,0.896,0,2v7c0,1.104,0.896,2,2,2h1v3l3-3h6c1.104,0,2-0.896,2-2V2C14,0.896,13.104,0,12,0z"/></svg>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;None: <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#'+(AVE.Utils.CSSstyle === "dark" ? "444" : "f2f2f2" )+'" d="M12,0H2C0.896,0,0,0.896,0,2v7c0,1.104,0.896,2,2,2h1v3l3-3h6c1.104,0,2-0.896,2-2V2C14,0.896,13.104,0,12,0z"/></svg>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Edit: <svg title="Edit" style="cursor:pointer;" version="1.1" id="editContext" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '" d="M1,10l-1,4l4-1l7-7L8,3L1,10z M11,0L9,2l3,3l2-2L11,0z"/></svg>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Peek: <svg version="1.1" id="peakContext" title="A comment or an URL would be here"  style="cursor:help;" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + ';" d="M7,2C3,2,0,7,0,7s3,5,7,5s7-5,7-5S11,2,7,2z M7,10c-1.657,0-3-1.344-3-3c0-1.657,1.343-3,3-3 s3,1.343,3,3C10,8.656,8.657,10,7,10z M7,6C6.448,6,6,6.447,6,7c0,0.553,0.448,1,1,1s1-0.447,1-1C8,6.447,7.552,6,7,6z"/></svg>' +
                '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Open link: <svg title="Open in new tab" style="cursor:alias;" version="1.1" id="openInTab" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + ';" d="M13,4L9,0v3C6,3,1,4,1,8c0,5,7,6,7,6v-2c0,0-5-1-5-4s6-3,6-3v3L13,4z"/></svg>' +
                '</div>';

            return htmlStr;
        },
        callback: function () {
            "use strict";
            var _this = this;
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:last-child') //remove
                .off()
                .on("mouseover", function () {
                    $(this).parent().css("background", _this.MouseOverColours[1]);
                })
                .on("mouseleave", function () {
                    $(this).parent().css("background", "");
                })
                .on("click", function () {
                    var name = $(this).parent().attr("username");
                    if (confirm("Are you sure you want to delete "+name+"'s tag?")){
                        _this.module.RemoveTag(name);
                        $(_this.CSSselector).trigger("click");
                    }
                });
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(2)') //edit tag
                .off()
                .on("click", function (e, artificial) {
                    var tag = $(this).text() || $(this).find("input").val() || "";

                    if ($(this).find("input").length === 0){
                        $(this).html('<input id="AVE_Dashboard_usertag_quickedit" data="tag" style="max-width:140px;" type="text" original="'+tag+'" value="'+tag+'">');
                        var input = $(this).find("input");
                        input.focus().select();
                        input.one("focusout", function () {
                            input.val(input.attr("original"));
                            $(this).trigger("click", true);
                        });
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus because of a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+tag+'">'+tag+'</span>');
                    }
                });
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(3)') //edit colour
                .off()
                .on("click", function (e, artificial) {
                    var colour = $(this).text() || $(this).find("input").val();

                    if ($(this).find("input").length === 0){
                        var input = $("input#AVE_Dashboard_usertag_quickedit[type='color'][data='colour']");
                        input.attr("original", colour).attr("u", $(this).parent().attr("username")).val(colour);
                        input.one("change", function () {
                            _this.editTag(input, "colour");
                        });
                        input.show().css("opacity", "0"); //Because of Chrome which doesn't want to show the colour palette if the input is hidden ("display: none;")
                        input.trigger("click");
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus by a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+colour+'">'+colour+'</span>');
                    }
                });
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(4)') //edit ignore
                .off()
                .on("click", function () {
                    var ignore, newval;
                    ignore = $(this).text();
                    newval = ignore === "No" ? "Yes" : "No";

                    $(this).text(newval);
                    _this.editTag($(this), "ignore");
                });
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(6)') //Show context option (goto link, edit)
                .off()
                .on("mouseenter", function () { //Display option box
                    var JqId = $(this);
                    var boxHtml = ''; //Edit : Forward

                    var context = JqId.attr("title");

                    boxHtml += '<svg title="Edit" style="cursor:pointer;" version="1.1" id="editContext" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '" d="M1,10l-1,4l4-1l7-7L8,3L1,10z M11,0L9,2l3,3l2-2L11,0z"/></svg>';

                    if(context){
                        var url;
                        boxHtml += '<svg version="1.1" id="peakContext" title="'+context+'"  style="cursor:help;" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + ';" d="M7,2C3,2,0,7,0,7s3,5,7,5s7-5,7-5S11,2,7,2z M7,10c-1.657,0-3-1.344-3-3c0-1.657,1.343-3,3-3 s3,1.343,3,3C10,8.656,8.657,10,7,10z M7,6C6.448,6,6,6.447,6,7c0,0.553,0.448,1,1,1s1-0.447,1-1C8,6.447,7.552,6,7,6z"/></svg>';

                        if (!/^http/.test(context)) { url = "https://" + window.location.hostname + context; }
                        else{ url = context; }
                        boxHtml += '<svg onclick="window.open(\''+url+'\');return false;" title="Open in new tab" style="cursor:alias;" version="1.1" id="openInTab" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + ';" d="M13,4L9,0v3C6,3,1,4,1,8c0,5,7,6,7,6v-2c0,0-5-1-5-4s6-3,6-3v3L13,4z"/></svg>';
                    }
                    $(this).html(boxHtml)
                        .css("background-image", "none");

                    $("svg#editContext").on("click", function () {
                        var newcontext = prompt(context ? "Choose new context" : "Edit context", context);
                        if (newcontext === null){newcontext = context;}
                        JqId.attr("title", newcontext);
                        _this.editTag(JqId, "context");
                    });
                })
                .on("mouseleave", function () { //Hide option box
                    $("svg#editContext").off();
                    $(this).html("")
                        .css("background-image", "");
                })
                .on('dblclick', function() { //If a context exists try to open it in a new page
                    if($(this).is(":not([title])")){return;}
                    var url = $(this).attr("title");
                    if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                });
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(5)') //edit vote-balance
                .off()
                .on("click", function (e, artificial) {
                    var balance = $(this).text() || $(this).find("input").val();

                    if ($(this).find("input").length === 0){
                        $(this).html('<input id="AVE_Dashboard_usertag_quickedit" data="balance" style="text-align:center;width:50px;" type="number" original="'+balance+'" value="'+balance+'" step="1">');
                        var input = $(this).find("input");
                        input.focus().select();
                        input.one("focusout", function () {
                            input.val(input.attr("original"));
                            $(this).trigger("click", true);
                        });
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus by a click in the same input text
                        $(this).find("input").off();
                        $(this).html(balance);
                    }
                });
            $('a#AVE_Dashboard_navigate_tags') //navigate with buttons
                .off()
                .on("click", function () {
                    if ($(this).hasClass("btn-unsub")){return false;}

                    switch ($(this).attr('role')) {
                        case "prev":
                            _this.currpage--;
                            break;
                        case "next":
                            _this.currpage++;
                            break;
                        case "first":
                            _this.currpage = 0;
                            break;
                        case "last":
                            _this.currpage = Math.ceil((_this.usertags.length - _this.tagsperpage) / _this.tagsperpage);
                            break;
                        default:
                            return;
                    }

                    $(_this.CSSselector).trigger("click");
                });

            var JqIdOpt = $("fieldset#AVE_Dashboard_usertags_options");
            JqIdOpt.find("legend").off().on("click", function () {
               if ($(this).parent().find("input:first").is(':hidden')){
                   $(this).parent().find("*").show();
               } else {
                   $(this).parent().find("*").hide();
               }
                $(this).show();
            }).trigger("click");
            JqIdOpt.find("a#save").off().on("click", function () {

                _this.ShowVoteBalance = JqIdOpt.find("input#balance").is(":checked");
                _this.ShowIgnore = JqIdOpt.find("input#ignore").is(":checked");
                _this.ShowTag = JqIdOpt.find("input#tag").is(":checked");
                _this.tagsperpage = parseInt(JqIdOpt.find("input#elperpage").val(), 10) || 20;

                if (_this.tagsperpage < 1) {_this.tagsperpage = 20;}

                _this.SaveOptions();
                $(_this.CSSselector).trigger("click");
            });

            $(document)
                .off()
                .on("keyup", function (event) {
                    var ctrl, pos, input;
                    ctrl= event.ctrlKey;

                    input = $("input#AVE_Dashboard_usertag_quickedit:not([type='color'])");

                    if (input.length === 0){ //navigate with arrow keys
                        //We don't want to change page when a user is using the arrow key to edit a value
                        if (event.which === 37){
                            pos = (ctrl ? "first" : "prev");
                        } else if (event.which === 39){
                            pos = (ctrl ? "last" : "next");
                        }
                        if (pos){
                            $('a#AVE_Dashboard_navigate_tags[role="'+ pos +'"]:first').trigger("click");
                        }
                    }

                    if (event.which === 13){ //Press enter to confirm change
                        _this.editTag(input, input.attr("data"));
                    }
                });
        },

        editTag: function (input, dtype) {
            "use strict";
            var _this = this;

            if (input.length === 1){
                if (input.attr("original") === input.val() && dtype !== "ignore"){input.trigger("click", true);return;}//No need to update nor reload if nothing changed
                var root, tag, usertag;

                if (dtype === "colour"){
                    var u  = input.attr("u");
                    root = $("tr[username='"+u+"']");
                } else {
                    root = input.parents("tr:first");
                }

                usertag = {};
                usertag.username = root.attr("username");
                usertag.i = root.find("td[data='ignore']").text() === "Yes";
                usertag.con = root.find("td[data='context']").attr("title");
                if (!usertag.con){delete usertag.con;}

                if (dtype === "tag"){
                    usertag.t = input.val();
                } else {
                    usertag.t = root.find("td[data='tag']").text();
                }

                if (dtype === "colour"){
                    usertag.col = input.val() || input.attr("original");
                } else {
                    usertag.col = root.find("td[data='colour']").text();
                }

                if (dtype === "balance"){
                    var newval = input.val();
                    usertag.b = parseInt((isNaN(newval) || newval === "") ? input.attr("original") : input.val(), 10);
                } else {
                    usertag.b = parseInt(root.find("td[data='balance']").text(), 10);
                }

                _this.module.SetTag(usertag); //save tag

                $(_this.CSSselector).trigger("click"); //Reload-update
            }
        },

        navbuttons: function () {
            var htmlNavButtons = "";
            htmlNavButtons += '<div style="float:left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="first" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">First</a>' +
                '</div>';
            htmlNavButtons += '<div style="float:left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="prev" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">Previous</a>' +
                '</div>';
            htmlNavButtons += '<div style="float:right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="last" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.usertags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Last</a>' +
                '</div>';
            htmlNavButtons += '<div style="float:right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="next" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.usertags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Next</a>' +
                '</div>';
            return htmlNavButtons;
        },

        paging: function (start, nb) {
            var colour, r, g, b, bestColour;

            var htmlStr = "";
            var obj = {};

            for (i=start; i <= start+nb-1; i++){
                if (i >= this.usertags.length){break;}

                obj = JSON.parse(this.usertags[i]);

                if (obj.col){
                    colour = AVE.Utils.GetRGBvalues(obj.col);
                    r = colour[0]; g = colour[1]; b = colour[2];
                    bestColour = AVE.Utils.GetBestFontColour(r, g, b);
                } else {
                    bestColour = "white";
                }

                var VoteColour = "";
                if (this.module.Options.ShowBalanceWithColourGradient.Value && obj.b){
                    var Vr, Vg, Vb;
                    var valence = obj.b > 0;

                    var limit = this.module.Options.ColourGradientRangePos.Value;
                    var progValence = valence ?
                        Math.min(this.module.Options.ColourGradientRangePos.Value, obj.b) : Math.max(this.module.Options.ColourGradientRangeNeg.Value, obj.b);
                    if (!valence){
                        limit = this.module.Options.ColourGradientRangeNeg.Value;
                    }

                    Vr = Vg = Vb = parseInt(210 - progValence/limit * 210, 10);
                    if (valence) { Vg = 255; }
                    else { Vr = 255; }
                    VoteColour = 'color:#262626;background-color:rgb('+Vr+','+Vg+','+Vb+')';
                }

                htmlStr += '<tr username="'+obj.name+'">';
                htmlStr +=      '<td><a target="_blank" href="/user/'+obj.name+'" >'+obj.name+'</a></td>' +
                                '<td data="tag"><span title="'+obj.t+'">'+(obj.t || "")+'</span></td>';
                if (obj.col){
                    htmlStr +=  '<td data="colour" style="background-color:'+obj.col+';color:'+bestColour+';">'+obj.col+'</td>';
                } else {
                    htmlStr +=  '<td data="colour" title="You need to set a tag before choosing a colour" style="cursor:not-allowed;background-color:rgba(0,0,0,0);color:'+bestColour+';">None</td>';
                }
                htmlStr +=      '<td data="ignore">'+obj.i+'</td>' +
                                '<td data="balance" style="'+VoteColour+'">'+obj.b+'</td>' +
                                '<td data="context" '+ (obj.con ? ('title="'+obj.con+'"') : '') +'></td>' +
                                '<td><span id="PreviewBox" style="background-color:'+obj.col+';color:'+bestColour+';">'+(obj.t || "None")+'</span></td>' +
                                '<td role="remove_icon"></td>';
                htmlStr += "</tr>";
            }
            return htmlStr;
        },

        destructor: function () {
            //set all listeners to off
        }
    }
};
/// END User tagging ///

/// Toggle media:  Add a button to toggle chosen media types. ///
AVE.Modules['ToggleMedia'] = {
    ID: 'ToggleMedia',
    Name: 'Toggle media',
    Desc: 'Add a button to toggle chosen media types.',
    Category: 'Posts',

    Index: 5,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        MediaTypes: {
            Type: 'string',
            Value: "110" // Images, Videos, self-Texts
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];
        var opt = {};
        opt.Enabled = POST.Enabled;
        opt.MediaTypes = (POST.Images ? "1" : "0") + (POST.Videos ? "1" : "0") + (POST["self-texts"] ? "1" : "0");

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(opt));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    sel: [],
    ImgMedia: "[title^='JPG'],[title^='PNG'],[title^='GIF'],[title^='Gfycat'],[title^='Gifv'],[title^='Imgur Album']",
    VidMedia: "[title^='YouTube'],[title^='Vimeo']",
    SelfText: "[onclick^='loadSelfText']",
    // voat.co/v/test/comments/37149

    Start: function () {
        var AcceptedTypes = this.Options.MediaTypes.Value;
        if (AcceptedTypes !== "000" && $.inArray(AVE.Utils.currentPageType, ["subverses", "sets", "mysets", "user", "user-manage", "about"]) === -1) {

            var strSel = (AcceptedTypes[0] === "1" ? this.ImgMedia + "," : "") +
                         (AcceptedTypes[1] === "1" ? this.VidMedia + "," : "") +
                         (AcceptedTypes[2] === "1" ? this.SelfText : "");

            if (strSel[strSel.length - 1] === ",")
            { strSel = strSel.slice(0, -1); }

            this.sel = $(strSel).filter(':parents(.titlebox)') //Remove from selection all media in the subverse's bar.
                                .filter(function () {
                                    if ($(this).parents("div.submission[class*='id-']:first").css("opacity") === "1") {
                                        //Is this element in a submission post and not a duplicate inserted by NeverEndingVoat?
                                        //Is this element a link to a media in a self-post?
                                        return ($(this).next("span.link-expando-type").length > 0)
                                           ||   $(this).hasClass("expando-button");
                                    }
                                    //Is this element in a comment?
                                    return ($(this).parents("div.md").length > 0)
                                    //Does it contain an expando element?
                                        && ($(this).find("span.link-expando-type").length > 0);
                                });
                                
            print("AVE: ToggleMedia count > "+this.sel.length.toString(), true);

            this.AppendToPage();
            this.Listeners();
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        if (this.sel.length === 0) { return; }

        var JqId = $("a#GM_ExpandAllImages");
        if (JqId.length > 0) {
            JqId.text(JqId.text().replace(/\([0-9]*\)/, "(" + this.sel.length + ")"));
        }
        else {
            var btnHTML = '<li class="disabled"><a style="cursor:pointer;" id="GM_ExpandAllImages" class="contribute submit-text">View Media (' + this.sel.length + ')</a></li>';
            $(btnHTML).insertAfter(".disabled:last");
        }
    },

    Listeners: function () {
        var _this = this;
        var isExpanded = false;
        var JqId = $("a#GM_ExpandAllImages");
        JqId.off("click");
        JqId.on("click", function () {
            if ($(this).hasClass("expanded")) {
                $(this).text('View Media (' + _this.sel.length + ')');
                $(this).removeClass("expanded");
                isExpanded = false;
            } else {
                $(this).text('Hide Media (' + _this.sel.length + ')');
                $(this).addClass("expanded");
                isExpanded = true;
            }
            _this.ToggleMedia(isExpanded);
        });
    },

    ToggleMedia: function (state) {
        for (var el in this.sel.get()) {
            if (
                (state && this.sel.eq(el).parent().find(".expando,.link-expando").length == 0) ||
                 state === this.sel.eq(el).parent().find(".expando,.link-expando").first().is(':hidden')
                )
            {
                //A click on a media that failed (e.g. error 404) will redirect instead of toggling the expando.
                if (this.sel.eq(el).find("span.link-expando-type").text() !== "Error") {
                    this.sel[el].click();
                }
            }
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ToggleMedia'];
            var mediaTypes = ["Images", "Videos", "self-texts"];
            var value = _this.Options.MediaTypes.Value;
            var htmlString = '<div>';
            for (var i in mediaTypes) {
                htmlString += '<span style="margin-right:20px;" >' +
                              '<input ' + (value[i] == 1 ? 'checked="checked"' : '') + ' id="' + mediaTypes[i] + '" name="' + mediaTypes[i] + '" type="checkbox">' +
                               '<label for="' + mediaTypes[i] + '">' + mediaTypes[i] + '</label>' +
                               '</span>';
            }

            return htmlString + '</div>';
        }
    }
};
/// END Toggle media ///

/// Hide submissions:  Hide vote with the keyboard or automatically after voting on submissions. ///
AVE.Modules['HideSubmissions'] = {
    ID: 'HideSubmissions',
    Name: 'Hide submissions',
    Desc: 'Hide vote with the keyboard or automatically after voting on submissions.',
    Category: 'Subverse',

    Index: 10, //early so that other modules don't do unnecessary processing on submissions that will get removed
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        HideDownvoted: {
            Type: 'boolean',
            Desc: "Hide submissions you downvote.",
            Value: false
        },
        HideUpvoted: {
            Type: 'boolean',
            Desc: "Hide submissions you upvote.",
            Value: false
        },
        HideRightAway: {
            Type: 'boolean',
            Desc: "Hide the submission as soons as marked hidden by clicking the \"hide\" button or pressing the hide key",
            Value: false
        },
        HideAfterVote: {
            Type: 'boolean',
            Desc: "Hide the submission right after the vote is registered.",
            Value: false
        },
        HideAfterView: {
            Type: 'boolean',
            Desc: "Hide the submission after viewing it (opening its link).",
            Value: false
        },
        AddHideButton: {
            Type: 'boolean',
            Desc: "Insert a \"hide\" button.",
            Value: true
        },
        MaxStorage: {
            Type: 'int',
            Range: [1,5000],
            Desc: "Max number of submissions to remember",
            Value: 400
        }
    },

    OriginalOptions: "",
    StorageName: "",
    HiddenPosts: [],

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
        //this.Store.SetValue(this.StorageName, "[]");
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "saved"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_Hidden";
            this.HiddenPosts = JSON.parse(this.Store.GetValue(this.StorageName, "[]"));

            this.Pruning();
            this.Start();
        }
    },

    Pruning: function(){
        var count;
        count =this.HiddenPosts.length - this.Options.MaxStorage.Value;

        if (count < 1) {return;}

        count += Math.ceil(this.Options.MaxStorage.Value / 8); //If over the limit we remove 1/8th of the total value

        this.HiddenPosts.splice(0,count);
        this.Store.SetValue(this.StorageName, JSON.stringify(this.HiddenPosts));
    },

    AddToHiddenList: function (id, vote) {
        if ($.inArray(id.toString(), this.HiddenPosts) !== -1){this.RemoveFromHiddenList(id);return;}

        this.HiddenPosts.push(id);
        this.Store.SetValue(this.StorageName, JSON.stringify(this.HiddenPosts));

        var JqId = $("div.submission.id-"+id.toString());

        if (   (!vote && this.Options.HideRightAway.Value)
            || (vote && this.Options.HideAfterVote.Value)){
            JqId.remove();
            print("AVE: HideSubmissions > removing submission with id "+id);
        } else if(this.Options.AddHideButton.Value) {
            JqId.find("ul.flat-list.buttons").find("li > a#AVE_HideSubmissions_link").text("unhide");
        }

        print("AVE: HideSubmissions > hiding submission with id "+id);
    },

    RemoveFromHiddenList: function (id) {
        this.HiddenPosts.splice(this.HiddenPosts.indexOf(id), 1);
        this.Store.SetValue(this.StorageName, JSON.stringify(this.HiddenPosts));

        if (this.Options.AddHideButton.Value){
            $("div.submission.id-"+id.toString()).find("ul.flat-list.buttons").find("li > a#AVE_HideSubmissions_link").text("hide");
        }

        print("AVE: HideSubmissions > unhiding submission with id "+id);
    },

    Start: function () {
        var _this = this;
        $("div.submission").each(function () {
            var id = $(this).attr("data-fullname");
            if (id && $.inArray(id.toString(), _this.HiddenPosts) !== -1){
                $(this).remove();
                print("AVE: HideSubmissions > removing submission with id "+id);
            }
        });

        if (this.Options.AddHideButton.Value){
            this.AppendToPage();
        }
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        $("ul.flat-list.buttons").each(function () {
            if ($(this).find("li > a#AVE_HideSubmissions_link").length > 0) {return;}
            $(this).append('<li><a id="AVE_HideSubmissions_link" href="javascript:void(0);">hide</a></li>');
        });
    },

    obsVoteChange: null,

    Listeners: function () {
        var _this = this;

        if (this.Options.AddHideButton.Value) {
            $("li > a#AVE_HideSubmissions_link").off().on("click", function () {
                var id = $(this).parents("div.submission:first").attr("data-fullname");
                _this.AddToHiddenList(id);
            });
        }

        if (this.Options.HideAfterView.Value){
            var id;
            $("a.title.may-blank").off().on("mouseup", function (e) {
                if (e.which > 2) {return;} //Left or middle click
                id = $(this).parents("div.submission:first").attr("data-fullname");

                if ($.inArray(id.toString(), this.HiddenPosts) !== -1){return;}
                _this.AddToHiddenList(id, "spe");
            });
        }

        if (this.Options.HideDownvoted.Value || this.Options.HideUpvoted.Value) {
            if (this.obsVoteChange) { this.obsVoteChange.disconnect(); }
            this.obsVoteChange = new OnAttrChange($("div[class*='midcol']"), function (e) {
                if (!e.oldValue || e.oldValue.split(" ").length !== 2) { return true; }
                var id = $(this).parents("div.submission:first").attr("data-fullname");
                if (id){
                    var voteType = $(e.target).attr("class").split(" ")[1];
                    if( (voteType === "likes"    && _this.Options.HideUpvoted.Value) ||
                        (voteType === "dislikes" && _this.Options.HideDownvoted.Value)){
                        _this.AddToHiddenList(id, true);
                    }
                }
            });
            this.obsVoteChange.observe();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['HideSubmissions'];
            var htmlStr = '';

            htmlStr += '<label style="display:inline;" for="MaxStorage"> ' + _this.Options.MaxStorage.Desc + ': </label><input style="width: 60px;" id="MaxStorage" type="number" name="MaxStorage" value="'+_this.Options.MaxStorage.Value+'" min="1" max="5000"> (Currently: '+ Object.keys(_this.HiddenPosts).length+')<br><br>';

            htmlStr += '<input id="HideUpvoted" ' + (_this.Options.HideUpvoted.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideUpvoted"> ' + _this.Options.HideUpvoted.Desc + '</label><br>';
            htmlStr += '<input id="HideDownvoted" ' + (_this.Options.HideDownvoted.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideDownvoted"> ' + _this.Options.HideDownvoted.Desc + '</label><br>';
            htmlStr += '<input id="HideAfterVote" ' + (_this.Options.HideAfterVote.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideAfterVote"> ' + _this.Options.HideAfterVote.Desc + '</label><br>';
            htmlStr += '<input id="HideRightAway" ' + (_this.Options.HideRightAway.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideRightAway"> ' + _this.Options.HideRightAway.Desc + '</label>';
            if (AVE.Modules['ShortKeys']){
                var key = AVE.Modules['ShortKeys'].Options.HidePost.Value || "Enter/Return";
                htmlStr += ' ("<strong>'+key+'</strong>").<br>';
            } else {
                htmlStr += ' (disabled).<br>';
            }
            htmlStr += '<input id="HideAfterView" ' + (_this.Options.HideAfterView.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideAfterView"> ' + _this.Options.HideAfterView.Desc + '</label><br><br>';

            htmlStr += '<input id="AddHideButton" ' + (_this.Options.AddHideButton.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AddHideButton"> ' + _this.Options.AddHideButton.Desc + '</label><br>';

            return htmlStr;
        }
    }
};
/// END Hide submissions ///

/// Select posts:  A click selects/highlights a post. ///
AVE.Modules['SelectPost'] = {
    ID: 'SelectPost',
    Name: 'Select posts',
    Desc: 'A click selects/highlights a post.',
    Category: 'Posts',

    Enabled: false,
    Index: 19, //Must be before ShortKeys

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        ContentColour: {
            Type: 'array',
            Value: ['#323E47', '#F4FCFF']
        },
        QuoteCodeColour: {
            Type: 'array',
            Value: ['#394856', '#EAFEFF']
        },
        VoteCountBoxColour: {
            Type: 'array',
            Value: ['#2D4A60', '#E1F9FF']
        },
        ContextColour: {
            Type: 'array',
            Value: ['background-color: #482C2C !important; border: 1px solid #A23E3E !important;',
                    'background-color: #D5F0FF !important; border: 1px solid #4B96C4 !important;']
        }
    },

    OriginalOptions: {},

    SavePref: function (POST) {
        var _this = this;
        var colours = ["ContentColour", "QuoteCodeColour", "VoteCountBoxColour", "ContextColour"];
        POST = POST[_this.ID];

        $.each(colours, function (index, value) {
            _this.Options[value].Value[AVE.Utils.CSSstyle === "dark" ? 0 : 1] = POST[value];
            POST[value] = _this.Options[value].Value;
        });

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        if (Opt.Enabled && Opt.Enabled.hasOwnProperty("Value")){
            //Migrate
            var POST = {};
            POST.Enabled = Opt.Enabled.Value;
            $.each(Opt, function (key) {
                if(key === "Enabled") {return true;}

                POST[key] = Opt[key].Value;
            });
            this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
            Opt = POST;
        }

        $.each(Opt, function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    Listeners: function () {
        var _this = this;
        $("div.submission[class*='id-'], div.comment[class*='id-']").off("click")
                                                                    .on("click", function (event) {
            _this.ToggleSelectedState($(this).find(".entry:first"));
            event.stopPropagation();
        });
    },
    
    ToggleSelectedState: function (obj) {
        var _this = this;
        var style = (AVE.Utils.CSSstyle === "dark" ? 0 : 1);

        if (AVE.Utils.SelectedPost !== undefined) {
            AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").css('background-color', '');
            AVE.Utils.SelectedPost.find("blockquote").css('background-color', '');
            AVE.Utils.SelectedPost.find("pre").css('background-color', '');

            if (AVE.Utils.currentPageType === "user-submissions") {
                AVE.Utils.SelectedPost.parent().find(".submission.even.link._this").css('background-color', '');
                AVE.Utils.SelectedPost.parent().css('background-color', '');
                AVE.Utils.SelectedPost.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', '');
            }
            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("highlightedComment"))
            { AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").attr('style', ''); }

            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("submission"))
            { AVE.Utils.SelectedPost.find(".md").css('background-color', ''); }
        }

        obj.parents("div[class*=' id-']:first").css('background-color', _this.Options.ContentColour.Value[style]);
        obj.find("blockquote").css('background-color', _this.Options.QuoteCodeColour.Value[style]);
        obj.find("pre").css('background-color', _this.Options.QuoteCodeColour.Value[style]);

        //Special case: user/username/submissions
        if (AVE.Utils.currentPageType === "user-submissions") {
            obj.parent().find(".submission.even.link._this").css('background-color', _this.Options.ContentColour.Value[style]);
            obj.parent().css('background-color', _this.Options.ContentColour.Value[style]);
            obj.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', _this.Options.VoteCountBoxColour.Value[style]);
        }
        //Special case: highlighted comment
        if (obj.parents("div[class*=' id-']:first").hasClass("highlightedComment")) {
            obj.parents("div[class*=' id-']:first").attr('style', _this.Options.ContextColour.Value[style]);
        }
        //Special: is a submission post, not a comment.
        if (obj.parents("div[class*=' id-']:first").hasClass("submission"))
        { obj.find(".md").css('background-color', _this.Options.QuoteCodeColour.Value[style]); }

        AVE.Utils.SelectedPost = obj;
    },

    AppendToPreferenceManager: {
        html: function () {
            var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
            var _this = AVE.Modules['SelectPost'];
            var htmlStr = "";
            htmlStr += "<div>Background colours (" + AVE.Utils.CSSstyle + " theme):</div>";
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_ContentColour"></div>';
            htmlStr += ' <input style="display:inline;width:60px;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="ContentColour" Value="' + _this.Options.ContentColour.Value[style] + '"/> - Post<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_QuoteCodeColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="QuoteCodeColour" Value="' + _this.Options.QuoteCodeColour.Value[style] + '"/> - Quote and Code<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_VoteCountBoxColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="VoteCountBoxColour" Value="' + _this.Options.VoteCountBoxColour.Value[style] + '"/> - Vote box in submissions page<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_ContextColour"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:340px;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="ContextColour" Value="' + _this.Options.ContextColour.Value[style] + '"/> - Context comment<br />';
            return htmlStr;
        },
        callback: function () {//ContentColour QuoteCodeColour VoteCountBoxColour ContextColour
            var _this = AVE.Modules['SelectPost'];

            $("input[id='ContentColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
            $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
            $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
            $("input[id='ContextColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContextColour").attr("style", "display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" + $("input[id='ContextColour'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
        }
    }
};
/// END Select posts ///

/// Shortcut keys:  Use your keyboard to navigate Voat. Leave field empty for Enter/Return key. ///
AVE.Modules['ShortKeys'] = {
    ID: 'ShortKeys',
    Name: 'Shortcut keys',
    Desc: 'Use your keyboard to navigate Voat. Leave field empty for Enter/Return key.',
    Category: 'Posts',

    Enabled: false,
    Index: 20,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        OpenInNewTab: {
            Type: 'boolean',
            Desc: 'Open comments and link pages in new tabs.',
            Value: true
        },
        OpenInArchive: {
            Type: 'boolean',
            Desc: 'Open link page in <strong>archives.is</strong>.',
            Value: false
        },
        UpvoteKey: {
            Type: 'char',
            Value: 'a'
        },
        DownvoteKey: {
            Type: 'char',
            Value: 'z'
        },
        NextKey: {
            Type: 'char',
            Value: 'j'
        },
        PrevKey: {
            Type: 'char',
            Value: 'k'
        },
        OpenCommentsKey: {
            Type: 'char',
            Value: 'c'
        },
        OpenLinkKey: {
            Type: 'char',
            Value: 'l'
        },
        OpenLCKey: {
            Type: 'char',
            Value: 'b'
        },
        ExpandKey: {
            Type: 'char',
            Value: 'x'
        },
        ToggleCommentChain: {
            Type: 'char',
            Value: ''
        },
        NavigateTop: {
            Type: 'char',
            Value: 'f'
        },
        NavigateBottom: {
            Type: 'char',
            Value: 'v'
        },
        HidePost: {
            Type: 'char',
            Value: 'h'
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    ResetPref: function () {
        this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (!AVE.Modules['SelectPost'] || !AVE.Modules['SelectPost'].Enabled) { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        var shift, ctrl,
            up = this.Options.UpvoteKey.Value,
            down = this.Options.DownvoteKey.Value,
            next = this.Options.NextKey.Value,
            previous = this.Options.PrevKey.Value,
            OpenC = this.Options.OpenCommentsKey.Value,
            OpenL = this.Options.OpenLinkKey.Value,
            OpenLC = this.Options.OpenLCKey.Value,
            Expand = this.Options.ExpandKey.Value,
            TCC = this.Options.ToggleCommentChain.Value,
            NavTop = this.Options.NavigateTop.Value,
            NavBottom = this.Options.NavigateBottom.Value,
            HidePost = this.Options.HidePost.Value;

        $(document).keydown(function (event) {
            shift = event.shiftKey;
            ctrl = event.ctrlKey;

            //Exit if the CSSEditor panel has the focus
            if ($("style#custom_css.AVE_custom_css_editable").is(":focus")){return;}

            //Exit if the focus is given to a text input
            if ($(":input").is(":focus")) {
                if (ctrl && event.which === 13){
                    var inp = $("textarea#Content.commenttextarea:focus");
                    if (inp.length === 0){return;}

                    var submitbtn = inp.nextAll("input#submitbutton:first"); //
                    if (submitbtn.length === 0){
                        submitbtn = inp.parent().parent().nextAll("input#submitbutton:first");
                    }
                    submitbtn.trigger("click");
                }
                return;
            }

            //Exit if a key modifier is pressed (ctrl, shift)
            if (ctrl || shift) { return; }

            var sel = AVE.Utils.SelectedPost;
            var key;

            if (event.key === undefined) { //Chrome
                key = String.fromCharCode(event.keyCode).toUpperCase();
            } else {
                key = event.key.toUpperCase();
            }

            if (event.which === 13) { key = ""; } //Enter/Return key

            if (key === NavTop.toUpperCase()) { // Navigate to the top of the page
                //Scroll to top
                //Set first post as selected
                var obj = $("div.submission[class*='id']:first,div.comment[class*='id']:first").first();
                if (AVE.Modules['SelectPost']) { AVE.Modules['SelectPost'].ToggleSelectedState(obj.find(".entry:first")); }
                $(window).scrollTop(0);
            } else if (key === NavBottom.toUpperCase()) { // Navigate to the bottom of the page
                //Scroll to bottom
                $(window).scrollTop($(document).height());
                //Set last post as selected
                var obj = $("div.comment[class*='id']:last");
                if (obj.length === 0) { obj = $("div.submission[class*='id']:last"); }
                if (AVE.Modules['SelectPost']) { AVE.Modules['SelectPost'].ToggleSelectedState(obj.find(".entry:first")); }
            }

            //All following keys need a post selected to work
            if (!AVE.Utils.SelectedPost) {  return; }

            if (key === up.toUpperCase()) { // upvote
                sel.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
            } else if (key === down.toUpperCase()) { // downvote
                sel.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
            } else if (key === next.toUpperCase()) { // next post
                if (sel.parent().hasClass("submission")) {
                    //Submissions
                    var _next = sel.parent().nextAll("div.submission[class*='id-']:first");
                    if (_next.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(_next.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    } else if (AVE.Modules['NeverEndingVoat'] && AVE.Modules['NeverEndingVoat'].Enabled) {
                        //If the NeverEnding modules exists and is enabled, we load the next page.
                        AVE.Modules['NeverEndingVoat'].LoadMore();
                    }
                } else {
                    //Comment
                    var id = sel.parent().prop("class").split(" ")[1];
                    // :visible because comments could be hidden, with the ToggleChildComment module
                    var a = sel.parent().find("div[class*='id-']:visible").get(0) || //Child
                            $("div." + id + " ~ div[class*='id-']:visible").get(0); //Sibling

                    if (!a) { //Not a direct parent
                        var tempSel = sel.parent();
                        var tempID = id;
                        var count = 0;
                        while (!a) {
                            tempSel = $(tempSel.parent("div[class*='id-']").get(0) ||
                                      $("div." + tempID + " ~ div[class*='id-']:visible").get(0));
                            if (tempSel.length === 0) { break; }

                            if (tempSel.nextAll("div[class*='id-']:visible:last").length > 0) {
                                tempID = tempSel.nextAll("div[class*='id-']:visible:last").attr("class").split(" ")[1];
                            }
                            if (tempID !== id) {
                                a = $("div." + tempSel.nextAll("div[class*='id-']:visible:first").attr("class").split(" ")[1]);
                                break;
                            }
                            count++;
                            if (count > 30) { print("AVE: breaking endless loop > looking for next comment"); break; }
                        }
                    }

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    } else { $("a#loadmorebutton").click(); }
                }

            } else if (key === previous.toUpperCase()) { // previous post
                if (sel.parent().hasClass("submission")) { // select by page type not class
                    //Submissions
                    var prev = sel.parent().prevAll("div.submission[class*='id-']:first");
                    if (prev.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(prev.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    }
                } else {
                    //Comment
                    //var id = sel.parent().prop("class").split(" ")[1];

                    var a = sel.parent().prevAll("div[class*='id-']:visible:first").find("div[class*='id-']:visible:last").get(0) || //Parent's child
                            sel.parent().prevAll("div[class*='id-']:visible:first").get(0) || //Sibling
                            sel.parent().parent("div[class*='id-']:visible").get(0); //Parent

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    }
                    //if (!a) No previous comment
                }

            } else if (key === OpenC.toUpperCase()) { // Open comment page
                if (!sel.parent().hasClass("submission")) { return; }

                var url = "https://" + window.location.hostname +sel.find("a.comments").attr("href");
                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                } else {
                    window.location.href = url;
                }
            } else if (key === OpenL.toUpperCase()) { // Open link page
                if (!sel.parent().hasClass("submission")) { return; }
                var url = sel.find("a.title").attr("href");

                if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

                if (_this.Options.OpenInArchive.Value && !/^https?:\/\/archive\.is/.test(url)){
                    url = 'https://archive.is/?run=1&url='+encodeURIComponent(url);
                }

                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                } else {
                    window.location.href = url;
                }
            } else if (key === OpenLC.toUpperCase()) { // Open comment and link pages
                if (!sel.parent().hasClass("submission")) { return; }
                var url = [];

                url.push(sel.find("a.title").attr("href"));
                url.push("https://" + window.location.hostname + sel.find("a.comments").attr("href"));

                if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

                if (url[0] && url[0] === url[1]) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                } else {
                    if (_this.Options.OpenInArchive.Value && !/^https?:\/\/archive\.is/.test(url[0])){
                        url[0] = 'https://archive.is/?run=1&url='+encodeURIComponent(url[0]);
                    }
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
                }
            } else if (key === Expand.toUpperCase()) { // Expand media/self-text
                var expand, media;
                if ( sel.parent().hasClass("submission")) {
                    //In submissions
                    if (AVE.Utils.currentPageType === "thread" && sel.parent().hasClass("self")){
                        expand = true;
                        media = sel.find("div.md:visible").find("a[title]");

                        media.each(function () {
                            //Expand is false if at least one of the media is expanded
                            if ($(this).next(".link-expando:visible").length > 0)
                            { expand = false; return false; }
                        });

                        media.each(function () {
                            if ($(this).find("span.link-expando-type").length > 0
                                && expand !== $(this).next(".link-expando:visible").length > 0)
                            { this.click(); }
                        });
                    } else {
                        sel.find("div.expando-button").click();
                    }
                } else {
                    //In comments
                    expand = true;
                    media = sel.find("div.md:visible").find("a[title]");

                    media.each(function () {
                        //Expand is false if at least one of the media is expanded
                        if ($(this).next(".link-expando:visible").length > 0)
                        { expand = false; return false; }
                        });

                    media.each(function () {
                        if ($(this).find("span.link-expando-type").length > 0 
                            && expand !== $(this).next(".link-expando:visible").length > 0)
                        { this.click(); }
                        });
                }

                if (sel.offset().top < $(window).scrollTop() &&
                    sel.find("div.expando-button").hasClass("collapsed")){// and if it was expanded
                    $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
                }
            } else if (key === TCC.toUpperCase()) { // Toggle comment chain or load more replies
                if (sel.parent().hasClass("submission")) { return; }

                if (sel.find("a.inline-loadcomments-btn:first").length > 0) {
                    //Load more comment if possible
                    sel.find("a.inline-loadcomments-btn:first")[0].click();
                } else if (sel.find('a.expand:visible:first').length > 0) {
                    //Hide selected comment otherwise
                    sel.find('a.expand:visible:first')[0].click();
                }
            } else if (key === HidePost.toUpperCase()) { // Hide submission
                if (!AVE.Modules['HideSubmissions'] || !AVE.Modules['HideSubmissions'].Enabled){
                    if(!confirm("You are trying to hide a post but the module \"HideSubmissions\" is disabled.\nDo you want to activate and load this module?")){
                        return;
                    } else {
                        var Opt = JSON.parse(_this.Store.GetValue(_this.Store.Prefix + AVE.Modules['HideSubmissions'].ID, "{}"));
                        Opt.Enabled = true;
                        _this.Store.SetValue(_this.Store.Prefix + AVE.Modules['HideSubmissions'].ID, JSON.stringify(Opt));
                        AVE.Modules['HideSubmissions'].Load();
                        print("AVE: DomainFilter > enabled and started");
                    }
                }
                var id = sel.parent().attr("data-fullname");

                //Select the next submission
                var _next = sel.parent().nextAll("div.submission[class*='id-']:first");
                if (_next.length > 0) {
                    AVE.Modules['SelectPost'].ToggleSelectedState(_next.find("div.entry"));
                    _this.ScrollToSelectedSubmission();
                } else if (AVE.Modules['NeverEndingVoat'] && AVE.Modules['NeverEndingVoat'].Enabled) {
                    //If the NeverEnding modules exists and is enabled, we load the next page.
                    AVE.Modules['NeverEndingVoat'].LoadMore();
                }

                AVE.Modules['HideSubmissions'].AddToHiddenList(id);
            }
        });
    },

    ScrollToSelectedSubmission: function () {
        $('html, body').finish();
        //Scroll to selected item if out of screen
        if ($(window).scrollTop() > AVE.Utils.SelectedPost.parent().offset().top - AVE.Utils.SelectedPost.parent().height()) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
        } else if ($(window).scrollTop() + $(window).height() < AVE.Utils.SelectedPost.parent().offset().top + AVE.Utils.SelectedPost.parent().height() + 50) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - $(window).height() + AVE.Utils.SelectedPost.parent().height() + 50 }, 150);
        }
    },

    ScrollToSelectedComment: function () {
        $('html, body').finish();
        //Scroll to selected item if out of screen
        if ($(window).scrollTop() > AVE.Utils.SelectedPost.parent().offset().top - AVE.Utils.SelectedPost.height()) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
        } else if ($(window).scrollTop() + $(window).height() < AVE.Utils.SelectedPost.parent().offset().top + AVE.Utils.SelectedPost.height() + 50) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - $(window).height() + AVE.Utils.SelectedPost.height() + 50 }, 150);
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ShortKeys'];
            var htmlStr = "";
            //Up and Down vote
            htmlStr += '<table id="AVE_ShortcutKeys" style="text-align: right;">';
            htmlStr += '<tr>';
            htmlStr += '<td>Upvote: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Downvote: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"/></td>';
            //Next and previous post
            htmlStr += '<td>&nbsp; Next post: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NextKey" value="' + _this.Options.NextKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Previous post: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="PrevKey" value="' + _this.Options.PrevKey.Value + '"/></td>';
            htmlStr += '</tr>';
            //Open Link, Comments, Comments & Link
            htmlStr += '<tr>';
            htmlStr += '<td>Open Link: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenLinkKey" value="' + _this.Options.OpenLinkKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Open comments: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenCommentsKey" value="' + _this.Options.OpenCommentsKey.Value + '"/>';
            htmlStr += '<td>&nbsp; Open L&C: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenLCKey" value="' + _this.Options.OpenLCKey.Value + '"/></td>';
            //Toggle expand media
            htmlStr += '<td>&nbsp; Toggle expand: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="ExpandKey" value="' + _this.Options.ExpandKey.Value + '"/>';
            htmlStr += '</tr>';
            //Toggle expand comment
            htmlStr += '<tr>';
            htmlStr += '<td>&nbsp; <span title="Toggle comment chain or load more replies">Toggle comment</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="ToggleCommentChain" value="' + _this.Options.ToggleCommentChain.Value + '"/>';
            //Navigate to Top and Bottom of the page
            htmlStr += '<td>&nbsp; <span title="Navigate to the top of the page">Top of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NavigateTop" value="' + _this.Options.NavigateTop.Value + '"/>';
            htmlStr += '<td>&nbsp; <span title="Navigate to the bottom of the page">Bottom of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NavigateBottom" value="' + _this.Options.NavigateBottom.Value + '"/></td>';
            //Hide submission
            htmlStr += '<td>&nbsp; <span title="This feaure requires the module HideSubmission to be enabled!">Hide post</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="HidePost" value="' + _this.Options.HidePost.Value + '"/></td>';
            htmlStr += '</tr>';

            htmlStr += '</table>';
            htmlStr += '<input id="OpenInNewTab" ' + (_this.Options.OpenInNewTab.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInNewTab"> ' + _this.Options.OpenInNewTab.Desc + '</label><br>';
            htmlStr += '<input id="OpenInArchive" ' + (_this.Options.OpenInArchive.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInArchive"> ' + _this.Options.OpenInArchive.Desc + '</label><br>';
            return htmlStr;
        },

        callback: function () {

        }
    }
};
/// END Shortcut keys ///

/// Inject custom style:  Apply your custom CSS style of choice everywhere on Voat.<br />For the best result check "Disable custom subverse styles" in your preferences. ///
AVE.Modules['InjectCustomStyle'] = {
    ID: 'InjectCustomStyle',
    Name: 'Inject custom style',
    Desc: 'Apply your custom CSS style of choice everywhere on Voat.<br />For the best result check "Disable custom subverse styles" in your preferences.',
    Category: 'Style',

    Index: 50,
    Enabled: false,

    Store: {},

    RunAt: "start",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        CustomStyleName: {
            Type: 'string',
            Value: ""
        },
        CustomStyleUrl: {
            Type: 'string',
            Desc: 'Enter URL of a custom CSS file:',
            Value: ""
        },
        ApplyEverywhere: {
            Type: 'boolean',
            Desc: 'Also insert the custom style in non-subverse pages (e.g. user page, moderator page, ...). The custom styles generaly aren\'t compatible with them.',
            Value: false
        },
        RemoveSubverseStyle: {
            Type: 'boolean',
            Desc: 'Remove the subverse\'s custom style if any is found.',
            Value: true
        },
        InjectLate: {
            Type: 'boolean',
            Desc: 'Insert the new CSS file <strong>after</strong> the original custom style.',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (!this.Options.ApplyEverywhere.Value) {
            if ($.inArray(AVE.Utils.currentPageType,
                ["frontpage", "set", "subverse", "thread",
                 "domain", "search", "saved", "user-submissions", "user-comments"]) === -1) {
                this.Enabled = false;
            }
        }
        //No need to start if no external custom style was selected
        if (this.Options.CustomStyleName.Value === "None" &&
            this.Options.CustomStyleUrl.Value === "") {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    CustomStyles: {
        None: "",
        Cashmere: "https://cdn.rawgit.com/mijowa/Cashmere/master/css/cashmere.min.css?AVE",
        Flatron: "https://cdn.rawgit.com/Gyyyn/Flatron-Voat/master/flatron.css?AVE", //buggy (see block info) Doesn't like big usernames
        Scribble: "https://cdn.rawgit.com/ScribbleForVoat/Scribble/master/base.min.css?AVE",
        Simplegoats: "https://cdn.rawgit.com/relaxedzombie/simplegoats/master/simplegoats.min.css?AVE",
        SlimDark: "https://cdn.rawgit.com/KinOfMany/SlimDark/master/style.css?AVE",
        Typogra: "https://cdn.rawgit.com/Nurdoidz/Typogra-Voat/master/Typogra.min.css?AVE"
    },

    CustomCSSContainerCount: 0,

    Start: function () {
        var _this = this;

        var theme = AVE.Utils.CSSstyle || ~document.cookie.indexOf('theme=dark') ? "Dark" : "Light";

        /*
        BUG:
            if you log-in on voat.co then switch to www.voat.co, the theme info cookie (queried above) doesn't exist
            this module needs to start as soon as possible and the cookie is the earliest way to get that info
         */

        var obsCustomCSS = new OnNodeChange($(document.documentElement), function (m) {
            //By /u/FuzzyWords: voat.co/v/AVEbeta/comments/448708/2133227
            if(m.addedNodes) {
                for(var i = 0; i < m.addedNodes.length; i++) {
                    var n = m.addedNodes[i];

                    if (_this.Options.RemoveSubverseStyle.Value || !_this.Options.InjectLate.Value) {
                        if ($(n).is("link[href^='/Content/" + theme + "?v=']")){$(n).remove();}
                    }

                    if (_this.Options.RemoveSubverseStyle.Value) {
                        if(n.parentNode && n.nodeName.toUpperCase() === "STYLE" && n.id == "custom_css") {
                            n.parentNode.removeChild(n);

                            //We want to disconnect the observer once it has done its job. But remember that a custom style is added twice in threads.
                            // Actually this is no longer the case (the limit is set to 1 now)
                            obsCustomCSS.disconnect();
                        }
                    }
                }
            }
        });
        obsCustomCSS.observe();

        //If a custom style was added before our Observer could start, we delete it manually
        //This will happen with slow computers or extensions (very rarely with userscripts)
        $("style#custom_css").remove();

        var URL;

        if (this.Options.CustomStyleName.Value &&
            this.CustomStyles[this.Options.CustomStyleName.Value]) {
            URL = this.CustomStyles[this.Options.CustomStyleName.Value];
        } else if (this.Options.CustomStyleUrl.Value) {
            URL = this.Options.CustomStyleUrl.Value;
        }


        if (URL) {

            if (this.Options.InjectLate.Value && !this.Options.RemoveSubverseStyle.Value) {
                $(document).ready(function () {
                    $("body").append('<link id="AVE_Inject_Style" rel="StyleSheet" href="' + URL + '" type="text/css">');
                });
            } else {
                $("head").append('<link rel="stylesheet" href="/Content/' + theme + '?HiFromAVE" type="text/css">')
                         .append('<link id="AVE_Inject_Style" rel="StyleSheet" href="' + URL + '" type="text/css">');
            }

            //If I use the following method, someone could easily inject javascript code and mess with the user.
            //$.ajax({
            //    url: URL,
            //    cache: true,
            //}).done(function (data, status, request) {
            //    $("head").append('<style>\n' + data + '\n</style');
            //    print(request.getResponseHeader('Content-type').split(";")[0] == "text/css");
            //})
            //.fail(function (html) {
            //    print("AVE: failed loading custom style at URL: " + URL);
            //});

            if (!this.Options.CustomStyleUrl.Value) {
                switch (this.Options.CustomStyleName.Value) {
                    case "Flatron":
                        $("div#header").ready(function () {
                            $("#header-account").css("top", "25px")
                                                .css("maxHeight", "60px");
                            $(".logged-in").css("lineHeight", "17px");
                        });
                        break;
                    case "Cashmere":
                        AVE.Utils.AddStyle("a#GM_ExpandAllImages{display: inline !important;}");
                        break;
                    //case "Simplegoats":
                    //case "Typogra":
                    //    break;
                    default:
                        break;
                }
            }
        }

        //Panic Mode
        $(document).on("keydown", function (e) {
            if (e.shiftKey && e.ctrlKey && e.which === 45) {
                _this.PanicMode();
                $(document).off("keydown");
            }
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['InjectCustomStyle'];
            var htmlStr = '';

            if (_this.Options.CustomStyleName.Value)
            { htmlStr += 'Choose a custom style: '; }
            htmlStr += '<select id="CustomStyleName">';
            if (!_this.Options.CustomStyleName.Value)
            { htmlStr += '<option disabled selected value="">Choose a custom style</option>'; }

            $.each(Object.keys(_this.CustomStyles), function () {
                htmlStr += '<option ' + (_this.Options.CustomStyleName.Value == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select>';

            htmlStr += '<br /><br />' + _this.Options.CustomStyleUrl.Desc + '<br /><input id="CustomStyleUrl" style="width:85%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.CustomStyleUrl.Value + '">';
            htmlStr += '&nbsp; <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-unsub" id="AVE_CheckCSSFile">Check</a>';

            htmlStr += '<br /> <a target="_blank" href="https://userstyles.org/styles/browse/voat">Try a usertstyle<a/>: add ".css" at the end of the userstyle\'s url and paste it above.';

            htmlStr += '<br /><input id="RemoveSubverseStyle" ' + (_this.Options.RemoveSubverseStyle.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="RemoveSubverseStyle"> ' + _this.Options.RemoveSubverseStyle.Desc + '</label>';

            htmlStr += '<br /><input style="margin-left:15px;" id="InjectLate" ' + (_this.Options.InjectLate.Value ? 'checked="true"' : "") + ' '+ (_this.Options.RemoveSubverseStyle.Value ? 'disabled="true"' : "") +' type="checkbox"/><label style="display:inline;" for="InjectLate"> ' + _this.Options.InjectLate.Desc + '</label>';

            htmlStr += '<br /><br /><input id="ApplyEverywhere" ' + (_this.Options.ApplyEverywhere.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ApplyEverywhere"> ' + _this.Options.ApplyEverywhere.Desc + '</label>';

            htmlStr += '<br /><br /><h2><strong>Panic Mode</strong>: If you added a custom style that messes everything up and you cannot change back, do <strong>Ctrl+Shift+Insert</strong> to disable this module and reload the page.</h2>';

            return htmlStr;
        },
        callback: function () {
            var _this = this;

            $("input#RemoveSubverseStyle").change(function () {
                $("input#InjectLate").attr("disabled", $("input#RemoveSubverseStyle").is(":checked"));
            });

            $("a#AVE_CheckCSSFile").on("click", function () {
                var URL = $("div.AVE_ModuleCustomInput > input#CustomStyleUrl").val();

                if (URL) {
                    $.ajax({
                        url: URL,
                        cache: true
                    }).done(function (data, status, request) {
                        if (request.getResponseHeader('Content-type').split(";")[0] === "text/css") {
                            _this.ShowInfo("It's Ok! The file can be loaded as CSS!", "#68c16b");
                        } else {
                            _this.ShowInfo("Not Ok! The file isn't sent as a CSS file (MIME type).", "#dd5454");
                        }
                    })
                    .fail(function () {
                        _this.ShowInfo("Error while loading CSS file. Check the URL", "#dd5454");
                    });
                }
            });
        },

        ShowInfo: function (message, color) {
            var JqId = $("span#CustomStyleUrl_InfoStr");
            if (JqId.length === 0) {
                $('<br /><span id="CustomStyleUrl_InfoStr"></span>').insertAfter("a#AVE_CheckCSSFile");
                JqId = $("span#CustomStyleUrl_InfoStr");
            }
            $(JqId).show();
            $(JqId).text(message);
            if (color) { $("span#CustomStyleUrl_InfoStr").css("color", color); }

            $(JqId).delay(3000).fadeOut(300);
            setTimeout(function() { //Because "text" isn't a queued function
                $(JqId).text("");
            }, 3300);

        }
    },

    //If the applied custom style messed everything up, so much that you can't toggle the module off:
    PanicMode: function () {
        var _this = this;

        var POST = {};
        POST[this.ID] = {
            Enabled: false,
            CustomStyleName: _this.Options.CustomStyleName.Value,
            CustomStyleUrl: _this.Options.CustomStyleUrl.Value,
            ApplyEverywhere: _this.Options.ApplyEverywhere.Value,
            InjectLate: _this.Options.InjectLate.Value,
            RemoveSubverseStyle: _this.Options.RemoveSubverseStyle.Value
        };
        this.SavePref(POST);

        window.location.reload();
    }
};
/// END Inject custom style ///

/// Toggle subverse custom style:  Adds a checkbox to enable/disable custom styles on a per subverse basis.<br />This module is automatically disabled if "Inject custom style" is enabled or set to remove custom styles. ///
AVE.Modules['ToggleCustomStyle'] = {
    ID: 'ToggleCustomStyle',
    Name: 'Toggle subverse custom style',
    Desc: 'Adds a checkbox to enable/disable custom styles on a per subverse basis.<br />This module is automatically disabled if "Inject custom style" is enabled or set to remove custom styles.',
    Category: 'Style',

    Index: 51,
    Enabled: false,

    Store: {},

    RunAt: "start",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled && (!AVE.Modules['InjectCustomStyle'].Enabled || !AVE.Modules['InjectCustomStyle'].Options.RemoveSubverseStyle.Value)) {

            var sel = $("style#custom_css");
            if (sel.length > 0){
                this.CustomCSS = sel.text();
                this.Start();
            } else {
                var _this = this;
                var obsCustomCSS = new OnNodeChange($(document.documentElement), function (m) {
                    //By /u/FuzzyWords: voat.co/v/AVEbeta/comments/448708/2133227
                    if(m.addedNodes) {
                        for(var i = 0; i < m.addedNodes.length; i++) {
                            var n = m.addedNodes[i];
                            if(n.parentNode && n.nodeName.toUpperCase() === "STYLE" && n.id === "custom_css") {
                                if (!_this.CustomCSS){
                                    _this.CustomCSS = $(n).text();
                                }

                                if (_this.CustomCSSContainerCount === 1 && $.trim(_this.CustomCSS).length > 0){
                                    _this.Start();

                                    obsCustomCSS.disconnect();
                                }
                            }
                        }
                    }
                });
                obsCustomCSS.observe();
            }
        }
    },

    CustomCSS: "",
    StorageName: null,
    DisabledCSS: false, //If present we disable the custom CSS

    Start: function () {
        this.StorageName = this.Store.Prefix + this.ID + "_DisabledCSS";

        //print(this.Store.GetValue(this.StorageName, "[]"));
        //this.Store.DeleteValue(this.StorageName);

        this.DisabledCSS = $.inArray(AVE.Utils.subverseName, JSON.parse(this.Store.GetValue(this.StorageName, "[]"))) === -1;

        this.ToggleCSSPref(this.DisabledCSS);

        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        $('<input style="position:inherit;" id="AVE_ToggleCustomStyle" ' + (this.DisabledCSS ? 'checked="true"' : "") + ' type="checkbox"> <label for="AVE_ToggleCustomStyle" style="position:inherit;display:inline !important;">Enable custom style</label><br />').insertAfter("h1.hover.whoaversename");
    },

    Listeners: function () {
        var _this = this;
        $("input#AVE_ToggleCustomStyle").on("change", function () {
            if ($(this).is(":checked")) {
                _this.ToggleCSSPref(true);
            } else {
                _this.ToggleCSSPref(false);
            }
        });
    },

    ToggleCSSPref: function (status) {
        var CSSlist = JSON.parse(this.Store.GetValue(this.StorageName, "[]")),
            JqId = $("style#custom_css");

        if (status) { //Enable
            if ($.inArray(AVE.Utils.subverseName, CSSlist) !== -1) {
                // If exists in stored list of disabled CSS

                var idx = CSSlist.indexOf(AVE.Utils.subverseName);
                CSSlist.splice(idx, 1);

                this.Store.SetValue(this.StorageName, JSON.stringify(CSSlist));
            }
            //Don't add the CSS if we didn't remove it previously
            if ($.trim(JqId.text()).length === 0) {
                JqId.append(this.CustomCSS);
            }
        } else { // Disable
            if ($.inArray(AVE.Utils.subverseName, CSSlist) === -1) {
                // If doesn't exist in stored list of disabled CSSw
                CSSlist.push(AVE.Utils.subverseName);
                this.Store.SetValue(this.StorageName, JSON.stringify(CSSlist));
            }
            JqId.text("");
        }
        
        $(window).scrollTop(0);
    },

    AppendToDashboard: {
        initialized: false,
        CSSselector: "",
        module: {},

        init: function () {
            this.module = AVE.Modules['ToggleCustomStyle'];
            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";
            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}
            var htmlStr;

            htmlStr = '<div>Dashboard functionalities for '+this.module.ID+' are not yet implemented.</div>';

            return htmlStr;
        },
        callback: function () {
            "use strict";
        }
    }
};
/// END Toggle subverse custom style ///

/// Fix header position:  Set the subverse list header position as fixed. ///
AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'Misc',

    Index: 99,
    Enabled: false,

    Store: {},

    RunAt: 'banner',

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        $(window).resize(function () {
            AVE.Utils.ListHeaderHeight = $('#sr-header-area').height();
        });

        AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); //23

        this.SetAltBackground();
    },

    SetAltBackground: function () {
        // I don't remember why I added this exit condition...
        //if(!AVE.Modules['InjectCustomStyle'] || !AVE.Modules['InjectCustomStyle'].Enabled){return;}

        var bg, border, JqId;
        JqId = $("#sr-header-area");
        if(JqId.length === 0) {
            print("AVE: HeaderFixedPos > the header account element couldn't be found. Is this an error page?");
            return;
        }
        //Subverse list bg
        bg = JqId.css("background-color");
        //If alpha channel isn't 1
        if (  bg === "transparent" ||
            bg[3] === "a" &&
            parseInt(bg.replace(")", "").split(",")[3], 10) !== 1){
            //general header background
            bg = $("div#header[role='banner']").css("background-color");
            if (bg === "transparent") {
                //If there is no colour nor any image set, we set it by default
                bg = AVE.Utils.CSSstyle === "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
            }
        }

        border = JqId.css("borderBottomWidth") + " " +
            JqId.css("borderBottomStyle") + " " +
            JqId.css("borderBottomColor");

        JqId = $('.width-clip');
        JqId.css('position', 'fixed')
            .css("z-index", "1000")
            .css('border-bottom', border)//'1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
            .css("height", AVE.Utils.ListHeaderHeight + "px")
            .css("background-color", bg);//AVE.Utils.CSSstyle == "dark" ? "#333" : "#FFF");

        JqId.find("br:last").remove();//Chrome

        //If you have so many subscriptions that the "my subverses" list goes out of the screen, this is for you.
        JqId = $("ul.whoaSubscriptionMenu > li > ul:first");
        var li_Height = JqId.find("li > a").outerHeight();
        if (($(window).height() - AVE.Utils.ListHeaderHeight - li_Height) < JqId.height()) {
            var li_Width = JqId.find("li > a").outerWidth(),
                elPerCol = parseInt(($(window).height() - AVE.Utils.ListHeaderHeight) / li_Height, 10) - 1,
                columns = JqId.find("li").length / elPerCol - 1,
                el;

            for (var col = 0; col < columns; col++) {
                el = $("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")").find("li:gt(" + (elPerCol - 1) + ")");
                $('<ul style="width:' + li_Width + 'px;margin-left:' + (li_Width * (col + 1)) + 'px;"></ul>')
                    .insertAfter("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")")
                    .append(el);
            }
        }
    }
};
/// END Fix header position ///

/// Comment Filter:  Choose keywords to filter comments by hiding or removing them. ///
AVE.Modules['CommentFilter'] = {
    ID: 'CommentFilter',
    Name: 'Comment Filter',
    Desc: 'Choose keywords to filter comments by hiding or removing them.',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: []
        },
        RemoveFiltered: {
            Type: 'boolean',
            Desc: "Remove the comment and its child comments altogether.",
            Value: false
        }
    },

    Filter: function (id, keyword, sub) {
        this.Id = id || 0;
        this.Keywords = keyword || []; //List of keywords
        this.ApplyToSub = sub || []; //List of subs
    },

    Processed: [], //Ids of comments that have already been processed

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        var id, kw, sub, tV;

        this.Options.Filters.Value = [];

        $.each(POST, function (k, v) {
            tV = k.split("-");
            if (tV.length === 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] === "kw") {
                if (v.length === 0) { return true; } //If no kw were specified: continue
                //else
                _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(","), []));
            } else if (tV[1] === "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id === id; });
                if (inArr.length === 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length !== 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(",");
                }
            }
        });

        this.Store.SetValue(this.Store.Prefix + this.ID,
            JSON.stringify(
                {
                    Enabled: POST.Enabled,
                    RemoveFiltered: POST.RemoveFiltered,
                    Filters: this.Options.Filters.Value
                }
            )
        );
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["thread"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        //When a Comment is filtered it is removed, so no need to check anyting special when the update method is triggered.

        var re, found;
        $("div.comment").each(function () {
            var authorStr = $(this).find("a.author.userinfo").attr("data-username");
            var commentRef = $(this);
            var commentStr = commentRef.find("div.md:first").text().toLowerCase();

            if ($.inArray($(this).find("input#CommentId").val(), _this.Processed) !== -1)
            { return true; }
            //else
            _this.Processed.push($(this).find("input#CommentId").val());

            $.each(_this.Options.Filters.Value, function () {
                found = false;
                if (this.ApplyToSub.length === 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) !== -1) {
                    $.each(this.Keywords, function () {
                        if (this.length === 0) { return true; }//Just in case
                        re = new RegExp(this);
                        if (re.test(commentStr)) {
                            if (_this.Options.RemoveFiltered.Value) {
                                print("AVE: removed Comment by \"" + authorStr + "\" (kw: \"" + this + "\")");
                                commentRef.remove();
                            } else {
                                print("AVE: hid Comment by \"" + authorStr + "\" (kw: \"" + this + "\")");
                                commentRef.find("div.md:first").hide();

                                var commentContainer = commentRef.find("div.md:first").parent();//div.usertext-body#commentContent-id
                                commentContainer.append('<a href="javascript:void(0)" title="Show comment" AVE="HiddenComment">Comment filtered (kw: "' + this + '"). Click to display.</a>');
                                commentContainer.find("a[AVE='HiddenComment']")
                                        .css("font-size", "10px")
                                        .css("margin-left", "20px")
                                        .css("font-weight", "bold");
                            }
                            found = true; //no point in continuing since the Comment has already been removed/hidden
                            return false; //break
                        }
                    });
                }
                if (found) { return false; } //break (out of kw loop)
            });
            if (found) { return true; } //continue (to next submission)
        });

        this.Listeners();
    },

    Listeners: function () {
        if ($("a[AVE='HiddenComment']").length > 0) {
            $("a[AVE='HiddenComment']").off("click").on("click", function () {
                $(this).parent().find("div.md").show();
                $(this).remove();
            });
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: {
        htmlNewFilter: '',

        html: function () {
            var _this = AVE.Modules['CommentFilter'];
            var Pref_this = this;
            var htmlStr = "";

            this.htmlNewFilter = '<span class="AVE_Comment_Filter" id="{@id}">\
                                Keyword(s) \
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="CommentFilter" value="{@keywords}">\
                                Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="CommentFilter" value="{@subverses}">\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<input ' + (_this.Options.RemoveFiltered.Value ? 'checked="true"' : "") + ' id="RemoveFiltered" type="checkbox"/><label for="RemoveFiltered"> Remove filtered comment instead of replacing the text.</label><br />';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id}/ig, count);
                filter = filter.replace("{@keywords}", this.Keywords.join(","));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(","));
                count++;
                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            $("div#CommentFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#CommentFilter > div.AVE_ModuleCustomInput > span.AVE_Comment_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#CommentFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click")
                    .on("click", function () {
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Comment_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click")
                .on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Comment_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("CommentFilter");
            });
        },
    },
};
/// END Comment Filter ///

/// Toggle display child comments:  Adds "Hide child comments" link to hide a chain of comments ///
AVE.Modules['ToggleChildComment'] = {
    ID: 'ToggleChildComment',
    Name: 'Toggle display child comments',
    Desc: 'Adds "Hide child comments" link to hide a chain of comments',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    LabelHide: "hide child comments",
    LabelShow: "show child comments",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        var _this = this;
        $("ul[class*='flat-list']").each(function () {
            if ($(this).find("a#AVE_ToggleChildComment").length > 0) { return true; }
            if ($(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']").length === 0) { return true; }

            $('<li><a id="AVE_ToggleChildComment" href="javascript:void(0)" style="font-weight:bold;">' + _this.LabelHide + '</a></li>').insertAfter($(this).find("li:contains(report spam)"));
        });
    },

    Listeners: function () {
        var _this = this;
        $("a#AVE_ToggleChildComment").off("click")
            .on("click", function () {

            var NextLevelComments = $(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']");
            if (NextLevelComments.is(":visible")) {
                NextLevelComments.hide();
                $(this).text(_this.LabelShow);
            } else {
                NextLevelComments.show();
                $(this).text(_this.LabelHide);
            }
        });
    }
};
/// END Toggle display child comments ///

/// Show submission\'s actual vote balance:  This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote. ///
AVE.Modules['ShowSubmissionVoatBalance'] = {
    ID: 'ShowSubmissionVoatBalance',
    Name: 'Show submission\'s actual vote balance',
    Desc: 'This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        }
    },

    Processed: [], //Ids of comments that have already been processed

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },
    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        var s = $(".submission");
        s.each(function(index){
            if (s[index]) {
                _this.showUnvoted($(s[index]).find(".midcol:first"),
                                  $(s[index]).attr("data-fullname"));
            }
        });

        this.Listeners();
    },

    Listeners: function () {
        var _this = this;
        $("div[onclick^=\"voteUpSubmission\"],div[onclick^=\"voteDownSubmission\"]")
            .on("click",
                function(){
                    var el = this;
                    setTimeout(
                        function(){
                            _this.showUnvoted($(el).parent());
                        }, 1000);
                }
            );
    },

    showUnvoted: function (m, id) {
        if (id){
            if ($.inArray(id, this.Processed) === -1) {
                this.Processed.push(id);
            } else {
                return;
            }
        }

        if(m.length>0) {
            var u = m.find(".score.unvoted"),
                l = m.find(".score.likes"),
                d = m.find(".score.dislikes");

            if (m.find(".arrow-upvoted").length > 0) {
                u.css("color", l.css('color'));
            } else if (m.find(".arrow-downvoted").length > 0) {
                u.css("color", d.css('color'));
            } else {
                u.css("color", "");
            }

            u.text(l.text() - d.text());
            u.css("display", "block");
            l.css("display", "none");
            d.css("display", "none");
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            return 'Feature written by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>';
        }
    }
};
/// END Show submission\'s actual vote balance ///

/// Theme switcher:  Switch between the light and dark themes without reloading ///
AVE.Modules['ThemeSwitcher'] = {
    ID: 'ThemeSwitcher',
    Name: 'Theme switcher',
    Desc: 'Switch between the light and dark themes without reloading',
    Category: 'Style',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        $("#nightmodetoggle").attr("onclick", "return false;")
            .on("click", function () {
                $.ajax({
                    type: "POST",
                    url: "/account/togglenightmode/",
                    complete: function () {
                        print("AVE: ThemeSwichter > toggled theme style");
                        var prevstyle = AVE.Utils.CSSstyle;
                        prevstyle = prevstyle.substr(0,1).toUpperCase() + prevstyle.substr(1, prevstyle.length);

                        var newstyle = prevstyle === "Dark" ? "Light" : "Dark";
                        var csslink = $('link[rel="stylesheet"][href^="/Content/'+prevstyle+'"]');
                        csslink.attr("href", csslink.attr("href").replace(prevstyle, newstyle));
                        $("body").attr("class", newstyle.toLowerCase());

                        AVE.Utils.CSSstyle = AVE.Utils.CSS_Style();
                        if (AVE.Modules['HeaderFixedPos'] && AVE.Modules['HeaderFixedPos'].Enabled){
                            AVE.Modules['HeaderFixedPos'].SetAltBackground();
                        }
                        if (AVE.Modules['UserInfoFixedPos'] && AVE.Modules['UserInfoFixedPos'].Enabled){
                            AVE.Modules['UserInfoFixedPos'].SetAltBackground();
                        }
                    }
                });
            });
    }
};
/// END Theme switcher ///

/// Never Ending Voat:  Browse voat as one page, loading more posts when you hit the bottom. ///
AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse voat as one page, loading more posts when you hit the bottom.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        AutoLoad: {
            Type: 'boolean',
            Desc: 'If checked, scroll to load more content. Click the "load more" button to load the next page otherwise.',
            Value: true
        },
        ExpandSubmissionBlock: {
            Type: 'boolean',
            Desc: 'Expand the new submission posts over the empty sidebar\'s space',
            Value: true
        },
        DisplayDuplicates: {
            Type: 'boolean',
            Desc: 'Display duplicate submissions (greyed).',
            Value: true
        },
        ExpandNewMedia: {
            Type: 'boolean',
            Desc: 'Expand media in inserted pages, if you already clicked the \"View Media\" button.',
            Value: false
        }
    },

    OriginalOptions: "",

    NSFWlink: false,

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "user-comments", "user-submissions"]) === -1 ||
            $("div.pagination-container").find("li.btn-whoaverse-paging").length === 0) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.SepStyle = 'background-color:#' + (AVE.Utils.CSSstyle === "dark" ? "5C5C5C" : "F6F6F6") + ';height:20px;text-align:center;border:1px dashed #' + (AVE.Utils.CSSstyle === "dark" ? "111" : "BCBCBC") + ';border-radius:3px;padding:2px 0px;margin:4px 0px;';
            this.Start();
        }
    },

    Labels: ["Load more",
             "Sit tight...",
             "Sorry, I couldn't find more content.",
             "Something went wrong. Maybe try again?",
             "An error occured. No point in trying again right now I'm afraid."],
    PostsIDs: [],
    SepStyle: '',
    currentPage: 0,

    Start: function () {
        var _this = this;
        $("div.submission[class*='id-']").each(function () {
            _this.PostsIDs.push($(this).attr("class").split(" ")[1]);
        });

        this.currentPage = parseInt(AVE.Utils.POSTinfo["page"]) || 0;

        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("a#AVE_loadmorebutton").length === 0 && $("div.pagination-container").find("li.btn-whoaverse-paging").length > 0) {
            var LoadBtn = '<a href="javascript:void(0)" style="margin: 5px 0px;" class="btn-whoaverse btn-block" id="AVE_loadmorebutton">' + this.Labels[0] + '</a>';
            $("div.pagination-container").html(LoadBtn);
        }

        var sitetable = $("div.sitetable");
        var nsfwlink = $("div.sitetable > a[href='/randomnsfw']");
        if (nsfwlink.length > 0){
            $("<div id='AVE_randomlinks'></div>").appendTo(sitetable);
            sitetable.contents().slice(-5, -2).appendTo("div#AVE_randomlinks");
            this.NSFWlink = true;
        }
    },

    Listeners: function () {
        var _this = this;

        if (_this.Options.AutoLoad.Value) {
            $(window).scroll(function () {
                if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                    _this.LoadMore();
                }
            });
        }

        $("a#AVE_loadmorebutton").on("click", function () { _this.LoadMore(); });
    },

    LoadMore: function () {
        //Don't load another page if one is already being loaded.
        if ($("a#AVE_loadmorebutton").text() === this.Labels[1]) { return; }

        var _this = this;

        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") !== -1) {
            nextPageURL = nextPageURL.replace(/\?page=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://" + window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }

        $.each(AVE.Utils.POSTinfo, function (key, val) {
            if (key.toLowerCase() === "page"){return true;}
            nextPageURL +=  "&"+key+"="+val;
        });

        print('AVE: loading page > ' + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false,
        }).done(function (html) {
            var error = "sticky";
            var content = $(html).find("div[class*='id-'][data-downs][data-ups]");
            if (content.length === 0) { $("a#AVE_loadmorebutton").text(_this.Labels[4]); return false; } //catchall for error pages
            _this.currentPage++;
            //print($(html).find("div.submission[class*='id-']").length);

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") !== "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
                $("div.side").css("z-index", "100");
            }

            var sitetable = $("div.sitetable");
            if (sitetable.length === 0){ sitetable = $("div.content-no-margin");}
            sitetable.append('<div style="' + _this.SepStyle + '" id="AVE_page_' + (_this.currentPage) + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');

            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            var tempID;
            content.each(function () {
                tempID = $(this).attr("class").split(" ")[1];
                if ($.inArray(tempID, _this.PostsIDs) === -1) {
                    error = null;
                    _this.PostsIDs.push(tempID);
                    sitetable.append($(this));
                } else if (_this.Options.DisplayDuplicates.Value && !$(this).hasClass("stickied")) {
                    sitetable.append($(this));
                    $(this).css("opacity", "0.3");
                } else if (!$(this).hasClass("stickied")){
                    error = true;
                }
            });

            if (!error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[0]);
            } else if (error === "sticky") {
                //In a sub, a page with no content will still show the sticky.
                $("a#AVE_loadmorebutton").text(_this.Labels[2]);
                $("div.AVE_postSeparator#AVE_page_" + (_this.currentPage)).remove();
                _this.currentPage--;
                return;
            } if (error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[4]);
                print("AVE: oups error in NeverEndingVoat:LoadMore()");
                $("div.AVE_postSeparator#AVE_page_" + (_this.currentPage)).remove();
                _this.currentPage--;
                return;
            }

            // Update mail info
            _this.UpdateMailInfo($(html).find("span.notification-container > a#mail").attr("class"),
                $(html).find("span#mailcounter.notification-counter").text());
            _this.UpdateCPInfo($(html).find("a#scp.userkarma").text(),
                               $(html).find("a#ccp.userkarma").text());

            // Add expando links to the new submissions
            // from https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js#L163
            if (!window.wrappedJSObject || !window.wrappedJSObject.UI) { //Chrome
                location.assign("javascript:UI.ExpandoManager.execute();void(0)");
            } else {//Firefox, because it stopped working with the location hack above
                window.wrappedJSObject.UI.ExpandoManager.execute();
            }

            //Ugly, isn't it?
            if (_this.Options.ExpandNewMedia.Value) {
                if (AVE.Modules['ToggleMedia'] && AVE.Modules['ToggleMedia'].Enabled) {
                    if ($("[id='GM_ExpandAllImages']").hasClass("expanded")) {
                        setTimeout(function () { AVE.Modules['ToggleMedia'].ToggleMedia(true); }, 1000);
                    }
                }
            }

            setTimeout(AVE.Init.UpdateModules, 500);
            window.location.hash = 'p=' + _this.currentPage;

            //Next lines are needed because the front page (^voat.co$) is a bit different from a subverse page. div.pagination-container isn't normally inside div.sitetable
            if (sitetable.find("div.pagination-container").length > 0) {
                $("div.pagination-container").appendTo(sitetable);
                if (_this.NSFWlink){
                    $("div#AVE_randomlinks").appendTo(sitetable);
                } else { // This default case is needed when the nsfwlink isn't displayed (as it used to be if the nsfw option was disabled in the user preferences)
                    $("div.sitetable > a[href='/random']").appendTo(sitetable);
                }
            }
        }).fail(function () {
            $("a#AVE_loadmorebutton").text(_this.Labels[3]);
        });
    },

    UpdateMailInfo: function (newmail, newcount) {
        var hasmail = $("span.notification-container > a#mail"),
            mailcounter = $("span#mailcounter.notification-counter"),
            oldmail = hasmail.attr("class"),
            oldcount = mailcounter.text();

        if (oldmail !== newmail){
            hasmail.removeClass(oldmail)
                   .addClass(newmail);
            if (newmail === "havemail"){
                mailcounter.show();
            } else {
                mailcounter.hide();
            }
        }
        if (oldcount !== newcount){
            mailcounter.text(newcount);
        }
    },

    UpdateCPInfo: function (newSCP, newCCP) {
        var SCP = $("a#scp.userkarma"),
            CCP = $("a#ccp.userkarma"),
            oldSCP = SCP.text(),
            oldCCP = CCP.text();

        if (newSCP !== oldSCP){
            SCP.text(newSCP);
        }
        if (newCCP !== oldCCP){
            CCP.text(newCCP);
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['NeverEndingVoat'];

            var htmlStr = "";
            var opt = ["AutoLoad", "ExpandSubmissionBlock", "DisplayDuplicates", "ExpandNewMedia"];

            $.each(opt, function () {
                htmlStr += '<input id="' + this + '" ' + (_this.Options[this].Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="' + this + '"> ' + _this.Options[this].Desc + '</label><br />';
            });
            return htmlStr;
        }
    }
};
/// END Never Ending Voat ///

/// Reply with quote:  Insert selected/highlighted text in a comment into the reply box toggled by "reply". ///
AVE.Modules['ReplyWithQuote'] = {
    ID: 'ReplyWithQuote',
    Name: 'Reply with quote',
    Desc: 'Insert selected/highlighted text in a comment into the reply box toggled by "reply".',
    Category: 'Thread',

    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
    },

    Quote: '',

    Listeners: function () {
        var _this = this;

        $("li > a:contains(reply)").on("click", function () {
            //Needed because when the reply text input appears, the text is deselected.
            //  Thus, we get the selected text before that.
            _this.Quote = _this.getQuote();
        });

        $("div[class*='entry']").OnNodeChange(function () {
            if (_this.Quote === "") { return; }

            var ReplyBox = $(this).find("textarea[class='commenttextarea'][id='Content']");
            if (ReplyBox.length > 0) {
                ReplyBox.val(_this.Quote + "\n\n");
            }
        });
    },

    getQuote: function () {
        var nodes = this.getSelectedNodes();

        if (!nodes) {
            return "";
        }

        if ($(nodes[0]).parents(".usertext-body:first").attr("id") === undefined ||
            $(nodes[0]).parents(".usertext-body:first").attr("id") !== $(nodes[1]).parents(".usertext-body:first").attr("id")) {
            return "";
        }

        return AVE.Utils.ParseQuotedText(this.getSelectedText().toString());
    },

    getSelectedNodes: function () {
        // Thanks to InvisibleBacon @ https://stackoverflow.com/questions/1335252/how-can-i-get-the-dom-element-which-contains-the-current-selection
        var selection = window.getSelection();
        if (selection.rangeCount > 0)
        { return [selection.getRangeAt(0).endContainer.parentNode, selection.getRangeAt(0).startContainer.parentNode]; }
    },

    getSelectedText: function () {
        var t = '';
        if (window.getSelection) {
            t = window.getSelection();
            if (t.rangeCount) {
                for (var i = 0; i < t.rangeCount; ++i) {
                    return new XMLSerializer().serializeToString(t.getRangeAt(i).cloneContents());
                }
            }
        }
        else {
            alert("AVE: Quoting is not supported by your browser. Sorry");
            return "";
        }
    }
};
/// END Reply with quote ///

/// Set Voat page width:  By default, Voat shows a margin on both sides of the page. You can modify this by setting a custom width as a percentage of the available horizontal space. ///
AVE.Modules['FixContainerWidth'] = {
    ID: 'FixContainerWidth',
    Name: 'Set Voat page width',
    Desc: 'By default, Voat shows a margin on both sides of the page. You can modify this by setting a custom width as a percentage of the available horizontal space.',
    Category: 'Misc',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "start",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Width: {
            Type: 'int',
            Range: [1,100],
            Value: 100
        },
        Justify: {
            Type: 'boolean',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        POST.Width = parseInt(POST.Width, 10);
        if (typeof POST.Width !== "number" || isNaN(POST.Width)) {
            POST.Width = _this.Options.Width.Value;
        }

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        AVE.Utils.AddStyle('div#container{max-width:' + this.Options.Width.Value + '% !important}\
                            div.md{max-width:100% !important;}');

        if (this.Options.Justify.Value)
        { AVE.Utils.AddStyle('div.md{text-align:justify;padding-right:10px;}'); }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            var htmlStr = '<input style="width:50%;display:inline;" id="Width" value="' + _this.Options.Width.Value + '" type="range" min="' + _this.Options.Width.Range[0] + ' max="' + _this.Options.Width.Range[1] + '"/> <span id="FixContainerWidth_Value">' + _this.Options.Width.Value + '</span>%';

            htmlStr += '<br /><input ' + (_this.Options.Justify.Value ? 'checked="true"' : "") + ' id="Justify" type="checkbox"/><label for="Justify">Justify text in comments.</label>';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            $("input#Width[type='range']").on("change", function () {
                $("span#FixContainerWidth_Value").text($(this).val());
                $("div#container").get(0).style.setProperty("max-width", $(this).val() + "%", 'important');
            });
            if (_this.Enabled){
                $("div#container").trigger("change");
            }
        }
    }
};
/// END Set Voat page width ///

/// unsecure HTTP warning:  This module show a warning for submissions that link to HTTP URL instead of HTTPS(ecure). ///
AVE.Modules['HttpWarning'] = {
    ID: 'HttpWarning',
    Name: 'unsecure HTTP warning',
    Desc: 'This module show a warning for submissions that link to HTTP URL instead of HTTPS(ecure).',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        WarningIcon: {
            Type: 'boolean',
            Desc: "Display a warning icon before HTTP submission links",
            Value: true
        },
        ModifyStyle: {
            Type: 'boolean',
            Desc: "Change the titles' style with the CSS values below",
            Value: false
        },
        WarningStyle: {
            Type: 'array',
            Value: ['color: #e0baba;', //dark
                    'color: #d85858;'] //light
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        POST = POST[this.ID];

        this.Options.WarningStyle.Value[style] = POST.WarningStyle;
        POST.WarningStyle = this.Options.WarningStyle.Value;

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
    },

    AppendToPage: function () {
        if (this.Options.ModifyStyle.Value){
            AVE.Utils.AddStyle('a.title.may-blank[href^="http:"] {' + this.Options.WarningStyle.Value[AVE.Utils.CSSstyle === "dark" ? 0 : 1] + '}');
        }
        if (this.Options.WarningIcon.Value){
            $('a.title.may-blank[href^="http:"]').attr("title", "This submission links to a webpage over an insecure protocol (HTTP)");
            AVE.Utils.AddStyle( 'a.title.may-blank[href^="http:"]:before {' +
                '   content: "";' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20style%3D%22fill%3A%23'+'d85858'+'%3B%22%20d%3D%22M7%2C0L0%2C12h14L7%2C0z%20M7%2C11c-0.553%2C0-1-0.447-1-1s0.447-1%2C1-1c0.553%2C0%2C1%2C0.447%2C1%2C1S7.553%2C11%2C7%2C11z%20M7%2C8%20C6.447%2C8%2C6%2C7.553%2C6%2C7V5c0-0.553%2C0.447-1%2C1-1c0.553%2C0%2C1%2C0.447%2C1%2C1v2C8%2C7.553%2C7.553%2C8%2C7%2C8z%22%2F%3E%3C%2Fsvg%3E");'+
                '   width: 14px;'+
                '   height: 14px;'+
                '   background-repeat: no-repeat;'+
                '   background-position: center;' +
                '   display: inline-block;' +
                '   margin-right: 5px;' +
                '   vertical-align: middle;' +
                '}');
        }
    },

    AppendToPreferenceManager: {

        html: function () {
            var _this = AVE.Modules['HttpWarning'],
                style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
            var htmlStr = '';

            htmlStr += '<input id="WarningIcon" ' + (_this.Options.WarningIcon.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="WarningIcon"> ' + _this.Options.WarningIcon.Desc + '</label><br />';
            htmlStr += '<input id="ModifyStyle" ' + (_this.Options.ModifyStyle.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ModifyStyle"> ' + _this.Options.ModifyStyle.Desc + '</label><br />';

            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;font-weight: bold;" id="Demo_WarningStyle">TEST</div>';
            htmlStr += '<input style="font-size:12px;display:inline;width: 65%;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="WarningStyle" Value="'+_this.Options.WarningStyle.Value[style]+'"/> - Warning style values<br />';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['HttpWarning'];
            $("input[id='WarningStyle'][Module='" + _this.ID + "']").on("keyup", function () {
                var tmp = [];
                var demo = $("div#Demo_WarningStyle");
                demo.attr("style", "display:inline;padding-left:15px;padding-right:15px;margin-right:10px;font-weight: bold;");
                $.each($("input[id='WarningStyle'][Module='" + _this.ID + "']").val().split(";"), function (idx, val) {
                    tmp = $.trim(val).split(":");
                    if (tmp.length === 2) {
                        demo.css(tmp[0], tmp[1]);
                    }
                });
            }).trigger("keyup");
        }
    }
};
/// END unsecure HTTP warning ///

/// Submission Filter:  Remove submissions whose titles matche one of the filters. Additionally, filters can be applied to a specific subverse only. ///
AVE.Modules['SubmissionFilter'] = {
    ID: 'SubmissionFilter',
    Name: 'Submission Filter',
    Desc: 'Remove submissions whose titles matche one of the filters. Additionally, filters can be applied to a specific subverse only.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [] //not JSONified
        }
    },

    Filter: function (id, keyword, sub) {
        this.Id = id || 0;
        this.Keywords = keyword || []; //List of keywords
        this.ApplyToSub = sub || []; //List of subs
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        var id, kw, sub, tV;

        this.Options.Filters.Value = [];

        $.each(POST, function (k, v) {
            tV = k.split("-");
            if (tV.length === 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] === "kw") {
                if (v.length === 0) { return true; } //If no kw were specified: continue
                else {
                    _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(","), []));
                }
            } else if (tV[1] === "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id === id; });
                if (inArr.length === 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length !== 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(",");
                }
            }
        });

        this.Store.SetValue(this.Store.Prefix + this.ID,
            JSON.stringify(
                {
                    Enabled: POST.Enabled,
                    Filters: this.Options.Filters.Value
                }
            )
        );
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        //When a submission is filtered it is removed, so no need to check anyting special when the update method is triggered.

        var re, found;
        $("div.entry > p.title > a.title").each(function () {
            var titleStr = $(this).text().toLowerCase();
            var titleRef = $(this);
            $.each(_this.Options.Filters.Value, function () {
                found = false;
                if (this.ApplyToSub.length === 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) !== -1) {
                    $.each(this.Keywords, function () {
                        if (this.length === 0) { return true;}//Just in case
                        re = new RegExp(this);
                        if (re.test(titleStr)) {
                            print("AVE: removed submission with title \"" + titleStr + "\" (kw: \"" + this + "\")");
                            titleRef.parents("div.submission:first").remove();
                            found = true; //no point in continuing since the submission no longer exists
                            return false; //break
                        }
                    });
                }
                if (found) { return false; } //break
            });
            if (found) { return true; } //continue
        });
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        htmlNewFilter: '',

        html: function () {
            var _this = AVE.Modules['SubmissionFilter'];
            var Pref_this = this;
            var htmlStr = "";

            this.htmlNewFilter = '<span class="AVE_Submission_Filter" id="{@id}">\
                                Keyword(s) \
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}">\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}">\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id}/ig, count);
                filter = filter.replace("{@keywords}", this.Keywords.join(","));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(","));
                count++;
                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top:10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click")
                    .on("click", function () {
                    //print("Remove link: " + $(this).attr("id"));
                    //print("Remove span: " + $(this).prev("span.AVE_Submission_Filter").attr("id"));
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Submission_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click")
                .on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Submission_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("SubmissionFilter");
            });
        }
    }
};
/// END Submission Filter ///

/// Simple in-page CSS editor:  Edit your custom CSS stylesheets from within the page itself (created by <a href="https://voat.co/u/j_">/u/j_</a> [<a href="https://voat.co/v/CustomizingVoat/comments/92886">cf.</a>], adapted as a userscript by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>) ///
AVE.Modules['CSSEditor'] = {
    ID: 'CSSEditor',
    Name: 'Simple in-page CSS editor',
    Desc: 'Edit your custom CSS stylesheets from within the page itself (created by <a href="https://voat.co/u/j_">/u/j_</a> [<a href="https://voat.co/v/CustomizingVoat/comments/92886">cf.</a>], adapted as a userscript by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>)',
    Category: 'ModTools',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    /*
        Automatically open the mod stylesheet page with the new css?
     */

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        Size: {
            Type: "array[2]", //Width, Height
            Desc: 'Set the size of the editor panel (in pixel [px] or percentage [%]):',
            Value: ["400px", "500px"]
        },
        Position: {
            Type: 'array[2]', // Vertically, Horizontally
            Desc: 'Set the position of the editor panel:',
            Value: ["bottom", "left"],
            All: [ { "top": "top:0", "bottom": "bottom:0"},
                   { "left": "left:0", "right": "right:0"} ]
        },
        AllowEverywhere: {
            Type: 'boolean',
            Desc: 'Enable this module and show the "CSS Editor" button everywhere, not only in subverse pages.',
            Value: false
        },
        RelocateButton: {
            Type: 'boolean',
            Desc: 'Display the "CSS Editor" button in the banner instead of in the side panel.',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var app;
        POST = POST[this.ID];

        POST.Size = ["", ""];
        if (POST.hasOwnProperty("sizeW")){
            app = POST.sizeW.indexOf("px") > 0 || POST.sizeW.indexOf("%") > 0;
            POST.Size[0] = POST.sizeW;
            if (!app){ POST.Size[0] += "px"; }
        }
        if (POST.hasOwnProperty("sizeH")){
            app = POST.sizeH.indexOf("px") > 0 || POST.sizeH.indexOf("%") > 0;
            POST.Size[1] = POST.sizeH;
            if (!app){
                POST.Size[1] += "px";
            }
        }

        POST.Position = [POST.posV, POST.posH];

        // we can remove properties safely even if they don't exit
        delete POST.sizeW;
        delete POST.sizeH;
        delete POST.posV;
        delete POST.posH;

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (!this.Options.AllowEverywhere.Value) {
            if ($.inArray(AVE.Utils.currentPageType, ["subverse", "thread"]) === -1) {
                this.Enabled = false;
            }
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        var button;
        if (this.Options.RelocateButton.Value || $.inArray(AVE.Utils.currentPageType, ["subverse", "thread"]) === -1){
            button = '<li class="disabled"><a class="contribute submit-text" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></li>';
            $(button).appendTo("ul.tabmenu");
        } else {
            button = '<div class="spacer"><a class="btn-whoaverse btn-block" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></div>';
            $(button).insertBefore($(".titlebox:last").parent());
        }
    },

    Listeners: function () {
        var _this = this,
            sel = "style#custom_css";
        $("a#AVE_CSSEditor_button").off().on("click", function () {
            var s = $(sel);
            if (s.hasClass("AVE_custom_css_editable")) {
                if (s.is(":hidden")){ s.show(); } else { s.hide(); }
            } else {
                if (s.length === 0)// This element may have been removed by one of the style modules
                    { $("body").append('<style id="custom_css"></style>'); s = $(sel); }
                var Vpos = _this.Options.Position.All[0][_this.Options.Position.Value[0]].split(":"),
                    Hpos = _this.Options.Position.All[1][_this.Options.Position.Value[1]].split(":");

                s.attr("style", "display:block;position:fixed;z-index:2000;max-height:"+_this.Options.Size.Value[1]+";max-width:"+_this.Options.Size.Value[0]+";min-height:"+_this.Options.Size.Value[1]+";min-width:"+_this.Options.Size.Value[0]+";background:rgba(255,255,255,.9);color:#000;opacity:.5;font:10px/1.1 monospace;white-space:pre;overflow:scroll;padding:4px;-webkit-user-modify:read-write-plaintext-only;")
                 .css(Vpos[0], Vpos[1])
                 .css(Hpos[0], Hpos[1])
                 .attr("contentEditable", true)
                 .attr("onfocus", "this.style.opacity=1")
                 .attr("onblur", "this.style.opacity=.35")
                 .addClass("AVE_custom_css_editable")
                 .on("keyup", function (e) {
                     if (e.which === 27) {s.hide().trigger("blur");} //Escape key
                });
            }
            s.focus();
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['CSSEditor'],
                htmlStr = '';

            htmlStr += '<span>'+_this.Options.Position.Desc+'</span><br>';
            htmlStr += '<span style="margin-left:10px;">Vertical: </span><select id="posV">';
            $.each(Object.keys(_this.Options.Position.All[0]), function () {
                htmlStr += '<option ' + (_this.Options.Position.Value[0] == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select><br>';

            htmlStr += '<span style="margin-left:10px;">Horizontal: </span><select id="posH">';
            $.each(Object.keys(_this.Options.Position.All[1]), function () {
                htmlStr += '<option ' + (_this.Options.Position.Value[1] == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select><br><br>';

            htmlStr += '<span>'+_this.Options.Size.Desc+'</span><br>';
            htmlStr += '<input style="width: 60px;margin-left:10px;" id="sizeW" type="text" name="sizeW" value="'+_this.Options.Size.Value[0]+'" min="1" max="5000"><label style="display:inline;margin-left:5px;" for="sizeW">Width</label><br>';
            htmlStr += '<input style="width: 60px;margin-left:10px;" id="sizeH" type="text" name="sizeH" value="'+_this.Options.Size.Value[1]+'" min="1" max="5000"><label style="display:inline;margin-left:5px;" for="sizeH">Height</label><br><br>';

            htmlStr += '<input id="AllowEverywhere" ' + (_this.Options.AllowEverywhere.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AllowEverywhere"> ' + _this.Options.AllowEverywhere.Desc + '</label><br>';
            htmlStr += '<input id="RelocateButton" ' + (_this.Options.RelocateButton.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="RelocateButton"> ' + _this.Options.RelocateButton.Desc + '</label>';

            return htmlStr;
        }
    }
};
/// END Simple in-page CSS editor ///

/// Ignore users:  Lets you tag users as Ignored. When tagged, a user\'s comments will be replaced with [Ignored User]. ///
AVE.Modules['IgnoreUsers'] = {
    ID: 'IgnoreUsers',
    Name: 'Ignore users',
    Desc: 'Lets you tag users as Ignored. When tagged, a user\'s comments will be replaced with [Ignored User].',
    Category: 'General',

    Index: 100, //must be called after the UserTagging module.
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        HardIgnore: {
            Type: 'boolean',
            Desc: 'Entirely remove posts and chain comments made by ignored users.',
            Value: false
        }
    },

    IgnoreList: [],

    Processed: [], //Ids of comments that have already been processed

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        $.each(Opt, function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        //Cannot work without the userTag module
        if (!AVE.Modules['UserTag'] || !AVE.Modules['UserTag'].Enabled) { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        if (AVE.Utils.currentPageType === "thread") { // comments
            $("p.tagline > a.author").each(function () {

                if ($.inArray($(this).parents("div.comment:first").find("input#CommentId").val(), _this.Processed) !== -1)
                { return true; }
                //else
                _this.Processed.push($(this).parents("div.comment:first").find("input#CommentId").val());

                var name = $(this).attr("data-username");

                if (!name) { return true; }

                if ($.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('AVE: Removed comment by ' + name);
                    $(this).parents("div.comment[class*='id-']:first").remove();
                } else {
                    var CommentContainer = $(this).parent().parent().find("div[id*='commentContent-']");
                    CommentContainer.find("div.md").hide();
                    CommentContainer.append('<a href="javascript:void(0)" title="Show comment" AVE="IgnoredComment">[Ignored User] Click to display comment.</a>');
                    CommentContainer.find("a[AVE='IgnoredComment']")
                            .css("font-size", "10px")
                            .css("margin-left", "20px")
                            .css("font-weight", "bold");
                }
            });
        } else if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain"]) !== -1) { // submissions
            $("p.tagline > a.author").each(function () {

                if ($.inArray($(this).parents("div.submission:first").attr("data-fullname"), _this.Processed) !== -1)
                    { return true; }
                //else
                _this.Processed.push($(this).parents("div.submission:first").attr("data-fullname"));

                var name = $(this).attr("data-username");
                if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('AVE: Removed submission titled: "'+$(this).parents("div.entry:first").find("p.title > a[class*='title']:first").text()+'" by '+name);
                    $(this).parents("div.submission").remove();
                } else {
                    $(this).parents("div.entry:first").find("p.title > a[class*='title']:first").text('[Ignored User]').css("font-size", "13px");
                }
            });
        } else if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) !== -1) { // userpages
            var name = $("div.alert-title").text().split(" ");
            name = name[name.length - 1].replace('.', '');
            if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return; }

            $("<span> [Ignored User]</span>").appendTo("div.alert-title")
                .css("font-weight", "bold")
                .css("color", "#B45656");
        }

        this.Listeners();
    },

    Listeners: function () {
        var JqId = $("a[AVE='IgnoredComment']");
        if (JqId.length > 0) {
            JqId.off("click"); //We don't want to multiply the eventListeners for the same elements when updating.
            JqId.on("click", function () {
                $(this).parent().find("div.md").show();
                $(this).remove();
            });
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var htmlStr = "";
            htmlStr += '<input ' + (AVE.Modules['IgnoreUsers'].Options.HardIgnore.Value ? 'checked="true"' : "") + ' id="HardIgnore" type="checkbox"/><label for="HardIgnore"> Hard ignore</label><br />If checked all submissions and (chain-)comments of ignored users will be hidden.';
            if (!AVE.Modules['UserTag'] || !AVE.Modules['UserTag'].Enabled) {
                htmlStr += '<br /><span style="font-weight:bold;color:#D84C4C;">The User tagging module is not activated, this module cannot work without it.</span>';
            }
            //show a warning if usertag is disabled
            return htmlStr;
        }
    }
};
/// END Ignore users ///

/// Fix expanding images:  Let images expand over the sidebar and disallow the selection/highlighting of the image. ///
AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlighting of the image.',
    Category: 'Misc',

    Enabled: false,

    Store: {},

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        OverSidebar: {
            Type: 'boolean',
            Desc: 'Let images expand over the sidebard.',
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType,
            ["frontpage", "set", "subverse", "thread",
             "domain", "search", "saved", "user-submissions", "user-comments"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    ImgMedia: "a[title='JPG'],a[title='PNG'],a[title='GIF']",//These are the only media that are resizable

    Start: function () {
        if (this.Options.OverSidebar.Value &&
            $.inArray(AVE.Utils.currentPageType, ["saved", "user-submissions", "user-comments"]) === -1) {
            /*
            !! THIS CSS FIX IS BORROWED FROM /V/SCRIBBLE 1.5 !!
            */
            AVE.Utils.AddStyle('\
                .usertext {\
                    font-size: small;\
                    overflow: auto;\
                }\
                .md {overflow: visible;}\
                /*.comment > .entry:has(ul.flat-list.buttons:nth-child(1):has(.first)) {margin-left:30px;}*/\
                .comment > .entry {margin-left:30px;}\
                .usertext {overflow: visible !important;}\
                .link-expando {\
                    overflow: visible;\
                    position: relative;\
                    z-index: 1;\
                }\
                .submission > .entry {margin-left: 59px;}\
                .entry {overflow: visible;}\
                .comment {overflow: visible;}\
                form > div.row {overflow:hidden;}');
        }

        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsImgExp: null,

    Listeners: function () {
        if (this.obsImgExp) {
            this.obsImgExp.targets = $("div.expando, " + this.ImgMedia);
        }
        else {
            this.obsImgExp = new OnNodeChange($("div.expando, " + this.ImgMedia), function (e) {
                var img = $(e.target).find("img:first"); //In sub
                if (img.length === 0) { img = $(this).next("div.link-expando").find("img"); } //In thread

                if (img.length > 0) {
                    img.OnAttrChange(function () { window.getSelection().removeAllRanges(); });
                }
            });
        }
        this.obsImgExp.observe();
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['FixExpandImage'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.OverSidebar.Value ? 'checked="true"' : "") + ' id="OverSidebar" type="checkbox"/><label for="OverSidebar"> '+_this.Options.OverSidebar.Desc+'</label>';
            return htmlStr;
        }
    }
};
/// END Fix expanding images ///

/// CCP and SCP differences:  Show the difference in contribution points between now and X time ago. ///
AVE.Modules['ContributionDeltas'] = {
    ID: 'ContributionDeltas',
    Name: 'CCP and SCP differences',
    Desc: 'Show the difference in contribution points between now and X time ago.',
    Category: 'General',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        AddAsToolTip: {
            Type: 'boolean',
            Desc: 'Show differences in a tooltip instead of inline.',
            Value: false
        },
        ShowColourDelta: {
            Type: 'boolean',
            Desc: 'Show points in green (+) or red (-) according to the change.',
            Value: true
        },
        ShowMultipleDeltas: {
            Type: 'boolean',
            Desc: 'Show multiple differences in the tooltip (Hour, Day, Week).',
            Value: false
        },
        ShowSinceLast: {
            Type: 'string',
            Desc: 'Show contribution point differences for the last: ',
            Value: 'day'
        }
    },

    SinceLast: ["reset", "page", "hour", "6 hours",
                "12 hours", "day", "week"],

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be removed.
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Username: "",
    StoredDeltas: {},
    CCP: 0,
    SCP: 0,

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        this.Username = $(".logged-in > .user > a[title='Profile']");
        if (this.Username.length > 0){
            this.Username = this.Username.text();
        } else {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        var _now = Date.now();
        this.CCP = $("a.userkarma#ccp").text();
        this.SCP = $("a.userkarma#scp").text();

        //this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", "{}");

        this.StoredDeltas = JSON.parse(this.Store.GetValue(this.Store.Prefix + this.ID + "_Deltas", "{}"));
        if (this.StoredDeltas[this.Username] === undefined) {
            var tempVal = {ts: new Date (0), S: _this.SCP, C: _this.CCP};
            this.StoredDeltas[this.Username] = {};
            $.each(_this.SinceLast, function () {
                _this.StoredDeltas[_this.Username][this] = tempVal;
            });

            this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", JSON.stringify(this.StoredDeltas));
        }

        var dateDiff, change, newTs, epsilon;
        epsilon = 2000; //2 sec.
        change = false;

        if ((_now - _this.StoredDeltas[_this.Username]["page"].ts) > epsilon){//page
            change = true;
            print("AVE: ContribDelta > Updated \"Page\"", true);
            _this.StoredDeltas[_this.Username]["page"] = {ts: _now, S: _this.SCP, C: _this.CCP};

            dateDiff = (_now - _this.StoredDeltas[_this.Username]["hour"].ts) /1000;
            if (dateDiff > 3600) { //Hour
                print("AVE: ContribDelta > Updated \"hour\"", true);

                newTs = new Date (_now).setMinutes(0, 0);
                _this.StoredDeltas[_this.Username]["hour"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                dateDiff = (_now - _this.StoredDeltas[_this.Username]["6 hours"].ts) / 1000;
                if (dateDiff > 21600) { //6 hours
                    print("AVE: ContribDelta > Updated \"6 hours\"", true);

                    var newTsHour = new Date (newTs).getHours();
                    newTs = new Date (newTs).setHours(
                        (newTsHour < 4 ? 0 :
                            (newTsHour < 10 ? 6 :
                                (newTsHour < 16 ? 12 : 18)
                                )
                            )
                        );
                    _this.StoredDeltas[_this.Username]["6 hours"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    dateDiff = (_now - _this.StoredDeltas[_this.Username]["12 hours"].ts) / 1000;
                    if (dateDiff > 43200) { //12 hours
                        print("AVE: ContribDelta > Updated \"12 hours\"", true);

                        newTs = new Date (newTs).setHours(newTsHour < 12 ? 0 : 12);
                        _this.StoredDeltas[_this.Username]["12 hours"] = {ts: newTs, S: _this.SCP, C: _this.CCP};
                    }
                }
                //Only check for days once per hour (and only check for week once per day)
                dateDiff = (_now - _this.StoredDeltas[_this.Username]["day"].ts) / 1000;
                if (dateDiff > 86400) { //day
                    print("AVE: ContribDelta > Updated \"Day\"", true);

                    newTs = new Date (newTs).setHours(6);

                    _this.StoredDeltas[_this.Username]["day"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    dateDiff = (_now - _this.StoredDeltas[_this.Username]["week"].ts) / 1000;
                    if (dateDiff > 604800) { //week
                        print("AVE: ContribDelta > Updated \"Week\"", true);
                        newTs -= 86400000 * ((new Date (newTs)).getDay() - 1);
                        _this.StoredDeltas[_this.Username]["week"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    }
                }
            }
        }

        //save changes if any was made
        if (change) {
            this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", JSON.stringify(this.StoredDeltas));
        }

        this.AppendToPage();
    },

    AppendToPage: function () {
        var _this = this;
        var delta, JqId, data, multipleD;
        var _str, _data, _delta;

        multipleD = ["hour", "day", "week"];
        if ($.inArray(this.Options.ShowSinceLast.Value, multipleD) == -1){
            //Add selected SinceLast if it isn't already in the list
            multipleD.splice(0, 0, this.Options.ShowSinceLast.Value);
        }
        data = this.StoredDeltas[this.Username][this.Options.ShowSinceLast.Value];


        //SCP
        JqId = $("a.userkarma#scp");
        delta = JqId.text() - data.S;
        if (this.Options.AddAsToolTip.Value){
            if (this.Options.ShowMultipleDeltas.Value){
                JqId.parent().attr("title", (delta > 0 ? "+": "") +delta);
                if (this.Options.ShowColourDelta.Value && delta !== 0){
                    JqId.css("color", ( delta > 0 ?"#1BB61B": "#FF4B4B") );
                }
            }
        } else {
            $('<span title="SCP delta" id="AVE_SCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_SCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }

        if (this.Options.ShowMultipleDeltas.Value){
            _str = "";
            $.each(multipleD, function (i, v) {
                _data = _this.StoredDeltas[_this.Username][v];
                _delta = JqId.text() - _data.S;
                _str += v + ": "+   (_delta > 0 ? "+": "") +_delta;
                if (i+1 != multipleD.length){
                    _str += "\n";
                }
            });

            if (this.Options.AddAsToolTip.Value){
                JqId.parent().attr("title", _str);
            } else {
                $("#AVE_SCP-delta").attr("title", _str);
            }
        }

        //CCP
        JqId = $("a.userkarma#ccp");
        delta = JqId.text() - data.C;
        if (this.Options.AddAsToolTip.Value){
            if (this.Options.ShowMultipleDeltas.Value) {
                JqId.parent().attr("title", (delta > 0 ? "+" : "") + delta);
                if (this.Options.ShowColourDelta.Value && delta !== 0) {
                    JqId.css("color", ( delta > 0 ? "#1BB61B" : "#FF4B4B"));
                }
            }
        } else {
            $('<span title="CCP delta" id="AVE_CCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_CCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }

        if (this.Options.ShowMultipleDeltas.Value){
            _str = "";
            $.each(multipleD, function (i, v) {
                _data = _this.StoredDeltas[_this.Username][v];
                _delta = JqId.text() - _data.C;
                _str += v + ": "+   (_delta > 0 ? "+": "") +_delta;
                if (i+1 != multipleD.length){
                    _str += "\n";
                }
            });

            if (this.Options.AddAsToolTip.Value){
                JqId.parent().attr("title", _str);
            } else {
                $("#AVE_CCP-delta").attr("title", _str);
            }
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var htmlStr = '';

            htmlStr += '<input id="AddAsToolTip" ' + (_this.Options.AddAsToolTip.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AddAsToolTip"> ' + _this.Options.AddAsToolTip.Desc + '</label><br />';
            htmlStr += '<input id="ShowColourDelta" ' + (_this.Options.ShowColourDelta.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowColourDelta"> ' + _this.Options.ShowColourDelta.Desc + '</label><br />';
            htmlStr += '<input id="ShowMultipleDeltas" ' + (_this.Options.ShowMultipleDeltas.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowMultipleDeltas"> ' + _this.Options.ShowMultipleDeltas.Desc + '</label><br />';

            htmlStr += "<br />"+_this.Options.ShowSinceLast.Desc;
            htmlStr += '<select id="ShowSinceLast">';
            $.each(_this.SinceLast, function () {
                htmlStr += '<option ' + (_this.Options.ShowSinceLast.Value == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select>';

            /*
            Button to display all SinceLast: (in a table?)
                SinceLast[]: CCP/SCP
                e.g. In last week: #/#
             */

            if (_this.StoredDeltas[_this.Username] && _this.Username.length > 0) {
                htmlStr += '<br /><br />Current user: ' + _this.Username + '.<br /> <a style="margin-top:10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AVE_Reset_SinceLast">Reset count</a> <span id="AVE_LastReset">Last reset on ' + this.GetParsedDate(_this.StoredDeltas[_this.Username]["reset"].ts) + '</span>';
            }
            return htmlStr;
        },

        callback: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var JqId;

            JqId = $("div#ContributionDeltas > div.AVE_ModuleCustomInput > a#AVE_Reset_SinceLast");

            JqId.off("click");
            JqId.on("click", function () {
                $("span#AVE_LastReset").text('Last reset on '+ GetParsedDate(Date.now()));

                _this.StoredDeltas[_this.Username]["reset"] = {ts: Date.now(), S: $("a.userkarma#scp").text(), C: $("a.userkarma#ccp").text()};
                _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Deltas", JSON.stringify(_this.StoredDeltas));
            });
        },


        /**
         * @param timeStamp
         * @returns {string}
         */
        GetParsedDate: function (timeStamp) {
            return new Date(timeStamp).toLocaleString();
        }
    }
};
/// END CCP and SCP differences ///

/// Remember comment count:  For all visited threads show the number of new comments since the last time they were opened. ///
AVE.Modules['RememberCommentCount'] = {
    ID: 'RememberCommentCount',
    Name: 'Remember comment count',
    Desc: 'For all visited threads show the number of new comments since the last time they were opened.',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},
    StorageName: "",
    Data: {},
    Processed: [],

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        HighlightNewComments: {
            Type: 'boolean',
            Desc: "Highlight new comments.",
            Value: false
        },
        HighlightStyle: {
            Type: 'string',
            Desc: "Highlight CSS value",
            Value: ['#473232',
                    '#ffffcf']
        },
        MaxStorage: {
            Type: 'int',
            Range: [1,5000],
            Desc: "Max number of threads to remember",
            Value: 400
        },
        CorrectTimeZone: {
            Type: 'boolean',
            Desc: "Correct time zones (beta).",
            Value: true
        }
    },

    OriginalOptions: "",

    Username : "",
    SubmissionID : "",
    NewTimeStamp : 0,
    OldTimeStamp : 0,
    Init : false,

    SavePref: function (POST) {
        var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        POST = POST[this.ID];

        //Clamping
        if(POST.MaxStorage > 5000){POST.MaxStorage=5000;}
        else if(POST.MaxStorage < 1){POST.MaxStorage=1;}

        //Save style for both theme
        this.Options.HighlightStyle.Value[style] = POST.HighlightStyle;
        POST.HighlightStyle = this.Options.HighlightStyle.Value;

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_Data";
            //this.Data = JSON.parse(this.Store.SetValue(this.StorageName, "{}"));
            this.Data = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Pruning();
            this.Start();
        }
    },

    Start: function () {

        this.NewTimeStamp = Date.now();
        if (this.Options.CorrectTimeZone.Value){
            //Current date with hour correction since timestamps on the page are UTC+1 (CET)
            this.NewTimeStamp += (new Date(this.NewTimeStamp).getTimezoneOffset() * 60000);
        }

        this.AppendToPage();
        this.Listeners(); // shouldn't be updated
    },

    Pruning: function(){
        var count, key;
        count = Object.keys(this.Data).length - this.Options.MaxStorage.Value;

        if (count < 1) {return;}

        count += Math.ceil(this.Options.MaxStorage.Value / 8); //If over the limit we remove 1/8th of the total value

        for (key in this.Data){
            delete(this.Data[key]);
            count--;
            if (count === 0){break;}
        }
        this.Store.SetValue(this.StorageName, JSON.stringify(this.Data));
    },

    Update: function () {
        if (this.Enabled) {
            this.AppendToPage();
        }
    },

    AppendToPage: function () {
        var _this = this;
        var _style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        var _count, _id;

        if (AVE.Utils.currentPageType === "thread") { // comments
            var JqId = $("a.comments.may-blank:first");
            var _new = JqId.find("span").length == 0;
            _count = parseInt(JqId.text().split(" ")[0], 10) || 0;
            if (_count > 0) {
                _this.SubmissionID = _id = $("div.submission[class*='id-']:first").attr("id").split("-")[1];
                if (this.Data.hasOwnProperty(_id)) {
                    if (_new) {
                        if (_count > this.Data[_id][0]) {
                            JqId.append('&nbsp;<span style="font-weight:bold;color:#4189B1;">(+' + (_count - this.Data[_id][0]) + ')</span>');
                        }
                    }

                    if (!this.OldTimeStamp){
                        this.OldTimeStamp = this.Data[_id][1];
                    }

                    if (_this.Options.HighlightNewComments.Value) {
                        var CommId, CommTimeStamp, CommAuthor;

                        _this.Username = $("span.user > a[title='Profile']");
                        _this.Username = _this.Username.length > 0 ? _this.Username.text().toLowerCase() : "";
                        $("div.noncollapsed").each(function () {
                            CommId = $(this).attr("id");
                            CommAuthor = $(this).find("a.userinfo.author").text().toLowerCase();

                            if ($.inArray(CommId, _this.Processed) === -1 && CommAuthor !== _this.Username) {
                                CommTimeStamp = new Date($(this).find("time:first").attr("datetime")).getTime();
                                if (_this.Options.CorrectTimeZone.Value){
                                    CommTimeStamp += (-60 * 60000); //Convert to UTC from CET(UTC+1)
                                }

                                if (CommTimeStamp > _this.OldTimeStamp) {
                                    $(this).parents("div[class*=' id-']:first").css('background-color', _this.Options.HighlightStyle.Value[_style]);
                                }
                                _this.Processed.push(CommId)
                            }
                        });
                    }

                    print("AVE: RememberCommentCount > updating "+ _id, true);
                } else {
                    print("AVE: RememberCommentCount > adding "+ _id, true);
                }

                if (!this.Init) {//We have no reason to update this again after loading more comments
                    //If we do, we cannot update manually when the user adds a new comment
                    if (this.Data.hasOwnProperty(_id) && _count === this.Data[_id][0]) {
                        //Pass
                    } else if (_new) {
                        //s("AVE: RememberCommentCount > Writing");
                        //Update Stored Data in case multiple threads were opened at the same time (we don't want them to overwrite each others).
                        AVE.Utils.SendMessage({
                            request: "Storage", type: "Update", callback: function () {
                                _this.Data = JSON.parse(_this.Store.GetValue(_this.StorageName, "{}"));

                                _this.Data[_id] = [_count, _this.NewTimeStamp];
                                _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.Data));
                            }
                        });
                    }
                    this.Init = true;
                }
            }
        } else if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions"]) !== -1) { // submissions
            $("a.comments.may-blank").each(function () {
                _id = $(this).parents("div.submission[class*='id-']:first").attr("data-fullname");
                if ($.inArray(_id, _this.Processed) !== -1){return true;}

                _count = parseInt($(this).text().split(" ")[0], 10) || 0;
                if (_count > 0){
                    if (_this.Data.hasOwnProperty(_id) && _count > _this.Data[_id][0]){
                        $(this).append('&nbsp;<span style="font-weight:bold;color:#4189B1;">(+'+(_count - _this.Data[_id][0])+')</span>');
                    }
                }
                _this.Processed.push(_id)
            });
        } else if (AVE.Utils.currentPageType === "user-comments"){//Comments and link to submissions in user-comments page
            $("div.thread").each(function () {
                _id = $(this).find("p.parent >  a.title").attr("href").split("/");
                _id = _id[_id.length - 1];
                if ($.inArray(_id, _this.Processed) !== -1){return true;}

                _count = $(this).find("ul.flat-list.buttons > li:last-child > a").text().split(/(\(|\))/) || 0;
                _count = _count[_count.length -3];

                if (_count > 0) {
                    if (_this.Data.hasOwnProperty(_id) && _count > _this.Data[_id][0]) {
                        $(this).find("ul.flat-list.buttons > li:last-child > a").append('&nbsp;<span style="font-weight:bold;color:#4189B1;">(+' + (_count - _this.Data[_id][0]) + ')</span>');
                    }
                }
                _this.Processed.push(_id)
            });
        }
    },

    Listeners: function () {
        var _this = this;

        if (AVE.Utils.currentPageType === "thread") {
            var timestamp = Date.now();
            //listen on new nodes added to the div containing all comments
            $("div.commentarea > div#siteTable").on("DOMNodeInserted",  function (e) {
                var _id, _target;

                _id = _this.SubmissionID;
                _target = $(e.target);
                //If the new element is a div with classes: "comment" and "child". Is it a comment?
                if(_target.is("div.comment.child")){
                    var CommTimeStamp, CommAuthor;
                    //CommId = $(this).attr("id");
                    CommAuthor = _target.find("a.userinfo.author").text().toLowerCase();
                    CommTimeStamp = new Date(_target.find("time:first").attr("datetime")).getTime();
                    //If  the new comment is from the same username as the one used by the current logged user
                    //and the comment was added after this page was loaded
                    if (CommAuthor === _this.Username && CommTimeStamp > timestamp) {
                        //Update data storage and parse it as object from JSON
                        AVE.Utils.SendMessage({ request: "Storage", type: "Update", callback: function () {
                            _this.Data = JSON.parse(_this.Store.GetValue(_this.StorageName, "{}"));
                            //If we have an entry stored for this thread (there is no reason there is not, but this is a security)
                            if (_this.Data.hasOwnProperty(_id)) {
                                //Increment comment count since the user just added one
                                _this.Data[_id][0]++;
                                //We don't update the timestamp because other users may have added comments too
                                //Save new data
                                _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.Data));
                            }
                        }});
                    }
                }
            });
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
            var _this = AVE.Modules['RememberCommentCount'];
            var htmlStr = '';

            htmlStr += '<label style="display:inline;" for="MaxStorage"> ' + _this.Options.MaxStorage.Desc + ': </label><input style="width: 60px;" id="MaxStorage" type="number" name="MaxStorage" value="'+_this.Options.MaxStorage.Value+'" min="1" max="5000"> (Currently: '+ Object.keys(_this.Data).length+')<br />'; //Max: '+_this.Options.MaxStorage.Range[1]+',
            htmlStr += '<input id="HighlightNewComments" ' + (_this.Options.HighlightNewComments.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HighlightNewComments"> ' + _this.Options.HighlightNewComments.Desc + '</label><br />';

            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_HighlightStyle"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:60px;padding:0;" class="form-control" type="text" Module="' + _this.ID + '" id="HighlightStyle" Value="'+_this.Options.HighlightStyle.Value[style]+'"/> - Highlight CSS value<br />';

            htmlStr += '<input id="CorrectTimeZone" ' + (_this.Options.CorrectTimeZone.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="CorrectTimeZone"> ' + _this.Options.CorrectTimeZone.Desc + '</label><br />';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['RememberCommentCount'];

            $("input[id='HighlightStyle'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_HighlightStyle").css("background-color", $("input[id='HighlightStyle'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
        }
    }
};
/// END Remember comment count ///

/// Append quote:  Add a "quote" link to automatically insert the quoted comment into the closest reply box. ///
AVE.Modules['AppendQuote'] = {
    ID: 'AppendQuote',
    Name: 'Append quote',
    Desc: 'Add a "quote" link to automatically insert the quoted comment into the closest reply box.',
    Category: 'Thread',
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Formatting: {
            Type: 'string',
            Value: '[{@username}]({@permaLink}) wrote:{@n}{@n}{@comment}'
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;

        print(JSON.stringify(POST));

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        $("ul.flat-list.buttons").each(function () {
            if ($(this).find("a#AVE_QuotePost").length > 0) { return; }

            var cont = $(this).find("li:first");
            if (cont.length > 0){
                $('<li><a id="AVE_QuotePost" href="javascript:void(0)" style="font-weight:bold;">quote</a></li>').insertAfter(cont);
            }
        });
    },

    Listeners: function () {
        var _this = this;

        $("a#AVE_QuotePost").off("click")
            .on("click", function () {
            var comment = AVE.Utils.ParseQuotedText($(this).parent().parent().parent().find('.md:first').html());
            var permaLink = $(this).parents("ul[class*='flat-list']").first().find("a[class*='bylink']").attr("href");
            if (!permaLink) { permaLink = window.location.href; }
            var userpageLink = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").attr("href");
            var username = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").text();
            
            var quote = _this.Options.Formatting.Value.replace(/\{@username}/gi, username);
            quote = quote.replace(/\{@permaLink}/gi, permaLink);
            quote = quote.replace(/\{@userpage}/gi, userpageLink);
            quote = quote.replace(/\{@comment}/gi, comment);
            quote = quote.replace(/\{@n}/g, "\n");

            var NearestReplyBox = $(this).parents(":has(textarea[class*='commenttextarea'][id*='Content']:visible)").first()
                                         .find("textarea[class*='commenttextarea'][id*='Content']:visible");
            print(NearestReplyBox.length);
            if (NearestReplyBox.val() !== "") {
                NearestReplyBox.val(NearestReplyBox.val() + "\n\n" + quote);
            } else {
                NearestReplyBox.val(quote);
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['AppendQuote'];
            var htmlStr = "";
            htmlStr += '<input style="display:inline;width:80%;padding:0;letter-spacing:0.35px;" class="form-control" type="text" Module="'+ _this.ID +'" id="Formatting" value="' + _this.Options.Formatting.Value + '">';
            htmlStr += ' <button id="AutoQuoteFormatShowPreview" class="btn-whoaverse-paging" type="button">Show Preview</button>';
            htmlStr += '<div class="md" id="AutoQuoteFormatPreview" style="height:150px;background-color: #' + ( AVE.Utils.CSSstyle === "dark" ? "292929": "FFF" ) + '; position: fixed; width:430px;padding: 10px; border-radius: 6px; border: 2px solid black;display: none;overflow: auto;"></div>';
            htmlStr += "<br /> {@username}: username of the comment's author,";
            htmlStr += '<br /> {@permaLink}: permaLink to the comment,';
            htmlStr += "<br /> {@userpage}: link to the username's page,";
            htmlStr += "<br /> {@comment}: comment's content as a quote,";
            htmlStr += '<br /> {@n}: new line.';
            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['AppendQuote'];
            $('button#AutoQuoteFormatShowPreview').on("click", function () {
                var JqId = $("div#AutoQuoteFormatPreview");
                if ($(this).text() === "Show Preview") {
                    $(this).text("Hide Preview");

                    JqId.show();

                    var quote = $("input[id='Formatting'][Module='" + _this.ID + "']").val().replace(/\{@username}/gi, "Username");
                    quote = quote.replace(/\{@permaLink}/gi, "/v/whatever/comments/111111/111111");
                    quote = quote.replace(/\{@userpage}/gi, "/user/atko");
                    quote = quote.replace(/\{@comment}/gi, "> This is a comment.\n\n> Another line.");
                    quote = quote.replace(/\{@n}/g, "\n");

                    JqId.text("Loading...");
                    var r = { MessageContent: quote };
                    $.ajax({
                        url: "https://voat.co/ajaxhelpers/rendersubmission/",
                        type: "post",
                        dataType: "html",
                        success: function (n) {
                            JqId.html(n);
                        },
                        data: r
                    });
                } else {
                    $(this).text("Show Preview");
                    JqId.hide();
                }
            });
        }
    }
};
/// END Append quote ///

/// Disable Share-a-Link:  This module will remove the Share-a-Link overlay block. ///
AVE.Modules['DisableShareALink'] = {
    ID: 'DisableShareALink',
    Name: 'Disable Share-a-Link',
    Desc: 'This module will remove the Share-a-Link overlay block.',
    Category: 'Misc',
    //The share-a-link feature doesn't exist anymore it seems. This module is obsolete.

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['DisableShareALink'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['DisableShareALink'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        $('div#share-a-link-overlay').remove();
        $("body").removeAttr("ondrop")
                 .removeAttr("ondragover");
    }
};
/// END Disable Share-a-Link ///

/// Subverse and Set shortcuts:  Replace the subverse list header with a custom list. ///
AVE.Modules['Shortcuts'] = {
    ID: 'Shortcuts',
    Name: 'Subverse and Set shortcuts',
    Desc: 'Replace the subverse list header with a custom list.',
    Category: 'General',

    Order: 4,
    Enabled: false,

    Store: {},
    StorageName: "",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    defaultList: "newsubverses,introductions,news",

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;

        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_shortcuts";
            this.Start();
        }
    },

    Start: function () {
        this.DisplayCustomSubversesList();
        if (AVE.Utils.isPageSubverse) {
            this.AppendShortcutButton();
        } else if (AVE.Utils.currentPageType === "subverses") {
            this.AddShortcutsButtonInSubversesPage();
        } else if ($.inArray(AVE.Utils.currentPageType, ["mysets", "sets"]) >= 0) {
            this.AddShortcutsButtonInSetsPage();
        } else if (AVE.Utils.currentPageType === "set") {
            this.AddShortcutsButtonInSetPage();
        }
    },

    AddShortcutsButtonInSetPage: function () {
        //Not implemented yet.
        //The set pages are bound to change soon.
        //return;
    },

    AddShortcutsButtonInSetsPage: function () {
        var _this = this;
        var inShortcut = false;
        var tempSetName = "";
        var tempSetId = "";

        $("div[id*='set']").each(function () {
            tempSetName = $(this).find(".h4").text();//.replace(/([&\/\\#,+()$~%.'":*?<>{}])/g, '\\$1');
            tempSetId = $(this).find(".h4").attr("href").substr(5);
            inShortcut = this.isSubInShortcuts(tempSetName + ":" + tempSetId);

            var btnHTML = '<br /><button style="margin-top:5px;" id="AVE_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default' + (inShortcut ? "" : "btn-sub") + '">' +
                                    (inShortcut ? "-" : "+") + ' shortcut' +
                            '</button>';
            $(btnHTML).appendTo($(this).find(".midcol").first());
        });

        $(document).on("click", "#AVE_Sets_Shortcut", function () {
            var setName = $(this).attr("setName");
            var setId = $(this).attr("setId");

            if (setName === null || setName === undefined || setName === "undefined" ||
                setId === null || setId === undefined) {
                alert("AVE: Error adding set " + setName + ", id: " + setId);
                return;
            }

            var set = setName + ":" + setId;
            if (_this.isSubInShortcuts(set)) {
                _this.RemoveFromShortcuts(set);
                _this.ToggleShortcutButton(true, this);
            }
            else {
                _this.AddToShortcuts(set);
                _this.ToggleShortcutButton(false, this);
            }

            this.DisplayCustomSubversesList();
        });
    },

    // Special to voat.co/subverses: adds a "shortcut" button for each subverse////
    AddShortcutsButtonInSubversesPage: function () {
        var _this = this;
        var inShortcut = false;
        var tempSubName = "";

        $('.col-md-6').each(function () {
            tempSubName = $(this).find(".h4").attr("href").substr(3);
            inShortcut = _this.isSubInShortcuts(tempSubName);

            var btnHTML = '<br /><button style="margin-top:5px;" id="AVE_Subverses_Shortcut" subverse="' + tempSubName + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">' + (inShortcut ? "-" : "+") + ' shortcut </button>';
            $(btnHTML).appendTo($(this).find(".midcol").first());
        });

        $(document).on("click", "#AVE_Subverses_Shortcut", function () {
            var subName = $(this).attr("subverse");
            if (_this.isSubInShortcuts(subName)) {
                _this.RemoveFromShortcuts(subName);
                _this.ToggleShortcutButton(true, this);
            }
            else {
                _this.AddToShortcuts(subName);
                _this.ToggleShortcutButton(false, this);
            }

            _this.DisplayCustomSubversesList();
        });
    },

    /// Common to voat.co: modifies the subverse header list with custom subverse ////
    DisplayCustomSubversesList: function () {
        var SubString = '';
        var subArr = this.GetSubversesList();
        var setInfo = [];

        for (var idx in subArr) {
            if (!subArr.hasOwnProperty(idx) || subArr[idx] == "") { continue; }
            if (AVE.Utils.regExpSet.test(subArr[idx])) { //ex: name:12
                setInfo = this.GetSetParam(subArr[idx]);
                SubString += '<li><span class="separator">-</span><a href="/set/' + setInfo[1] + '/" style="font-weight:bold;font-style: italic;">' + setInfo[0] + '</a></li>';
            }
            else {
                SubString += '<li><span class="separator">-</span><a href="/v/' + subArr[idx] + '/">' + subArr[idx] + '</a></li>';
            }
        }
        $('ul#sr-bar').html(SubString);
    },

    //// Special to subverse: adds a "shortcut" button for this subverse////
    AppendShortcutButton: function () {
        var _this = this;
        var btnHTML;

        if (!this.isPageInShortcuts()) {
            //style="display:inline" is a fix for the Scribble custom style that tries to hide the block button, but instead hides this button.
            btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline;" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline;" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
        }

        if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
        }
        else {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
        }

        $("#AVE_Shortcut").on("click", function () {
            var subverseName = $("h1.whoaversename > a:first").text();
            if (_this.isPageInShortcuts()) {
                _this.RemoveFromShortcuts(subverseName);
                _this.ToggleShortcutButton(true, "#AVE_Shortcut");
            }
            else {
                _this.AddToShortcuts(subverseName);
                _this.ToggleShortcutButton(false, "#AVE_Shortcut");
            }

            _this.DisplayCustomSubversesList();
        });
    },
    /// Special methods related to shortcuts ///
    GetSubversesList: function () {
        return this.Store.GetValue(this.StorageName, this.defaultList).split(',');
    },
    GetSubversesListRaw: function () {
        return this.Store.GetValue(this.StorageName, this.defaultList);
    },

    GetSetParam: function (str) {
        var m = AVE.Utils.regExpSet.exec(str);

        if (m == null) { return null; }
        else { return [m[1].toLowerCase(), m[2]]; }
    },

    AddToShortcuts: function (SubName) {
        if (SubName === "") {return;}
        var subversesArr = this.GetSubversesListRaw();
        if (subversesArr.toLowerCase().split(",").indexOf(SubName.toLowerCase()) !== -1){
            print("AVE: AddToShortcuts > \""+SubName+"\" is already present in the shortcut list");
            return;
        }
        if (subversesArr === this.defaultList){
            this.Store.SetValue(this.StorageName, SubName);
            return;
        }

        subversesArr = this.GetSubversesList();
        this.Store.SetValue(this.StorageName, subversesArr.join(",") + "," + SubName);
    },

    EditShortcut: function (x, newname) {
        if (newname === "") {return;}
        var subversesArr = this.GetSubversesList();
        if (isNaN(x)){
            //x is the sub's name
            var idx = subversesArr.indexOf(x);
            if (idx !== -1){
                subversesArr[idx] = newname;
            } else {
                print("AVE: EditShortcut > "+x+" couldn't be found");
                return;
            }

        } else {
            //x is an index
            if (x >= 0 && x < subversesArr.length){
                subversesArr[x] = newname;
            } else {
                print("AVE: EditShortcut > index out of bound");
                return;
            }
        }

        this.Store.SetValue(this.StorageName, subversesArr.join(","));
    },

    RemoveSetFromShortcut: function (id) {
        var subversesArr = this.GetSubversesList();

        for (var x in subversesArr) {
            if (AVE.Utils.regExpSet.test(subversesArr[x])) {
                if (this.GetSetParam(subversesArr[x])[1] == id) {
                    this.RemoveFromShortcuts(subversesArr[x]);
                    return true;
                }
            }
        }
        return false;
    },

    RemoveFromShortcuts: function (SubName) {
        var subversesArr = this.GetSubversesListRaw().toLowerCase().split(",");
        var idx = subversesArr.indexOf(SubName.toLowerCase());

        if (idx === -1) {
            alert("AVE: sub or set name not found in header list (" + SubName + ")");
            return;
        }

        subversesArr = this.GetSubversesList();
        subversesArr.splice(idx, 1);
        this.Store.SetValue(this.StorageName, subversesArr.join(","));
    },

    ToggleShortcutButton: function (state, sel) {
        if (state == true) {
            $(sel).text('+ shortcut');
            $(sel).addClass('btn-sub')
        }
        else {
            $(sel).text('- shortcut');
            $(sel).removeClass('btn-sub');
        }
    },

    isSubInShortcuts: function (Sub) {
        var subversesArr = this.GetSubversesList();

        for (var i in subversesArr) {
            if (subversesArr[i].toLowerCase() == Sub.toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    isPageInShortcuts: function () {
        return this.isSubInShortcuts(AVE.Utils.subverseName);
    },

    AppendToDashboard: {
        initialized: false,
        CSSselector: "",
        module: {},

        init: function () {
            this.module = AVE.Modules['Shortcuts'];
            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";
            this.initialized = true;

            var CSS = '' +
                'svg#AVE_subversetable {' +
                '   vertical-align: middle;' +
                '   cursor: pointer;' +
                '   margin-left:10px;' +
                '}' +
                'div#AVE_Dashboard_shortcuts_buttons{' +
                '   margin-bottom: 20px;' +
                '   margin-left: 45px;' +
                '}' +
                'div#AVE_Dashboard_shortcuts_table{' +
                '   margin-left: 45px;' +
                '   margin-bottom: 10px;' +
                '}';
            AVE.Utils.AddStyle(CSS);
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Update data storage
            AVE.Storage.Update();
            this.module.DisplayCustomSubversesList();

            var htmlStr = "";
            var subs = this.module.GetSubversesList();
            var len = subs.length;

            htmlStr += '<div id="AVE_Dashboard_shortcuts_buttons">' +
                '<input placeholder="Enter here a list of subverses separated by commas" class="form-control valid" style="width:400px;display: inline;" type="text" />' +
                '<a href="javascript:void(0);" title="Add new subverse names to the shortcut list" role="append" class="btn-whoaverse-paging btn-xs btn-default" style="margin-left:10px;margin-right:15px;">Append</a>' +
                '<a href="javascript:void(0);" title="Replace the shortcut list with a new one" role="set" class="btn-whoaverse-paging btn-xs btn-default" style="margin-right:15px;">Set</a>' +
                '<a href="javascript:void(0);" title="Export list as a string of subverse names separated by commas" role="export" class="btn-whoaverse-paging btn-xs btn-default">Export</a>' +
                '</div>';

            $.each(subs, function (idx, sub) {
                htmlStr += '' +
                    '<div subname="'+sub+'" id="AVE_Dashboard_shortcuts_table"> ' +
                    '<svg title="Delete" role="remove" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><rect y="5" style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + ';" width="14" height="4"/></svg>' +
                    '<svg title="Move down" role="down" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;' + (idx === len-1 ? "cursor:not-allowed;" : "") + '" xml:space="preserve"><polygon style="fill:#' + (idx === len-1 ? "AAA" : "377da8") + ';" points="11.949,3.404 7,8.354 2.05,3.404 -0.071,5.525 7,12.596 14.07,5.525 "/></svg>' +

                    '<svg title="Move up" role="up" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;' + (idx === 0 ? "cursor:not-allowed;" : "") + '" xml:space="preserve"><polygon style="fill:#' + (idx === 0 ? "AAA" : "377da8") + ';" points="2.051,10.596 7,5.646 11.95,10.596 14.07,8.475 7,1.404 -0.071,8.475 "/></svg>' +

                    '<svg title="edit" role="edit" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#377da8" d="M1,10l-1,4l4-1l7-7L8,3L1,10z M11,0L9,2l3,3l2-2L11,0z"/></svg>' +

                    '<span id="AVE_subname" style="font-size:14px;color:#' + (AVE.Utils.CSSstyle === "dark" ? "AAA" : "666") + ';margin-left:15px;font-weight: bold;">'+sub+'</span>' +
                    '</div>';
            });

            htmlStr += '<div><svg role="add" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;margin-left: 160px;cursor:pointer;" xml:space="preserve"><polygon fill="#27a32b" points="14,5 9,5 9,0 5,0 5,5 0,5 0,9 5,9 5,14 9,14 9,9 14,9 "/></svg></div>';

            return htmlStr;
        },

        callback: function () {
            "use strict";
            var _this = this;
            var JqId = $("section[role='AVE_Dashboard'][module='Shortcuts']");
            var input = JqId.parent().find("input");

            JqId.find("a[role='append']").off().on("click", function () {
                var newset = $.trim(input.val().replace(/\s/g, '')).split(",");
                var newsubs = _this.module.GetSubversesList();

                for (var i = 0; i < newset.length; i++){
                    if (!newset[i] ||  $.inArray(newset[i], newsubs) !== -1){continue;}
                    newsubs.push(newset[i]);
                }
                if (newsubs.length === 0) {return;}

                _this.module.Store.SetValue(_this.module.StorageName, newsubs.join(","));
                _this.Reload();
            });
            JqId.find("a[role='set']").off().on("click", function () {
                var newset = $.trim(input.val().replace(/\s/g, '')).split(",");
                var newsubs = [];

                for (var i = 0; i < newset.length; i++){
                    if (!newset[i] ||  $.inArray(newset[i], newsubs) !== -1){continue;}
                    newsubs.push(newset[i]);
                }
                if (newsubs.length === 0) {return;}

                _this.module.Store.SetValue(_this.module.StorageName, newsubs.join(","));
                _this.Reload();
            });
            JqId.find("a[role='export']").off().on("click", function () {
                prompt("Copy the string below", _this.module.GetSubversesListRaw());
            });
            JqId.find("svg[role='add']").off().on("click", function () {
                var subname = $.trim(prompt("Enter below the subverse's name you want to add"));
                if (subname === ""){return false;}

                _this.module.AddToShortcuts(subname);
                _this.Reload();
            });

            JqId.find("svg[role='remove']").off().on("click", function () {
                var subname = $(this).parent().attr("subname");

                if (!confirm("Are you sure you want to remove \""+subname+"\" from your shortcuts?")){return false;}

                _this.module.RemoveFromShortcuts(subname);
                _this.Reload();
            });
            JqId.find("svg[role='edit']").off().on("click", function () {
                var oldsubname = $(this).parent().attr("subname");
                var newsubname = $.trim(prompt("Edit below the subverse's name.", oldsubname));
                if (newsubname === ""){return false;}

                _this.module.EditShortcut(oldsubname, newsubname);
                _this.Reload();
            });
            JqId.find("svg[role='down']").off().on("click", function () {
                if ($(this).css("cursor") !== "pointer"){return;}

                var subversesArr = _this.module.GetSubversesList();
                var idx = $(this).parent().index() -1;
                AVE.Utils.move(subversesArr, idx, idx+1);

                _this.module.Store.SetValue(_this.module.StorageName, subversesArr.join(","));
                _this.Reload();
            });
            JqId.find("svg[role='up']").off().on("click", function () {
                if ($(this).css("cursor") !== "pointer"){return;}

                var subversesArr = _this.module.GetSubversesList();
                var idx = $(this).parent().index() -1;
                AVE.Utils.move(subversesArr, idx, idx-1);

                _this.module.Store.SetValue(_this.module.StorageName, subversesArr.join(","));
                _this.Reload();
            });
        },

        Reload: function () {
            this.module.DisplayCustomSubversesList();
            $(this.CSSselector).trigger("click"); //Reload-update
        }
    }
};
/// END Subverse and Set shortcuts ///

/// Archive submissions:  Add a link to an archived version of the submission ///
AVE.Modules['ArchiveSubmission'] = {
    ID: 'ArchiveSubmission',
    Name: 'Archive submissions',
    Desc: 'Add a link to an archived version of the submission',
    Category: 'Subverse',

    Index: 101,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        ArchiveSelfposts: {
            Type: 'boolean',
            Desc: "Archive self-posts as well.",
            Value: false
        },
        WebArchive: {
            Type: 'obj',
            Desc: 'What archiving website do you want to use?',
            Websites:
               {'org': 'archive.org', // https://web.archive.org/web/*/URL
                'is' : 'archive.is'}, // https://archive.is/?run=1&url=URL
                                      // Add google-cache?
            Value: "is"
        }
    },

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "thread", "domain", "user-submissions", "user-comments", "saved", "search"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        var _this = this;
        $("ul.flat-list.buttons").each(function () {
            if($(this).find("li > a#AVE_ArchiveSubmission_link").length>0) {return;} //Not already added
            if(!_this.Options.ArchiveSelfposts.Value && $(this).parents("div.submission:first").hasClass("self")){return;} //Not a self-post
            if($(this).find("li:first > a ").text()==="permalink"){return false;} //Not a comment (will break the loop if it is)

            var url;
            url = $(this).parents("div.entry:first").find("p.title > a.title").attr("href");
            //If link to self-post: return. The only case where the archive link will be added to a self-post submissions is with stickies.

            if (!/^http/.test(url)) { //if self-post
                if (_this.Options.ArchiveSelfposts.Value)//recreate URL if chose to archive self-posts
                { url = "https://" + window.location.hostname + url; }
                else //return here otherwise. Even though the function should have exited already by that point (only if not a sticky)
                { return; }
            }
            if (/^https?:\/\/archive\.is/.test(url)) {return;}

            url = 'https://archive.is/?run=1&url='+encodeURIComponent(url);

            $(this).append('<li><a id="AVE_ArchiveSubmission_link" target="_blank" href="'+url+'">archive</a></li>');
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['ArchiveSubmission'];
            var htmlStr = '';

            htmlStr += '<div>The archiving website used is <strong>"archive.is"</strong>.<br>After opening a new page to archive.is, you may need to wait a second or two before being redirected to the archived page.<br>If you are the first to open a particular page looking for an archived version, you will need to wait for it to be processed. Please let this process finish as it will help other users after you.</div><br>';

            htmlStr += '<input id="ArchiveSelfposts" ' + (_this.Options.ArchiveSelfposts.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ArchiveSelfposts"> ' + _this.Options.ArchiveSelfposts.Desc + '</label>';

            return htmlStr;
        }
    }
};
/// END Archive submissions ///

/// Domain filter:  Use filters to remove submissions linking to particular domains. ///
AVE.Modules['DomainFilter'] = {
    ID: 'DomainFilter',
    Name: 'Domain filter',
    Desc: 'Use filters to remove submissions linking to particular domains.',
    Category: 'Domains',

    Index: 101,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [] //not JSONified
        }
    },

    filters: [],

    Filter: function (id, keyword, sub) {
        this.Id = id || 0;
        this.Keywords = keyword || []; //List of keywords
        this.ApplyToSub = sub || []; //List of subs
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        var id, kw, sub, tV;

        this.Options.Filters.Value = [];

        $.each(POST, function (k, v) {
            tV = k.split("-");
            if (tV.length === 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] === "kw") {
                if (v.length === 0) { return true; } //If no kw were specified: continue
                else {
                    _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(","), []));
                }
            } else if (tV[1] === "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id === id; });
                if (inArr.length === 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length !== 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(",");
                }
            }
        });

        //print(JSON.stringify( _this.Options.Filters.Value));

        this.Store.SetValue(this.Store.Prefix + this.ID,
            JSON.stringify(
                {
                    Enabled: POST.Enabled,
                    Filters: this.Options.Filters.Value
                }
            )
        );
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        var _this = this;
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "saved"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.filters = jQuery.extend([], _this.Options.Filters.Value);

            if (AVE.Modules['DomainTags'].Enabled){
                var id = _this.Options.Filters.Value.length;
                $.each(AVE.Modules['DomainTags'].DomainTags, function (name, tag) {
                    if (tag.i){
                        _this.filters.push(new _this.Filter(id++, [name.toLowerCase()]));
                    }
                });
            }

            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        //When a submission is filtered it is simply removed, so no need to check anything special when the update method is triggered.

        var re, found;
        $("div.entry > p.title > span.domain > a").each(function () {
            var DomainRef = $(this);
            var DomainStr = DomainRef.text().toLowerCase(); //if str == self.(SubName) continue
            $.each(_this.filters, function () {
                found = false;
                if (this.ApplyToSub.length === 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) !== -1) {
                    $.each(this.Keywords, function () {
                        if (this.length === 0) { return true;}//Just in case
                        // ((Start of string OR preceded by a period) OR (End of line OR followed by a period))
                        re = new RegExp("(^|\\.)"+this+"($|\\.)");
                        // An issue could arise if a filter matches a subdomain's name. Unfortunately, I cannot check to see if an TLD always follows.
                        if (re.test(DomainStr)) {
                            print("AVE: removed submission from domain \"" + DomainStr + "\" (kw: \"" + this + "\")");
                            DomainRef.parents("div.submission:first").remove();
                            found = true; //no point in continuing since the submission no longer exists
                            return false; //break
                        }
                    });
                }
                if (found) { return false; } //break
            });
            if (found) { return true; } //continue
        });
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        htmlNewFilter: '',

        html: function () {
            var _this = AVE.Modules['DomainFilter'];
            var Pref_this = this;
            var htmlStr = "";

            this.htmlNewFilter = '<span class="AVE_Domain_Filter" id="{@id}">\
                                Keyword(s) \
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@keywords}"/>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@subverses}"/>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "abc" matches "abc.com", "en.abc.com" but not "abcd.com".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id}/ig, count);
                filter = filter.replace("{@keywords}", this.Keywords.join(","));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(","));
                count++;
                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top:10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            var JqId = $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter");
            $("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#DomainFilter > div.AVE_ModuleCustomInput > span.AVE_Domain_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click")
                    .on("click", function () {
                    print("Remove link: " + $(this).attr("id"), true);
                    print("Remove span: " + $(this).prev("span.AVE_Domain_Filter").attr("id"), true);
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Domain_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            JqId.off("click");
            JqId.on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Domain_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("DomainFilter");
            });
        }
    }
};
/// END Domain filter ///

/// Single click opener:  Add "[l+c]" link to submission, opens link and comment pages. ///
AVE.Modules['SingleClickOpener'] = {
    ID: 'SingleClickOpener',
    Name: 'Single click opener',
    Desc: 'Add "[l+c]" link to submission, opens link and comment pages.',
    Category: 'Subverse',

    Index: 102,
    Enabled: false,

    Store: {},

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        OpenInArchive: {
            Type: 'boolean',
            Desc: 'Open external link in <strong>archives.is</strong>.',
            Value: false
        }
    },

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "saved"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        $("ul.flat-list.buttons").each(function () {
            if ($(this).find("li > a#AVE_SingleClickOpener_link").length > 0) {return;}
            if($(this).parents("div.submission:first").hasClass("self")){return;} //Not a self-post
            $(this).append('<li><a id="AVE_SingleClickOpener_link" href="javascript:void(0);">[l+c]</a></li>');
        });
    },

    Listeners: function () {
        "use strict";
        var _this = this;
        $("li > a#AVE_SingleClickOpener_link").off().on("click", function () {
            var url = [];

            url.push($(this).parents("div.entry:first").find("p.title > a.title").attr("href"));
            url.push("https://" + window.location.hostname + $(this).parent().parent().find(":first-child > a.comments").attr("href"));

            if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

            if (_this.Options.OpenInArchive.Value && !/^https?:\/\/archive\.is/.test(url[0])){
                url[0] = 'https://archive.is/?run=1&url='+encodeURIComponent(url[0]);
            }

            if (url[0] && url[0] === url[1]) {
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
            } else {
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
            }
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['SingleClickOpener'];
            return '<input id="OpenInArchive" ' + (_this.Options.OpenInArchive.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInArchive"> ' + _this.Options.OpenInArchive.Desc + '</label><br>';
        }
    }
};



/// END Single click opener ///

/// Hide username:  Options to hide or replace references to your username (not in posts). ///
AVE.Modules['HideUsername'] = {
    ID: 'HideUsername',
    Name: 'Hide username',
    Desc: 'Options to hide or replace references to your username (not in posts).',
    Category: 'Account',

    //Should be loaded after the usertag module 
    Index: 150,
    Enabled: false,

    Store: {},

    RunAt: "banner",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        NewName: {
            Type: 'string',
            Desc: "Replace with: ",
            Value: ""
        },
        ReplaceEverywhere: {
            Type: 'boolean',
            Desc: 'Replace all references to your username.',
            Value: false
        },
        RemoveInLoginBlock: {
            Type: 'boolean',
            Desc: 'Remove your username from the user info block.',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        if (AVE.Utils.CurrUsername() === null) {return;}

        if (this.Options.RemoveInLoginBlock.Value) {
            $(".logged-in > .user > a[title='Profile']").remove();
        } else if (!this.Options.ReplaceEverywhere.Value) {
            $(".logged-in > .user > a[title='Profile']").text(this.Options.NewName.Value);
        }

        if (this.Options.ReplaceEverywhere.Value) {
            $("a[href='/user/" + AVE.Utils.CurrUsername() + "'],a[href='/u/" + AVE.Utils.CurrUsername() + "']")
                .not("#upvoatsGiven").filter(":parents(li.selected)")
                .text(this.Options.NewName.Value);
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['HideUsername'];
            var htmlStr = '';

            htmlStr += '<input id="RemoveInLoginBlock" ' + (_this.Options.RemoveInLoginBlock.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="RemoveInLoginBlock"> ' + _this.Options.RemoveInLoginBlock.Desc + '</label>';
            htmlStr += '<br /><input id="ReplaceEverywhere" ' + (_this.Options.ReplaceEverywhere.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ReplaceEverywhere"> ' + _this.Options.ReplaceEverywhere.Desc + '</label>';
            htmlStr += '<br />' + _this.Options.NewName.Desc + '<input id="NewName" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.NewName.Value + '"/>';

            return htmlStr;
        },
        callback: function () {
        }
    }
};
/// END Hide username ///

/// Domain tags:  Choose tags to characterize domains. ///
AVE.Modules['DomainTags'] = {
    ID: 'DomainTags',
    Name: 'Domain tags',
    Desc: 'Choose tags to characterize domains.',
    Category: 'Domains',

    Index: 200,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        }
    },

    Style: "",
    DomainTags: "",
    StorageName: "",
    Processed: [],

    DomainTagObj: function (tag, colour, ignore) {
        this.t = tag.toString();
        this.c = colour.toString();
        this.i = !!ignore;
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.style =
                'div.AVE_Domain_tag {' +
                '   margin-left: 5px;' +
                '   cursor: pointer;' +
                '   display: inline-block;' +
                '}' +
                'div.AVE_Domaintag_box > span {' +
                '   cursor: pointer;' +
                '   font-size: 14px;' +
                '   margin-left: 2px;' +
                '   margin-right: 2px;' +
                '}' +
                'div.AVE_Domaintag_box > div#ColourDot {' +
                '	width: 15px;' +
                '	height: 15px;' +
                '	border-radius: 10px;' +
                '	display: inline;' +
                '	float: right;' +
                '   margin: 2px 8px 2px 0px;' +
                '	border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '   cursor: pointer;' +
                '/* overrides */' +
                //'	width: 20px;' +
                //'	height: 20px;' +
                //'	border-radius: 0px 10px 10px 0px;' +
                //'	display: inline;' +
                //'	float: right;' +
                //'	margin: 0px 5px 0px 0px;' +
                //'	border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                //'	cursor: pointer;' +
                //'	min-width: 10px;' +
                //'	border-width: 0px 2px 0px 1px;' +
                '}' +
                'div.AVE_Domaintag_box > input[type="text"] {' +
                '	height: 20px;' +
                '	width: 220px;' +
                '	border: none;' +
                '   border-left: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '   border-right: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '	padding-left: 5px;' +
                '	background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "414141" : "F8F8F8") + ';' +
                '}' +
                'div.AVE_Domaintag_box {' +
                    'background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';' +
                    (AVE.Utils.CSSstyle === "dark" ? "" : "color: #707070;") +
                    'z-index: 1000 !important;' +
                    'position:absolute;' +
                    'left:0px;' +
                    'top:0px;' +
                    'border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                    'border-radius:3px;' +
                    'width:320px;' +
                '}' +
                'div.AVE_Domain_tag > svg {' +
                '   vertical-align: middle;' +
                '}' +
                'div.AVE_Domaintag_box > svg {' +
                '   vertical-align: middle;' +
                '   margin-left: 2px;' +
                '}';
            AVE.Utils.AddStyle(this.style);

            this.StorageName = this.Store.Prefix + this.ID + "_Tags";
            this.DomainTags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));

            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        var _this  = this;

        $("p.title > span.domain > a").each(function () {
            var id = $(this).parents("div.submission[class*='id-']:first").attr("data-fullname");
            if ($.inArray(id, _this.Processed) !== -1){return true;}
            else {_this.Processed.push(id);}

            var domain;
            var tag, colour;
            domain = $(this).text();

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
            }
            //Commented out so that we can tag subverses too (self-text submissions).
            //if (/self\.[a-zA-Z0-9]?/.test(domain)){return true;}

            if ($(this).parent().find("div.AVE_Domain_tag").length === 0) {
                $('<div class="AVE_Domain_tag"></div>').insertAfter($(this));
                var el = $(this).parent().find("div.AVE_Domain_tag");

                if (!tag && !colour) {
                    el.html('<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + ';" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>');
                    el.attr("title", "Click to create a new tag");
                } else {
                    if (!tag) { tag = "No tag"; }
                    else if (!colour) { colour = (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB"); }
                    el.attr("title", tag);
                    el.html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="' + colour + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>');
                }
            }
        });
    },

    Listeners: function () {
        "use strict";
        var _this = this;

        $("div.AVE_Domain_tag").off().on("click", function (e) {
            //e.stopPropagation();
            var domain, box;
            var tag, colour, ignore;

            domain = $(this).parent().find("a").text();

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
                ignore = _this.DomainTags[domain].i;
            }
            box = $("div.AVE_Domaintag_box");

            if (box.length === 0){
                var boxHtml;

                boxHtml = '' +
                    '<div domain="void" class="AVE_Domaintag_box">' +
                    '   <svg version="1.1" id="infoicon" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#FF0000" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>' +
                    '   <input placeholder="Click here to create a new tag" id="AVE_Domaintag_box_textinput" type="text" value="">' +
                    '   <svg version="1.1" id="ignoreDomain" title="Click to toggle ignored" style="cursor:pointer;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="14px" viewBox="0 0 14 14" xml:space="preserve"><path style="fill:#ABABAB;" d="M7,2C3,2,0,7,0,7s3,5,7,5s7-5,7-5S11,2,7,2z M7,10c-1.657,0-3-1.344-3-3c0-1.657,1.343-3,3-3 s3,1.343,3,3C10,8.656,8.657,10,7,10z M7,6C6.448,6,6,6.447,6,7c0,0.553,0.448,1,1,1s1-0.447,1-1C8,6.447,7.552,6,7,6z" />' +
                    '       <polyline style="stroke:#ABABAB;stroke-width:0px;" points="13,1 1,13"/></svg>' +
                    '   <span id="cancel" title="Cancel and close" style="float:right;">✖</span>' +
                    '   <span id="submit" title="Accept and save" style="float:right;">✔</span>' +
                    '   <div id="ColourDot" title="Click to choose a color"></div><input style="opacity:0;visiblity: hidden; position: absolute;width:0px;height:0px" type="color" value="">' +
                    '</div>'; //Weird css values for the colour input because of Chrome not wanting to trigger it if hidden with "display:none;"

                $("body").append(boxHtml);

                box = $("div.AVE_Domaintag_box");
                box.find("div#ColourDot").on("click", function () {
                    var dot = $(this);
                    dot.parent().find("input[type='color']")
                        .trigger("click")
                        .on("change", function () {
                            dot.css("background-color", $(this).val());
                            dot.parent().find("svg:first").find("path").css("fill", $(this).val());
                        });
                });
                box.find("input[type='text']").on("input", function () {
                    box.find("svg:first").attr("title", $(this).val() || "No tag");
                });
                box.find("svg:last").off().on("click", function () {
                    var Opt;
                    if (!AVE.Modules['DomainFilter'].Enabled){
                        if (!confirm("This feature relies on DomainFilter to work, but this module is disabled.\nDo you want to activate it?")){
                            return;
                        } else {
                            Opt = JSON.parse(_this.Store.GetValue(_this.Store.Prefix + AVE.Modules['DomainFilter'].ID, "{}"));
                            Opt.Enabled = true;
                            _this.Store.SetValue(_this.Store.Prefix + AVE.Modules['DomainFilter'].ID, JSON.stringify(Opt));
                            print("AVE: DomainFilter > Enabled by DomainTag");
                        }
                    }

                    var poly = $(this).find("polyline");
                    poly.css("stroke-width", poly.css("stroke-width") !== "2px" ? "2px" : "0px");
                });

                box.find("span#cancel").off().on("click", function () {
                    box.hide();
                });
                box.find("span#submit").off().on("click", function () {
                    domain = box.attr("domain");
                    tag = box.find("input[type='text']").val();
                    colour = box.find("input[type='color']").val();
                    ignore = box.find("svg > polyline").css("stroke-width") === "2px";

                    _this.setTag(domain, tag, colour, ignore);
                    _this.updateTag(domain);
                    box.hide();
                });
                box.hide();
            }

            var position = $(this).offset();
            position.top -= 5;
            position.left = Math.max(position.left - 280, 20);
            box.css(position)
                .show();

            box.attr("domain", domain);
            box.find("input[type='text']").val(tag).select();
            box.find("input[type='color']").val(colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("div#ColourDot").css("background-color", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg:first").find("path").css("fill", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg:first").attr("title", tag || "No tag");
            box.find("svg:last > polyline").css("stroke-width", ignore ? "2px" : "0px");
        });

        $(document).on("keyup", function (e) {
            var box = $("div.AVE_Domaintag_box");
            if (box.is(":visible")){
                //print(e.key + " - "+e.which);
                if (e.which === 13) { //enter
                    if ($(e.target).attr("id") === "AVE_Domaintag_box_textinput") {
                        box.find("span#submit").trigger("click");
                    }
                }
                else if (e.which === 27) { //escape
                    box.find("span#cancel").trigger("click");
                }
            }
        });
    },

    updateTag: function (domain) {
        "use strict";
        var _this = this;
        $("p.title > span.domain > a:textEquals("+domain+")").each(function(){
            var tag, colour, ignore;

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
                ignore = _this.DomainTags[domain].i || false;
            }

            var el = $(this).parent().find("div.AVE_Domain_tag");
            if(!el){return;}

            if (!tag && !colour) {
                el.html('<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>');
                el.attr("title", "Click to create a new tag");
            } else {
                if (!tag) { tag = "No tag"; }
                else if (!colour) { colour = (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB"); }
                el.attr("title", tag);
                el.html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="' + colour + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>');
            }
        });
    },

    setTag: function (domain, tag, colour, ignore) {
        "use strict";
        var obj = new this.DomainTagObj(tag, colour, ignore);
        if(!obj.t && !obj.c){return;}
        this.DomainTags[domain] = obj;

        //print(JSON.stringify(this.DomainTags[domain]));
        this.Store.SetValue(this.StorageName, JSON.stringify(this.DomainTags));
    },
    removeTag: function (domain) {
        "use strict";
        delete this.DomainTags[domain];
        this.Store.SetValue(this.StorageName, JSON.stringify(this.DomainTags));
    },

    AppendToPreferenceManager: {
        html: function () {
            "use strict";
            var _this = AVE.Modules['DomainTags'];
            var htmlStr = '' +
                '<span>' +
                '   Click the default icon (<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="vertical-align: middle;enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>) to display the tagbox and create a new tag.' +
                '   <br/>Move your mouse over the I icon (<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="vertical-align: middle;enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>) to see the tag, click this icon to edit the current tag.' +
                '   <br/>You don\'t have to choose a tag label to create a new domainTag; a colour alone is enough.';

            if (_this.Enabled){
                var len = Object.keys(_this.DomainTags).length;
                htmlStr += '<br /><br />You have tagged <strong>'+ len +'</strong> domain'+ (len > 1 ? "s" : "") +'.';
            }

            htmlStr += '</span>';
            return htmlStr;
        }
    },


    AppendToDashboard: {
        tableCSS: '',
        initialized: false,
        module: {},
        domaintags: [],

        tagsperpage: 20,
        currpage: 0,

        CSSselector: "",

        MouseOverColours: [],

        init: function () {
            this.tableCSS = '\
                table#AVE_Dashboard_domaintags_table{\
                    width: 100%;\
                }\
                table#AVE_Dashboard_domaintags_table > thead > tr {\
                    font-size: 14px;\
                    padding-bottom: 10px;\
                    margin-bottom: 20px;\
                }\
                table#AVE_Dashboard_domaintags_table > thead > tr > th{\
                    text-align: center;\
                    font-weight: bold;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr:hover {\
                    background-color: '+(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9")+';\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td{\
                    padding-top: 5px;\
                    border-top : 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    text-align: center;\
                    margin\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(1){\
                    /* Username */\
                    font-weight: bold;\
                    text-align: left;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(2){\
                    /* Tag */\
                    text-align: left;\
                    width: 250px;\
                    overflow: hidden;\
                    text-overflow: ellipsis;\
                    white-space: nowrap;\
                    padding-right: 10px;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(3){\
                    /* Colour */\
                    width: 120px;\
            }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:last-child{\
                    /* Delete */\
                    height: 14px;\
                    width: 14px;\
                    /* SVG from Jquery Mobile Icon Set */\
                    background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + '%22%20points%3D%2214%2C3%2011%2C0%207%2C4%203%2C0%200%2C3%204%2C7%200%2C11%203%2C14%207%2C10%2011%2C14%2014%2C11%2010%2C7%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
                    background-repeat: no-repeat;\
                    cursor: pointer;\
                    background-position: center;\
                }\
                a#AVE_Dashboard_navigate_tags[role]{\
                    margin: 0px 5px 10px 0px;\
                }\
                td > span#PreviewBox {\
                    margin: -2px 0px -2px 0px;\
                }';
            AVE.Utils.AddStyle(this.tableCSS);

            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9");
            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#534040" : "#FFC9C9");

            this.module = AVE.Modules['DomainTags'];

            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";

            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Empty container
            this.domaintags = [];

            var _this, tempObj, tempDomaintags, keys, htmlStr, start;
            _this = this;
            start  = this.currpage*this.tagsperpage;
            htmlStr = "";

            AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
            tempDomaintags = JSON.parse(this.module.Store.GetValue(this.module.StorageName, "{}"));
            keys = Object.keys(tempDomaintags);
            keys.sort();

            $.each(keys, function (idx, key) {

                tempObj = tempDomaintags[key];
                tempObj.name = key;

                tempObj.c = tempObj.c || "#FFF";
                tempObj.i = tempObj.i ? "Yes" : "No";
                _this.domaintags.push( JSON.stringify( tempObj ) );

            });

            var htmlNavButtons = this.navbuttons();

            htmlStr += htmlNavButtons;

            htmlStr += '<input style="display:none;" id="AVE_Dashboard_domaintags_quickedit" data="colour" style="width:50px;" type="color" original="#FFFFFF" value="#FFFFFF">';

            var htmlTable = "";
            htmlTable += '<table id="AVE_Dashboard_domaintags_table">' +
                '<thead>' +
                '<tr>' +
                '<th>Domain</th>' +       //click to go to user page
                '<th>Tag</th>' +            //click to show input box
                '<th>Colour</th>' +         //click to show color picker
                '<th>Ignored</th>' +        //click to toggle ignore
                '<th role="remove"></th>' + //click to remove entire tag
                '</tr>' +//ADD link to open page to this domain
                '</thead>';
            htmlTable +=    this.paging(start, this.tagsperpage);
            htmlTable += "</table>";

            htmlStr += htmlTable;

            htmlStr += '<div style="text-align: right;margin-bottom:10px;">Showing tags '+ (start+1)+' to '+ Math.min(this.domaintags.length, start+this.tagsperpage) +' ('+this.domaintags.length+' total)</div>';

            htmlStr += htmlNavButtons;

            htmlStr +='<br><div style="margin-top:20px;font-weight:bold;">Click on a value to modify it.'+
                '<br> Click the buttons on either sides to navigate through the table pages or use the arrow keys (+Ctrl to go to the first or last page)';

            return htmlStr;
        },
        callback: function () {
            "use strict";
            var _this = this;
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:last-child') //remove
                .off()
                .on("mouseover", function () {
                    $(this).parent().css("background", _this.MouseOverColours[1]);
                })
                .on("mouseleave", function () {
                    $(this).parent().css("background", "");
                })
                .on("click", function () {
                    var name = $(this).parent().attr("domain");
                    if (confirm("Are you sure you want to delete the tag attached to \""+name+"\"?")){
                        _this.module.removeTag(name);
                        $(_this.CSSselector).trigger("click");
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(2)') //edit tag
                .off()
                .on("click", function (e, artificial) {
                    var tag = $(this).text() || $(this).find("input").val() || "";

                    if ($(this).find("input").length === 0){
                        $(this).html('<input id="AVE_Dashboard_domaintags_quickedit" data="tag" style="width:95%;" type="text" original="'+tag+'" value="'+tag+'">');
                        var input = $(this).find("input");
                        input.focus().select();
                        input.one("focusout", function () {
                            input.val(input.attr("original"));
                            $(this).trigger("click", true);
                        });
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus because of a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+tag+'">'+tag+'</span>');
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(3)') //edit colour
                .off()
                .on("click", function (e, artificial) {
                    var colour = $(this).text() || $(this).find("input").val();

                    if ($(this).find("input").length === 0){
                        var input = $("input#AVE_Dashboard_domaintags_quickedit[type='color'][data='colour']");
                        input.attr("original", colour).attr("u", $(this).parent().attr("domain")).val(colour);
                        input.one("change", function () {
                            _this.editTag(input, "colour");
                        });
                        input.show().css("opacity", "0"); //Because of Chrome which doesn't want to show the colour palette if the input is hidden ("display: none;")
                        input.trigger("click");
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus by a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+colour+'">'+colour+'</span>');
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(4)') //edit ignore
                .off()
                .on("click", function () {
                    var ignore, newval;
                    ignore = $(this).text();
                    newval = ignore === "No" ? "Yes" : "No";

                    $(this).text(newval);
                    _this.editTag($(this), "ignore");
                });
            $('a#AVE_Dashboard_navigate_tags') //navigate with buttons
                .off()
                .on("click", function () {
                    if ($(this).hasClass("btn-unsub")){return false;}

                    switch ($(this).attr('role')) {
                        case "prev":
                            _this.currpage--;
                            break;
                        case "next":
                            _this.currpage++;
                            break;
                        case "first":
                            _this.currpage = 0;
                            break;
                        case "last":
                            _this.currpage = Math.ceil((_this.domaintags.length - _this.tagsperpage) / _this.tagsperpage);
                            break;
                        default:
                            return;
                    }

                    $(_this.CSSselector).trigger("click");
                });
            $(document)
                .off()
                .on("keyup", function (event) {
                    var ctrl, pos, input;
                    ctrl= event.ctrlKey;

                    input = $("input#AVE_Dashboard_domaintags_quickedit:not([type='color'])");

                    if (input.length === 0){ //navigate with arrow keys
                        //We don't want to change page when a user is using the arrow key to edit a value
                        if (event.which === 37){
                            pos = (ctrl ? "first" : "prev");
                        } else if (event.which === 39){
                            pos = (ctrl ? "last" : "next");
                        }
                        if (pos){
                            $('a#AVE_Dashboard_navigate_tags[role="'+ pos +'"]:first').trigger("click");
                        }
                    }

                    if (event.which === 13){ //Press enter to confirm change
                        _this.editTag(input, input.attr("data"));
                    }
                });
        },

        editTag: function (input, dtype) {
            "use strict";
            var _this = this;

            if (input.length === 1){
                if (input.attr("original") === input.val() && dtype !== "ignore"){input.trigger("click", true);return;}//No need to update nor reload if nothing changed
                var root, tag, colour;

                if (dtype === "colour"){
                    var u  = input.attr("u");
                    root = $("tr[domain='"+u+"']");
                } else {
                    root = input.parents("tr:first");
                }

                var domain = root.attr("domain");
                var ignore = root.find("td[data='ignore']").text() === "Yes";

                if (dtype === "tag"){
                    tag = input.val();
                } else {
                    tag = root.find("td[data='tag']").text();
                }

                if (dtype === "colour"){
                    colour = input.val() || input.attr("original");
                } else {
                    colour = root.find("td[data='colour']").text();
                }

                _this.module.setTag(domain, tag, colour, ignore); //save tag

                $(_this.CSSselector).trigger("click"); //Reload-update
            }
        },

        navbuttons: function () {
            var htmlNavButtons = "";
            htmlNavButtons += '<div style="float: left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="first" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">First</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="prev" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">Previous</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="last" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.domaintags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Last</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="next" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.domaintags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Next</a>' +
                '</div>';
            return htmlNavButtons;
        },

        paging: function (start, nb) {
            var colour, r, g, b, bestColour;

            var htmlStr = "";
            var obj = {};
            var direct = false;

            for (var i=start; i <= start+nb-1; i++){
                if (i >= this.domaintags.length){break;}

                obj = JSON.parse(this.domaintags[i]);

                colour = AVE.Utils.GetRGBvalues(obj.c);
                r = colour[0]; g = colour[1]; b = colour[2];
                bestColour = AVE.Utils.GetBestFontColour(r, g, b);

                direct = /v\/[a-zA-Z0-9]?/.test(obj.name);

                htmlStr += '<tr domain="'+obj.name+'">';
                htmlStr += '<td><a target="_blank" href="/'+ (direct ? obj.name : "domains/"+obj.name)+'" >'+obj.name + '</a></td>' +
                    '<td data="tag"><span title="'+obj.t+'">'+obj.t+'</span></td>' +
                    '<td data="colour" style="background-color:'+obj.c+'; color:'+bestColour+';">'+obj.c+'</td>' +
                    '<td data="ignore">'+obj.i+'</td>' +
                    '<td role="remove_icon"></td>';
                htmlStr += "</tr>";
            }
            return htmlStr;
        },

        destructor: function () {
            //set all listeners to off
        }
    }
};
/// END Domain tags ///

/// User-block fixes:  Minor fixes to the userblock. ///
AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'User-block fixes',
    Desc: 'Minor fixes to the userblock.',
    Category: 'Misc',

    Index: 200,
    Enabled: false,

    RunAt: 'banner',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        DivideBlock: {
            Type: 'boolean',
            Value: false
        },
        ToggleBlock: {
            Type: 'boolean',
            Value: true
        },
        PersistentHide: {
            Type: 'boolean',
            Value: false
        },
        HidePoints: {
            Type: 'boolean',
            Value: false
        }
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    bg: "",
    userBlockOriginalOffset: null,
    userBlockOriginalWidth: 0,
    HeaderFixed: false,

    Start: function () {
        if (!AVE.Utils.ListHeaderHeight) { AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); }

        if (AVE.Modules['HeaderFixedPos'] && AVE.Modules['HeaderFixedPos'].Enabled){ this.HeaderFixed = true; }

        var JqId1 = $('#header-account');
        if(JqId1.length === 0) {
            print("AVE: UserInfoFixedPos > the header account element couldn't be found.");
        }

        var JqId2 = $("div#header-account > div.logged-in");
        //this.userBlockOriginalTopOffset = JqId1.offset().top;
        //this.SetAccountHeaderPosAsFixed();

        if (this.Options.DivideBlock.Value && JqId2.length > 0) {
            //Align header-account's content
            JqId2.css("text-align", "center");
            //Add a line return before the icons
            $("<br />").insertAfter("div#header-account > div.logged-in > span.separator:first");
            //Remove the, now useless, separator
            $("div#header-account > div.logged-in > span.separator:first").remove();    
        }

        if (this.Options.ToggleBlock.Value && $('#header-account:has(div.logged-in)').length > 0) {
            //Add arrow icon element
            JqId1.append('<div title="Hide user block" class="expanded" id="AVE_ToggleUserBlock"></div>');
            this.ToggleBlockListener();
        }

        if (this.Options.PersistentHide.Value) {
            $("div#AVE_ToggleUserBlock").click();
        }

        if (this.Options.HidePoints.Value){
            var html = $("a[title='Profile']")[0].outerHTML;
            $("span.user:first").html(html);
        }

        this.SetAltBackground();

        AVE.Utils.AddStyle('\
div#AVE_ToggleUserBlock{\
    background-position: center center;\
    background-repeat: no-repeat;\
    border: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "222" : "DCDCDC") + ';\
    border-radius: 1em;\
    cursor:pointer;\
    float:right;\
    width: 14px;\
    height: 14px;\
}\
div#AVE_ToggleUserBlock.expanded{\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20style%3D%22fill%3A%23DDD%3B%22%20points%3D%223.404%2C2.051%208.354%2C7%203.404%2C11.95%205.525%2C14.07%2012.596%2C7%205.525%2C-0.071%20%22%2F%3E%3C%2Fsvg%3E");\
}\
div#AVE_ToggleUserBlock.collapsed{\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23DDD%22%20points%3D%2214%2C5%209%2C5%209%2C0%205%2C0%205%2C5%200%2C5%200%2C9%205%2C9%205%2C14%209%2C14%209%2C9%2014%2C9%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
}\
.logged-in{\
    margin-bottom:2px;\
}\
div#header-account > div.logged-in{\
    background: ' + this.bg + '\
}\
/* Next is a fix for some custom styles */\
div#container {z-index: 1;}\
div#header-container {z-index: 2;}\
.modal-backdrop.in {display: none;}\
.modal#linkFlairSelectModal{top: 140px;}');

        this.Listeners();

        // Update once after three seconds in case modules loaded later change the element's width by addind content to it.
        setTimeout(this.UpdateBlockData, 3000);
    },

    SetAltBackground: function () {
        if(!AVE.Modules['InjectCustomStyle'] || !AVE.Modules['InjectCustomStyle'].Enabled){return;}

        var JqId = $("div#header-container");
        this.bg = JqId.css("background-color") + " " +
                  JqId.css("background-image") + " " +
                  JqId.css("background-repeat") + " " +
                  JqId.css("background-attachment") + " " +
                  JqId.css("background-position") + " " +
                  JqId.css("background-clip") + " " +
                  JqId.css("background-origin");

        if (JqId.css("background-color") === "transparent" &&
            JqId.css("background-image") === "none") {
            this.bg = $("div#header[role='banner']").css("background-color");
            if (this.bg === "transparent") {
                this.bg = $("#logged-in").css("background-color");

                if (this.bg === "transparent" &&
                    this.bg === $("[title='Profile']").css("color")) {
                    $("[title='Profile']").css("color");
                    this.bg = $("#header-account").css("background-color");

                    if (this.bg === "transparent") {
                        this.bg = $("div#header[role='banner']").css("background-color");

                        if (this.bg === "transparent") {
                            //If there is no colour nor any image set, we set a default value
                            this.bg = AVE.Utils.CSSstyle === "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
                        }
                    }
                }
            }
        }
        $('div#header-account > div.logged-in').css("background", this.bg);
    },

    SetAccountHeaderPosAsFixed: function () {
        var JqId = $('#header-account');
        if ($(window).scrollTop() + (this.HeaderFixed ? AVE.Utils.ListHeaderHeight : 0) > this.userBlockOriginalOffset.top) {
            JqId.css('position', 'fixed')
                .css('top', (this.HeaderFixed ? AVE.Utils.ListHeaderHeight : 0) +"px")
                .css('left', this.userBlockOriginalOffset.left+"px")
                .css('right', this.userBlockOriginalOffset.right+"px")
                .css("text-align", "center")
                .css("height", "0px");
            $('.logged-in').css("background", AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
        } else {
            JqId.css('position', "")
                .css('top', "")
                .css('left', "")
                .css('right', "")
                .css("text-align", "")
                .css("height", "");
            $('.logged-in').css("background", "");
        }
    },

    ToggleBlockListener: function() {
        var JqId = $("div#AVE_ToggleUserBlock");
        JqId.on("click", function () {//
            if (JqId.hasClass("collapsed")) {//If user block is already hidden
                //Show expand icon
                JqId.removeClass("collapsed");
                JqId.addClass("expanded");
                //Change element's title
                JqId.attr("title", "Hide user block");
                //Show user block
                $('div#header-account > div.logged-in,div.logged-out').show();
                //Restore #header-account's default size
                $('div#header-account').css("width", "")
                    .css("height", "");
            } else {//If user block is visible
                //Show collapse icon
                JqId.removeClass("expanded");
                JqId.addClass("collapsed");
                //Change element's title
                JqId.attr("title", "Show user block");
                //Hide user block
                $('div#header-account > div.logged-in,div.logged-out').hide();
                //Set #header-account's size to be that of the toggle icon
                $('div#header-account').css("width", "14px")
                    .css("height", "14px");
            }
        });
    },

    Listeners: function () {
        var _this = this;
        $(window).ready(function () { _this.UpdateBlockData(); _this.SetAccountHeaderPosAsFixed();})
                 .on("scroll", function () { _this.SetAccountHeaderPosAsFixed();})
                 .on("resize", function () { _this.UpdateBlockData(); _this.SetAccountHeaderPosAsFixed();});
    },

    UpdateBlockData : function () {
        var JqId = $('#header-account');

        // Reset the block for an instant so that we don't get back the offset values we ourselves set.
        // If you don't see what I mean: comment out the next css calls, then resize the page while scrolled down
        JqId.css('position', "")
            .css('top', "")
            .css('left', "")
            .css('right', "")
            .css("text-align", "")
            .css("height", "");

        if (!this.userBlockOriginalOffset){
            this.userBlockOriginalOffset = JqId.offset();
            this.userBlockOriginalWidth = JqId.outerWidth();
        }
        else { this.userBlockOriginalOffset.left = JqId.offset().left; }

        this.userBlockOriginalOffset.right = Math.floor($(document).width() - (this.userBlockOriginalOffset.left + this.userBlockOriginalWidth));
        if (this.userBlockOriginalOffset.right < 0){this.userBlockOriginalOffset.right = 0;}
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserInfoFixedPos'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Account header separated - username and stats at the top, icons below</label>';
            htmlStr += '<br /><input ' + (_this.Options.ToggleBlock.Value ? 'checked="true"' : "") + ' id="ToggleBlock" type="checkbox"/><label style="display:inline;" for="ToggleBlock"> Show icon to toggle hide/show the user block</label>';
            htmlStr += '<br /><input ' + (_this.Options.PersistentHide.Value ? 'checked="true"' : "") + ' id="PersistentHide" type="checkbox"/><label style="display:inline;" for="PersistentHide"> Always hide the userblock</label>';
            htmlStr += '<br /><input ' + (_this.Options.HidePoints.Value ? 'checked="true"' : "") + ' id="HidePoints" type="checkbox"/><label style="display:inline;" for="HidePoints"> Hide contribution points</label>';

            return htmlStr;
        }
    }
};

/// END User-block fixes ///

/// Account Switcher:  Store information for several accounts and switch between them easily. ///
AVE.Modules['AccountSwitcher'] = {
    ID: 'AccountSwitcher',
    Name: 'Account Switcher',
    Desc: 'Store information for several accounts and switch between them easily.',
    Category: 'Account',

    Index: 200,
    Enabled: false,

    Store: {},

    RunAt: "banner",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        IconPositionLeft: {
            Type: 'boolean',
            Desc: "Display the voat icon on the left of your username",
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {

            this.StorageName = this.Store.Prefix + this.ID + "_accounts";

            this.savedAccounts = JSON.parse(this.Store.GetValue(this.StorageName, "[]"));

            this.Start();
        }
    },

    Start: function () {
        //Thanks a lot to /u/GingerSoul for this feature!

        this.style = '' +
            'span#AVE_AccountSwitcher_del {\
                /* Delete */\
                height: 14px;\
                width: 14px;\
                margin-top:2px;\
                margin-left:4px;\
                /* SVG from Jquery Mobile Icon Set */\
                background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + '%22%20points%3D%2214%2C3%2011%2C0%207%2C4%203%2C0%200%2C3%204%2C7%200%2C11%203%2C14%207%2C10%2011%2C14%2014%2C11%2010%2C7%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
    background-repeat: no-repeat;\
    cursor: pointer;\
    background-position: center;\
                }\
            span#AVE_AccountSwitcher_edit {\
                /* edit */\
                height:14px;\
                width:14px;\
                margin-top:2px;\
                margin-left:4px;\
                /* SVG from Jquery Mobile Icon Set */\
                background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23377da8%22%20d%3D%22M1%2C10l-1%2C4l4-1l7-7L8%2C3L1%2C10z%20M11%2C0L9%2C2l3%2C3l2-2L11%2C0z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
                background-repeat:no-repeat;\
                cursor:pointer;\
                background-position:center;\
                }\
            .light span#AVE_AccountSwitcher_account{\
                color:#000;\
                }\
            .dark span#AVE_AccountSwitcher_account{\
                color:#FFF;\
                }\
            span#AVE_AccountSwitcher_account:hover{\
                color:#e23f3f;\
                }\
            .dark div#AVE_AccountSwitcher_MngrMenu{\
                color:#fff;\
                background-color:#333;\
                }\
            .light div#AVE_AccountSwitcher_MngrMenu{\
                color:#000;\
                background-color:#fff;\
                }\
            div#AVE_AccountSwitcher_MngrMenu > span:last-child:hover{\
                color:#e23f3f;\
                }';

        AVE.Utils.AddStyle(this.style);
        this.AppendToPage();
    },

    storageName: "",
    style: "",
    savedAccounts: [],

    AppendToPage: function () { //To insert content into the page
        var _this = this;
        var q = $('div#header-account > div:first');

        if(q.length === 0) {
            print("AVE: AccountSwitcher > the header account element couldn't be found. Is this an error page?");
        }

        var qH = q.height() + (q.outerHeight() - q.height()) / 2;
            //qW = q.outerWidth();

        //var light = AVE.Utils.CSSstyle === "light";
        //if (!light)
        //{
        //    this.normalColour = '#fff'; //this.hoverColour = "#8c2f2f"
        //}

        var manager = document.createElement('span');
        manager.style.position = 'relative';
        manager.style.display = 'inline-block';
        manager.style.visibility = 'visible';
        manager.style.fontSize = '12px';
        var managerIcon = document.createElement('img');
        manager.appendChild(managerIcon);
        managerIcon.src = '/favicon.ico';
        managerIcon.width = 14;
        managerIcon.height = 14;
        managerIcon.title = 'Accounts';
        managerIcon.style.cursor = 'pointer';
        var managerMenu = $('<div id="AVE_AccountSwitcher_MngrMenu" style="display:none;position:absolute;left:0;top:'+qH+'px;width:200px;border:1px solid rgb(119,119,119);border-radius:3px;text-align:left;"></div>');
        $(manager).append(managerMenu);
        managerIcon.addEventListener('click', function (e) {
            if(managerMenu.is(":hidden")){
                managerMenu.show();
            } else {
                managerMenu.hide();
            }
        }, false);
        document.addEventListener('click', function (e) {
            if (e.target != managerIcon)
                managerMenu.hide();
        }, false);
        $.each(this.savedAccounts, function (val) {
            if (AVE.Utils.CurrUsername() && _this.savedAccounts[val].name.toLowerCase() === AVE.Utils.CurrUsername().toLowerCase()) { return; }
            _this.addLoginLink(managerMenu, _this.savedAccounts[val].name, _this.savedAccounts[val].pass);
        });
        var managerAddAccount = $('<span style="cursor:pointer;padding:0 0.5em;">+ Add account</span>');
        managerMenu.append(managerAddAccount);
        $(managerAddAccount).off().on('click', function () {
            var user = prompt('Username', '');
            if (!user){
                return false;
            }
            var exit = false;
            $.each(_this.savedAccounts, function (idx) {
                if (user.toUpperCase() === _this.savedAccounts[idx].name.toUpperCase()) {
                    alert('User ('+user+') already exists');
                    exit = true;
                    return false;
                }
            });
            if (exit){return false;}

            var pass = prompt('Password', '');
            if (!pass){
                alert("You need to input a password");
                return false;
            }
            _this.savedAccounts.push({
                name: user,
                pass: pass
            });
            _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
            managerAddAccount.remove();
            _this.addLoginLink(managerMenu, user, pass);
            managerMenu.append(managerAddAccount);
        });
        if (q.hasClass('logged-in')){
            q = q.find(".user");
        } else {this.Options.IconPositionLeft.Value = true;} // Can't be at the right of the username if we aren't logged in
        if (this.Options.IconPositionLeft.Value){
            $(manager).insertBefore(q.find('>:first-child'));
            managerIcon.style.marginRight = '0.5em';
        } else {
            $(manager).insertAfter("span.user > a[title='Profile']");
            managerIcon.style.marginLeft = '0.5em';
        }
    },

    logIn: function (user, pass) {
        var token = document.querySelector('[name="__RequestVerificationToken"]');
        if (!token) {
            alert('Can\'t login from this page');
            return;
        }
        var form = document.createElement('form');
        var userInput = document.createElement('input');
        var passInput = document.createElement('input');
        var tokenInput = document.createElement('input');
        var rememberMe = document.createElement('input');
        form.method = 'post';
        form.action = '/account/login?ReturnUrl=' + encodeURIComponent(location.pathname);
        form.appendChild(userInput);
        form.appendChild(passInput);
        form.appendChild(tokenInput);
        form.appendChild(rememberMe);
        document.body.appendChild(form);
        userInput.name = 'UserName';
        userInput.value = user;
        passInput.name = 'Password';
        passInput.value = pass;
        tokenInput.name = '__RequestVerificationToken';
        tokenInput.value = token.value;
        rememberMe.type = 'checkbox';
        rememberMe.value = 'RememberMe';
        rememberMe.value = 'false';
        form.style.display = 'none';
        form.submit();
    },

    addLoginLink: function (managerMenu, name) {
        if (typeof name !== "string") {print("AVE: AccountSwitcher > wrong variable type for \"name\""); return false;}
        var _this = this;
        var account = $('<div></div>'),
            namelink = $('<span id="AVE_AccountSwitcher_account"></span>');

        namelink.text(name);
        account.append(namelink);

        var del = $('<span id="AVE_AccountSwitcher_del" style="float:right;" title="remove account information"></span>').get(0),
            edit = $('<span id="AVE_AccountSwitcher_edit" style="float:right;" title="change password"></span>').get(0);

        account.append(del);
        account.append(edit);
        managerMenu.append(account);
        namelink.css("cursor", 'pointer');
        account.css("padding", "0 0.5em");

        $(edit).off()
            .on("click", function () {
                var pass = prompt('New password', '');
                if (pass) {
                    for (var i = 0; i < _this.savedAccounts.length; i++) {
                        if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()) {
                            _this.savedAccounts[i].pass = pass;
                            break;
                        }
                    }
                    _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
                }
        });
        $(del).off()
            .on("click", function () {
                if (confirm('Are you sure you want to remove '+name+' ?')) {
                    for (var i = 0; i < _this.savedAccounts.length; i++) {
                        if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()) {
                            _this.savedAccounts.splice(i, 1);
                            break;
                        }
                    }
                    _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
                    account.remove();
                }
            });

        $(namelink).off()
            .on("click", function () {
                for (var i = 0; i < _this.savedAccounts.length; i++) {
                    if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()){
                        _this.logIn(name, _this.savedAccounts[i].pass);
                        return false;
                    }
                }
            });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['AccountSwitcher'];
            var htmlStr = "";

            htmlStr += '<input id="IconPositionLeft" ' + (_this.Options.IconPositionLeft.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="IconPositionLeft"> ' + _this.Options.IconPositionLeft.Desc + '</label><br><br>';
            htmlStr += 'Feature written by <a href="https://voat.co/u/GingerSoul">/u/GingerSoul</a>.<br><br>' +
                    '<strong>DO NOT FORGET that your account information are stored unencrypted in AVE\'s data when you export it to a JSON file!</strong>';

            return htmlStr;
        }
    }
};
/// END Account Switcher ///

/// AVE\'s dashboard:  Use it to manage your saved data. ///
AVE.Modules['Dashboard'] = {
    ID: 'Dashboard',
    Name: 'AVE\'s dashboard',
    Desc: 'Use it to manage your saved data.',
    Category: null,
    //Category set to null will make this module invisible to the pref-mngr

    Index: 1000,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Modules: {
        "UserTag": "User tags",
        "DomainTags": "Domain tags",
        "Shortcuts": "Subverse shortcuts",
        "ToggleCustomStyle": "Custom style permissions"},

    Load: function () {
        if (AVE.Utils.currentPageType === "user-manage"){
            this.Enabled = true;
        }

        if (this.Enabled){
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        if(location.hash === "#dashboard"){
            $("a#AVE_ShowDashboard:first").trigger("click");
        }
    },

    AppendToPage: function () {
        "use strict";
        var TempHtml;
        var _this = this;

        if ($("a#AVE_ShowDashboard").length === 0){
            TempHtml = '<ul class="tabmenu"><li class="selected"><a id="AVE_ShowDashboard" style="font-weight: bold;margin-right: 20px;" title="Show AVE\'s dashboard" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub">Show dashboard</a>';


            $.each(_this.Modules, function (id, name) {
                /*
                 Subverse list (rearrange, delete, update, add(list",")
                 ToggleCustomStyle (stored subverse and if show or hide)
                 */
                //Replace buttons with a droplist
                TempHtml += '<a style="margin-left:10px;" name="'+id+'" id="AVE_Dashboard_Show_'+id+'" title="Show '+name+'" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub">'+name+'</a>';
            });
            TempHtml += '</li></ul>';

            $(TempHtml).insertAfter("#show-menu-button");
            $("a[id^='AVE_Dashboard_Show']").hide();
        }
        if ($('div.content').length === 1){
            TempHtml = '<div style="display: none;" class="content" id="AVE_Dashboard_content" role="default"><div class="row nomargin"></div></div>';

            $(TempHtml).insertAfter('div.content[role="main"]');

            var JqId = $('div.content#AVE_Dashboard_content[role="default"] > div.row.nomargin');
            TempHtml = '<div class="alert-title">AVE\'s dashboard</div>';
            TempHtml += '<section id="userPreferences">';
            TempHtml += '   <div style="font-weight: bold;font-size: 12px;" >Click one of the buttons above to display the data associated with it.<br />';
            TempHtml += '   <span style="text-decoration: underline;">Nota Bene</span>: stored data aren\'t cached; they are retrieved and processed every time you click one of the button to always display the most up to date values.</div>';
            TempHtml +='</section>';
            JqId.append(TempHtml);
        }
    },

    Listeners: function () {
        var _this = this;
        $("a#AVE_ShowDashboard")
            .off("click")
            .on("click", function () {_this.ToggleMainContent();});

        $("a[id^='AVE_Dashboard_Show']")
            .off("click")
            .on("click", function () {
                "use strict";
                _this.ToggleContent($(this).attr("name"), $(this).text());
        });
    },

    ToggleContent: function (module, name) {
        if (AVE.Modules[module].AppendToDashboard !== undefined) {
            if (typeof AVE.Modules[module].AppendToDashboard.html === "function") {
                var html;

                html = '<div class="alert-title">'+name+'</div>';
                html += '<section id="userPreferences" role="AVE_Dashboard" module="'+module+'">';
                html += AVE.Modules[module].AppendToDashboard.html();
                html +='</section>';

                $('div.content#AVE_Dashboard_content[role="default"] > div.row.nomargin').html(html);
            } else {print("AVE: Dashboard > Module \""+module+"\" doesn't implement function \"AppendToPreferenceManager.html()\"");return;}
            if (typeof AVE.Modules[module].AppendToDashboard.callback === "function") {
                AVE.Modules[module].AppendToDashboard.callback();
            }

        } else {print("AVE: Dashboard > Module \""+module+"\" doesn't implement asso. array \"AppendToPreferenceManager\"");}
    },

    ToggleMainContent: function(){
        "use strict";
        var JqMain = $('div.content[role="main"]:first');
        var JqNew = $('div.content#AVE_Dashboard_content[role="default"]');
        if (JqMain.is(":visible")){
            JqMain.hide();
            JqNew.show();
            $("a[id^='AVE_Dashboard_Show']").show();

            $("a#AVE_ShowDashboard").text("Hide Dashboard");
            document.title = "Manage AVE's Data";
            location.hash = "#dashboard";
        } else {
            JqMain.show();
            JqNew.hide();
            $("a[id^='AVE_Dashboard_Show']").hide();

            $("a#AVE_ShowDashboard").text("Show Dashboard");
            document.title = "Manage Account";
            location.hash = "";
        }
    }
};
/// END AVE\'s dashboard ///

/// Build Dependent ///
AVE.Utils.SendMessage = function (Obj, callback) {
    switch (Obj.request) {
        case "Storage":
            switch (Obj.type) {
                case "SetValue":
                    GM_setValue(Obj.key, Obj.value);
                    break;
                case "DeleteValue":
                    GM_deleteValue(Obj.key);
                    break;
                case "Update":
                    AVE.Storage.Data = {};
                    $.each(GM_listValues(), function () {
                        AVE.Storage.Data[this] = GM_getValue(this.toString());
                    });
                    break;
            }
            break;
        case 'OpenInTab':
            GM_openInTab(Obj.url);
            break;
    }
    if (Obj.hasOwnProperty("callback")){
        Obj.callback();
    }
};
AVE.Utils.MetaData = { version: GM_info.script.version, name: GM_info.script.name };
AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
AVE.Init.Start();
/// END Build Dependent ///
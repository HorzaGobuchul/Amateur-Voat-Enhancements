// ==UserScript==
// @name        Amateur Voat Enhancements
// @author      Horza
// @date        2015-11-12
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @exclude     *://*.voat.co/api*
// @exclude     *://voat.co/api*
// @version     2.26.1.14
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_openInTab
// @run-at      document-start
// @updateURL   https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements_meta.user.js
// @downloadURL https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://github.com/domchristie/to-markdown/raw/master/dist/to-markdown.js
// @require     https://raw.githubusercontent.com/eligrey/FileSaver.js/master/FileSaver.min.js
// ==/UserScript==

/// Init ///
var AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        var ModLoad, _this, stopLoading;

        _this = this;
        ModLoad = {
            Start: [],
            HeadReady: [],
            ContainerReady: [],
            DocReady: [],
            WinLoaded: []
        };
        stopLoading = false;

        AVE.Utils.EarlySet();

        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) === -1) {

            $.each(AVE.Modules, function () {
                if (!this.RunAt || this.RunAt === "ready") {
                    ModLoad.DocReady.push(this.ID);
                } else if (this.RunAt === "start") {
                    ModLoad.Start.push(this.ID);
                } else if (this.RunAt === "head") {
                    ModLoad.HeadReady.push(this.ID);
                } else if (this.RunAt === "container") {
                    ModLoad.ContainerReady.push(this.ID);
                } else if (this.RunAt === "load") {
                    ModLoad.WinLoaded.push(this.ID);
                }
            });

            //Start as soon as possible
            $.each(ModLoad.Start, function () {
                _this.LoadModules(this);
            });

            //On head ready
            $("head").ready(function () {
                $.each(ModLoad.HeadReady, function () {
                    _this.LoadModules(this);
                });
            });

            //On container ready
            $("div#container").ready(function () {
                $.each(ModLoad.ContainerReady, function () {
                    _this.LoadModules(this);
                });
            });

            //On doc ready
            $(document).ready(function () {
                AVE.Utils.LateSet();

                print("AVE: Current page > " + AVE.Utils.currentPageType);
                //print("AVE: Current style > " + AVE.Utils.CSSstyle);

                //By /u/Jammi: voat.co/v/AVE/comments/421861
                if (document.title === 'Checking your bits' || document.title === 'Play Pen Improvements') {
                    print("AVE: this is an error page, no more modules will be started");
                    if (~document.cookie.indexOf('theme=dark')) {
                        $.each(["body background #333", "body color #dfdfdf", "#header background #333", "#header-container background #333", "#header-container borderBottomColor #555", "#header-container borderTopColor #555", ".panel-info background #222", ".panel-heading background #222", ".panel-heading borderColor #444", ".panel-title background #222", ".panel-title color #dfdfdf", ".panel-body background #222", ".panel-body borderColor #444"],
                               function () { var _this = this.split(" "); $(_this[0]).css(_this[1], _this[2]); });
                    }
                    stopLoading = true;
                    return;
                }//Error pages that are empty
                
                $.each(ModLoad.DocReady, function () {
                    _this.LoadModules(this);
                });
            });
            //On window loaded
            var loadModuleOnLoadComplete = function () {
                if (stopLoading){return;}
                $.each(ModLoad.WinLoaded, function () {
                    _this.LoadModules(this);
                });
            };

            //$(window).load's callback isn't triggered if it is processed as the page's readystate already is "complete"
            if (document.readyState === "complete") { loadModuleOnLoadComplete(); }
            else { $(window).load(function () { loadModuleOnLoadComplete(); }); }
        }
    },

    LoadModules: function (ID) {
        //var module = AVE.Modules[ID];s
        //print("AVE: Loading: " + module.Name + " (RunAt: " + (module.RunAt || "ready" ) + ")");
        
        //AVE.Modules[ID].Load();

        //var ntime = 0; var time = Date.now();
        try { AVE.Modules[ID].Load(); }
        catch (e) {print("AVE: Error loading " + ID);}
        //ntime =  Date.now();
        //print("updated > " + AVE.Modules[ID].ID + " (" + (ntime - time) + "ms)");
    },

    UpdateModules: function () {
        $.each(AVE.Modules, function () {
            //var ntime = 0; var time = new Date().getTime();
            
            if (typeof this.Update === "function") {
                this.Update();

                //ntime = new Date().getTime();
                //print("updated > " + this.Name + " (" + (ntime - time) + "ms)");
                //time = ntime;
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
    
    LateSet: function () {
        this.CSSstyle = this.CSS_Style();
    },

    EarlySet: function () {
        this.subverseName = this.GetSubverseName();
        this.isPageSubverse = this.GetPageSubverse();
        this.currentPageType = this.Page();
    },

    CSS_Style: function () {
        return $('link[rel="stylesheet"][href^="/Content/Dark"]').length > 0 ? "dark" : "light";
        //return $("body").attr("class"); //Doesn't work because the class is added after DOMready and this is evaluated before DOMload
    },

    MetaData: null,

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(new)?(\?page=[0-9]*)?(\#[^\\\/]*)?$/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            comments: /voat.co\/user\/[\w\d]*\/comments/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            sub_rel: /voat.co\/v\/[a-z]*\/[a-z]{1,}/i,
            register: /voat.co\/account\/register/i,
            userShort: /voat.co\/u\/[\w\d]*\/?$/i,
            modlog: /voat.co\/v\/[a-z]*\/modlog/i,
            about: /voat.co\/v\/[a-z]*\/about/i,
            sub_new: /voat.co\/v\/[a-z]*\/new/i,
            sub_top: /voat.co\/v\/[a-z]*\/top/i,
            user: /voat.co\/user\/[\w\d]*\/?$/i,
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
            api: /voat.co\/api/i,
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
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

    AddStyle: function (StyleStr) {
        if ($("style[for='AVE']").length === 0) { $("head").append('<style for="AVE"></style>'); }
        $("style[for='AVE']").append("\n" + StyleStr);
    },
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
function print(str) { console.log(str); }
//Thanks to Paolo Bergantino https://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector#answer-965962
jQuery.expr[':'].parents = function (a, i, m) { return jQuery(a).parents(m[3]).length < 1; };

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
/// END Utils ////// Storage ///
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
        },
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
                try{
                    _this.Options[key].Value = value;
                } catch (e){
                    //print("AVE ["+_this.ID+"]: option \""+key+"\" couldn't be found and assigned to.")
                }
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
            }\
            div.MngWinHeader{\
                margin: 0px 0px;\
                padding: 4px 2px;\
                font-size: 16px;\
                background: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
                border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F4F4F4") + ';\
                border-bottom:0px;\
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
            span.ModuleTitle{\
                font-size:14px;\
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
                        <span class="MngrWinTitle"><a target="_blank" href="https://voat.co/v/AVE">AVE</a></span> <span style="cursor:pointer;font-size:10px;" id="AVE_Version">Version @{version}</span>\
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

    Categories: ["General", "Subverse", "Thread", "Posts", "Manager", "Account", "Style", "Fixes"],//Available Categories to show
    Modules: [],//List of modules
    ModifiedModules: [],

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
            if (AVE.Modules['VersionNotifier']) {
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
                if (key === "") { return true; }
                if ($(this).attr("type") && $(this).attr("type").toLowerCase() === "checkbox") {
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
                    <input id="Enabled" ' + (alwaysEnabled ? 'disabled="true"' : '') + ' type="checkbox" class="ToggleEnable" ' + ((enabled || alwaysEnabled) ? 'Checked="true"' : '') + ' /> \
                    <span class="ModuleTitle alert-title">' + module.Name + '</span> \
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
                $("form[cat='" + cat + "']").find("div[id='" + module.ID + "']").append('<div class=AVE_ModuleCustomInput></div>');
                $("form[cat='" + cat + "']").find("div[id='" + module.ID + "']").find("div.AVE_ModuleCustomInput").append(module.AppendToPreferenceManager.html());
            }
            if (typeof module.AppendToPreferenceManager.callback === "function") {
                module.AppendToPreferenceManager.callback();
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
            if (this.checked) {
                $(this).parent().find("span[class*='ModuleState']").addClass("Enabled");
                $(this).parent().find("span[class*='ModuleState']").removeClass("Disabled");
            } else {
                $(this).parent().find("span[class*='ModuleState']").addClass("Disabled");
                $(this).parent().find("span[class*='ModuleState']").removeClass("Enabled");
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['PreferenceManager'];
            var htmlStr = "";

            htmlStr += '<input ' + (_this.Options.LossChangeNotification.Value ? 'checked="true"' : "") + ' id="LossChangeNotification" type="checkbox"/><label style="display: inline;" for="LossChangeNotification"> ' + _this.Options.LossChangeNotification.Desc + '</label><br />';

            htmlStr += '<br />Export all stored data as a JSON file: <input style="font-weight:bold;" value="Export" id="AVE_ExportToJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON">';
            htmlStr += '<br />Import settings/data from a JSON file: <input style="font-weight:bold;" value="Import" id="AVE_ImportFromJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON">\
                        <input style="display:none;"value="file_Import" id="AVE_file_ImportFromJSON" type="file"><br /><br /><br />';
            htmlStr += 'Reset all data stored: <input style="font-weight:bold;" value="Reset" id="AVE_ResetAllData" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Warning: this will delete your preferences, shortcut list and all usertags!">';
            htmlStr += '<br/><span style="font-weight:bold;" id="AVE_Mng_Info"></span>';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['PreferenceManager'];
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
                    _this.ShowInfo(c + " values copied!", "success");
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
    },
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
            Value: true,
        },
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
        "V2.26.1.14",
        "   ToggleMedia:",
        "       Fixed bug preventing the module from detecting any media in submissions' pages.",
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
                                '<p class="VersionBoxInfo">' + (this.Trigger === "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px">' + AVE.Utils.MetaData.version + '</strong></p>' +
                                '<p class="VersionBoxToggle"><a href="javascript:void(0)" id="ShowChangelog">See Changelog?</a><p>' +
                                '<div class="VersionBoxClose">Close</div>' +
                            '</div>';

        $("<style></style>").appendTo("head").html(CSSstyle);
        $("body").append(notifierHTML);
    },

    Listeners: function () {
        var _this = AVE.Modules['VersionNotifier'];
        var ChangeLog = this.ChangeLog;
        var VersionBox = $(".VersionBox");

        $("p.VersionBoxToggle").on("click", function () {
            var ChangeLogHTML = '<textarea class="VersionBoxText" readonly="true">';
            for (var idx in ChangeLog) {
                ChangeLogHTML += ChangeLog[idx] + "\n";
            }
            ChangeLogHTML += '</textarea>';
            $(this).remove();
            $(ChangeLogHTML).insertAfter(VersionBox.find("p.VersionBoxInfo"));

            $("textarea.VersionBoxText").animate({
                height: "370px",
            }, 1000);
            VersionBox.animate({
                width: "85%",
                height: "450px",
            }, 1000);
        });
        $("div.VersionBoxClose").on("click", function () {
            VersionBox.hide("slow");
            _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Version", AVE.Utils.MetaData.version);
        });
    },
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
            Value: true,
        },
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

    obsReplies: null,
    obsComm: null,
    CommentLen: 0,

    Start: function () {
        var _this = this;

        this.CommentLen = $("div[class*='id-']").length;
        //More Comments
        if (this.obsComm) { this.obsComm.disconnect(); }
        this.obsComm = new OnNodeChange($("div.sitetable#siteTable"), function (e) {
            if (e.addedNodes.length > 0 && e.removedNodes.length === 0) {
                if ($("div[class*='id-']").length > _this.CommentLen) {
                    _this.CommentLen = $("div[class*='id-']").length;

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
        this.Listeners();
    },
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
    },
    //Possible issues with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance) {
        this.tag = tag.toString();
        this.colour = colour;
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.balance = (typeof balance === "number" ? balance : 0);
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        $.each(Opt, function (key, value) {
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
tr#ShowPreview > td > span#PreviewBox {\
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
    border-radius:3px;font-size:10px;\
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
    padding: 0px 4px;font-size: 10px;\
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
                    <input class="UserTagTextInput" type="text" value="" id="ChooseTag" style="width:130px;"/>\
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

            this.usertags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Start();
        }
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

            tag = _this.GetTag(name) || new _this.UserTagObj("",  (AVE.Utils.CSSstyle === "dark" ? "#d1d1d1" : "#e1fcff"), false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "" : tag.tag) + '</span>';
            if (_this.Options.VoteBalance.Value) {
                if (tag.balance !== 0) {
                    var sign = tag.balance > 0 ? "+" : "";
                    Tag_html += '<span class="AVE_UserBalance" id="' + name + '">[ ' + sign + tag.balance + ' ]</span>';
                } else {
                    Tag_html += '<span class="AVE_UserBalance" id="' + name + '"></span>';
                }
            }
            $(Tag_html).insertAfter($(this));


            if (tag.tag) {
                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).next(".AVE_UserTag").css("background-color", tag.colour);
                $(this).next(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }

            if (AVE.Modules['IgnoreUsers'] && tag.ignored) {
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

        JqId1 = $("tr#SetTag > td > input.UserTagTextInput");
        JqId2 = $("tr#SetColour > td > input#ChooseColor");
        $(".AVE_UserTag").off("click")
                         .on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = _this.usertags[username];

            var position = $(this).offset();

            position.top += 20;
            $("#UserTagBox").css(position)
                            .show();

            $("div#UserTagHeader > span#username").text(username);

            JqId1.val(oldTag === "+" ? "" : oldTag);
            $("tr#ShowPreview > td > span#PreviewBox").text(oldTag === "+" ? "" : oldTag);
            if (usertag !== undefined) {
                JqId2.val(usertag.colour);
                JqId2.change();
                if (usertag.ignored) { $("tr#SetIgnore > td > input#ToggleIgnore").prop('checked', "true"); }
                $("tr#SetBalance > td > input#voteBalance").val(usertag.balance);
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
        //Show in the preview box the tag
        JqId1.off('keyup')
             .on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
        JqId2.off('change')
             .on('change', function () {
            var r, g, b;
            var newColour = $(this).val();
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val())
                                                      .css("color", AVE.Utils.GetBestFontColour(r, g, b));
        });
        //Saving tag
        $("tr#SetBalance > td > a#SaveTag").off("click")
                                           .on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                tag: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                colour: $("tr#SetColour > td > input#ChooseColor").val(),
                ignore: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                balance: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10)
            };

            if (isNaN(opt.balance)) { opt.balance = 0; }

            if (opt.tag.length === 0 && opt.ignore === false && opt.balance === 0) {
                _this.RemoveTag(opt.username);
            } else {
                _this.SetTag(opt);
            }

            _this.UpdateUserTag(opt);

            $("#UserTagBox").hide();
        });

        //If Enter/Return is pressed while the focus is on one of the two text input, we save the tag.
        $(document).off("keyup");
        $(document).on("keyup", function (e) {
            if (e.which === 13) {
                if ($(e.target).attr("class") === "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
            if (e.which === 27 && $("#UserTagBox").is(":visible")) {
                $("div#UserTagHeader > span > a#CloseTagWin").click();
                $("#UserTagBox").hide();
            }
        });
    },

    //Because the .click JQuery event triggered by the shortkeys in ShortKeys.js triggers an OnAttrChange with false mutation values (oldValue, attributeName),
    //      we use a second function that keypresses in ShortKeys.js can invoke directly.
    // Ten mimutes later it works perfectly well. Maybe, voat's current instability was to blame. I'm not changing it back, anyway...
    ChangeVoteBalance: function (target, oldValue) {
        //print("target: "+target); 
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find("p.tagline").find(".AVE_UserTag:first");
        if (!username) { return true; } //If we couldn't find a username in the tagline that means this is
        username = username.attr("id").toLowerCase();
        if (!username) { return true; }

        var tag = this.GetTag(username);
        var opt = { username: username, tag: tag.tag || '', colour: tag.colour || "#d1d1d1", ignore: tag.ignore || false, balance: tag.balance || 0 };

        //If the previous status was "unvoted"
        if (oldValue === "midcol unvoted") {
            if ($(target).hasClass('likes')) { opt.balance += 1; }
            else if ($(target).hasClass('dislikes')) { opt.balance -= 1; }
        }
        else {
            //If the previous status was "upvoted"
            if (oldValue === "midcol likes") {
                if ($(target).hasClass('unvoted')) { opt.balance -= 1; }
                else if ($(target).hasClass('dislikes')) { opt.balance -= 2; }
            }
                //If the previous status was "downvoted"
            else if (oldValue === "midcol dislikes") {
                if ($(target).hasClass('likes')) { opt.balance += 2; }
                else if ($(target).hasClass('unvoted')) { opt.balance += 1; }
            }
        }
        
        this.SetTag(opt);
        this.UpdateUserTag(opt);
    },

    UpdateUserTag: function (tag) {
        var _this = this;
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {

            if (tag.tag !== "") {
                $(this).text(tag.tag);

                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).css("background-color", tag.colour);
                $(this).css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }
            else {
                $(this).text("");
                $(this).removeAttr("style");
            }

            if (_this.Options.VoteBalance.Value) {
                if (tag.balance !== 0) {
                    var sign = tag.balance > 0 ? "+" : "";
                    $(this).nextAll("span.AVE_UserBalance:first").text('[ ' + sign + tag.balance + ' ]');
                } else {
                    $(this).nextAll("span.AVE_UserBalance:first").text("");
                }
            }
        });
    },

    RemoveTag: function (username) {
        var _this = this;
        delete _this.usertags[username];

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    SetTag: function (opt) {
        var _this = this;
        _this.usertags[opt.username] = new _this.UserTagObj(opt.tag, opt.colour, opt.ignore, opt.balance);

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    GetTag: function (userName) {
        var _this = this;
        return _this.usertags[userName] || false;
    },

    GetTagCount: function () {
        return this.usertags.length;
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserTag'];
            if (_this.Enabled) {
                var TagLen = 0;
                var VoteLen = 0;
                var IgnoreLen = 0;
                var htmlStr = "";

                $.each(_this.usertags, function (key, value) {
                    if (value.tag.length > 0) { TagLen++; }
                    if (value.balance !== 0) { VoteLen++; }
                    if (value.ignored === true) { IgnoreLen++; }
                });

                htmlStr += '<ul style="list-style:inside circle;"><li>You have tagged ' + TagLen + ' users.</li>';
                htmlStr += "<li>You have voted on submissions made by " + VoteLen + " users.</li>";
                htmlStr += "<li>You have chosen to ignore " + IgnoreLen + " users.</li></ul>";

                htmlStr += '<br /><input id="VoteBalance" ' + (_this.Options.VoteBalance.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="VoteBalance"> ' + _this.Options.VoteBalance.Desc + '</label><br />';
                //Add option to remove oldest tags.
                //  Seeing as this.usertags is ordered oldest first, propose to remove X tags at the beginning of the list.
                return htmlStr;
            }
        },
        callback: function () {
        },
    },
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
                if (_this.Options[key]) {
                    _this.Options[key].Value = value;
                }
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
                                
            //print("ToggleMedia "+this.sel.length);

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
                              '<input ' + (value[i] == 1 ? 'checked="checked"' : '') + ' id="' + mediaTypes[i] + '" name="' + mediaTypes[i] + '" type="checkbox"></input>' +
                               '<label for="' + mediaTypes[i] + '">' + mediaTypes[i] + '</label>' +
                               '</span>';
            }

            return htmlString + '</div>';
        },
    },
};
/// END Toggle media ///

/// Select posts:  A click selects/highlights a post. ///
AVE.Modules['SelectPost'] = {
    ID: 'SelectPost',
    Name: 'Select posts',
    Desc: 'A click selects/highlights a post.',
    Category: 'Posts',

    Enabled: false,
    Index: 19, //Must be before ShortKeys

    Store: AVE.storage,

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

    OriginalOptions: {}, //For reset function

    SavePref: function (POST) {
        var _this = this;
        var colours = ["ContentColour", "QuoteCodeColour", "VoteCountBoxColour", "ContextColour"];
        POST = POST[_this.ID];

        $.each(colours, function (index, value) {
            _this.Options[value].Value[AVE.Utils.CSSstyle === "dark" ? 0 : 1] = POST[value];
        });
        _this.Options.Enabled.Value = POST.Enabled;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(_this.Options));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID);

        if (Opt != undefined) {
            _this.Options = JSON.parse(Opt);
        }

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.OriginalOptions = JSON.stringify(this.Options);
        this.Store = AVE.Storage;
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
            htmlStr += ' <input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContentColour" Value="' + _this.Options.ContentColour.Value[style] + '"/> - Post<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_QuoteCodeColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="QuoteCodeColour" Value="' + _this.Options.QuoteCodeColour.Value[style] + '"/> - Quote and Code<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_VoteCountBoxColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="VoteCountBoxColour" Value="' + _this.Options.VoteCountBoxColour.Value[style] + '"/> - Vote box in submissions page<br />';
            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_ContextColour"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:340px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContextColour" Value="' + _this.Options.ContextColour.Value[style] + '"/> - Context comment<br />';
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
            Value: true,
        },
        OpenInNewTab: {
            Type: 'boolean',
            Desc: 'Open comments and link pages in new tabs.',
            Value: true,
        },
        UpvoteKey: {
            Type: 'char',
            Value: 'a',
        },
        DownvoteKey: {
            Type: 'char',
            Value: 'z',
        },
        NextKey: {
            Type: 'char',
            Value: 'j',
        },
        PrevKey: {
            Type: 'char',
            Value: 'k',
        },
        OpenCommentsKey: {
            Type: 'char',
            Value: 'c',
        },
        OpenLinkKey: {
            Type: 'char',
            Value: 'l',
        },
        OpenLCKey: {
            Type: 'char',
            Value: 'b',
        },
        ExpandKey: {
            Type: 'char',
            Value: 'x',
        },
        ToggleCommentChain: {
            Type: 'char',
            Value: '',
        },
        NavigateTop: {
            Type: 'char',
            Value: 'f',
        },
        NavigateBottom: {
            Type: 'char',
            Value: 'v',
        },
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

        var up = this.Options.UpvoteKey.Value;
        var down = this.Options.DownvoteKey.Value;
        var next = this.Options.NextKey.Value;
        var previous = this.Options.PrevKey.Value;
        var OpenC = this.Options.OpenCommentsKey.Value;
        var OpenL = this.Options.OpenLinkKey.Value;
        var OpenLC = this.Options.OpenLCKey.Value;
        var Expand = this.Options.ExpandKey.Value;
        var TCC = this.Options.ToggleCommentChain.Value;
        var NavTop = this.Options.NavigateTop.Value;
        var NavBottom = this.Options.NavigateBottom.Value;

        $(document).keydown(function (event) {
            //Exit if the focus is given to a text input
            if ($(":input").is(":focus")) { return; }
            //Exit if a key modifier is pressed (ctrl, shift)
            if (event.ctrlKey || event.shiftKey) { return; }

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
                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: "https://" + window.location.hostname + sel.find("a.comments").attr("href") });
                } else {
                    window.location.href = "https://" + window.location.hostname + sel.find("a.comments").attr("href");
                }
            } else if (key === OpenL.toUpperCase()) { // Open link page
                if (!sel.parent().hasClass("submission")) { return; }
                var url = sel.find("a.title").attr("href");

                if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

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
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
                }
            } else if (key === Expand.toUpperCase()) { // Expand media/self-text
                if (sel.parent().hasClass("submission")) {
                    //In submission
                    sel.find("div.expando-button").click();
                } else {
                    //In comment
                    var expand = true;
                    var media = sel.find("div.md:visible").find("a[title]");

                    media.each(function () {
                        //Expand is false if at least one of the media is expanded
                        if ($(this).next(".link-expando:visible").length > 0)
                        { expand = false; return;}
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
            htmlStr += '<td>Upvote: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Downvote: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"></input></td>';
            //Next and previous post
            htmlStr += '<td>&nbsp; Next post: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="NextKey" value="' + _this.Options.NextKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Previous post: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="PrevKey" value="' + _this.Options.PrevKey.Value + '"></input></td>';
            htmlStr += '</tr>';
            //Open Link, Comments, Comments & Link
            htmlStr += '<tr>';
            htmlStr += '<td>Open Link: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenLinkKey" value="' + _this.Options.OpenLinkKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Open comments: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenCommentsKey" value="' + _this.Options.OpenCommentsKey.Value + '"></input>';
            htmlStr += '<td>&nbsp; Open L&C: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenLCKey" value="' + _this.Options.OpenLCKey.Value + '"></input></td>';
            //Toggle expand media
            htmlStr += '<td>&nbsp; Toggle expand: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="ExpandKey" value="' + _this.Options.ExpandKey.Value + '"></input>';
            htmlStr += '</tr>';
            //Toggle expand comment
            htmlStr += '<tr>';
            htmlStr += '<td>&nbsp; <span title="Toggle comment chain or load more replies">Toggle comment</span>: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="ToggleCommentChain" value="' + _this.Options.ToggleCommentChain.Value + '"></input>';
            //Navigate to Top and Bottom of the page
            htmlStr += '<td>&nbsp; <span title="Navigate to the top of the page">Top of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="NavigateTop" value="' + _this.Options.NavigateTop.Value + '"></input>';
            htmlStr += '<td>&nbsp; <span title="Navigate to the bottom of the page">Bottom of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="NavigateBottom" value="' + _this.Options.NavigateBottom.Value + '"></input></td>';
            htmlStr += '</tr>';


            htmlStr += '</table>';
            htmlStr += '<input id="OpenInNewTab" ' + (_this.Options.OpenInNewTab.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInNewTab"> ' + _this.Options.OpenInNewTab.Desc + '</label><br />';
            return htmlStr;
        },
    },
};
/// END Shortcut keys ///

/// Inject custom style:  Apply your custom style of choice everywhere on Voat.<br />For the best result check "Disable custom subverse styles" in your preferences. ///
AVE.Modules['InjectCustomStyle'] = {
    ID: 'InjectCustomStyle',
    Name: 'Inject custom style',
    Desc: 'Apply your custom style of choice everywhere on Voat.<br />For the best result check "Disable custom subverse styles" in your preferences.',
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
            Desc: 'Insert the new CSS file <strong>after</strong> the custom style.',
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
        Typogra: "https://cdn.rawgit.com/Nurdoidz/Typogra-Voat/master/Typogra.min.css?AVE",
    },
    
    CustomCSSContainerCount: 0,

    Start: function () {
        var _this = this;
        var theme = ~document.cookie.indexOf('theme=dark') ? "Dark" : "Light";

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
                            _this.CustomCSSContainerCount++;
                            if (AVE.Utils.currentPageType === "thread") {
                                if (_this.CustomCSSContainerCount === 2)
                                { obsCustomCSS.disconnect();}
                            }
                            else { obsCustomCSS.disconnect(); }
                        }
                    }
                }
            }
        });
        obsCustomCSS.observe();

        if ($("style#custom_css").length > 0){
            //If a custom style was added before our Observer could start, we delete it manually
            //This will happen with slow computers or extensions (very rarely with userscripts)
            $("style#custom_css").remove();
        }

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
                $("head").append('<link rel="stylesheet" href="/Content/' + theme + '?HiFromAVE" type="text/css">');
                $("head").append('<link id="AVE_Inject_Style" rel="StyleSheet" href="' + URL + '" type="text/css">');
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
                            $("#header-account").css("top", "25px");
                            $("#header-account").css("maxHeight", "60px");
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

            htmlStr += '<br /><br />' + _this.Options.CustomStyleUrl.Desc + '<br /><input id="CustomStyleUrl" style="width:85%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.CustomStyleUrl.Value + '"></input>';
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
                        cache: true,
                    }).done(function (data, status, request) {
                        if (request.getResponseHeader('Content-type').split(";")[0] === "text/css") {
                            _this.ShowInfo("It's Ok! The file can be loaded as CSS!", "#68c16b");
                        } else {
                            _this.ShowInfo("Not Ok! The file isn't sent as a CSS file (MIME type).", "#dd5454");
                        }
                    })
                    .fail(function () {
                        _this.ShowInfo("Error while loading CSS file. Check the URL", "#68c16b");
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

        },
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
        };
        this.SavePref(POST);

        window.location.reload();
    },
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
            Value: true,
        },
    },

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    CustomCSSContainerCount: 0,

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled && (!AVE.Modules['InjectCustomStyle'].Enabled || !AVE.Modules['InjectCustomStyle'].Options.RemoveSubverseStyle.Value)) {
            
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
                            
                            //We want to disconnect the observer once it has done its job. But remember that a custom style is added twice in threads.
                            _this.CustomCSSContainerCount+=1;
                            if (AVE.Utils.currentPageType === "thread") {
                                if (_this.CustomCSSContainerCount === 2)
                                {
                                    n.parentNode.removeChild(n);
                                    obsCustomCSS.disconnect();
                                }
                            }
                            else { obsCustomCSS.disconnect(); }

                            if (_this.CustomCSSContainerCount === 1 && $.trim(_this.CustomCSS).length > 0){
                                _this.Start();
                            }
                        }
                    }
                }
            });
            obsCustomCSS.observe();
        
            // && $.trim($("style#custom_css:first").text()).length > 0
            //this.CustomCSS = $("style#custom_css:first").text();
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
        $('<input style="position:inherit;" id="AVE_ToggleCustomStyle" ' + (this.DisabledCSS ? 'checked="true"' : "") + ' type="checkbox"> <label for="AVE_ToggleCustomStyle" style="position:inherit;display:inline !important">Enable custom style</label><br />').insertAfter("h1.hover.whoaversename");
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
        var CSSlist = JSON.parse(this.Store.GetValue(this.StorageName, "[]"));

        if (status) { //Enable
            if ($.inArray(AVE.Utils.subverseName, CSSlist) !== -1) {
                // If exists in stored list of disabled CSS

                var idx = CSSlist.indexOf(AVE.Utils.subverseName);
                CSSlist.splice(idx, 1);

                this.Store.SetValue(this.StorageName, JSON.stringify(CSSlist));
            }
            //Don't add the CSS if we didn't remove it previously
            if ($.trim($("style#custom_css").text()).length === 0) {
                $("style#custom_css").append(this.CustomCSS);
            }
        } else { // Disable
            if ($.inArray(AVE.Utils.subverseName, CSSlist) === -1) {
                // If doesn't exist in stored list of disabled CSSw
                CSSlist.push(AVE.Utils.subverseName);
                this.Store.SetValue(this.StorageName, JSON.stringify(CSSlist));
            }
            $("style#custom_css").text("");
        }
        
        $(window).scrollTop(0);
    },
};
/// END Toggle subverse custom style ///

/// Fix header position:  Set the subverse list header position as fixed. ///
AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'Fixes',
    Index: 99,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
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

        var bg, border;
        //Subverse list bg
        bg = $("#sr-header-area").css("background-color");
        if (bg === "transparent") {
            //general header background
            bg = $("div#header[role='banner']").css("background-color");
            if (bg === "transparent") {
                //If there is no colour nor any image set, we set it by default
                bg = AVE.Utils.CSSstyle === "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
            }
        }

        border = $("#sr-header-area").css("borderBottomWidth") + " " +
                 $("#sr-header-area").css("borderBottomStyle") + " " +
                 $("#sr-header-area").css("borderBottomColor");

        $('.width-clip').css('position', 'fixed')
            .css("z-index", "1000")
            .css('border-bottom', border)//'1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
            .css("height", AVE.Utils.ListHeaderHeight + "px")
            .css("background-color", bg);//AVE.Utils.CSSstyle == "dark" ? "#333" : "#FFF");

        $('.width-clip').find("br:last").remove();//Chrome

        //If you have so many subscriptions that the "my subverses" list goes out of the screen, this is for you.
        var li_Height = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerHeight();
        if (($(window).height() - AVE.Utils.ListHeaderHeight - li_Height) < $("ul.whoaSubscriptionMenu > li > ul:first").height()) {
            var li_Width = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerWidth();
            var elPerCol = parseInt(($(window).height() - AVE.Utils.ListHeaderHeight) / li_Height, 10) - 1;
            var columns = $("ul.whoaSubscriptionMenu > li > ul:first").find("li").length / elPerCol - 1;

            for (var col = 0; col < columns; col++) {
                el = $("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")").find("li:gt(" + (elPerCol - 1) + ")");
                $('<ul style="width:' + li_Width + 'px;margin-left:' + (li_Width * (col + 1)) + 'px"></ul>')
                            .insertAfter("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")")
                            .append(el);
            }
        }
    },
};
/// END Fix header position ///

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
            Value: true,
        },
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
        return false;
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

            var btnHTML = '<br /><buttonstyle="margin-top:5px;" id="AVE_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default' + (inShortcut ? "" : "btn-sub") + '">'
                                    + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>';
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

    /// Common to voat.co: modifies the subverses header list with custom subverses ////
    DisplayCustomSubversesList: function () {
        var SubString = '';
        var subArr = this.GetSubversesList();
        var setInfo = [];

        for (var idx in subArr) {
            if (subArr[idx] == "") { continue; }
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
        _this = this;

        if (!this.isPageInShortcuts()) {
            //style="display:inline" is a fix for the Scribble custom style that tries to hide the block button, but instead hides this shorcut button.
            var btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            var btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
        }

        if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
        }
        else {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
        }

        $(document).on("click", "#AVE_Shortcut", function () {
            if (_this.isPageInShortcuts()) {
                _this.RemoveFromShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(true, "#AVE_Shortcut");
            }
            else {
                _this.AddToShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(false, "#AVE_Shortcut");
            }

            _this.DisplayCustomSubversesList();
        });
    },
    /// Special methods related to shortcuts ///
    GetSubversesList: function () {
        return this.Store.GetValue(this.StorageName, "newsubverses,introductions,news").split(',');
    },

    GetSetParam: function (str) {
        var m = AVE.Utils.regExpSet.exec(str);

        if (m == null) { return null; }
        else { return [m[1].toLowerCase(), m[2]]; }
    },

    AddToShortcuts: function (SubName) {
        var subversesArr = this.GetSubversesList();
        var str = subversesArr.join(",") + "," + SubName;

        this.Store.SetValue(this.StorageName, str);
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
        var subversesArr = this.GetSubversesList();
        var idx = subversesArr.indexOf(SubName);

        if (idx < 0) {
            alert("AVE: sub or set name not found in Header list\n(" + SubName + ")");
            return false;
        }

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
        var subversesArr = this.GetSubversesList();

        return this.isSubInShortcuts(AVE.Utils.subverseName);
    },
};
/// END Subverse and Set shortcuts ///

/// Fix user-block position:  Set the user info block\'s position as fixed. ///
AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'Fixes',

    Index: 100,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        DivideBlock: {
            Type: 'boolean',
            Value: false,
        },
        ToggleBlock: {
            Type: 'boolean',
            Value: true,
        },
        PersistentHide: {
            Type: 'boolean',
            Value: false,
        },
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

    Start: function () {
        if (!AVE.Utils.ListHeaderHeight) { AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); }

        var headerAccountPos = $('#header-account').offset().top;
        this.SetAccountHeaderPosAsFixed(headerAccountPos);

        if (this.Options.DivideBlock.Value && $("div#header-account > div.logged-in").length > 0) {
            //Align header-account's content
            $("div#header-account > div.logged-in").css("text-align", "center");
            //Add a line return before the icons
            $("<br />").insertAfter("div#header-account > div.logged-in > span.separator:first");
            //Remove the, now useless, separator
            $("div#header-account > div.logged-in > span.separator:first").remove();    
        }

        if (this.Options.ToggleBlock.Value && $('#header-account:has(div.logged-in)').length > 0) {
            //Add arrow icon element
            $('#header-account').append('<div title="Hide user block" class="expanded" id="AVE_ToggleUserBlock"></div>');

            this.Listeners();
        }

        if (this.Options.PersistentHide.Value) {
            $("div#AVE_ToggleUserBlock").click();
        }

        this.bg = $("div#header-container").css("background-color") + " " +
                  $("div#header-container").css("background-image") + " " +
                  $("div#header-container").css("background-repeat") + " " +
                  $("div#header-container").css("background-attachment") + " " +
                  $("div#header-container").css("background-position") + " " +
                  $("div#header-container").css("background-clip") + " " +
                  $("div#header-container").css("background-origin");

        if ($("div#header-container").css("background-color") === "transparent" &&
            $("div#header-container").css("background-image") === "none") {
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
    },

    SetAccountHeaderPosAsFixed: function () {
        $('div#header-account').css('position', 'fixed')
                               .css('top', AVE.Utils.ListHeaderHeight + "px")
                               .css('right', '0')
                               .css("text-align", "center")
                               .css("bottom", "auto");
        //$('div#header-account > div.logged-in').css("background", this.bg);
    },

    Listeners: function () {
        $("div#AVE_ToggleUserBlock").on("click", function () {//
            if ($("div#AVE_ToggleUserBlock").hasClass("collapsed")) {//If user block is already hidden
                //Show expand icon
                $("div#AVE_ToggleUserBlock").removeClass("collapsed");
                $("div#AVE_ToggleUserBlock").addClass("expanded");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Hide user block");
                //Show user block
                $('div#header-account > div.logged-in,div.logged-out').show();
                //Restore #header-account's default size
                $('div#header-account').css("width", "")
                                       .css("height", "");
            } else {//If user block is visible
                //Show collapse icon
                $("div#AVE_ToggleUserBlock").removeClass("expanded");
                $("div#AVE_ToggleUserBlock").addClass("collapsed");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Show user block");
                //Hide user block
                $('div#header-account > div.logged-in,div.logged-out').hide();
                //Set #header-account's size to be that of the toggle icon
                $('div#header-account').css("width", "14px")
                                       .css("height", "14px");
            }
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserInfoFixedPos'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Do you want the header account separated- username and numbers at the top and icons below?</label>';
            htmlStr += '<br /><input ' + (_this.Options.ToggleBlock.Value ? 'checked="true"' : "") + ' id="ToggleBlock" type="checkbox"/><label style="display:inline;" for="ToggleBlock"> Show icon to toggle hide/show the user block.</label>';
            htmlStr += '<br /><input ' + (_this.Options.PersistentHide.Value ? 'checked="true"' : "") + ' id="PersistentHide" type="checkbox"/><label style="display:inline;" for="PersistentHide"> Always hide the userblock</label>';

            return htmlStr;
        },
    },
};
/// END Fix user-block position ///

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
            Desc: "Remove altogether the comment and child comments.",
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
            $("a[AVE='HiddenComment']").off("click");
            $("a[AVE='HiddenComment']").on("click", function () {
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
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="CommentFilter" value="{@keywords}"></input>\
                                Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="CommentFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<input ' + (_this.Options.RemoveFiltered.Value ? 'checked="true"' : "") + ' id="RemoveFiltered" type="checkbox"/><label for="RemoveFiltered"> Remove filtered comment instead of replacing the text.</label><br />';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id\}/ig, count);
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

                $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
                $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Comment_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
            $("div#CommentFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Comment_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("CommentFilter");
            });
        },
    },
};
/// END Comment Filter ///

/// Set Voat container\'s width:  By default, Voat shows a margin on both sides of the container. You can modify this by setting a custom width as a percentage of the available horizontal space. ///
AVE.Modules['FixContainerWidth'] = {
    ID: 'FixContainerWidth',
    Name: 'Set Voat container\'s width',
    Desc: 'By default, Voat shows a margin on both sides of the container. You can modify this by setting a custom width as a percentage of the available horizontal space.',
    Category: 'Fixes',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Width: {
            Type: 'int',
            Range: [1,100],
            Value: 100,
        },
        Justify: {
            Type: 'boolean',
            Value: false
        },
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
            var htmlStr = '<input style="width:50%;display:inline;" id="Width" value="' + _this.Options.Width.Value + '" type="range" min="' + _this.Options.Width.Range[0] + ' max="' + _this.Options.Width.Range[1] + '"/> <span id="FixContainerWidth_Value"></span>%';

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
        },
    },
};
/// END Set Voat container\'s width ///

/// Disable Share-a-Link:  This module will remove the Share-a-Link overlay block. ///
AVE.Modules['DisableShareALink'] = {
    ID: 'DisableShareALink',
    Name: 'Disable Share-a-Link',
    Desc: 'This module will remove the Share-a-Link overlay block.',
    Category: 'Fixes',
    //The share-a-link feature doesn't exist anymore it seems. This module is obsolete.

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
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
        $("body").removeAttr("ondrop");
        $("body").removeAttr("ondragover");
    },
};
/// END Disable Share-a-Link ///

/// Reply with quote:  Insert selected/highlighted text (in a comment) into the reply box toggled by "reply". ///
AVE.Modules['ReplyWithQuote'] = {
    ID: 'ReplyWithQuote',
    Name: 'Reply with quote',
    Desc: 'Insert selected/highlighted text (in a comment) into the reply box toggled by "reply".',
    Category: 'Thread',

    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
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
                for (var i = 0, len = t.rangeCount; i < len; ++i) {
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

/// Never Ending Voat:  Browse an entire subverse in one page. ///
AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse an entire subverse in one page.',
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
        },
    },

    OriginalOptions: "",

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
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse"]) === -1 ||
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
             "Sorry, I couldn't find more content",
             "Something went wrong. Maybe try again?",
             "An error occured. No point in trying again I'm afraid"],
    PostsIDs: [],
    SepStyle: '',
    currentPage: 0,

    Start: function () {
        var _this = this;
        $("div.submission[class*='id-']").each(function () {
            _this.PostsIDs.push($(this).attr("data-fullname"));
        });

        this.currentPage = window.location.href.match(/\?page\=([0-9]*)/);
        if (!this.currentPage) { this.currentPage = 0; }
        else { this.currentPage = parseInt(this.currentPage[1], 10); }

        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("a#AVE_loadmorebutton").length === 0 && $("div.pagination-container").find("li.btn-whoaverse-paging").length > 0) {
            var LoadBtn = '<a href="javascript:void(0)" style="margin: 5px 0px;" class="btn-whoaverse btn-block" id="AVE_loadmorebutton">' + this.Labels[0] + '</a>';
            $("div.pagination-container").html(LoadBtn);
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
        if ($("a#AVE_loadmorebutton").text() === this.Labels[1]) { return false; }

        var _this = this;

        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") !== -1) {
            nextPageURL = nextPageURL.replace(/\?page\=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://" + window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }
        print("AVE: loading page: " + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false,
        }).done(function (html) {
            var error = "sticky";
            if ($(html).find("div.submission[class*='id-']").length === 0) { $("a#AVE_loadmorebutton").text(_this.Labels[2]); return false; } //catchall for error pages
            _this.currentPage++;
            //print($(html).find("div.submission[class*='id-']").length);

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") !== "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
                $("div.side").css("z-index", "100");
            }

            $("div.sitetable").append('<div style="' + _this.SepStyle + '" id="AVE_page_' + (_this.currentPage) + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');

            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            $(html).find("div.submission[class*='id-']").each(function () {
                if ($.inArray($(this).attr("data-fullname"), _this.PostsIDs) === -1) {
                    error = null;
                    _this.PostsIDs.push($(this).attr("data-fullname"));
                    $("div.sitetable").append($(this));
                } else if (_this.Options.DisplayDuplicates.Value && !$(this).hasClass("stickied")) {
                    $("div.sitetable").append($(this));
                    $(this).css("opacity", "0.3");
                } else if (!$(this).hasClass("stickied")){
                    error = true;
                }
            });
            
            if (!error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[0]);
            } else if (error === "sticky") {
                //In a sub a page with no content will still show the sticky.
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

            // Add expando links to the new submissions
            if (!window.wrappedJSObject || !window.wrappedJSObject.UI) { //Chrome
                location.assign("javascript:UI.ExpandoManager.execute();void(0)");
            } else {//firefox, because it stopped working with the location hack above
                window.wrappedJSObject.UI.ExpandoManager.execute();
            }
            // from https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js#L190

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

            //Next lines are needed because the front page (^voat.co$) is a bit different from subverses' pages. div.pagination-container isn't normally inside div.sitetable 
            if ($("div.sitetable").find("div.pagination-container").length > 0) {
                $("div.pagination-container").appendTo($("div.sitetable"));
                $("div.sitetable > a[href='/random']").appendTo($("div.sitetable"));
            }
        }).fail(function () {
            $("a#AVE_loadmorebutton").text(_this.Labels[3]);
        });
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
        },
    },
};
/// END Never Ending Voat ///

/// Show submission\'s actual vote balance:  This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.<br /><strong>Warning: the vote count will not be accurate if you change a vote already registered by Voat.</strong><br /><strong>This feature is disabled because it is still in development.</strong> ///
AVE.Modules['ShowSubmissionVoatBalance'] = {
    ID: 'ShowSubmissionVoatBalance',
    Name: 'Show submission\'s actual vote balance',
    Desc: 'This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.<br /><strong>Warning: the vote count will not be accurate if you change a vote already registered by Voat.</strong><br /><strong>This feature is disabled because it is still in development.</strong>',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: { //Forced disable
    },
    //Options: {
    //    Enabled: {
    //        Type: 'boolean',
    //        Value: false,
    //    },
    //    // Add option to show (+1|-1) between the vote arrows and remove element in the tagline
    //},

    Processed: [], //Ids of comments that have already been processed

    //OriginalOptions: "",

    //SavePref: function (POST) {
    //    var _this = this;
    //    POST = POST[this.ID];

    //    this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    //},

    //ResetPref: function () {
    //    var _this = this;
    //    this.Options = JSON.parse(this.OriginalOptions);
    //},

    //SetOptionsFromPref: function () {
    //    var _this = this;
    //    var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

    //    $.each(JSON.parse(Opt), function (key, value) {
    //        _this.Options[key].Value = value;
    //    });
    //    this.Enabled = this.Options.Enabled.Value;
    //},

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        //this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
        //If update all will processed another time. This shouldn't happen
    },

    Start: function () {
        var _this = this;

        $("div.score").remove();
        $('<div style="display:block !important;" class="score unvoted" id="AVE_VoatBalance">0</div>').insertAfter("div.submission > div.midcol > div[aria-label='upvote']");

        $("div#AVE_VoatBalance").each(function () {
            _this.ShowVoteBalance($(this).parent());
        });

        this.Listeners();
    },

    Listeners: function () {
        var _this = this;
        $("div.submission > div.midcol > div[aria-label='upvote'],div[aria-label='downvote']").off();//We don't want duplicates of this listener created because of "Update"
        $("div.submission > div.midcol > div[aria-label='upvote'],div[aria-label='downvote']").on("click", function (event) {
            _this.ShowVoteBalance($(this).parent(), true, $(this).attr("aria-label"));
        });
    },

    ShowVoteBalance: function (target, click, voteClick) {
        var vote, status;

        vote = target.prop("class").split(" ")[1];  //Get vote status
        
        var newClass;
        if (voteClick == "upvote") {
            if (vote == "unvoted") {
                newClass = "likes";
            } else if (vote == "likes") {
                newClass = "unvoted";
            } else if (vote == "dislikes") {
                newClass = "dislikes";
            }
        } else if (voteClick == "downvote") {
            if (vote == "unvoted") {
                newClass = "dislikes";
            } else if (vote == "likes") {
                newClass = "likes";
            } else if (vote == "dislikes") {
                newClass = "unvoted";
            }
        } else { newClass = vote; }

        status = target.find("div.score." + vote);  //Get element currently displaying the vote balance
        vote = ["unvoted", "likes"].indexOf(vote);  //Get vote value from status(-1, 0, 1)

        //If the user did not just click to vote, this means it was done in the past and the vote is counted in the up/downvote counts
        if (!click) { vote = 0; }

        //We get the current vote values from the tagline or Score tab in a thread
        var up, down;
        if (AVE.Utils.currentPageType !== "thread") {
            up = parseInt(target.parent().find("span.commentvotesratio > span.post_upvotes").text()) || 0;
            down = parseInt(target.parent().find("span.commentvotesratio > span.post_downvotes").text()) || 0;
        } else {
            var val = $("div.submission-score-box:nth-child(6)").find("b");
            up = parseInt(val.eq(1).text()) || 0;
            down = -1 * parseInt(val.eq(2).text()) || 0;
        }

        print("Vote: " + vote + ", up:  " + up + ", down: " + down + " => " + (vote + up + down));
        print("score " + newClass);

        var voteEl = target.find("div#AVE_VoatBalance");
        voteEl.text(vote + up + down);
        voteEl.attr("class", "score " + newClass);


        print(voteEl.length + " - " + voteEl.is(":hidden")+ " - "+voteEl.text());

    },
};
/// END Show submission\'s actual vote balance ///

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
            Desc: 'Show deltas in a tooltip instead of inline.',
            Value: false
        },
        ShowColourDelta: {
            Type: 'boolean',
            Desc: 'Show points in green (+) or red (-) according to the change.',
            Value: true
        },
        ShowMultipleDeltas: {
            Type: 'boolean',
            Desc: 'Show multiple deltas in the tooltip (Hour, Day, Week).',
            Value: false
        },
        ShowSinceLast: {
            Type: 'string',
            Desc: 'Show contribution points deltas for the last: ',
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
            //print("AVE: ContribDelta -> Updated \"Page\"");
            _this.StoredDeltas[_this.Username]["page"] = {ts: _now, S: _this.SCP, C: _this.CCP};

            dateDiff = (_now - _this.StoredDeltas[_this.Username]["hour"].ts) /1000;
            if (dateDiff > 3600) { //Hour
                //print("AVE: ContribDelta -> Updated \"hour\"");

                newTs = new Date (_now).setMinutes(0, 0);
                _this.StoredDeltas[_this.Username]["hour"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                dateDiff = (_now - _this.StoredDeltas[_this.Username]["6 hours"].ts) / 1000;
                if (dateDiff > 21600) { //6 hours
                    //print("AVE: ContribDelta -> Updated \"6 hours\"");

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
                        //print("AVE: ContribDelta -> Updated \"12 hours\"");

                        newTs = new Date (newTs).setHours(newTsHour < 12 ? 0 : 12);
                        _this.StoredDeltas[_this.Username]["12 hours"] = {ts: newTs, S: _this.SCP, C: _this.CCP};
                    }
                }
                //Only check for days once per hour (and only check for week once per day)
                dateDiff = (_now - _this.StoredDeltas[_this.Username]["day"].ts) / 1000;
                if (dateDiff > 86400) { //day
                    //print("AVE: ContribDelta -> Updated \"Day\"");

                    newTs = new Date (newTs).setHours(6);

                    _this.StoredDeltas[_this.Username]["day"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    dateDiff = (_now - _this.StoredDeltas[_this.Username]["week"].ts) / 1000;
                    if (dateDiff > 604800) { //week
                        //print("AVE: ContribDelta -> Updated \"Week\"");
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
            var _str, _data, _delta;
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
            var _str, _data, _delta;
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
                htmlStr += '<br /><br />Current user: ' + _this.Username + '.<br /> <a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AVE_Reset_SinceLast">Reset count</a> <span id="AVE_LastReset">Last reset on ' + this.GetParsedDate(_this.StoredDeltas[_this.Username]["reset"].ts) + '</span>';
            }
            return htmlStr;
        },

        callback: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var _Mngthis = this;
            var JqId;

            JqId = $("div#ContributionDeltas > div.AVE_ModuleCustomInput > a#AVE_Reset_SinceLast");

            JqId.off("click");
            JqId.on("click", function () {
                $("span#AVE_LastReset").text('Last reset on '+ _Mngthis.GetParsedDate(Date.now()));

                _this.StoredDeltas[_this.Username]["reset"] = {ts: Date.now(), S: $("a.userkarma#scp").text(), C: $("a.userkarma#ccp").text()};
                _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Deltas", JSON.stringify(_this.StoredDeltas));
            });
        },

        GetParsedDate: function(timeStamp) {
            return new Date(timeStamp).toLocaleString();
        }
    }
};
/// END CCP and SCP differences ///

/// Submission Filter:  Remove submissions which title matches one of the filters. Additionally, you can specify a subverse, where a filter will only be applied. ///
AVE.Modules['SubmissionFilter'] = {
    ID: 'SubmissionFilter',
    Name: 'Submission Filter',
    Desc: 'Remove submissions which title matches one of the filters. Additionally, you can specify a subverse, where a filter will only be applied.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [], //not JSONified
        },
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
                    Filters: this.Options.Filters.Value,
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
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id\}/ig, count);
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
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
                $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                    //print("Remove link: " + $(this).attr("id"));
                    //print("Remove span: " + $(this).prev("span.AVE_Submission_Filter").attr("id"));
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Submission_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Submission_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("SubmissionFilter");
            });
        },
    },
};
/// END Submission Filter ///

/// Ignore users:  Lets you tag users as Ignored. Replacing all their comments\' content with [Ignored User]. ///
AVE.Modules['IgnoreUsers'] = {
    ID: 'IgnoreUsers',
    Name: 'Ignore users',
    Desc: 'Lets you tag users as Ignored. Replacing all their comments\' content with [Ignored User].',
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
            Desc: 'Remove entirely from the page posts and chain comments made by the ignored users.',
            Value: false
        },
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
            if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

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

/// Toggle display child comments:  Adds "Hide child comments" link to hide a chain of posts ///
AVE.Modules['ToggleChildComment'] = {
    ID: 'ToggleChildComment',
    Name: 'Toggle display child comments',
    Desc: 'Adds "Hide child comments" link to hide a chain of posts',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
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
        $("a#AVE_ToggleChildComment").off("click");
        $("a#AVE_ToggleChildComment").on("click", function () {

            var NextLevelComments = $(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']");
            if (NextLevelComments.is(":visible")) {
                NextLevelComments.hide();
                $(this).text(_this.LabelShow);
            } else {
                NextLevelComments.show();
                $(this).text(_this.LabelHide);
            }
        });
    },
};
/// END Toggle display child comments ///

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
        $("ul[class*='flat-list']").each(function () {
            if ($(this).find("a#AVE_QuotePost").length > 0) { return; }

            $('<li><a id="AVE_QuotePost" href="javascript:void(0)" style="font-weight:bold;">quote</a></li>').insertAfter($(this).find("li:contains(source)"));
        });
    },

    Listeners: function () {
        var _this = this;

        $("a#AVE_QuotePost").off("click");
        $("a#AVE_QuotePost").on("click", function () {
            var comment = AVE.Utils.ParseQuotedText($(this).parent().parent().parent().find('.md:first').html());
            var permaLink = $(this).parents("ul[class*='flat-list']").first().find("a[class*='bylink']").attr("href");
            if (!permaLink) { permaLink = window.location.href; }
            var userpageLink = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").attr("href");
            var username = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").text();
            
            var quote = _this.Options.Formatting.Value.replace(/\{@username\}/gi, username);
            quote = quote.replace(/\{@permaLink\}/gi, permaLink);
            quote = quote.replace(/\{@userpage\}/gi, userpageLink);
            quote = quote.replace(/\{@comment\}/gi, comment);
            quote = quote.replace(/\{@n\}/g, "\n");

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
            htmlStr += '<input style="display:inline;width:80%;padding:0px;letter-spacing:0.35px;" class="form-control" type="text" Module="'+ _this.ID +'" id="Formatting" value="' + _this.Options.Formatting.Value + '"></input>';
            htmlStr += ' <button id="AutoQuoteFormatShowPreview" class="btn-whoaverse-paging" type="button">Show Preview</button>';
            htmlStr += '<div class="md" id="AutoQuoteFormatPreview" style="height:150px; background-color: #' + ( AVE.Utils.CSSstyle === "dark" ? "292929": "FFF" ) + '; position: fixed; width:430px;padding: 10px; border-radius: 6px; border: 2px solid black;display: none;overflow: auto;"></div>';
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
                if ($(this).text() === "Show Preview") {
                    $(this).text("Hide Preview");
                    $("div#AutoQuoteFormatPreview").show();

                    var quote = $("input[id='Formatting'][Module='" + _this.ID + "']").val().replace(/\{@username\}/gi, "Username");
                    quote = quote.replace(/\{@permaLink\}/gi, "/v/whatever/comments/111111/111111");
                    quote = quote.replace(/\{@userpage\}/gi, "/user/atko");
                    quote = quote.replace(/\{@comment\}/gi, "> This is a comment.\n\n> Another line.");
                    quote = quote.replace(/\{@n\}/g, "\n");

                    $("div#AutoQuoteFormatPreview").text("Loading...");
                    var r = { MessageContent: quote };
                    $.ajax({
                        url: "https://voat.co/ajaxhelpers/rendersubmission/",
                        type: "post",
                        dataType: "html",
                        success: function (n) {
                            $("div#AutoQuoteFormatPreview").html(n);
                        },
                        data: r
                    });
                } else {
                    $(this).text("Show Preview");
                    $("div#AutoQuoteFormatPreview").hide();
                }
            });
        }
    }
};
/// END Append quote ///

/// Fix expanding images:  Let images expand over the sidebar and disallow the selection/highlight of the image. ///
AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlight of the image.',
    Category: 'Fixes',

    Enabled: false,

    Store: AVE.storage,

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        OverSidebar: {
            Type: 'boolean',
            Desc: 'Let images expand over the sidebard.',
            Value: true,
        },
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
        },
    },
};
/// END Fix expanding images ///

/// Domain filter:  Use filters to remove submissions linking to particular domains. ///
AVE.Modules['DomainFilter'] = {
    ID: 'DomainFilter',
    Name: 'Domain filter',
    Desc: 'Use filters to remove submissions linking to particular domains.',
    Category: 'Subverse',

    Index: 101,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [] //not JSONified
        },
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

        print(JSON.stringify( _this.Options.Filters.Value))

        this.Store.SetValue(this.Store.Prefix + this.ID,
            JSON.stringify(
                {
                    Enabled: POST.Enabled,
                    Filters: this.Options.Filters.Value,
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
        //When a submission is filtered it is removed, so no need to check anything special when the update method is triggered.

        var re, found;
        $("div.entry > p.title > span.domain > a").each(function () {
            var DomainRef = $(this);
            var DomainStr = DomainRef.text().toLowerCase(); //if str == self.(SubName) continue
            $.each(_this.Options.Filters.Value, function () {
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
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "abc" matches "abc.com", "en.abc.com" but not "abcd.com".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id\}/ig, count);
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
            var JqId = $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter");
            $("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#DomainFilter > div.AVE_ModuleCustomInput > span.AVE_Domain_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
                $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                    //print("Remove link: " + $(this).attr("id"));
                    //print("Remove span: " + $(this).prev("span.AVE_Domain_Filter").attr("id"));
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
        },
    },
};
/// END Domain filter ///

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

    RunAt: "ready",

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
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
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

    Username: "",

    Start: function () {
        if (!this.Username){
            this.Username = $(".logged-in > .user > a[title='Profile']").text();
        }

        if (this.Options.RemoveInLoginBlock.Value) {
            $(".logged-in > .user > a[title='Profile']").remove();
        } else if (!this.Options.ReplaceEverywhere.Value) {
            $(".logged-in > .user > a[title='Profile']").text(this.Options.NewName.Value);
        }

        if (this.Options.ReplaceEverywhere.Value) {
            $("a[href='/user/" + this.Username + "'],a[href='/u/" + this.Username + "']")
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
            htmlStr += '<br />' + _this.Options.NewName.Desc + '<input id="NewName" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.NewName.Value + '"></input>';

            return htmlStr;
        },
        callback: function () {
        },
    },
};
/// END Hide username ///

/// Build Dependent ///
AVE.Utils.SendMessage = function (Obj) {
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
};
AVE.Utils.MetaData = { version: GM_info.script.version, name: GM_info.script.name };
AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
AVE.Init.Start();
/// END Build Dependent ///
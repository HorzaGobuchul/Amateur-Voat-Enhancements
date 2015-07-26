// ==UserScript==
// @name        Amateur Voat Enhancements
// @author      Horza
// @date        2015-07-26
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @version     2.19.10.24
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// @grant       GM_openInTab
// @run-at      document-end
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
        this.LoadModules();
    },

    LoadModules: function () {
        AVE.Utils.Set();
        print("AVE: Current page > " + AVE.Utils.currentPageType);
        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) == -1) {
            $(document).ready(function () {
                $.each(AVE.Modules, function () {
                    //print("Loading: "+this.Name + " - " + Object.keys(AVE.Modules).length+ " modules.");
                    this.Load();
                });
            });
        }
    },

    UpdateModules: function () { //Get this in the reload module?
        $.each(AVE.Modules, function () {
            if (typeof this.Update === "function") {
                this.Update();
                //print("updating: " + this.Name);
            }
        });
    },
};
/// END Init ///

/// Utils ///
/* global self */

AVE.Utils = {
    regExpSet: /([^:]*):([0-9]*)/i,
    regExpTag: /([^:]*):([^:]*)/i,
    subverseName: "",
    isPageSubverse: "",
    CSSstyle: "",
    currentPageType: "",
    
    Set: function () {
        this.subverseName = this.GetSubverseName();
        this.isPageSubverse = this.isPageSubverse();
        this.CSSstyle = this.CSS_Style();
        this.currentPageType = this.Page();
    },

    CSS_Style: function () {
        return $("body").attr("class");
    },

    MetaData: null,

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(new)?(\?page=[0-9]*)?(\#[^\\\/]*)?$/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            comments: /voat.co\/user\/[\w\d]*\/comments/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            register: /voat.co\/account\/register/i,
            userShort: /voat.co\/u\/[\w\d]*\/?$/i,
            user: /voat.co\/user\/[\w\d]*\/?$/i,
            manage: /voat.co\/account\/manage/i,
            saved: /voat.co\/user\/.*\/saved/i,
            login: /voat.co\/account\/Login/i,
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
        else if (RegExpTypes.api.test(url)) { return "api"; }
        else if (RegExpTypes.thread.test(url)) { return "thread"; }
        else if (RegExpTypes.submit.test(url)) { return "submit"; }
        else if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        else if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        else if (RegExpTypes.domain.test(url)) { return "domain"; }
        else if (RegExpTypes.set.test(url)) { return "set"; }
        else if (RegExpTypes.search.test(url)) { return "search"; }
        else if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        else if (RegExpTypes.sets.test(url)) { return "sets"; }
        else if (RegExpTypes.user.test(url)) { return "user"; }
        else if (RegExpTypes.userShort.test(url)) { return "user"; }
        else if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        else if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        else if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        else if (RegExpTypes.manage.test(url)) { return "user-manage"; }
        else if (RegExpTypes.saved.test(url)) { return "saved"; }
        else if (RegExpTypes.register.test(url)) { return "account-register"; }
        else if (RegExpTypes.login.test(url)) { return "account-login"; }

        return "none";
    },

    isPageSubverse: function () {
        if (this.subverseName != null)
        { return true; }

        return false;
    },

    GetSubverseName: function () {
        var m = new RegExp(/voat\.co\/v\/([\w\d]*)/).exec(window.location.href);

        if (m == null) { return null; }
        else { return m[1].toLowerCase(); }
    },

    ParseQuotedText: function (text) {
        converter = { filter: 'span', replacement: function (innerHTML) { return ''; } };
        return toMarkdown(text, { converters: [converter] }).replace(/^(.)/img, "> $1");
    },

    GetBestFontColour: function (r,g,b) {
        //from http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
        var o = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
        return (o > 125) ? 'black' : 'white';
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
                    if (e.attributeName != null) {
                        callback.call(e.target, e);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    }
})(jQuery);
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
                    if (e.addedNodes != null) {
                        callback.call(e.target);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    }
})(jQuery);
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
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.addedNodes != null) {
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
})();
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
                if (e.attributeName != null) {
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
})();
/// END Utils ////// Storage ///
AVE.Storage = {
    Prefix: "AVE_",

    Data: null,

    GetValue: function (key, def) {
        if (!this.Data) { return null; }
        //AVE.Utils.SendMessage({ request: "Storage", type: "GetValue", key: key});

        var val = this.Data[key];
        if (val == undefined) {
            if (def == undefined) {
                return null;
            } else { return def }
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
};
/// END Storage ///

/// Preference manager:  AVE\'s preference manager. Will contain a button to reset all data stored soon. ///
AVE.Modules['PreferenceManager'] = {
    ID: 'PreferenceManager',
    Name: 'Preference manager',
    Desc: 'AVE\'s preference manager. Will contain a button to reset all data stored soon.',
    Category: 'Manager',

    Index: 0,

    Store: {},

    Options: {
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['PreferenceManager'];

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
    },

    Load: function () {
        this.Store = AVE.Storage;
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
                background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F4F4F4") + ';\
                color: #' + (AVE.Utils.CSSstyle == "dark" ? "5452A8" : "404040") + ';\
                left:0;\
                right:0;\
                margin-left:auto;\
                margin-right:auto;\
                width:650px;\
                height:600px;\
                top: 5%;\
                position:fixed;\
                font-size: 14px;\
            }\
            div.MngWinHeader{\
                margin: 0px 0px;\
                padding: 4px 2px;\
                font-size: 16px;\
                background: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
                border: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F4F4F4") + ';\
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
                border: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F4F4F4") + ';\
                padding-left:5px;\
                text-align:left;\
                color: #' + (AVE.Utils.CSSstyle == "dark" ? "DFDFDF" : "404040") + ';\
                background: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
                border-radius: 5px;\
            }\
            div.ModuleToggle:hover {\
                background: #b0dbf4;\
                background: linear-gradient(to right,  #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F4F4F4") + ' 0%, #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ' 100%);\
            }\
            div.ModuleToggle:active {\
                background: #91c3e0;\
                background: linear-gradient(to right,  #' + (AVE.Utils.CSSstyle == "dark" ? "202020" : "ededed") + ' 0%, #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ' 100%);\
            }\
            \
            section.ModulePref{\
                font-size:12px;\
                position:absolute;\
                right:5px;\
                float:right;\
                margin-top:10px;\
                margin-left: 10px;\
                padding-left: 10px;\
                padding-right: 10px;\
                padding-top: 10px;\
                width:525px;\
                height:552px;\
                background: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
                color: #' + (AVE.Utils.CSSstyle == "dark" ? "AAA" : "404040") + ';\
                border-radius: 5px;\
                overflow-y:auto;\
            }\
            div.ModuleBlock{\
                margin-bottom: 10px;\
            }\
            div.ModuleTitleBlock{\
                font-size:12px;\
                border-bottom: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "222" : "DDD") + ';\
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
                border-left:2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "3F3F3F" : "DDD") + ';\
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
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="SaveData">Save Changes</a>\
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default" id="CloseWinMngr">x</a>\
                        </div>\
                    </div>\
                    <section class="ModulePref" Module="null">\
                    </section>\
                    <section id="ModuleSectionToggles">\
                    </section>\
                </div>\
            </div>',

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

    Categories: ["General", "Subverse", "Thread", "Posts", "Manager", "Fixes"],//Available Categories to show
    Modules: [],//List of modules

    AppendToPage: function () {
        $("<style></style>").appendTo("head").html(this.MngWinStyle);

        if ($("span.user:contains('Manage')").length > 0) {
            var LinkHTML = '<span class="user"><a style="font-weight:bold;" href="javascript:void(0)" id="" title="AVE Preference Manager">AVE</a></span> <span class="separator">|</span> ';
            $(LinkHTML).insertBefore("span.user:contains('Manage')");
        } else { //If the user isn't logged in
            var LinkHTML = '<span class="user"> - <a style="font-weight:bold;" href="javascript:void(0)" id="" title="AVE Preference Manager">AVE</a></span>';
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
        });
    },

    BuildManager: function () {
        var _this = AVE.Modules['PreferenceManager'];
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
            var enabled;
            var alwaysEnabled;

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

        $("#CloseWinMngr").on("click", function (event) {
            $(".MngrWin").hide();
            $(".overlay").hide();

            event.stopPropagation();
        });
        //Save Data
        $("div.MngrWin > div.MngWinHeader > div.TopButtons > a#SaveData").on("click", function () {
            var input;
            $.each(_this.Categories, function () {
                moduleForms = $("form[cat='" + this + "'] > div.ModuleBlock");

                moduleForms.each(function () {
                    var ModKey = $(this).attr("id");
                    var POST = {};
                    POST[ModKey] = {};

                    $(this).find("input").each(function () {
                        var key = $(this).prop("id");
                        if (key == "") { return true;}
                        if ($(this).attr("type").toLowerCase() == "checkbox") {
                            POST[ModKey][key] = $(this).is(":checked");
                        } else {
                            POST[ModKey][key] = $(this).val();
                        }
                    });
                    //Send new pref to module
                    if (typeof AVE.Modules[ModKey].SavePref === "function") {
                        AVE.Modules[ModKey].SavePref(POST);
                    }
                });

            });
            $("#CloseWinMngr").click();
        });

        //Close the pref Manager with a click outside of it.
        $(".overlay").on("click", function (e) {
            if ($(e.target).attr("class") == "overlay") {
                $("#CloseWinMngr").click();
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            //return 'Reset all data stored: <input style="font-weight:bold;" value="Reset" id="ResetAllData" class="btn-whoaverse-paging btn-xs btn-default" type="submit" title="Warning: this will delete your preferences, shortcut list and all usertags!"></input>';
        },
        callback: function () {
            //$("input#ResetAllData").on("click", function (param) {
            //    alert(typeof param);
            //});
        },
    },

    AddModule: function (module, cat, pos) {
        var _this = AVE.Modules['PreferenceManager'];

        if (module.Options.Enabled != undefined) {
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

        if (pos == undefined) {
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
                var ID = $(this).parent().attr('id')
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

    SaveModule: function (Mod_ID) {
        var POST = {};
        POST[Mod_ID] = {};

        $(this).find("input").each(function () {
            var key = $(this).prop("id")
            if ($(this).attr("type").toLowerCase() == "checkbox") {
                POST[Mod_ID][key] = this.checked;
            } else {
                POST[Mod_ID][key] = $(this).val();
            }
        });
        //Send new pref to module
        AVE.Modules[Mod_ID].SavePref(POST);
    },

    AppendToPreferenceManager: {
        html: function () {
            var htmlStr = "";
            htmlStr += '<br />Export all stored data as a JSON file: <input style="font-weight:bold;" value="Export" id="AVE_ExportToJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON"></input>';
            htmlStr += '<br />Import settings/data from a JSON file: <input style="font-weight:bold;" value="Import" id="AVE_ImportFromJSON" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Export Stored Data as JSON"></input> \
                        <input style="display:none;"value="file_Import" id="AVE_file_ImportFromJSON" type="file"></input><br /><br /><br />';
            htmlStr += 'Reset all data stored: <input style="font-weight:bold;" value="Reset" id="AVE_ResetAllData" class="btn-whoaverse-paging btn-xs btn-default" type="button" title="Warning: this will delete your preferences, shortcut list and all usertags!"></input>';
            htmlStr += '<br/><span style="font-weight:bold;" id="AVE_Mng_Info"></span>';

            //Reset / Export
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
                } else if (f.name.substr(f.name.length - 4, 4) != "json") {//Only plain text/JSON
                    _this.ShowInfo("The selected file\'s format isn\'t JSON", "failed");
                    print(f.type);
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
                        if (k.substr(0, 3) != "AVE") {
                            print("Failed: " + k);
                            return true;
                        }
                        _this.Store.SetValue(k, v)
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
        $("span#AVE_Mng_Info").finish();
        $("span#AVE_Mng_Info").show();
        $("span#AVE_Mng_Info").text(text);
        $("span#AVE_Mng_Info").css("color", status == "success" ? "#68C16B" : "#DD5454");
        $("span#AVE_Mng_Info").delay(5000).fadeOut(300);
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

        var data = {};
        $.each(_this.Store.Data, function (k, v) { data[k] = v; });
        var blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8" });
        print(self);
        saveAs(blob, "AVE_Data_" + (new Date().toLocaleDateString().replace(/\//g, "_")) + ".json");
    },
};
/// END Preference manager ///

/// Version notifier:  Show a short notification the first time a new version of AVE is used. ///
/* global self */

AVE.Modules['VersionNotifier'] = {
    ID: 'VersionNotifier',
    Name: 'Version notifier',
    Desc: 'Show a short notification the first time a new version of AVE is used.',
    Category: 'General',

    Index: 0.5,
    Enabled: false,

    Store: {},

    Options: {
    },

    Load: function () {
        this.Store = AVE.Storage;
        //this.Store.DeleteValue(this.Store.Prefix + this.ID + "_Version")
        this.Enabled = this.Store.GetValue(this.Store.Prefix + this.ID + "_Version") != AVE.Utils.MetaData.version;

        if (this.Enabled) {
            this.Start();
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
        "V2.19.11.22:",
        "   New feature: SubmissionFilter",
        "   Extend what a submission page is (to \"search\" and \"domains\" pages)",
        "   Replaced unicode character used for the close button in the PreferenceManager that wasn't displayed right in all extensions",
        "V2.18.10.20:",
        "   Removed backcompatibility module for V1 to V2 (explains why the version's Minor was decremented)",
        "   Released Firefox and Chrome extensions",
        "   Added support for more voat pages:",
        "       Api (excluded)",
        "       Saved",
        "       Domain",
        "       Submit",
        "       Account-login",
        "       Account-register",
        "V2.19.10.16:",
        "   NeverEndingVoat:",
        "       Corrected a bug that prevented going back to the previous submissions if the \"page #\" was just before it",
        "   UserTag:",
        "       Fixed bug: voteBalance listener was added instead of replaced. Result: after more content is loaded several time, one vote can count as several for the voteBalance feature",
        "   UserInfoFixedPos:",
        "       Added option to divide in two parts the user account header (disabled by default)",
        "   PreferenceManager:",
        "       Changed CSS of custom input so that it is more independent from the rest of the layout",
        "V2.19.10.12:",
        "   Shortkey:",
        "       Added new shortcuts:",
        "           Select next or previous post",
        "           Open comments page",
        "           Open link page",
        "           Open link and comments pages",
        "           Expand media",
        "       Hitting the next key, at the bottom of a subverse page or thread, triggers loading more content",
        "       Added option to open links and comments pages in new tabs. Redirects otherwise",
        "       Doesn't work anymore when a key modifier is pressed (ctrl, shift)",
        "   NeverEndingVoat:",
        "       Added option to expand media in new pages if you already clicked the \"View Media\" button",
        "           Disabled by default to save bandwidth",
        "           Duplicate submissions aren't expanded",
        "       Duplicate submissions' opacity has been lowered to 0.3",
        "       AutoLoad option",
        "   UserTag:",
        "       Added option to disabled the vote balance feature",
        "       Fixed a bug that made it so, in comment/self-text, only the first reference to a user, in the same line, was detected and tagged",
        "       The tag preview area is now limited to one line",
        "   PreferenceManager:",
        "       The 'AVE' link now appears even when not logged-in",
        "   UserInfoFixedPos:",
        "       If the page loads already scrolled down (e.g. refreshed), the account info block now positions itself accordingly",
        "   Added support for voat.co/search",
        "   Added support for voat.co/new",
        "V2.19.2.4:",
        "   New fix: DisableShareALink",
        "   NeverEndingVoat:",
        "       won't show sticky submission duplicates anymore",
        "       add expandos icon and feature to new submissions",
        "       updates enabled modules (ToggleMedia, ExpandImage, UserTag, ...)",
        "   IgnoreUsers:",
        "       Forgot to let the module show its current setting in the prefMngr",
        "   PreferenceManager:",
        "       Fixed a bug where a module alone in its category wouldn't reset as it should",
        "V2.18.0.1:",
        "   New feature: NeverEndingVoat",
        "   Fixed issue where NeverEndingVoat would update all updatable modules",
        "   UserTag:",
        "       Replaced empty tag (\"[ + ]\") with a tag icon",
        "       Fixed bug that made deleting tags impossible",
        "V2.17.0.2:",
        "    New feature: FixContainerWidth",
        "V2.16.0.3:",
        "    New feature: IgnoreUsers (deactivated by default)",
        "    Reinstated css fixes for chrome that were erased during refactoring",
        "    implemented a solution for users who have so many subscriptions that the \"my subverses\" list goes out of the screen",
        "V2.15.0.8: in AppendQuote, fixed issue with quoting self-text posts.",
        "V2.15.0.7: fixed and improved expanding images",
        "V2:",
        "Refactoring:",
        "    all modules are now completely separated/autonomous",
        "    the module class can implement default methods:",
        "        to save/load options",
        "        to reset data to default options through the prefMngr",
        "        to inject custom html (e.g. inputs) into the prefMngr and retrieve the form data",
        "        to insert elements into the current page",
        "        to add custom event listeners",
        "        to update when triggered by UpdateAfterLoadingMore",
        "Feature: New PrefManager",
        "Feature: UpdateAfterLoadingMore",
        "    Triggers modules to update when more content is loaded at the end of a thread",
        "Feature: BackCompatibility",
        "    Import data from v1",
        "Feature: ToggleChildComment",
        "    Adds \"Hide child comments\" link to hide a chain of posts",
        "Improved ExpandImage:",
        "    Works in subverse and thread pages",
        "improved Usertagging:",
        "    A tag box appears below the username instead of the javascript prompt",
        "    You can choose a colour to go with the tag",
        "Feature: vote balance (in UserTag)",
        "Design implementation of Ignore (but not yet implemented)",
        "AppendQuote: added \"quote\" link to self-text OP in thread pages",
        "Storage Module with GM_storage (localStorage later)",
        "Added an option to ToggleMedia: toggle media in the sidebar (default: false)",
        "Light and Dark theme for the PrefMngr and Tag box", ],

    AppendToPage: function () {
        var CSSstyle = 'div.VersionBox' +
                      '{background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F6F6F6") + ';' +
                       'border:1px solid black;' +
                       'z-index: 1000 ! important;' +
                       'position:fixed;' +
                       'right:0px;' +
                       'top:64px;' +
                       'width:250px;' +
                       'font-size:12px;' +
                       '}' +
                    'p.VersionBoxTitle' +
                       '{background-color: ' + (AVE.Utils.CSSstyle == "dark" ? "#575757" : "#D5D5D5") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#BFBFBF" : "535353") + ';' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'text-align: center;' +
                       'font-weight: bold;' +
                       '}' +
                    'p.VersionBoxInfo' +
                       '{' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#AAA" : "#565656") + ';' +
                       'margin-top: 5px;' +
                       'padding: 5px;' +
                       '}' +
                    'p.VersionBoxToggle' +
                       '{padding: 5px;}' +
                    'div.VersionBoxClose{' +
                       'border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "5452A8" : "D1D0FE") + ';' +
                       'background-color:#' + (AVE.Utils.CSSstyle == "dark" ? "304757" : "F4FCFF") + ';' +
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
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#BFBFBF" : "535353") + ';' +
                       'font-size:12px;' +
                       'font-weight:bold;' +
                       'width:100%;' +
                       'padding:10px;' +
                       'padding-bottom:10px;' +
                       '}';
        var notifierHTML = '<div class="VersionBox">' +
                                '<p class="VersionBoxTitle">' + AVE.Utils.MetaData.name + '</p>' +
                                '<p class="VersionBoxInfo">' + (this.Trigger == "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px">' + AVE.Utils.MetaData.version + '</strong></p>' +
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

/// Fix header position:  Set the subverse list header position as fixed. ///
AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'Fixes',
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
        var _this = AVE.Modules['HeaderFixedPos'];

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

        AVE.Utils.ListHeaderHeight = $('#sr-header-area').height();

        $('.width-clip').css('position', 'fixed')
            .css("z-index", "1000")
            .css('border-bottom', '1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
            .css("height", AVE.Utils.ListHeaderHeight + "px")
            .css("background-color", AVE.Utils.CSSstyle == "dark" ? "#333" : "#FFF");

        $('.width-clip').find("br:last").remove();//Chrome

        //If you have so many subscriptions that the "my subverses" list goes out of the screen, this is for you.
        var li_Height = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerHeight();
        if (($(window).height() - AVE.Utils.ListHeaderHeight - li_Height) < $("ul.whoaSubscriptionMenu > li > ul:first").height()) {
            var li_Width = $("ul.whoaSubscriptionMenu > li > ul:first").find("li > a").outerWidth();
            var elPerCol = parseInt(($(window).height() - AVE.Utils.ListHeaderHeight) / li_Height) - 1;
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
        var _this = AVE.Modules['UpdateAfterLoadingMore'];

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

    obsReplies: null,
    obsComm: null,
    CommentLen: 0,

    Start: function () {
        var _this = this;

        this.CommentLen = $("div[class*='id-']").length;
        //More Comments
        if (this.obsComm) { this.obsComm.disconnect(); }
        this.obsComm = new OnNodeChange($("div.sitetable#siteTable"), function (e) {
            if (e.addedNodes.length > 0 && e.removedNodes.length == 0) {
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
            if (e.removedNodes.length == 1) {
                if (e.removedNodes[0].tagName == "DIV" && e.removedNodes[0].id == "") {
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

/// Fix user-block position:  Set the user info block\'s position as fixed. ///
AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'Fixes',

    Index: 2,
    Enabled: false,

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
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['UserInfoFixedPos'];

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
        if (!AVE.Utils.ListHeaderHeight) { AVE.Utils.ListHeaderHeight = 0; }

        var headerAccountPos = $('#header-account').offset().top;
        $(window).scroll(function () {
            SetAccountHeaderPosAsFixed(headerAccountPos)
        });
        SetAccountHeaderPosAsFixed(headerAccountPos)

        function SetAccountHeaderPosAsFixed(headerAccountPos) {
            if ($(window).scrollTop() + AVE.Utils.ListHeaderHeight > headerAccountPos) {
                $('div#header-account').css('position', 'fixed')
                                    .css('top', AVE.Utils.ListHeaderHeight + "px")
                                    .css('right', '0')
                                    .css("text-align", "center")
                                    .css("height", "0px");
                $('div#header-account > div.logged-in').css("background", AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
            } else {
                $('div#header-account').css('position', '')
                                    .css('top', '')
                                    .css("text-align", "")
                                    .css("height", "");
                $('div#header-account > div.logged-in').css("background", "");
            }
        }

        if (this.Options.DivideBlock.Value && $("div#header-account > div.logged-in").length > 0) {
            //Align header-account's content
            $("div#header-account > div.logged-in").css("text-align", "center");
            //Add a line return before the icons
            $("<br />").insertAfter("div#header-account > div.logged-in > span.separator:first");
            //Remove the, now useless, separator
            $("div#header-account > div.logged-in > span.separator:first").remove();
            //Reset header-account's so that it is not a few pixels too high.
            $('div#header-account').css('position', '');
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var htmlStr = "";
            htmlStr += '<input ' + (AVE.Modules['UserInfoFixedPos'].Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Do you want the header account separated- username and numbers at the top and icons below?</label>'
            return htmlStr;
        },
    },
};
/// END Fix user-block position ///

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
            Value: true,
        },
        VoteBalance: {
            Type: 'boolean',
            Desc: 'Track votes and display the vote balance next to usernames.',
            Value: true,
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
    background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
    ' + (AVE.Utils.CSSstyle == "dark" ? "" : "color: #707070;") + '\
    z-index: 1000 !important;\
    position:absolute;\
    left:0px;\
    top:0px;\
    border: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
    border-radius:3px;\
    width:280px;\
}\
div#UserTagHeader{\
    font-weight:bold;   \
    height:20px;\
    border-bottom: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
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
    background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
    border: 1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
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
    border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';\
    border-radius:3px;\
}\
span.AVE_UserTag{\
    font-weight:bold;\
    cursor:pointer;\
    margin-left:4px;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';\
    color:#' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "000") + ';\
    border-radius:3px;font-size:10px;\
}\
span.AVE_UserTag:empty{\
    border:0px;\
    height: 14px;\
    width: 14px;\
    margin: 0px 0px -3px 4px;\
    /* SVG from Jquery Mobile Icons Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle == "dark" ? "ABABAB" : "BBB") + '%22%20d%3D%22M5%2C0H0v5l9%2C9l5-5L5%2C0z%20M3%2C4C2.447%2C4%2C2%2C3.553%2C2%2C3s0.447-1%2C1-1s1%2C0.447%2C1%2C1S3.553%2C4%2C3%2C4z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
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
                <td><input name="color" type="color" title="Click me!" id="ChooseColor" style="width:60px;" />\</td>\
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
        var _this = AVE.Modules['UserTag'];
        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if (!$(this).attr('href').match(sel)) { return true; } //useful?
            if ($(this).next("span.AVE_UserTag").length > 0) { return true; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username

            if ($(this).attr('href').split("/")[2].toLowerCase() != name) { return true; } //don't add if this is a link whose label isn't the username

            tag = _this.GetTag(name) || new _this.UserTagObj("",  (AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"), false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "" : tag.tag) + '</span>';
            if (_this.Options.VoteBalance.Value) {
                if (tag.balance != 0) {
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
                if ($.inArray(name, AVE.Modules['IgnoreUsers'].IgnoreList) == -1) {
                    AVE.Modules['IgnoreUsers'].IgnoreList.push(name);
                }
            }
        });

        if ($("#UserTagBox").length == 0) {
            $("<style></style>").appendTo("head").html(_this.style);
            $(_this.html).appendTo("body");
            $("#UserTagBox").hide();
        }
    },

    obsVoteChange: null,

    Listeners: function () {
        var _this = AVE.Modules['UserTag'];

        $(".AVE_UserTag").off("click");
        $(".AVE_UserTag").on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = _this.usertags[username];

            var position = $(this).offset();

            position.top += 20;
            $("#UserTagBox").css(position);
            $("#UserTagBox").show();

            $("div#UserTagHeader > span#username").text(username);

            $("tr#SetTag > td > input.UserTagTextInput").val(oldTag == "+" ? "" : oldTag);
            $("tr#ShowPreview > td > span#PreviewBox").text(oldTag == "+" ? "" : oldTag);

            if (usertag != undefined) {
                $("tr#SetColour > td > input#ChooseColor").val(usertag.colour);
                $("tr#SetColour > td > input#ChooseColor").change();
                if (usertag.ignored) { $("tr#SetIgnore > td > input#ToggleIgnore").prop('checked', "true"); }
                $("tr#SetBalance > td > input#voteBalance").val(usertag.balance);
            } else {
                $("tr#SetColour > td > input#ChooseColor").val((AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"));
                $("tr#SetColour > td > input#ChooseColor").change();
            }
            $("tr#SetTag > td > input.UserTagTextInput").focus();
            $("tr#SetTag > td > input.UserTagTextInput").select();
        });
        

        if (_this.Options.VoteBalance.Value) {
            if (_this.obsVoteChange) { _this.obsVoteChange.disconnect(); }
            _this.obsVoteChange = new OnAttrChange($("div[class*='midcol']"), function (e) {
                if (!e.oldValue || e.oldValue.split(" ").length != 2) { return true; }
                _this.ChangeVoteBalance(e.target, e.oldValue);
            });
            this.obsVoteChange.observe();
        }

        //Close button
        $("div#UserTagHeader > span > a#CloseTagWin").off("click");
        $("div#UserTagHeader > span > a#CloseTagWin").on("click", function () {
            $("#UserTagBox").hide();
        }),
        //Show in the preview box the tag
        $("tr#SetTag > td > input.UserTagTextInput").off('keyup');
        $("tr#SetTag > td > input.UserTagTextInput").on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
        $("tr#SetColour > td > input#ChooseColor").off('change');
        $("tr#SetColour > td > input#ChooseColor").on('change', function () {
            var r, g, b;
            var newColour = $(this).val();
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val());
            $("tr#ShowPreview > td > span#PreviewBox").css("color", AVE.Utils.GetBestFontColour(r, g, b));
        });
        //Saving tag
        $("tr#SetBalance > td > a#SaveTag").off("click")
        $("tr#SetBalance > td > a#SaveTag").on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                tag: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                colour: $("tr#SetColour > td > input#ChooseColor").val(),
                ignore: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                balance: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10),
            };

            if (isNaN(opt.balance)) { opt.balance = 0; }

            if (opt.tag.length == 0 && opt.ignore == false && opt.balance == 0) {
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
            if (e.which == 13) {
                if ($(e.target).attr("class") == "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
            if (e.which == 27 && $("#UserTagBox").is(":visible")) {
                $("div#UserTagHeader > span > a#CloseTagWin").click();
                $("#UserTagBox").hide();
            }
        });
    },

    //Because the .click JQuery event triggered by the shortkeys in ShortKeys.js triggers an OnAttrChange with false mutation values (oldValue, attributeName),
    //      we use a second function that keypresses in ShortKeys.js can invoke directly.
    // Ten mimutes later it works perfectly well. Maybe, voat's current instability was to blame. I'm not changing it back, anyway...
    ChangeVoteBalance: function (target, oldValue) {
        var _this = this;

        //print("target: "+target);
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find(".AVE_UserTag:first").attr("id").toLowerCase();
        if (username == undefined) { return true; }

        var tag = _this.GetTag(username);
        var opt = { username: username, tag: tag.tag || '', colour: tag.colour || "#d1d1d1", ignore: tag.ignore || false, balance: tag.balance || 0 };

        //If the previous status was "unvoted"
        if (oldValue == "midcol unvoted") {
            if ($(target).hasClass('likes')) { opt.balance += 1; }
            else if ($(target).hasClass('dislikes')) { opt.balance -= 1; }
        }
        else {
            //If the previous status was "upvoted"
            if (oldValue == "midcol likes") {
                if ($(target).hasClass('unvoted')) { opt.balance -= 1; }
                else if ($(target).hasClass('dislikes')) { opt.balance -= 2; }
            }
                //If the previous status was "downvoted"
            else if (oldValue == "midcol dislikes") {
                if ($(target).hasClass('likes')) { opt.balance += 2; }
                else if ($(target).hasClass('unvoted')) { opt.balance += 1; }
            }
        }
        
        _this.SetTag(opt);
        _this.UpdateUserTag(opt);
    },

    UpdateUserTag: function (tag) {
        var _this = AVE.Modules['UserTag'];
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {

            if (tag.tag != "") {
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
                if (tag.balance != 0) {
                    var sign = tag.balance > 0 ? "+" : "";
                    $(this).nextAll("span.AVE_UserBalance:first").text('[ ' + sign + tag.balance + ' ]');
                } else {
                    $(this).nextAll("span.AVE_UserBalance:first").text("");
                }
            };
        });
    },

    RemoveTag: function (username) {
        var _this = AVE.Modules['UserTag'];
        delete _this.usertags[username];

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    SetTag: function (opt) {
        var _this = AVE.Modules['UserTag'];
        _this.usertags[opt.username] = new _this.UserTagObj(opt.tag, opt.colour, opt.ignore, opt.balance);

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    GetTag: function (userName) {
        var _this = AVE.Modules['UserTag'];
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
                    if (value.balance != 0) { VoteLen++; }
                    if (value.ignored == true) { IgnoreLen++; }
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

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        MediaTypes: {
            Type: 'string',
            Value: "110", // Images, Videos, self-Texts
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ToggleMedia'];
        POST = POST[_this.ID];
        var opt = {};
        opt.Enabled = POST.Enabled;
        opt.MediaTypes = (POST.Images ? "1" : "0") + (POST.Videos ? "1" : "0") + (POST["self-texts"] ? "1" : "0")

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(opt));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ToggleMedia'];
        _this.Options = JSON.parse(_this.OriginalOptions);
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
    ImgMedia: "[title*='JPG'],[title*='PNG'],[title*='GIF'],[title*='Gfycat'],[title*='Gifv'],[title*='Imgur Album']",
    VidMedia: "[title*='YouTube'],[title*='Vimeo']",
    SelfText: "[onclick^='loadSelfText']",
    // voat.co/v/test/comments/37149

    Start: function () {
        var AcceptedTypes = this.Options.MediaTypes.Value;
        if (AcceptedTypes != "000" && $.inArray(AVE.Utils.currentPageType, ["subverses", "sets", "mysets", "user", "user-manage"]) == -1) {

            var strSel = (AcceptedTypes[0] == true ? this.ImgMedia + "," : "") +
                         (AcceptedTypes[1] == true ? this.VidMedia + "," : "") +
                         (AcceptedTypes[2] == true ? this.SelfText : "");

            if (strSel[strSel.length - 1] == ",")
            { strSel = strSel.slice(0, -1); }

            this.sel = $(strSel).filter(function (idx) { return $(this).parents("div.submission[class*='id-']:first").css("opacity") == 1; });

            //print(this.sel.length);

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
        if (this.sel.length == 0) { return; }

        if ($("a#GM_ExpandAllImages").length > 0) {
            $("a#GM_ExpandAllImages").text($("a#GM_ExpandAllImages").text().replace(/\([0-9]*\)/, "(" + this.sel.length + ")"));
        }
        else {
            var btnHTML = '<li class="disabled"><a id="GM_ExpandAllImages" class="contribute submit-text">View Media (' + this.sel.length + ')</a></li>';
            $(btnHTML).insertAfter(".disabled:last");
        }
    },

    Listeners: function () {
        var _this = this;
        var isExpanded = false;
        $("[id='GM_ExpandAllImages']").off("click");
        $("[id='GM_ExpandAllImages']").on("click", function () {
            if ($(this).hasClass("expanded")) {
                $(this).text('View Media (' + _this.sel.length + ')');
                $(this).removeClass("expanded")
                isExpanded = false;
            } else {
                $(this).text('Hide Media (' + _this.sel.length + ')');
                $(this).addClass("expanded")
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
                ) {
                this.sel[el].click();
            }
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ToggleMedia']
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
            Value: true,
        },
        Formatting: {
            Type: 'string',
            Value: '[{@username}]({@permaLink}) wrote:{@n}{@n}{@comment}',
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['AppendQuote'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = AVE.Modules['AppendQuote'];
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
        var _this = AVE.Modules['AppendQuote'];
        $("a#AVE_QuotePost").off("click");
        $("a#AVE_QuotePost").on("click", function () {
            var comment = AVE.Utils.ParseQuotedText($(this).parent().parent().parent().find('.md:first').html())
            var permaLink = $(this).parents("ul[class*='flat-list']").first().find("a[class*='bylink']").attr("href");
            if (!permaLink) { permaLink = window.location.href; }
            var userpageLink = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").attr("href");
            var username = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").text();
            
            var quote = _this.Options.Formatting.Value.replace(/{@username}/gi, username);
            quote = quote.replace(/{@permaLink}/gi, permaLink);
            quote = quote.replace(/{@userpage}/gi, userpageLink);
            quote = quote.replace(/{@comment}/gi, comment);
            quote = quote.replace(/{@n}/g, "\n");

            var NearestReplyBox = $(this).parents(":has(textarea[class*='commenttextarea'][id*='CommentContent']:visible)").first().find("textarea[class*='commenttextarea'][id*='CommentContent']:visible");
            if (NearestReplyBox.val() != "") {
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
            htmlStr += ' <button id="AutoQuoteFormatShowPreview" class="btn-whoaverse-paging" type="button">Show Preview</button>'
            htmlStr += '<div class="md" id="AutoQuoteFormatPreview" style="height:150px; background-color: #' +(AVE.Utils.CSSstyle == "dark" ? "292929": "D1D0FE") + '; position: fixed; width:430px;padding: 10px; border-radius: 6px; border: 3px solid black;display: none;overflow: auto;"></div>';
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
                if ($(this).text() == "Show Preview") {
                    $(this).text("Hide Preview");
                    $("div#AutoQuoteFormatPreview").show();

                    var quote = $("input[id='Formatting'][Module='" + _this.ID + "']").val().replace(/{@username}/gi, "Username");
                    quote = quote.replace(/{@permaLink}/gi, "/v/whatever/comments/111111/111111");
                    quote = quote.replace(/{@userpage}/gi, "/user/atko");
                    quote = quote.replace(/{@comment}/gi, "> This is a comment.\n\n> Another line.");
                    quote = quote.replace(/{@n}/g, "\n");

                    $("div#AutoQuoteFormatPreview").text("Loading...");
                    var r = { MessageContent: quote }
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
        },
    },
};
/// END Append quote ///

/// Disable Share-a-Link:  This module will remove the Share-a-Link overlay block ///
AVE.Modules['DisableShareALink'] = {
    ID: 'DisableShareALink',
    Name: 'Disable Share-a-Link',
    Desc: 'This module will remove the Share-a-Link overlay block',
    Category: 'Fixes',

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

/// Set Voat container\'s width:  By default, Voat shows a margin at both sides of the container. You can modify this by setting the new width as a percentage of the available horizontal space. ///
AVE.Modules['FixContainerWidth'] = {
    ID: 'FixContainerWidth',
    Name: 'Set Voat container\'s width',
    Desc: 'By default, Voat shows a margin at both sides of the container. You can modify this by setting the new width as a percentage of the available horizontal space.',
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
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['FixContainerWidth'];
        POST = POST[_this.ID];

        POST.Width = parseInt(POST.Width);
        if (typeof POST.Width != "number" || isNaN(POST.Width)) {
            POST.Width = _this.Options.Width.Value;
        }

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = AVE.Modules['FixContainerWidth'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['FixContainerWidth'];
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
        $("div#container").css("max-width", this.Options.Width.Value + "%");
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            var htmlStr = '<input style="width:50%;display:inline;" id="Width" value="'+_this.Options.Width.Value+'" type="range" min="' + _this.Options.Width.Range[0] + ' max="' + _this.Options.Width.Range[1] + '"/> <span id="FixContainerWidth_Value"></span>%';
            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            $("input#Width[type='range']").on("change", function () {
                $("span#FixContainerWidth_Value").text($(this).val());
                $("div#container").css("max-width", $(this).val() + "%");
            });
            $("input#Width[type='range']").change();
        },
    },
};
/// END Set Voat container\'s width ///

/// Fix expanding images:  Let images expand over the sidebar and disallow the selection/highlight of the image. ///
AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlight of the image.',
    Category: 'Fixes',

    Enabled: false,

    Store: AVE.storage,

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['FixExpandImage'];

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
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsInSub: null,
    obsInThread: null,

    Listeners: function () {
        var ImgMedia = "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']";

        if (this.obsInSub) {
            this.obsInSub.disconnect();
            //Instead of disconnecting and recreating, maybe I could add the new targets to the observer.
        }
        this.obsInSub = new OnNodeChange($("a" + ImgMedia), function (e) {
            var container = $(e.target).parent().find("div.link-expando:first");
            var img = container.find("img:first");

            if (img.length > 0) {
                var parentWidth = $(this).parent().parent().width();

                img.css("position", "absolute")
                   .css("margin-top", "20px");

                img.OnAttrChange(function () {
                    window.getSelection().removeAllRanges();
                    container.width(parentWidth);//img.width());
                    container.height(img.height() + 20);
                });

                container.animate({
                    width: parentWidth + "px",
                    height: img.height() + 20 + "px",
                }, 1500);
            }
        });
        this.obsInSub.observe();

        if (this.obsInThread) {
            this.obsInThread.disconnect();
        }

        this.obsInThread = new OnNodeChange($("div.expando:hidden"), function (e) {
            //if ($(this).is(":not(div.expando)")) { print("a!!"); return true; }

            var img = $(e.target).find("img:first");
            if (img.length > 0) {
                var exp = $(this).hasClass("link-expando") ? $(this) : $(this).find("div.expando-link");
                img.css("position", "absolute")
                   .css("margin-top", "20px");

                img.OnAttrChange(function () {
                    window.getSelection().removeAllRanges();
                    exp.width(150);//img.width());
                    exp.height(img.height() + 20);
                });

                exp.animate({
                    width: 150 + "px", //just enough width to let the media info show
                    height: img.height() + 20 + "px",
                }, 150);
            }
        });
        this.obsInThread.observe()
    },
};
/// END Fix expanding images ///

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
            Value: false,
        },
        HardIgnore: {
            Type: 'boolean',
            Desc: 'Remove entirely from the page posts and chain comments made by the ignored users.',
            Value: false,
        },
    },

    IgnoreList: [],

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = AVE.Modules['IgnoreUsers'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
        var _this = AVE.Modules['IgnoreUsers'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['IgnoreUsers'];
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
        var _this = AVE.Modules['IgnoreUsers'];
        if (AVE.Utils.currentPageType == "thread") { // comments
            $("p.tagline > a.author").each(function () {
                var name = $(this).attr("data-username");
                if ($.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('Removed comment by ' + name)
                    $(this).parents("div.comment[class*='id-']:first").remove();
                } else {
                    $(this).parent().parent().find("div[id*='commentContent-']")
                        .text('[Ignored User]')
                        .css("font-size", "10px")
                        .css("margin-left", "20px")
                        .css("font-weight", "bold");
                }
            });
        } else if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain"]) !== -1) { // submissions
            $("p.tagline > a.author").each(function () {
                var name = $(this).attr("data-username");
                if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('Removed submissions titled: "'+$(this).parents("div.entry:first").find("p.title > a[class*='title']:first").text()+'" by '+name)
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
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var htmlStr = "";
            htmlStr += '<input ' + (AVE.Modules['IgnoreUsers'].Options.HardIgnore.Value ? 'checked="true"' : "") + ' id="HardIgnore" type="checkbox"/><label for="HardIgnore"> Hard ignore</label><br />If checked all submissions and (chain)-comments of ignored users will be hidden.';
            if (!AVE.Modules['UserTag'] || !AVE.Modules['UserTag'].Enabled) {
                htmlStr += '<br /><span style="font-weigth:bold;color:#D84C4C;">The User tagging module is not activated, this module cannot work without it.</span>';
            }
            //show a warning if usertag is disabled
            return htmlStr;
        },
    },
};
/// END Ignore users ///

/// Never Ending Voat:  Browse an entire subverse in one page. ///
AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse an entire subverse in one page.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        AutoLoad: {
            Type: 'boolean',
            Desc: 'If checked, scroll to load more content. Click the "load more" button to load the next page otherwise.',
            Value: true,
        },
        ExpandSubmissionBlock: {
            Type: 'boolean',
            Desc: 'Expand the new submission posts over the empty sidebar\'s space',
            Value: true,
        },
        DisplayDuplicates: {
            Type: 'boolean',
            Desc: 'Display duplicate submissions (greyed).',
            Value: true,
        },
        ExpandNewMedia: {
            Type: 'boolean',
            Desc: 'Expand media in inserted pages, if you already clicked the \"View Media\" button.',
            Value: false,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['NeverEndingVoat'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse"]) == -1 ||
            $("div.pagination-container").find("li.btn-whoaverse-paging").length == 0) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.SepStyle = 'background-color:#' + (AVE.Utils.CSSstyle == "dark" ? "5C5C5C" : "F6F6F6") + ';height:20px;text-align:center;border:1px dashed #' + (AVE.Utils.CSSstyle == "dark" ? "111" : "BCBCBC") + ';border-radius:3px;padding:2px 0px;margin:4px 0px;';
            this.Start();
        }
    },

    Labels: ["Load more", "Sit tight ...", "Sorry, I couldn't find more content", "Something went wrong. Maybe try again?"],
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
        if ($("a#AVE_loadmorebutton").length == 0 && $("div.pagination-container").find("li.btn-whoaverse-paging").length > 0) {
            var LoadBtn = '<a href="javascript:void(0)" style="margin: 5px 0px;" class="btn-whoaverse btn-block" id="AVE_loadmorebutton">' + this.Labels[0] + '</a>';
            $("div.pagination-container").html(LoadBtn);
        }
    },

    Listeners: function () {
        var _this = this;

        if (_this.Options.AutoLoad.Value) {
            $(window).scroll(function () {
                if ($(document).scrollTop() + $(window).height() >= $("body").height()) {
                    _this.LoadMore();
                }
            });
        }

        $("a#AVE_loadmorebutton").on("click", function () { _this.LoadMore(); });
    },

    LoadMore: function () {
        //Don't load another page if one is already being loaded.
        if ($("a#AVE_loadmorebutton").text() == this.Labels[1]) { return false; }

        var _this = this;

        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") != -1) {
            nextPageURL = nextPageURL.replace(/\?page\=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://" + window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }
        print("loading page: " + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false,
        }).done(function (html) {
            var error = false;
            if ($(html).find("div.submission[class*='id-']").length == 0) { $("a#AVE_loadmorebutton").text(_this.Labels[2]); return false; } //catchall for error pages
            _this.currentPage++;
            print($(html).find("div.submission[class*='id-']").length);

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") != "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
                $("div.side").css("z-index", "100");
            }

            $("div.sitetable").append('<div style="' + _this.SepStyle + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');

            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            $(html).find("div.submission[class*='id-']").each(function () {
                if ($.inArray($(this).attr("data-fullname"), _this.PostsIDs) == -1) {
                    _this.PostsIDs.push($(this).attr("data-fullname"));
                    $("div.sitetable").append($(this));
                } else if (_this.Options.DisplayDuplicates.Value && !$(this).hasClass("stickied")) {
                    $("div.sitetable").append($(this));
                    $(this).css("opacity", "0.3");
                } else {
                    error = true;
                }
            });

            if (!error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[0]);
            } else {
                $("a#AVE_loadmorebutton").text("An error occured. No point in trying again I'm afraid.");
                print("AVE: oups error in NeverEndingVoat:LoadMore()");
            }

            // Add expando links to the new submissions
            location.assign("javascript:UI.ExpandoManager.execute();void(0)");
            // from https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js#L190

            //Ugly, isn't it?
            if (_this.Options.ExpandNewMedia.Value) {
                if (AVE.Modules['ToggleMedia'] && AVE.Modules['ToggleMedia'].Enabled) {
                    if ($("[id='GM_ExpandAllImages']").hasClass("expanded")) {
                        setTimeout(function () { AVE.Modules['ToggleMedia'].ToggleMedia(true) }, 750);

                    }
                }
            }

            setTimeout(AVE.Init.UpdateModules, 500);
            window.location.hash = 'p=' + _this.currentPage;

            //Next lines are needed because the front page (^voat.co$) is a bit different from subverses' pages. div.pagination-container isn't normally inside div.sitetable 
            if ($("div.sitetable").find("div.pagination-container").length > 0) {
                $("div.pagination-container").appendTo($("div.sitetable"))
                $("div.sitetable > a[href='/random']").appendTo($("div.sitetable"))
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
        var _this = AVE.Modules['ReplyWithQuote'];

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
            if (_this.Quote == "") { return; }

            var ReplyBox = $(this).find("textarea[class='commenttextarea'][id='CommentContent']");
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

        if ($(nodes[0]).parents(".usertext-body:first").attr("id") == undefined ||
            $(nodes[0]).parents(".usertext-body:first").attr("id") != $(nodes[1]).parents(".usertext-body:first").attr("id")) {
            return "";
        }

        return AVE.Utils.ParseQuotedText(this.getSelectedText().toString());
    },

    getSelectedNodes: function () {
        // Thanks to InvisibleBacon @ https://stackoverflow.com/questions/1335252/how-can-i-get-the-dom-element-which-contains-the-current-selection
        var selection = window.getSelection();
        if (selection.rangeCount > 0)
            return [selection.getRangeAt(0).endContainer.parentNode, selection.getRangeAt(0).startContainer.parentNode];
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

/// Select posts:  A click selects/highlights a post. ///
AVE.Modules['SelectPost'] = {
    ID: 'SelectPost',
    Name: 'Select posts',
    Desc: 'A click selects/highlights a post.',
    Category: 'Posts',

    Enabled: false,

    Store: AVE.storage,

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        ContentColour: {
            Type: 'array',
            Value: ['#323E47', '#F4FCFF'],
        },
        QuoteCodeColour: {
            Type: 'array',
            Value: ['#394856', '#EAFEFF'],
        },
        VoteCountBoxColour: {
            Type: 'array',
            Value: ['#2D4A60', '#E1F9FF'],
        },
        ContextColour: {
            Type: 'array',
            Value: ['background-color: #482C2C !important; border: 1px solid #A23E3E !important;',
                    'background-color: #D5F0FF !important; border: 1px solid #4B96C4 !important;'],
        },
    },

    OriginalOptions: {}, //For reset function

    SavePref: function (POST) {
        var _this = AVE.Modules['SelectPost'];
        var colours = ["ContentColour", "QuoteCodeColour", "VoteCountBoxColour", "ContextColour"];
        POST = POST[_this.ID];

        $.each(colours, function (index, value) {
            _this.Options[value].Value[AVE.Utils.CSSstyle == "dark" ? 0 : 1] = POST[value];
        });
        _this.Options.Enabled.Value = POST.Enabled;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(_this.Options));
    },

    ResetPref: function(){
        var _this = AVE.Modules['SelectPost'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['SelectPost'];
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
        var _this = AVE.Modules['SelectPost'];
        $(".entry").off("click");
        $(".entry").on("click", function () {
            _this.ToggleSelectedState($(this));
        });
    },
    
    ToggleSelectedState: function (obj) {
        var style = (AVE.Utils.CSSstyle == "dark" ? 0 : 1);
        _this = AVE.Modules['SelectPost'];
        if (AVE.Utils.SelectedPost != undefined) {
            AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").css('background-color', '');
            AVE.Utils.SelectedPost.find("blockquote").css('background-color', '');
            AVE.Utils.SelectedPost.find("pre").css('background-color', '');

            if (AVE.Utils.currentPageType == "user-submissions") {
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
        if (AVE.Utils.currentPageType == "user-submissions") {
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
            var style = AVE.Utils.CSSstyle == "dark" ? 0 : 1;
            var _this = AVE.Modules['SelectPost'];
            var htmlStr = "";
            htmlStr += "<div>Background colours (" + AVE.Utils.CSSstyle + " theme):</div>"
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContentColour"></div>';
            htmlStr += ' <input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContentColour" Value="' + _this.Options.ContentColour.Value[style] + '"/> - Post<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_QuoteCodeColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="QuoteCodeColour" Value="' + _this.Options.QuoteCodeColour.Value[style] + '"/> - Quote and Code<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_VoteCountBoxColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="VoteCountBoxColour" Value="' + _this.Options.VoteCountBoxColour.Value[style] + '"/> - Vote box in submissions page<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContextColour"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:340px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContextColour" Value="' + _this.Options.ContextColour.Value[style] + '"/> - Context comment<br />';
            return htmlStr;
        },
        callback: function () {//ContentColour QuoteCodeColour VoteCountBoxColour ContextColour
            var _this = AVE.Modules['SelectPost'];
            $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_ContextColour").attr("style", $("div#Demo_ContextColour").attr("style") + $("input[id='ContextColour'][Module='" + _this.ID + "']").val());

            $("input[id='ContentColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='ContextColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContextColour").attr("style", "display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" + $("input[id='ContextColour'][Module='" + _this.ID + "']").val());
            });

        },
    },
};
/// END Select posts ///

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
        var _this = AVE.Modules['Shortcuts'];

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
        } else if (AVE.Utils.currentPageType == "subverses") {
            this.AddShortcutsButtonInSubversesPage();
        } else if ($.inArray(AVE.Utils.currentPageType, ["mysets", "sets"]) >= 0) {
            this.AddShortcutsButtonInSetsPage();
        } else if (AVE.Utils.currentPageType == "set") {
            this.AddShortcutsButtonInSetPage();
        }
    },

    AddShortcutsButtonInSetsPage: function () {
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

            if (setName == null || setName == undefined || setName == "undefined" ||
                setId == null || setId == undefined) {
                alert("AVE: Error adding set " + setName + ", id: " + setId);
                return;
            }

            var set = setName + ":" + setId;
            if (this.isSubInShortcuts(set)) {
                this.RemoveFromShortcuts(set);
                this.ToggleShortcutButton(true, this);
            }
            else {
                this.AddToShortcuts(set);
                this.ToggleShortcutButton(false, this);
            }

            this.DisplayCustomSubversesList();
        });
    },

    // Special to voat.co/subverses: adds a "shortcut" button for each subverse////
    AddShortcutsButtonInSubversesPage: function () {
        var _this = AVE.Modules['Shortcuts'];
        var inShortcut = false;
        var tempSubName = "";

        $('.col-md-6').each(function () {
            tempSubName = $(this).find(".h4").attr("href").substr(3);
            inShortcut = _this.isSubInShortcuts(tempSubName);

            var btnHTML = '<br /><button style="margin-top:5px;" id="AVE_Subverses_Shortcut" subverse="'+ tempSubName + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">'+ (inShortcut ? "-" : "+") + ' shortcut </button>';
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
        _this = AVE.Modules['Shortcuts'];
        var SubString = '';
        var subArr = this.GetSubversesList();
        var setInfo = [];

        for (var idx in subArr) {
            if (subArr[idx] == "") { continue; }
            if (AVE.Utils.regExpSet.test(subArr[idx])) { //ex: name:12
                setInfo = _this.GetSetParam(subArr[idx]);
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
        _this = AVE.Modules['Shortcuts'];

        if (!this.isPageInShortcuts()) {
            var btnHTML = '<button id="AVE_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            var btnHTML = '<button id="AVE_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
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
        _this = AVE.Modules['Shortcuts'];
        return _this.Store.GetValue(_this.StorageName, "newsubverses,introductions,news").split(',');
    },

    GetSetParam: function (str) {
        var m = AVE.Utils.regExpSet.exec(str);

        if (m == null) { return null; }
        else { return [m[1].toLowerCase(), m[2]]; }
    },

    AddToShortcuts: function (SubName) {
        _this = AVE.Modules['Shortcuts'];
        var subversesArr = _this.GetSubversesList();
        var str = subversesArr.join(",") + "," + SubName;

        _this.Store.SetValue(_this.StorageName, str);
    },

    RemoveSetFromShortcut: function (id) {
        _this = AVE.Modules['Shortcuts'];
        var subversesArr = _this.GetSubversesList();

        for (var x in subversesArr) {
            if (AVE.Utils.regExpSet.test(subversesArr[x])) {
                if (_this.GetSetParam(subversesArr[x])[1] == id) {
                    _this.RemoveFromShortcuts(subversesArr[x]);
                    return true;
                }
            }
        }
        return false;
    },

    RemoveFromShortcuts: function (SubName) {
        _this = AVE.Modules['Shortcuts'];
        var subversesArr = _this.GetSubversesList();
        var idx = subversesArr.indexOf(SubName);

        if (idx < 0) {
            alert("AVE: sub or set name not found in Header list\n(" + SubName + ")");
            return false;
        }

        subversesArr.splice(idx, 1);
        _this.Store.SetValue(_this.StorageName, subversesArr.join(","));
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
        _this = AVE.Modules['Shortcuts'];
        var subversesArr = _this.GetSubversesList();

        for (var i in subversesArr) {
            if (subversesArr[i].toLowerCase() == Sub.toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    isPageInShortcuts: function () {
        _this = AVE.Modules['Shortcuts'];
        var subversesArr = _this.GetSubversesList();

        return _this.isSubInShortcuts(AVE.Utils.subverseName);
    },
};
/// END Subverse and Set shortcuts ///

/// Shortcut keys:  Use your keyboard to navigate Voat. ///
/* global self */
AVE.Modules['ShortKeys'] = {
    ID: 'ShortKeys',
    Name: 'Shortcut keys',
    Desc: 'Use your keyboard to navigate Voat.',
    Category: 'Posts',

    Enabled: false,

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
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ShortKeys'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ShortKeys'];
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

        $(document).keydown(function (event) {
            //Exit if there is no post currently selected
            if (!AVE.Utils.SelectedPost) { return; }
            //Exit if the focus is given to a text input
            if ($(":input").is(":focus")) { return; }
            //Exit if a key modifier is pressed (ctrl, shift)
            if (event.ctrlKey || event.shiftKey) { return; }

            var sel = AVE.Utils.SelectedPost;

            if (event.key == undefined) { //Chrome
                var key = String.fromCharCode(event.keyCode).toUpperCase();
            } else {
                var key = event.key.toUpperCase();
            }

            if (key == up.toUpperCase()) { // upvote
                sel.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
            } else if (key == down.toUpperCase()) { // downvote
                sel.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
            } else if (key == next.toUpperCase()) { // next post
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
                            if (tempSel.length == 0) { break; }

                            if (tempSel.nextAll("div[class*='id-']:visible:last").length > 0) {
                                tempID = tempSel.nextAll("div[class*='id-']:visible:last").attr("class").split(" ")[1];
                            }
                            if (tempID != id) {
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

            } else if (key == previous.toUpperCase()) { // previous post
                if (sel.parent().hasClass("submission")) { // select by page type not class
                    //Submissions
                    var prev = sel.parent().prevAll("div.submission[class*='id-']:first");
                    if (prev.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(prev.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    }
                } else {
                    //Comment
                    var id = sel.parent().prop("class").split(" ")[1];

                    var a = sel.parent().prevAll("div[class*='id-']:visible:first").find("div[class*='id-']:visible:last").get(0) || //Parent's child
                            sel.parent().prevAll("div[class*='id-']:visible:first").get(0) || //Sibling
                            sel.parent().parent("div[class*='id-']:visible").get(0); //Parent

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    }
                    //if (!a) No previous comment
                }

            } else if (key == OpenC.toUpperCase()) { // Open comment page
                if (!sel.parent().hasClass("submission")) { return; }
                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: "https://" + window.location.hostname + sel.find("a.comments").attr("href") });
                } else {
                    window.location.href = "https://" + window.location.hostname + sel.find("a.comments").attr("href");
                }
            } else if (key == OpenL.toUpperCase()) { // Open link page
                if (!sel.parent().hasClass("submission")) { return; }
                var url = sel.find("a.title").attr("href");

                if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                } else {
                    window.location.href = url;
                }
            } else if (key == OpenLC.toUpperCase()) { // Open comment and link pages
                if (!sel.parent().hasClass("submission")) { return; }
                var url = [];

                url.push(sel.find("a.title").attr("href"));
                url.push("https://" + window.location.hostname + sel.find("a.comments").attr("href"));

                if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

                if (url[0] && url[0] == url[1]) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                } else {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
                }
            } else if (key == Expand.toUpperCase()) { // Expand media/self-text
                if (!sel.parent().hasClass("submission")) { return; }
                sel.find("div.expando-button").click();
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
            htmlStr += '</table>';
            htmlStr += '<input id="OpenInNewTab" ' + (_this.Options.OpenInNewTab.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInNewTab"> ' + _this.Options.OpenInNewTab.Desc + '</label><br />';
            return htmlStr;
        },
    },
};
/// END Shortcut keys ///

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
            if (tV.length == 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] == "kw") {
                if (v.length == 0) { return true; } //If no kw were specified: continue
                else {
                    _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(" "), []))
                }
            } else if (tV[1] == "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id == id; });
                if (inArr.length == 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length != 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(" ");
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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain"]) == -1) {
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
                if (this.ApplyToSub.length == 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) != -1) {
                    $.each(this.Keywords, function () {
                        re = new RegExp(this);
                        if (re.test(titleStr)) {
                            print("AVE: removed submission with title \"" + titleStr + "\" (tag: \"" + this + "\")");
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
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:30%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".</span><br />';

            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />"
                filter = filter.replace(/{@id}/ig, $("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter").length);
                filter = filter.replace("{@keywords}", this.Keywords.join(" "));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(" "));

                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />"
                html = html.replace(/{@id}/ig, $("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter").length);
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
            });

            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Submission_Filter").remove();
                $(this).remove();
            });
        },
    },
};
/// END Submission Filter ///

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
        var _this = AVE.Modules['ToggleChildComment'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['ToggleChildComment'];
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
        var _this = AVE.Modules['ToggleChildComment'];
        $("ul[class*='flat-list']").each(function () {
            if ($(this).find("a#AVE_ToggleChildComment").length > 0) { return true; }
            if ($(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']").length == 0) { return true; }

            $('<li><a id="AVE_ToggleChildComment" href="javascript:void(0)" style="font-weight:bold;">' + _this.LabelHide + '</a></li>').insertAfter($(this).find("li:contains(report spam)"));
        });
    },

    Listeners: function () {
        var _this = AVE.Modules['ToggleChildComment'];
        $("a#AVE_ToggleChildComment").off("click");
        $("a#AVE_ToggleChildComment").on("click", function () {

            var NextLevelComments = $(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']")
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
            }
            break;
        case 'OpenInTab':
            GM_openInTab(Obj.url);
            break;
    }
};
AVE.Utils.MetaData = { version: GM_info.script.version, name: GM_info.script.name };
AVE.Storage.Data = {};
$.each(GM_listValues(), function () {
    AVE.Storage.Data[this] = GM_getValue(this.toString());
});
AVE.Init.Start();
/// END Build Dependent ///
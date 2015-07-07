// ==UserScript==
// @name        Amateur Voat Enhancements Beta Version
// @author      Horza
// @date        2015-07-07
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @version     2.15.0.2
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @run-at      document-end
// @updateURL   https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements_meta.user.js
// @downloadURL https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require     https://github.com/domchristie/to-markdown/raw/master/dist/to-markdown.js
// ==/UserScript==

/// Init ///
AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        this.LoadModules();
    },

    LoadModules: function () {
        AVE.Utils.Set();

        //print(AVE.Storage.Persistence());

        $(document).ready(function () {
            $.each(AVE.Modules, function () {
                //print("Loading: "+this.Name + " - " + Object.keys(AVE.Modules).length+ " modules.");
                this.Load();
            });
        });
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

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(\?page=[0-9]*)?$/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            subverses: /voat.co\/subverses/i,
            set: /voat.co\/set\/\d*/i,
            mySet: /voat.co\/mysets/i,
            sets: /voat.co\/sets/i,
            user: /voat.co\/user\/[\w\d]*\/?$/i,
            comments: /voat.co\/user\/[\w\d]*\/comments/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            messaging: /voat.co\/messaging/i,
            manage: /voat.co\/account\/manage/i,
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
        else if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        else if (RegExpTypes.thread.test(url)) { return "thread"; }
        else if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        else if (RegExpTypes.set.test(url)) { return "set"; }
        else if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        else if (RegExpTypes.sets.test(url)) { return "sets"; }
        else if (RegExpTypes.user.test(url)) { return "user"; }
        else if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        else if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        else if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        else if (RegExpTypes.manage.test(url)) { return "user-manage"; }

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

    cls = function (t, c) {
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
            _this = this;
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

    Test: function () {
        try { return localStorage.setItem(StoragePrefix+'localStorageTest', 'test') == undefined;
        } catch (e) { return false;}
    },

    //localStorage: window.localStorage,

    Persistence: function(){
        var val = { GM: "", LS: "" };
        //val.GM = GM_setValue("GM_Persistence", "true")
        //val.LS = this.SetValue("LS_Persistence", "true")

        val.GM = GM_getValue("GM_Persistence", "null")
        val.LS = this.GetValue("LS_Persistence", "null")
        return val;
    },

    GetValue: function (key, def) {
        //var val = localStorage.getItem(key);
        var val = GM_getValue(key);
        if (val == undefined) {
            if (def == undefined) {
                return null;
            } else{ return def}
        } return val;
    },

    SetValue: function (key, val) {
        var val = GM_setValue(key, val);
        //localStorage.setItem(key, val);
    },

    DeleteValue: function (key) {
        var val = GM_deleteValue(key);
        //localStorage.removeItem(key);
    },

    ExportToJSON: function () {
        //Get options from all modules
        return 'Not Implemented Yet';
    },

    ImportToJSON: function () {
        //Set options for all modules
        return 'Not Implemented Yet';
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
            }';

        this.MngWinHTML = '\
            <div class="overlay">\
                <div class="MngrWin" id="MngWin">\
                    <div class="MngWinHeader">\
                        <span class="MngrWinTitle"><a target="_blank" href="https://voat.co/v/AVE">AVE</a></span> <span style="cursor:pointer;font-size:10px;" id="AVE_Version">Version @{version}</span>\
                        <div class="TopButtons">\
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="SaveData">Save Changes</a>\
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default" id="CloseWinMngr">×</a>\
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

    Categories: ["General", "Thread", "Posts", "Manager", "Misc."],//Available Categories to show //backward compatibility in misc
    Modules: [],//List of all modules

    AppendToPage: function () {
        $("<style></style>").appendTo("head").html(this.MngWinStyle);

        var LinkHTML = '<span class="user"><a style="font-weight:bold;" href="javascript:void(0)" id="" title="AVE_Manager">AVE</a></span> <span class="separator">|</span> ';
        $(LinkHTML).insertBefore("span.user:contains('Manage')");
    },

    Listeners: function () {
        var _this = this;
        $("a[title='AVE_Manager']").on("click", function () {
            if ($(".MngrWin").length > 0) {
                $(".MngrWin").show();
            }
            else { _this.BuildManager(); }
            $(".overlay").show();
        });
    },

    BuildManager: function () {
        var _this = AVE.Modules['PreferenceManager'];
        var MngWinHTML = _this.MngWinHTML.replace('@{version}', GM_info.script.version);
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
                        var key = $(this).prop("id")
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
            $("div.ModuleToggle:first").click();
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
            if (pos > 0) {
                $(html).insertAfter("form[cat='" + cat + "'] > div.ModuleBlock:nth(" + (pos - 1) + ")");
            } else { $(html).insertBefore("form[cat='" + cat + "'] > div.ModuleBlock:nth(0)"); }
        }

        //Get special form element from the modules themselves.
        if (typeof module.AppendToPreferenceManager === "object") {
            if (typeof module.AppendToPreferenceManager.html === "function") {
                $("form[cat='" + cat + "']").find("div[id='" + module.ID + "']").append('<div style="margin-top:5px;" class=ModuleCustomInput></div>');
                $("form[cat='" + cat + "']").find("div[id='" + module.ID + "']").find("div.ModuleCustomInput").append(module.AppendToPreferenceManager.html());
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

    RemoveAllData: function () {
        //In Manager options, not in plain view. Too error-prone

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
    },

    Load: function () {
        this.Store = AVE.Storage;
        //this.Store.DeleteValue(this.Store.Prefix + this.ID + "_Version")
        this.Enabled = this.Store.GetValue(this.Store.Prefix + this.ID + "_Version") !== GM_info.script.version;

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
        "Light and Dark theme for the PrefMngr and Tax box", ],

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
                                '<p class="VersionBoxTitle">' + GM_info.script.name + '</p>' +
                                '<p class="VersionBoxInfo">' + (this.Trigger == "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px">' + GM_info.script.version + '</strong></p>' +
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
            _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Version", GM_info.script.version);
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

    Start: function () {
        this.Listeners();
    },

    Listeners: function () {
        $("a#loadmorebutton").OnNodeChange(function () {
            if ($(this).text().split(" ")[0] == "load") {
                setTimeout(AVE.Init.UpdateModules, 500);
            }
        });
    },
};
/// END Update after loading more ///

/// Fix user-block position:  Set the user info block\'s position as fixed. ///
AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'General',

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
        if (AVE.Modules['HeaderFixedPos'] == undefined) { AVE.Utils.ListHeaderHeight = 0; }

        var headerAccountPos = $('#header-account').offset().top;
        $(window).scroll(function () {
            SetAccountHeaderPosAsFixed(headerAccountPos)
        });
        SetAccountHeaderPosAsFixed(headerAccountPos)

        function SetAccountHeaderPosAsFixed(headerAccountPos) {
            if ($(window).scrollTop() + AVE.Utils.ListHeaderHeight > headerAccountPos) {
                $('#header-account').css('position', 'fixed')
                                    .css('top', AVE.Utils.ListHeaderHeight+"px")
                                    .css('right', '0')
                                    .css("text-align", "center")
                                    .css("height", "0px");
                $('.logged-in').css("background", AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
            } else {
                $('#header-account').css('position', '')
                                    .css('top', '')
                                    .css("text-align", "")
                                    .css("height", "");
                $('.logged-in').css("background", "");
            }
        }
    },
};
/// END Fix user-block position ///

/// Fix header position:  Set the subverse list header position as fixed. ///
AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'General',
    Index: 2,
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
    },
};
/// END Fix header position ///

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
    },
    //Possible issues with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance) {
        this.tag = tag.toString();
        this.colour = colour;
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.balance = (typeof balance === "number" ? balance : 0);
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['UserTag'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['UserTag'];
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
    text-overflow: ellipsis;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';\
    border-radius:3px;\
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
        this.Start();
    },

    AppendToPage: function () {
        var _this = AVE.Modules['UserTag'];
        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if (!$(this).attr('href').match(sel)) { return true; } //useful?
            if ($(this).parent().find("span.AVE_UserTag").length > 0) { return true; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username

            if ($(this).attr('href').split("/")[2].toLowerCase() != name) { return true; } //don't add if this is a link whose label isn't the username

            tag = _this.GetTag(name) || new _this.UserTagObj("",  (AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"), false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '" style="font-weight:bold;cursor:pointer;margin-left:4px;padding: 0px 4px;border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';border-radius:3px;font-size:10px;">' + (!tag.tag ? "+" : tag.tag) + '</span>';
            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "";
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '" style="padding: 0px 4px;font-size: 10px;">[ ' + sign + tag.balance + ' ]</span>';
            } else {
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '" style="padding: 0px 4px;font-size: 10px;"></span>';
            }
            $(Tag_html).insertAfter($(this));


            if (tag.tag) {
                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).parent().find(".AVE_UserTag").css("background-color", tag.colour);
                $(this).parent().find(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }
        });

        if ($("#UserTagBox").length == 0) {
            $("<style></style>").appendTo("head").html(_this.style);
            $(_this.html).appendTo("body");
            $("#UserTagBox").hide();
        }
    },

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

        $("div[class*='midcol']").OnAttrChange(function (e) {//persistent with UpdateAfterLoadingMore?
            if (!e.oldValue || e.oldValue.split(" ").length != 2) { return true; }

            _this.ChangeVoteBalance(e.target, e.oldValue);
        });

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

            if (opt.tag.length == 0 && opt.ignore == false) {
                if (opt.balance == 0) {
                    _this.RemoveTag(opt.username);
                } // the balance isn't 0, we don't want to remove the tag, nor update it.
                opt.tag = "+";
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
        var _this = AVE.Modules['UserTag'];

        //print("target: "+target);
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find(".AVE_UserTag").attr("id").toLowerCase();
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

            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "";
                $(this).parent().find("span.AVE_UserBalance").text('[ ' + sign + tag.balance + ' ]');
            } else {
                $(this).parent().find("span.AVE_UserBalance").text("");
            }
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
        ToggleInSidebar: {
            Desc: 'Also toggle Media present in the sidebar of the subverse.',
            Type: 'boolean',
            Value: false,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ToggleMedia'];
        POST = POST[_this.ID];
        var opt = {};
        opt.Enabled = POST.Enabled;
        opt.MediaTypes = (POST.Images ? "1" : "0") + (POST.Videos ? "1" : "0") + (POST["self-texts"] ? "1" : "0")
        opt.ToggleInSidebar = POST.ToggleInSidebar;

        //Add ToggleInSidebar
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
    ImgMedia: "[title*='JPG'],[title*='PNG'],[title*='GIF'],[title*='Gfycat'],[title*='Gifv'],[title*='Imgur Album']",
    VidMedia: "[title*='YouTube'],[title*='Vimeo']",
    SelfText: "[onclick^='loadSelfText']",
    // voat.co/v/test/comments/37149

    Start: function () {
        AcceptedTypes = this.Options.MediaTypes.Value;
        if (AcceptedTypes != "000" && $.inArray(AVE.Utils.currentPageType, ["subverses", "sets", "mysets", "user", "user-manage"]) == -1) {

            var strSel = (AcceptedTypes[0] == true ? this.ImgMedia + "," : "") +
                         (AcceptedTypes[1] == true ? this.VidMedia + "," : "") +
                         (AcceptedTypes[2] == true ? this.SelfText : "");

            if (strSel[strSel.length - 1] == ",")
            { strSel = strSel.slice(0, -1); }

            this.sel = $(strSel);

            if (!this.Options.ToggleInSidebar.Value)
            { this.sel = $(this.sel).filter(':parents(.titlebox)'); }


            this.AppendToPage();
            this.Listeners();
        }
    },

    Update: function () {
        this.Start();
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
        sel = this.sel;
        var isExpanded = false;
        $("[id='GM_ExpandAllImages']").off("click");
        $("[id='GM_ExpandAllImages']").on("click", function () {
            if ($(this).hasClass("expanded")) {
                $(this).text('View Media (' + sel.length + ')');
                $(this).removeClass("expanded")
                isExpanded = false;
            } else {
                $(this).text('Hide Media (' + sel.length + ')');
                $(this).addClass("expanded")
                isExpanded = true;
            }

            for (var el in sel) {
                if (
                    (isExpanded && sel.eq(el).parent().find(".expando,.link-expando").length == 0) ||
                    isExpanded === sel.eq(el).parent().find(".expando,.link-expando").first().is(':hidden')
                    ) {
                    sel[el].click();
                }
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ToggleMedia']
            var mediaTypes = ["Images", "Videos", "self-texts"];
            var value = _this.Options.MediaTypes.Value;
            var htmlString = '<div style="margin-left:30px;padding:5px 0 0 5px;border-left:2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "222" : "DDD") + ';">';
            for (var i in mediaTypes) {
                htmlString += '<span style="margin-right:20px;" >' +
                              '<input ' + (value[i] == 1 ? 'checked="checked"' : '') + ' id="' + mediaTypes[i] + '" name="' + mediaTypes[i] + '" type="checkbox"></input>' +
                               '<label for="' + mediaTypes[i] + '">' + mediaTypes[i] + '</label>' +
                               '</span>';
            }
            //ToggleInSidebar
            htmlString += '<br /><input ' + (_this.Options.ToggleInSidebar.Value ? 'checked="checked"' : '') + ' id="ToggleInSidebar" name="ToggleInSidebar" type="checkbox"></input>' +
            '<label for="ToggleInSidebar">' + _this.Options.ToggleInSidebar.Desc + '</label>';

            return htmlString+'</div>';
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        this.Start();
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

/// Fix expanding images:  Let images expand over the sidebar and disallow the selection/highlight of the image. ///
AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlight of the image.',
    Category: 'Posts',

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
        this.Listeners();
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
                }, 1000);
            }
        });
        this.obsInSub.observe();

        if (this.obsInThread) {
            this.obsInThread.disconnect();
        }
        this.obsInThread = new OnNodeChange($("div[class*='expando']"), function (e) {
            var img = $(e.target).find("img:first");
            if (img.length > 0) {
                var exp = $(this);
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
                }, 1000);
            }
        });
        this.obsInThread.observe()
    },
};
/// END Fix expanding images ///

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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        this.Start();
    },

    AppendToPage: function () {
    },

    Quote: '',

    Listeners: function () {
        var SelectedNodes = this.getSelectedNodes;
        var SelectedText = this.getSelectedText;
        var Quote = this.Quote;

        $("div[class*='entry']").OnNodeChange(function () {
            if (Quote == "") { return; }
            var ReplyBox = $(this).find("textarea[class='commenttextarea'][id='CommentContent']");
            if (ReplyBox.length > 0) {
                ReplyBox.val(Quote + "\n\n");
            }
        });

        $(".usertext").off("mouseup");
        $(".usertext").on("mouseup", function () {
            var nodes = SelectedNodes();

            if (!nodes) {
                Quote = "";
                return;
            }
            if ($(nodes[0]).parents(".usertext").attr("id") == undefined ||
                $(nodes[0]).parents(".usertext").attr("id") != $(nodes[1]).parents(".usertext").attr("id")) {
                Quote = "";
                return;
            }

            Quote = AVE.Utils.ParseQuotedText(SelectedText().toString());
        });
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
        this.Start();
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

            var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default' + (inShortcut ? "" : "btn-sub") + '">'
                                    + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
            $(btnHTML).insertAfter($(this).find(".midcol").first());
        });

        $(document).on("click", "#GM_Sets_Shortcut", function () {
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
        _this = AVE.Modules['Shortcuts'];
        var inShortcut = false;
        var tempSubName = "";

        $('.col-md-6').each(function () {
            tempSubName = $(this).find(".h4").attr("href").substr(3);
            inShortcut = _this.isSubInShortcuts(tempSubName);

            var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Subverses_Shortcut" subverse="'+ tempSubName + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">'
                                    + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
            $(btnHTML).insertAfter($(this).find(".midcol").first());
        });

        $(document).on("click", "#GM_Subverses_Shortcut", function () {
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
            var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
        }

        if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
        }
        else {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
        }

        $(document).on("click", "#GM_Shortcut", function () {
            if (_this.isPageInShortcuts()) {
                _this.RemoveFromShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(true, "#GM_Shortcut");
            }
            else {
                _this.AddToShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(false, "#GM_Shortcut");
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

/// Shortcut keys:  Use your keyboard to vote (default is A to upvote, Z to downvote). ///
AVE.Modules['ShortcutKeys'] = {
    ID: 'ShortcutKeys',
    Name: 'Shortcut keys',
    Desc: 'Use your keyboard to vote (default is A to upvote, Z to downvote).',
    Category: 'Posts',

    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
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
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ShortcutKeys'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ShortcutKeys'];
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var up = this.Options.UpvoteKey.Value;
        var down = this.Options.DownvoteKey.Value;

        $(document).keypress(function (event) {
            if ($(":input").is(":focus")) { return; }

            if (AVE.Utils.SelectedPost != undefined) {
                if (event.key == undefined) { //Chrome
                    var key = String.fromCharCode(event.charCode).toUpperCase();
                } else {
                    var key = event.key.toUpperCase();
                }
                if (key == up.toUpperCase()) { // upvote
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
                }
                else if (key == down.toUpperCase()) { // downvote
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
                }
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ShortcutKeys'];
            var htmlStr = "";
            htmlStr += 'Upvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"></input>';
            htmlStr += ' &nbsp; Downvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"></input>';
            return htmlStr;
        },
    },
};
/// END Shortcut keys ///

/// Toggle display chlild comments:  Adds "Hide child comments" link to hide a chain of posts ///
AVE.Modules['ToggleChildComment'] = {
    ID: 'ToggleChildComment',
    Name: 'Toggle display chlild comments',
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        this.Start();
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
/// END Toggle display chlild comments ///

/// BackCompatibility Module:  Migrate data from V1 to V2. ///
AVE.Modules['BackCompatibility'] = {
    ID: 'BackCompatibility',
    Name: 'BackCompatibility Module',
    Desc: 'Migrate data from V1 to V2.',
    Category: 'Misc.',

    Index: 200,
    Enabled: false,

    Options: {
    },

    Load: function () {
        this.GetV1DataStat();
    },

    Migrate: function (type) {
        if (type == "shortcuts") {
            if (GM_getValue("Voat_Subverses") == undefined) { return;}
            _this.Store.SetValue(AVE.Modules['Shortcuts'].StorageName, GM_getValue("Voat_Subverses"));
        } else if (type == "usertags") {
            if (GM_getValue("Voat_Tags") == undefined) { return; }
            var tags = GM_getValue("Voat_Tags").split(",");
            var opt, user, tag;
            for (var i in tags) {
                user = tags[i].split(":")[0];
                tag = tags[i].split(":")[1];
                if (tag == undefined) { continue;}

                opt = { username: user, tag: tag, colour: (AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"), ignore: false, balance: 0 };
                AVE.Modules['UserTag'].SetTag(opt);
            }
        }
    },

    DeleteOldData: function () {
        var prefNames = ["Voat_Subverses", "Voat_Tags", "Images", "Videos", "_this-texts", "MediaTypes", "ShowVersionChangeNotification"];
        $.each(prefNames, function (value) {
            if (GM_getValue(prefNames[value]) != undefined) {
                GM_deleteValue(prefNames[value]);
            } else {
                print(prefNames[value] + " doesn't exist.");
            }
        });
    },

    GetV1DataStat: function () {
        var ret = [0, 0, 0];
        if (GM_getValue("Voat_Subverses") != null) {
            ret[0] = GM_getValue("Voat_Subverses").split(",").length;
        }
        if (GM_getValue("Voat_Tags") != null) {
            ret[1] = GM_getValue("Voat_Tags").split(",").length - 1;
        }

        var prefNames = ["Images", "Videos", "_this-texts", "MediaTypes", "ShowVersionChangeNotification"];
        $.each(prefNames, function (value) {
            if (GM_getValue(prefNames[value]) != undefined) {
                ret[2]++;
            }
        });

        return ret;
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['BackCompatibility'];
            var s = _this.GetV1DataStat();
            var htmlStr = "";
            htmlStr += '<p>You have, stored from V1:<br />&nbsp;&nbsp;<b>' + s[0] + '</b> subverses/sets as your custom shortcuts.<br />&nbsp;&nbsp;<b>' + s[1] + '</b> tagged users.<br />&nbsp;&nbsp;<b>' + s[2] + '</b> module preferences.</p>';

            htmlStr += '<input module="shortcuts" style="font-weight:bold;margin-top:20px;" value="Migrate old shortcuts data" id="MigrateV1Data" class="btn-whoaverse-paging btn-xs btn-default" type="submit"></input><input style="margin-left:25px;font-weight:bold;" value="Clear old data" id="ClearAllV1Data" class="btn-whoaverse-paging btn-xs btn-default" type="submit"></input>';
            htmlStr += '<br /><input module="usertags" style="font-weight:bold;margin-top:5px;" value="Migrate old usertags data" id="MigrateV1Data" class="btn-whoaverse-paging btn-xs btn-default" type="submit"></input>';
            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['BackCompatibility'];
            $("input#MigrateV1Data").on("click", function () {
                _this.Migrate($(this).attr("module"));
            });
            $("input#ClearAllV1Data").on("click", function () {
                _this.DeleteOldData();
            });
        },
    },
};
/// END BackCompatibility Module ///
AVE.Init.Start();
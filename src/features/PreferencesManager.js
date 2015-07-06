AVE.Modules['PreferenceManager'] = {
    ID: 'PreferenceManager',
    Name: 'Preference manager',
    Desc: 'Adds option to modify preferences in voat.co/account/manage under the title "AVE Preferences"',
    Category: 'Manager',

    Index: 0,
    Debug: true,

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

        //_this.BuildManager(); //If uncommented, it is processed before some module can load their own pref from the local storage
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
        $(MngWinHTML).appendTo("body");//only .show() if exists already
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
                $("form[cat*='"+$(this).text()+"']").hide();
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
            return 'Reset all data stored: <input style="font-weight:bold;" value="Reset" id="ResetAllData" class="btn-whoaverse-paging btn-xs btn-default" type="submit" title="Warning: this will delete your preferences, shortcut list and all usertags!"></input>';
        },
        callback: function () {
            $("input#ResetAllData").on("click", function (param) {
                alert(typeof param);
            });
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
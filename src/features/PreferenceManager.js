AVE.Modules['PreferenceManager'] = {
    ID: 'PreferenceManager',
    Name: 'Preference manager',
    Desc: 'Manage AVE\'s stored data.',
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
                            <a href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default" id="SaveData">Save Changes</a>\
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
        AVE.Utils.AddStyle(this.MngWinStyle);

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

        //Exit the prefMngr
        $("#CloseWinMngr").on("click", function (event) {
            if ($("div.TopButtons > a#SaveData").hasClass("btn-sub")) {
                if (!confirm("You have unsaved changes.\n\nAre you sure you want to exit?"))
                { return; }
            }
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

            $("div.TopButtons > a#SaveData").removeClass("btn-sub");
            $("#CloseWinMngr").click();
        });

        //Close the pref Manager with a click outside of it.
        $(".overlay").on("click", function (e) {
            if ($(e.target).attr("class") == "overlay") {
                $("#CloseWinMngr").click();
            }
        });

        $("section.ModulePref").find("input").on("change", function () {
            if ($("div.TopButtons > a#SaveData").hasClass("btn-sub")) { return; }
            //$("section.ModulePref").find("input").off("change"); //Can't use off here because it removes custom event listeners
            $("div.TopButtons > a#SaveData").addClass("btn-sub");
            //if save btn has btn-sub class prompt confirmation
        });
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
        saveAs(blob, "AVE_Data_" + (new Date().toLocaleDateString().replace(/\//g, "_")) + ".json");
    },
};
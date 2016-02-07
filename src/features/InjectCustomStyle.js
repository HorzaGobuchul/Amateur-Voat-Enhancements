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
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
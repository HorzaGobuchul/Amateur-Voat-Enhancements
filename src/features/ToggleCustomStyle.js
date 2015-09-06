AVE.Modules['ToggleCustomStyle'] = {
    ID: 'ToggleCustomStyle',
    Name: 'Toggle subverse custom style',
    Desc: 'Adds a checkbox to enable/disable custom styles on a per subverse basis.',
    Category: 'Style',

    Index: 10,
    Enabled: false,

    Store: {},

    RunAt: "ready",

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

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled && !AVE.Modules['InjectCustomStyle'].Enabled && $.trim($("style#custom_css:first").text()).length > 0) {
            this.CustomCSS = $("style#custom_css:first").text();
            this.Start();
        }
    },

    CustomCSS: "",
    StorageName: null,
    DisabledCSS: false, //If present we disable the custom CSS

    Start: function () {
        this.StorageName = this.Store.Prefix + this.ID + "_DisabledCSS";

        //print(this.Store.GetValue(this.StorageName, "[]"));
        //this.Store.DeleteValue(this.StorageName);

        if ($("style#custom_css").length > 1) {
            $("style#custom_css:last").remove();
        }

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
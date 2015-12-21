AVE.Modules['ThemeSwichter'] = {
    ID: 'ThemeSwichter',
    Name: 'Theme swichter',
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
                        print("AVE: ThemeSwichter > toggled night mode");
                        var prevstyle = AVE.Utils.CSSstyle;
                        prevstyle = prevstyle.substr(0,1).toUpperCase() + prevstyle.substr(1, prevstyle.length);

                        var newstyle = prevstyle === "Dark" ? "Light" : "Dark";
                        var csslink = $('link[rel="stylesheet"][href^="/Content/'+prevstyle+'"]');
                        csslink.attr("href", csslink.attr("href").replace(prevstyle, newstyle));
                        $("body").attr("class", newstyle);

                        AVE.Utils.CSSstyle = AVE.Utils.CSS_Style();
                    }
                });
            });
    }
};
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
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist");return true;}
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
        $("li > a#AVE_SingleClickOpener_link").off().on("click", function () {
            var url = [];

            url.push($(this).parents("div.entry:first").find("p.title > a.title").attr("href"));
            url.push("https://" + window.location.hostname + $(this).parent().parent().find(":first-child > a.comments").attr("href"));

            if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

            if (url[0] && url[0] === url[1]) {
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
            } else {
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
            }
        });
    },
};
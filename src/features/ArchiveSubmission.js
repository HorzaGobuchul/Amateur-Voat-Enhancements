AVE.Modules['ArchiveSubmission'] = {
    ID: 'ArchiveSubmission',
    Name: 'Archive submissions',
    Desc: 'Add a link to an archived version of the submission',
    Category: 'Subverse',

    Index: 101,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        WebArchive: {
            Type: 'obj',
            Desc: 'What archiving website do you want to use?',
            Websites:
               {'org': 'archive.org', // https://web.archive.org/web/*/website.com
                'is' : 'archive.is'}, //
                                      // Add google-cache?
            Value: "is"
        }
    },

    OriginalOptions: "", //If ResetPref is used

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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "user-comments", "saved", "threads", "search"]) === -1) {
            this.Enabled = false;
            print("nope");
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
        $("ul.flat-list.buttons").each(function () {
            "use strict";
            if($(this).find("li > a#AVE_ArchiveSubmission_link").length>0) {return;} //Not already added
            if($(this).parents("div.submission:first").hasClass("self")){return;} //Not a self-post
            if($(this).find("li:first > a ").text()==="permalink"){return false;} //Not a comment (will break the loop if it is)

            $(this).append('<li><a id="AVE_ArchiveSubmission_link" href="javascript:void(0);">archive</a></li>');
        });
    },

    Listeners: function () {
        "use strict";

        $("li > a#AVE_ArchiveSubmission_link").off().on("click", function () {
            var url;
            print("Not yet implemented");
            return;

            url = $(this).parents("div.entry:first").find("p.title > a.title").attr("href");
            //Concatenate it with the archive query url
            AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ArchiveSubmission'];
            var htmlStr = '';
            return htmlStr;
        },
        callback: function () {
        }
    }
};
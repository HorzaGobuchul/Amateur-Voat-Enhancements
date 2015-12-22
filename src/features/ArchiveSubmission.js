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
        ArchiveSelfposts: {
            Type: 'boolean',
            Desc: "Archive self-posts as well.",
            Value: false
        },
        WebArchive: {
            Type: 'obj',
            Desc: 'What archiving website do you want to use?',
            Websites:
               {'org': 'archive.org', // https://web.archive.org/web/*/URL
                'is' : 'archive.is'}, // https://archive.is/?run=1&url=URL
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
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        var _this = this;
        $("ul.flat-list.buttons").each(function () {
            if($(this).find("li > a#AVE_ArchiveSubmission_link").length>0) {return;} //Not already added
            if(!_this.Options.ArchiveSelfposts.Value && $(this).parents("div.submission:first").hasClass("self")){return;} //Not a self-post
            if($(this).find("li:first > a ").text()==="permalink"){return false;} //Not a comment (will break the loop if it is)

            var url;
            url = $(this).parents("div.entry:first").find("p.title > a.title").attr("href");
            //If link to self-post: return. The only case where the archive link will be added to a self-post submissions is with stickies.

            if (!/^http/.test(url)) { //if self-post
                if (_this.Options.ArchiveSelfposts.Value)//recreate URL if chose to archive self-posts
                { url = "https://" + window.location.hostname + url; }
                else //return here otherwise (even though the function should have exited already by that point
                { return; }
            }
            if (/^https?:\/\/archive\.is/.test(url)) {return;}

            url = 'https://archive.is/?run=1&url='+encodeURIComponent(url);

            $(this).append('<li><a id="AVE_ArchiveSubmission_link" target="_blank" href="'+url+'">archive</a></li>');
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['ArchiveSubmission'];
            var htmlStr = '';

            htmlStr += '<div>The archiving website used is <strong>"archive.is"</strong>.<br>After opening a new page to archive.is, you may need to wait a second or two before being redirected to the archived page.<br>If you are the first to open a particular page looking for an archived version, you will need to wait for it to be processed. Please let this process finish as it will help other users after you.</div><br>';

            htmlStr += '<input id="ArchiveSelfposts" ' + (_this.Options.ArchiveSelfposts.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ArchiveSelfposts"> ' + _this.Options.ArchiveSelfposts.Desc + '</label>';

            return htmlStr;
        }
    }
};
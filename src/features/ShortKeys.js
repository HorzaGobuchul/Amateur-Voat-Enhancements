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
        var self = AVE.Modules['ShortcutKeys'];

        self.Store.SetValue(self.Store.Prefix + self.ID, JSON.stringify(POST[self.ID]));
    },

    ResetPref: function () {
        var self = AVE.Modules['ShortcutKeys'];
        self.Options = JSON.parse(self.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var self = this;
        var Opt = self.Store.GetValue(self.Store.Prefix + self.ID);

        if (Opt !== null) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                self.Options[key].Value = value;
            });
        }
        self.Enabled = self.Options.Enabled.Value;
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
                if (event.key.toUpperCase() == up.toUpperCase()) { // upvote
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
                    }
                else if (event.key.toUpperCase() == down.toUpperCase()) { // downvote
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
                }
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var self = AVE.Modules['ShortcutKeys'];
            var htmlStr = "";
            htmlStr += 'Upvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + self.Options.UpvoteKey.Value + '"></input>';
            htmlStr += ' &nbsp; Downvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + self.Options.DownvoteKey.Value + '"></input>';
            return htmlStr;
        },
    },
};
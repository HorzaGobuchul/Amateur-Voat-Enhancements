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
        var _this = AVE.Modules['ShortcutKeys'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ShortcutKeys'];
        _this.Options = JSON.parse(_this.OriginalOptions);
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
        _this.Enabled = _this.Options.Enabled.Value;
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
                    //if (AVE.Modules['UserTag']) {
                    //    AVE.Modules['UserTag'].ChangeVoteBalance(AVE.Utils.SelectedPost.parent().find(".midcol"), AVE.Utils.SelectedPost.parent().find(".midcol").attr("class"));
                    //    print("src: " + AVE.Utils.SelectedPost.parent().find(".midcol").attr("class"));
                    //}
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='upvote']").triggerHandler("click", ["Custom", "Event"]);
                    }
                else if (event.key.toUpperCase() == down.toUpperCase()) { // downvote
                    if (AVE.Modules['UserTag']) {
                        AVE.Modules['UserTag'].ChangeVoteBalance(AVE.Utils.SelectedPost.parent().find(".midcol"), AVE.Utils.SelectedPost.parent().find(".midcol").attr("class"));
                    }
                    AVE.Utils.SelectedPost.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
                }
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ShortcutKeys'];
            var htmlStr = "";
            htmlStr += 'Upvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"></input>';
            htmlStr += ' &nbsp; Downvote key: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"></input>';
            return htmlStr;
        },
    },
};
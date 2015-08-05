AVE.Modules['ShowSubmissionVoatBalance'] = {
    ID: 'ShowSubmissionVoatBalance',
    Name: 'Show submission\'s actual vote balance',
    Desc: 'This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false,
        },
        // Add option to show (+1|-1) between the vote arrows and remove element in the tagline
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        $("div.score.likes:visible,div.score.dislikes:visible").each(function () {
            _this.ShowVoteBalance($(this).parent());
        });

        this.Listeners();
    },

    Listeners: function () {
        var _this = this;
        $("div[aria-label='upvote'],div[aria-label='downvote']").off();//We don't want duplicates of this listener created because of "Update"
        $("div[aria-label='upvote'],div[aria-label='downvote']").on("click", function () {
            _this.ShowVoteBalance($(this).parent(),true);
        });
    },

    ShowVoteBalance: function (target, click) {
        //If the user hasn't voted on this post we have nothing to do here
        if (!click && target.find("div.score.unvoted").is(":visible")) { return true; } //continue

        target.find("div.score.dislikes").hide();
        target.find("div.score.likes").hide();
        target.find("div.score.unvoted").show().text(target.find("div.score.likes").text() - target.find("div.score.dislikes").text());
    },
};
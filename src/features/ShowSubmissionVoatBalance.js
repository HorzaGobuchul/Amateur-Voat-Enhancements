AVE.Modules['ShowSubmissionVoatBalance'] = {
    ID: 'ShowSubmissionVoatBalance',
    Name: 'Show submission\'s actual vote balance',
    Desc: 'This module displays the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.<br /><strong>Warning: the vote count will not be accurate if you change a vote already registered by Voat.</strong>',
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
        //If update all will processed another time. This shouldn't happen
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
            _this.ShowVoteBalance($(this).parent(), true);
        });
    },

    ShowVoteBalance: function (target, click) {
        //If the user hasn't voted on this post we have nothing to do here
        if (!click && target.find("div.score.unvoted").is(":visible")) { return true; } //continue

        var vote, status;

        vote = target.prop("class").split(" ")[1];  //Get vote status
        status = target.find("div.score." + vote);  //Get element currently displaying the vote balance
        vote = ["unvoted", "likes"].indexOf(vote);  //Get vote value from status(-1, 0, 1)

        //If the user did not just click to vote, this means it was done in the past and the vote is counted in the up/downvote counts
        if (!click) { vote = 0; }

        //We get the current vote values from the tagline or Score tab in a thread
        var up, down;
        if (AVE.Utils.currentPageType !== "thread") {
            up = parseInt(target.parent().find("span.commentvotesratio > span.post_upvotes").text()) || 0;
            down = parseInt(target.parent().find("span.commentvotesratio > span.post_downvotes").text()) || 0;
        } else {
            var val = $("div.submission-score-box:nth-child(6)").find("b");
            up = parseInt(val.eq(1).text()) || 0;
            down = -1 * parseInt(val.eq(2).text()) || 0;
        }

        //print("Vote: " + vote + ", up:  " + up + ", down: " + down + " => " + (vote + up + down));
        status.text(vote + up + down);
    },
};
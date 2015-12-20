AVE.Modules['HideSubmissions'] = {
    ID: 'HideSubmissions',
    Name: 'Hide submissions',
    Desc: 'Hide vote with the keyboard or automatically after voting on it.',
    Category: 'Subverse',

    Index: 10, //early so that other module don't do unnecessary processing on submissions that will get removed
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        HideDownvoted: {
            Type: 'boolean',
            Desc: "Hide submissions you downvote",
            Value: false
        },
        HideUpvoted: {
            Type: 'boolean',
            Desc: "Hide submissions you upvote",
            Value: false
        },
        HideRightAway: {
            Type: 'boolean',
            Desc: "Hide the submission as soons as marked hidden by clicking the \"hide\" button or pressing the hide key",
            Value: false
        },
        HideAfterVote: {
            Type: 'boolean',
            Desc: "Hide the submission right after the vote is registered",
            Value: false
        },
        AddHideButton: {
            Type: 'boolean',
            Desc: "Insert a \"hide\" button",
            Value: true
        },
        MaxStorage: {
            Type: 'int',
            Range: [1,5000],
            Desc: "Max number of submissions to remember",
            Value: 400
        }
    },

    OriginalOptions: "",
    StorageName: "",
    HiddenPosts: [],

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
        //this.Store.SetValue(this.StorageName, "[]");
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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "saved"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_Hidden";
            this.HiddenPosts = JSON.parse(this.Store.GetValue(this.StorageName, "[]"));

            this.Pruning();
            this.Start();
        }
    },

    Pruning: function(){
        var count, key;
        count =this.HiddenPosts.length - this.Options.MaxStorage.Value;

        if (count < 1) {return;}

        count += Math.ceil(this.Options.MaxStorage.Value / 8); //If over the limit we remove 1/8th of the total value

        this.HiddenPosts.splice(0,count);
        this.Store.SetValue(this.StorageName, JSON.stringify(this.HiddenPosts));
    },

    AddToHiddenList: function (id, vote) {
        if ($.inArray(id.toString(), this.HiddenPosts) !== -1){return;}

        this.HiddenPosts.push(id);
        this.Store.SetValue(this.StorageName, JSON.stringify(this.HiddenPosts));

        if (this.Options.HideRightAway.Value
            || (vote && this.Options.HideAfterVote.Value)){
            $("div.submission.id-"+id.toString()).remove();
        }

        print("AVE: HideSubmissions > removing submissons with id "+id);
    },

    Start: function () {
        var _this = this;
        $("div.submission").each(function () {
            var id = $(this).attr("data-fullname");
            if ($.inArray(id.toString(), _this.HiddenPosts) !== -1){
                $(this).remove();
            }
        });

        if (this.Options.AddHideButton.Value){
            this.AppendToPage();
        }
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
            if ($(this).find("li > a#AVE_HideSubmissions_link").length > 0) {return;}
            $(this).append('<li><a id="AVE_HideSubmissions_link" href="javascript:void(0);">hide</a></li>');
        });
    },

    obsVoteChange: null,

    Listeners: function () {
        "use strict";
        var _this = this;

        if (this.Options.AddHideButton.Value) {
            $("li > a#AVE_HideSubmissions_link").off().on("click", function () {
                var id = $(this).parents("div.submission:first").attr("data-fullname");
                _this.AddToHiddenList(id);
            });
        }

        if (this.Options.HideDownvoted.Value || this.Options.HideUpvoted.Value) {
            if (this.obsVoteChange) { this.obsVoteChange.disconnect(); }
            this.obsVoteChange = new OnAttrChange($("div[class*='midcol']"), function (e) {
                if (!e.oldValue || e.oldValue.split(" ").length !== 2) { return true; }
                var id = $(this).parents("div.submission:first").attr("data-fullname");
                if (id){
                    var voteType = $(e.target).attr("class").split(" ")[1];
                    if( (voteType === "likes"    && _this.Options.HideUpvoted.Value) ||
                        (voteType === "dislikes" && _this.Options.HideDownvoted.Value)){
                        print(id);
                        _this.AddToHiddenList(id, true);
                    }
                }
            });
            this.obsVoteChange.observe();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['HideSubmissions'];
            var htmlStr = '';

            htmlStr += '<label style="display:inline;" for="MaxStorage"> ' + _this.Options.MaxStorage.Desc + ': </label><input style="width: 60px;" id="MaxStorage" type="number" name="MaxStorage" value="'+_this.Options.MaxStorage.Value+'" min="1" max="5000"> (Currently: '+ Object.keys(_this.HiddenPosts).length+')<br><br>';

            htmlStr += '<input id="HideUpvoted" ' + (_this.Options.HideUpvoted.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideUpvoted"> ' + _this.Options.HideUpvoted.Desc + '</label><br>';
            htmlStr += '<input id="HideDownvoted" ' + (_this.Options.HideDownvoted.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideDownvoted"> ' + _this.Options.HideDownvoted.Desc + '</label><br>';
            htmlStr += '<input id="HideAfterVote" ' + (_this.Options.HideAfterVote.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideAfterVote"> ' + _this.Options.HideAfterVote.Desc + '</label><br><br>';
            htmlStr += '<input id="HideRightAway" ' + (_this.Options.HideRightAway.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HideRightAway"> ' + _this.Options.HideRightAway.Desc + '</label><br>';
            htmlStr += '<input id="AddHideButton" ' + (_this.Options.AddHideButton.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AddHideButton"> ' + _this.Options.AddHideButton.Desc + '</label><br>';

            return htmlStr;
        }
    }
};
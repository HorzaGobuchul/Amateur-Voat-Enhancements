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
            Value: false
        }
    },

    Processed: [], //Ids of comments that have already been processed

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },
    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
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

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        var s = $(".submission");
        s.each(function(index){
            if (s[index]) {
                _this.showUnvoted($(s[index]).find(".midcol:first"),
                                  $(s[index]).attr("data-fullname"));
            }
        });

        this.Listeners();
    },

    Listeners: function () {
        var _this = this;
        $("div[onclick^=\"voteUpSubmission\"],div[onclick^=\"voteDownSubmission\"]")
            .on("click",
                function(){
                    var el = this;
                    setTimeout(
                        function(){
                            _this.showUnvoted($(el).parent());
                        }, 1000);
                }
            );
    },

    showUnvoted: function (m, id) {
        if (id){
            if ($.inArray(id, this.Processed) === -1) {
                this.Processed.push(id);
            } else {
                return;
            }
        }

        if(m.length>0) {
            var u = m.find(".score.unvoted"),
                l = m.find(".score.likes"),
                d = m.find(".score.dislikes");

            if (m.find(".arrow-upvoted").length > 0) {
                u.css("color", l.css('color'));
            } else if (m.find(".arrow-downvoted").length > 0) {
                u.css("color", d.css('color'));
            } else {
                u.css("color", "");
            }

            u.text(l.text() - d.text());
            u.css("display", "block");
            l.css("display", "none");
            d.css("display", "none");
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            return 'Feature written by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>';
        }
    }
};
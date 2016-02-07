AVE.Modules['UpdateAfterLoadingMore'] = {
    ID: 'UpdateAfterLoadingMore',
    Name: 'Update after loading more',
    Desc: 'Updates other modules when a thread is continued.',
    Category: 'Thread',//Maybe Subverses/Sets later

    Index: 1,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist");return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") {this.Enabled = false;}

        if (this.Enabled) {
            this.Start();
        }
    },

    obsReplies: null,
    obsComm: null,
    CommentLen: 0,

    Start: function () {
        var _this = this;

        this.CommentLen = $("div[class*='id-']").length;
        //More Comments
        if (this.obsComm) { this.obsComm.disconnect(); }
        this.obsComm = new OnNodeChange($("div.sitetable#siteTable"), function (e) {
            if (e.addedNodes.length > 0 && e.removedNodes.length === 0) {
                if ($("div[class*='id-']").length > _this.CommentLen) {
                    _this.CommentLen = $("div[class*='id-']").length;

                    setTimeout(AVE.Init.UpdateModules, 500);
                }
            }
        });
        this.obsComm.observe();
        this.Listeners();
    },

    Listeners: function () {
        //More Replies
        if (this.obsReplies) { this.obsReplies.disconnect(); }
        this.obsReplies = new OnNodeChange($("a[id*='loadmore-']").parents("div[class*='id-']:visible"), function (e) {
            if (e.removedNodes.length === 1) {
                if (e.removedNodes[0].tagName === "DIV" && e.removedNodes[0].id === "") {
                    setTimeout(AVE.Init.UpdateModules, 500);
                }
            }
        });
        this.obsReplies.observe();
    },

    Update: function () {
        if (AVE.Utils.currentPageType !== "thread") {this.Listeners();}
    }
};
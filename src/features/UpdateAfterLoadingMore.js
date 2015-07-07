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
        var _this = AVE.Modules['UpdateAfterLoadingMore'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
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
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Listeners: function () {
        $("a#loadmorebutton").OnNodeChange(function () {
            if ($(this).text().split(" ")[0] == "load") {
                setTimeout(AVE.Init.UpdateModules, 500);
            }
        });
    },
};
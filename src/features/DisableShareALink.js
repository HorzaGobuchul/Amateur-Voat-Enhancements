AVE.Modules['DisableShareALink'] = {
    ID: 'DisableShareALink',
    Name: 'Disable Share-a-Link',
    Desc: 'This module will remove the Share-a-Link overlay block.',
    Category: 'Misc',
    //The share-a-link feature doesn't exist anymore it seems. This module is obsolete.

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['DisableShareALink'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['DisableShareALink'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });
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
        $('div#share-a-link-overlay').remove();
        $("body").removeAttr("ondrop")
                 .removeAttr("ondragover");
    }
};
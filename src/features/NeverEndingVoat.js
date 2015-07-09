AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Automatically load the next page of the subverse.',
    Category: 'Subverse',

    Index: 100,
    Debug: true,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Auto: {
            Type: 'boolean',
            Desc: 'If true, a new page will be loaded whent the user scrolls below the "load more" line',
            Value: true,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['NeverEndingVoat'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
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

    currentPage: 0,
    
    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
    },

    Listeners: function () {
    },

    AppendToPreferenceManager: {
        html: function () {
            var htmlStr = "";
            return htmlStr;
        },
        callback: function () {
        },
    },
};
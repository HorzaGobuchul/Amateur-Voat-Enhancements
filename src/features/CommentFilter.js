AVE.Modules['CommentFilter'] = {
    ID: 'CommentFilter',
    Name: 'Name',
    Desc: 'Desc',
    Category: 'Cat',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [],
        },
        RemoveFiltered: {
            Type: 'boolean',
            Desc: "Remove altogether the comment and all child comments.",
            Value: false,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
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

    Start: function () {
        //When a comment is filtered it can be hidden or removed. use :visible
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['CommentFilter'];
            var htmlStr = "";
            return htmlStr;
        },
        callback: function () {
        },
    },
};
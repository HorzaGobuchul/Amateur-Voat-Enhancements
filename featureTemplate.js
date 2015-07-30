AVE.Modules['ID'] = {
    ID: 'ID',
    Name: 'Name',
    Desc: 'Desc',
    Category: 'Cat',

    Index: 100,
    Debug: true, //Means this is a beta feature. It Won't be added to the release build if left.
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
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
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        //this.AppendToPage();
        //this.Listeners();
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () { //To insert content into the page
    },

    Listeners: function () { //To bind event listeneres to the content added in AppendToPage.
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['ID'];
            var htmlStr = '';
            return htmlStr;
        },
        callback: function () {
        },
    },
};
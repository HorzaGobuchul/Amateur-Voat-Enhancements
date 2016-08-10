AVE.Modules['${NAME}'] = {
    ID: '${NAME}',
    Name: '${Title}',
    Desc: '${Description}',
    Category: '${Category}',
    
    Index: 100,
    Enabled: false,

    Store: {},
    
    RunAt: "${Start}",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be removed.
        var _this = this;
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {return true;}
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

    Listeners: function () { //To bind event listeners to the content added in AppendToPage.
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['${NAME}'];
            var htmlStr = '';
            return htmlStr;
        },
        callback: function () {
        }
    },

    AppendToDashboard: {
        initialized: false,
        module: {},

        init: function () {
            this.module = AVE.Modules['${NAME}'];
            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}

            var htmlStr = "";
            return htmlStr;
        },
        callback: function () {
            var _this = this;
        }
};
AVE.Modules['HideUsername'] = {
    ID: 'HideUsername',
    Name: 'Hide username',
    Desc: 'Options to hide or replace references to your username (not in posts).',
    Category: 'Account',

    //Should be loaded after the usertag module 
    Index: 150,
    Enabled: false,

    Store: {},

    RunAt: "banner",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        NewName: {
            Type: 'string',
            Desc: "Replace with: ",
            Value: ""
        },
        ReplaceEverywhere: {
            Type: 'boolean',
            Desc: 'Replace all references to your username.',
            Value: false
        },
        RemoveInLoginBlock: {
            Type: 'boolean',
            Desc: 'Remove your username from the user info block.',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
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
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        if (AVE.Utils.CurrUsername() === null) {return;}

        if (this.Options.RemoveInLoginBlock.Value) {
            $(".logged-in > .user > a[title='Profile']").remove();
        } else if (!this.Options.ReplaceEverywhere.Value) {
            $(".logged-in > .user > a[title='Profile']").text(this.Options.NewName.Value);
        }

        if (this.Options.ReplaceEverywhere.Value) {
            $("a[href='/user/" + AVE.Utils.CurrUsername() + "'],a[href='/u/" + AVE.Utils.CurrUsername() + "']")
                .not("#upvoatsGiven").filter(":parents(li.selected)")
                .text(this.Options.NewName.Value);
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['HideUsername'];
            var htmlStr = '';

            htmlStr += '<input id="RemoveInLoginBlock" ' + (_this.Options.RemoveInLoginBlock.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="RemoveInLoginBlock"> ' + _this.Options.RemoveInLoginBlock.Desc + '</label>';
            htmlStr += '<br /><input id="ReplaceEverywhere" ' + (_this.Options.ReplaceEverywhere.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ReplaceEverywhere"> ' + _this.Options.ReplaceEverywhere.Desc + '</label>';
            htmlStr += '<br />' + _this.Options.NewName.Desc + '<input id="NewName" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.NewName.Value + '"/>';

            return htmlStr;
        },
        callback: function () {
        }
    }
};
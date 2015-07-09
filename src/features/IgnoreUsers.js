AVE.Modules['IgnoreUsers'] = {
    ID: 'IgnoreUsers',
    Name: 'Ignore users',
    Desc: 'Lets you tag users as Ignored. Replacing all their comments\' content with [Ignored User].',
    Category: 'General',

    Index: 100, //must be called after the UserTagging module.
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false,
        },
        HardIgnore: {
            Type: 'boolean',
            Desc: 'Remove entirely from the page posts and chain comments made by the ignored users.',
            Value: false,
        },
    },

    IgnoreList: [],

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = AVE.Modules['IgnoreUsers'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
        var _this = AVE.Modules['IgnoreUsers'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['IgnoreUsers'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        $.each(Opt, function (key, value) {
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        //Cannot work without the userTag module
        if (!AVE.Modules['UserTag'] || !AVE.Modules['UserTag'].Enabled) { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = AVE.Modules['IgnoreUsers'];
        if (AVE.Utils.currentPageType == "thread") { // comments
            $("p.tagline > a.author").each(function () {
                var name = $(this).attr("data-username");
                if ($.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('Removed comment by ' + name)
                    $(this).parents("div.comment[class*='id-']:first").remove();
                } else {
                    $(this).parent().parent().find("div[id*='commentContent-']")
                        .text('[Ignored User]')
                        .css("font-size", "10px")
                        .css("margin-left", "20px")
                        .css("font-weight", "bold");
                }
            });
        } else if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse"]) !== -1) { // submissions
            $("p.tagline > a.author").each(function () {
                var name = $(this).attr("data-username");
                if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

                if (_this.Options.HardIgnore.Value) {
                    print('Removed submissions titled: "'+$(this).parents("div.entry:first").find("p.title > a[class*='title']:first").text()+'" by '+name)
                    $(this).parents("div.submission").remove();
                } else {
                    $(this).parents("div.entry:first").find("p.title > a[class*='title']:first").text('[Ignored User]').css("font-size", "13px");
                }
            });
        } else if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) !== -1) { // userpages
            var name = $("div.alert-title").text().split(" ");
            name = name[name.length - 1].replace('.', '');
            if (!name || $.inArray(name.toLowerCase(), _this.IgnoreList) === -1) { return true; }

            $("<span> [Ignored User]</span>").appendTo("div.alert-title")
                .css("font-weight", "bold")
                .css("color", "#B45656");
        }
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore, remove otherwise
        this.Start();
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var htmlStr = "";
            htmlStr += '<input id="HardIgnore" type="checkbox"/><label for="HardIgnore"> Hard ignore</label><br />If checked all submissions and (chain)-comments of ignored users will be hidden.';
            if (!AVE.Modules['UserTag'] || !AVE.Modules['UserTag'].Enabled) {
                htmlStr += '<br /><span style="font-weigth:bold;color:#D84C4C;">The User tagging module is not activated, this module cannot work without it.</span>';
            }
            //show a warning if usertag is disabled
            return htmlStr;
        },
        callback: function () {
        },
    },
};
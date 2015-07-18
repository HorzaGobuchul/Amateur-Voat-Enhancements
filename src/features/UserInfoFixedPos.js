AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'Fixes',

    Index: 2,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        DivideBlock: {
            Type: 'boolean',
            Value: false,
        },
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['UserInfoFixedPos'];

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
        if (!AVE.Utils.ListHeaderHeight) { AVE.Utils.ListHeaderHeight = 0; }

        var headerAccountPos = $('#header-account').offset().top;
        $(window).scroll(function () {
            SetAccountHeaderPosAsFixed(headerAccountPos)
        });
        SetAccountHeaderPosAsFixed(headerAccountPos)

        function SetAccountHeaderPosAsFixed(headerAccountPos) {
            if ($(window).scrollTop() + AVE.Utils.ListHeaderHeight > headerAccountPos) {
                $('div#header-account').css('position', 'fixed')
                                    .css('top', AVE.Utils.ListHeaderHeight + "px")
                                    .css('right', '0')
                                    .css("text-align", "center")
                                    .css("height", "0px");
                $('div#header-account > div.logged-in').css("background", AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
            } else {
                $('div#header-account').css('position', '')
                                    .css('top', '')
                                    .css("text-align", "")
                                    .css("height", "");
                $('div#header-account > div.logged-in').css("background", "");
            }
        }

        if (this.Options.DivideBlock.Value && $("div#header-account > div.logged-in").length > 0) {
            //Align header-account's content
            $("div#header-account > div.logged-in").css("text-align", "center");
            //Add a line return before the icons
            $("<br />").insertAfter("div#header-account > div.logged-in > span.separator:first");
            //Remove the, now useless, separator
            $("div#header-account > div.logged-in > span.separator:first").remove();
            //Reset header-account's so that it is not a few pixels too high.
            $('div#header-account').css('position', '');
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var htmlStr = "";
            htmlStr += '<input ' + (AVE.Modules['UserInfoFixedPos'].Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Do you want the header account separated- username and numbers at the top and icons below?</label>'
            return htmlStr;
        },
    },
};
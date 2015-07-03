AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'General',

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
        var self = AVE.Modules['UserInfoFixedPos'];

        self.Store.SetValue(self.Store.Prefix + self.ID, JSON.stringify(POST[self.ID]));
    },

    SetOptionsFromPref: function () {
        var self = this;
        var Opt = self.Store.GetValue(self.Store.Prefix + self.ID);

        if (Opt !== null) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                self.Options[key].Value = value;
            });
        }
        self.Enabled = self.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        if (AVE.Modules['HeaderFixedPos'] == undefined) { AVE.Utils.ListHeaderHeight = 0; }

        var headerAccountPos = $('#header-account').offset().top;
        $(window).scroll(function () {
            SetAccountHeaderPosAsFixed(headerAccountPos)
        });
        SetAccountHeaderPosAsFixed(headerAccountPos)

        function SetAccountHeaderPosAsFixed(headerAccountPos) {
            if ($(window).scrollTop() + AVE.Utils.ListHeaderHeight > headerAccountPos) {
                $('#header-account').css('position', 'fixed')
                                    .css('top', AVE.Utils.ListHeaderHeight+"px")
                                    .css('right', '0')
                                    .css("text-align", "center")
                                    .css("height", "0px");
                $('.logged-in').css("background", AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
            } else {
                $('#header-account').css('position', '')
                                    .css('top', '')
                                    .css("text-align", "")
                                    .css("height", "");
                $('.logged-in').css("background", "");
            }
        }
    },
};
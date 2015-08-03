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
        ToggleBlock: {
            Type: 'boolean',
            Value: true,
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
        
        if (this.Options.ToggleBlock.Value) {
            //Add arrow icon element
            $('#header-account').append('<div title="Hide user block" id="AVE_ToggleUserBlock" style="font-size:20px;font-weight:bold;cursor:pointer;float:left;padding:5px;">&rArr;</div>')
            //Set user block as float:right;
            $('div#header-account > div.logged-in,div.logged-out').css("float", "right");

            this.Listeners();
        }
    },

    Listeners: function () {
        $("div#AVE_ToggleUserBlock").on("click", function () {//
            if ($('div#header-account > div.logged-in,div.logged-out').is(":hidden")) {//If user block is already hidden
                //Show arrow pointing to the right
                $("div#AVE_ToggleUserBlock").html("&rArr;");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Hide user block");
                //Show user block
                $('div#header-account > div.logged-in,div.logged-out').show();
            } else {//If user block is visible
                //Show arrow pointing to the left
                $("div#AVE_ToggleUserBlock").html("&lArr;");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Show user block");
                //Hide user block
                $('div#header-account > div.logged-in,div.logged-out').hide();
            }
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserInfoFixedPos'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Do you want the header account separated- username and numbers at the top and icons below?</label>';
            htmlStr += '<br /><input ' + (_this.Options.ToggleBlock.Value ? 'checked="true"' : "") + ' id="ToggleBlock" type="checkbox"/><label style="display:inline;" for="ToggleBlock"> Show icon to toggle hide/show the user block.</label>';

            return htmlStr;
        },
    },
};
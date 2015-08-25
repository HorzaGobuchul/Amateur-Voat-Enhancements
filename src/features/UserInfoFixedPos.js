AVE.Modules['UserInfoFixedPos'] = {
    ID: 'UserInfoFixedPos',
    Name: 'Fix user-block position',
    Desc: 'Set the user info block\'s position as fixed.',
    Category: 'Fixes',

    Index: 100,
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
        PersistentHide: {
            Type: 'boolean',
            Value: false,
        },
    },

    SavePref: function (POST) {
        var _this = this;

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

    bg: "",

    Start: function () {
        var _this = this;
        if (!AVE.Utils.ListHeaderHeight) { AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); }

        var headerAccountPos = $('#header-account').offset().top;
        $(window).scroll(function () {
            _this.SetAccountHeaderPosAsFixed(headerAccountPos)
        });
        this.SetAccountHeaderPosAsFixed(headerAccountPos)

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

        if (this.Options.ToggleBlock.Value && $('#header-account:has(div.logged-in)').length > 0) {
            //Add arrow icon element
            $('#header-account').append('<div title="Hide user block" class="expanded" id="AVE_ToggleUserBlock"></div>')

            this.Listeners();
        }

        if (this.Options.PersistentHide.Value) {
            $("div#AVE_ToggleUserBlock").click();
        }

        this.bg = $("div#header-container").css("background-color") + " " +
                  $("div#header-container").css("background-image") + " " +
                  $("div#header-container").css("background-repeat") + " " +
                  $("div#header-container").css("background-attachment") + " " +
                  $("div#header-container").css("background-position") + " " +
                  $("div#header-container").css("background-clip") + " " +
                  $("div#header-container").css("background-origin");

        if ($("div#header-container").css("background-color") == "transparent" &&
            $("div#header-container").css("background-image") == "none") {
            this.bg = $("#logged-in").css("background-color");

            if (this.bg == "transparent" && 
                this.bg == $("[title='Profile']").css("color")) {
                $("[title='Profile']").css("color")
                this.bg = $("#header-account").css("background-color");

                if (this.bg == "transparent") {
                    this.bg = $("div#header[role='banner']").css("background-color");

                    if (this.bg == "transparent") {
                        //If there is no colour nor any image set, we set a default value
                        this.bg = AVE.Utils.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
                    }
                }
            }
        }


        AVE.Utils.AddStyle('\
div#AVE_ToggleUserBlock{\
    background-position: center center;\
    background-repeat: no-repeat;\
    border: 1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "222" : "DCDCDC") + ';\
    border-radius: 1em;\
    cursor:pointer;\
    float:right;\
    width: 14px;\
    height: 14px;\
}\
div#AVE_ToggleUserBlock.expanded{\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20style%3D%22fill%3A%23DDD%3B%22%20points%3D%223.404%2C2.051%208.354%2C7%203.404%2C11.95%205.525%2C14.07%2012.596%2C7%205.525%2C-0.071%20%22%2F%3E%3C%2Fsvg%3E");\
}\
div#AVE_ToggleUserBlock.collapsed{\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23DDD%22%20points%3D%2214%2C5%209%2C5%209%2C0%205%2C0%205%2C5%200%2C5%200%2C9%205%2C9%205%2C14%209%2C14%209%2C9%2014%2C9%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
}\
.logged-in{\
    margin-bottom:2px;\
}\
div#header-account > div.logged-in{\
    background: ' + this.bg + '\
}\
/* Next is a fix for some custom styles */\
div#container {z-index: 1;}\
div#header-container {z-index: 2;}\
.modal-backdrop.in {display: none;}\
.modal#linkFlairSelectModal{top: 140px;}');
    },

    SetAccountHeaderPosAsFixed: function (headerAccountPos) {
        if ($(window).scrollTop() + AVE.Utils.ListHeaderHeight > headerAccountPos) {
            $('div#header-account').css('position', 'fixed')
                                .css('top', AVE.Utils.ListHeaderHeight + "px")
                                .css('right', '0')
                                .css("text-align", "center")
                                .css("bottom", "auto");
            //$('div#header-account > div.logged-in').css("background", this.bg);
        } else {
            $('div#header-account').css('position', '')
                                   .css('top', this.Options.DivideBlock.Value ? AVE.Utils.ListHeaderHeight + "px" : "")
                                   .css("text-align", "")
                                   .css("bottom", "");
            //$('div#header-account > div.logged-in').css("background", "");
        }
    },

    Listeners: function () {
        $("div#AVE_ToggleUserBlock").on("click", function () {//
            if ($("div#AVE_ToggleUserBlock").hasClass("collapsed")) {//If user block is already hidden
                //Show expand icon
                $("div#AVE_ToggleUserBlock").removeClass("collapsed");
                $("div#AVE_ToggleUserBlock").addClass("expanded");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Hide user block");
                //Show user block
                $('div#header-account > div.logged-in,div.logged-out').show();
                //Restore #header-account's default size
                $('div#header-account').css("width", "")
                                       .css("height", "");
            } else {//If user block is visible
                //Show collapse icon
                $("div#AVE_ToggleUserBlock").removeClass("expanded");
                $("div#AVE_ToggleUserBlock").addClass("collapsed");
                //Change element's title
                $("div#AVE_ToggleUserBlock").attr("title", "Show user block");
                //Hide user block
                $('div#header-account > div.logged-in,div.logged-out').hide();
                //Set #header-account's size to be that of the toggle icon
                $('div#header-account').css("width", "14px")
                                       .css("height", "14px");
            }
        });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserInfoFixedPos'];
            var htmlStr = "";
            htmlStr += '<input ' + (_this.Options.DivideBlock.Value ? 'checked="true"' : "") + ' id="DivideBlock" type="checkbox"/><label style="display:inline;" for="DivideBlock"> Do you want the header account separated- username and numbers at the top and icons below?</label>';
            htmlStr += '<br /><input ' + (_this.Options.ToggleBlock.Value ? 'checked="true"' : "") + ' id="ToggleBlock" type="checkbox"/><label style="display:inline;" for="ToggleBlock"> Show icon to toggle hide/show the user block.</label>';
            htmlStr += '<br /><input ' + (_this.Options.PersistentHide.Value ? 'checked="true"' : "") + ' id="PersistentHide" type="checkbox"/><label style="display:inline;" for="PersistentHide"> Always hide the userblock</label>';

            return htmlStr;
        },
    },
};
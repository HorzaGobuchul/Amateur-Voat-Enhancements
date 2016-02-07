AVE.Modules['HttpWarning'] = {
    ID: 'HttpWarning',
    Name: 'unsecure HTTP warning',
    Desc: 'This module show a warning for submissions that link to HTTP URL instead of HTTPS(ecure)',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        WarningIcon: {
            Type: 'boolean',
            Desc: "Display a warning icon before HTTP submission links",
            Value: true
        },
        ModifyStyle: {
            Type: 'boolean',
            Desc: "Change the titles' style with the CSS values below",
            Value: false
        },
        WarningStyle: {
            Type: 'array',
            Value: ['color: #e0baba;', //dark
                    'color: #d85858;'] //light
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        POST = POST[this.ID];

        this.Options.WarningStyle.Value[style] = POST.WarningStyle;
        POST.WarningStyle = this.Options.WarningStyle.Value;

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
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
        this.AppendToPage();
    },

    AppendToPage: function () {
        if (this.Options.ModifyStyle.Value){
            AVE.Utils.AddStyle('a.title.may-blank[href^="http:"] {' + this.Options.WarningStyle.Value[AVE.Utils.CSSstyle === "dark" ? 0 : 1] + '}');
        }
        if (this.Options.WarningIcon.Value){
            AVE.Utils.AddStyle( 'a.title.may-blank[href^="http:"]:before {' +
                '   content: "";' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20style%3D%22fill%3A%23'+'d85858'+'%3B%22%20d%3D%22M7%2C0L0%2C12h14L7%2C0z%20M7%2C11c-0.553%2C0-1-0.447-1-1s0.447-1%2C1-1c0.553%2C0%2C1%2C0.447%2C1%2C1S7.553%2C11%2C7%2C11z%20M7%2C8%20C6.447%2C8%2C6%2C7.553%2C6%2C7V5c0-0.553%2C0.447-1%2C1-1c0.553%2C0%2C1%2C0.447%2C1%2C1v2C8%2C7.553%2C7.553%2C8%2C7%2C8z%22%2F%3E%3C%2Fsvg%3E");'+
                '   width: 14px;'+
                '   height: 14px;'+
                '   background-repeat: no-repeat;'+
                '   background-position: center;' +
                '   display: inline-block;' +
                '   margin-right: 5px;' +
                '   vertical-align: middle;'+
                '}');
        }
    },

    AppendToPreferenceManager: {

        html: function () {
            var _this = AVE.Modules['HttpWarning'],
                style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
            var htmlStr = '';

            htmlStr += '<input id="WarningIcon" ' + (_this.Options.WarningIcon.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="WarningIcon"> ' + _this.Options.WarningIcon.Desc + '</label><br />';
            htmlStr += '<input id="ModifyStyle" ' + (_this.Options.ModifyStyle.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ModifyStyle"> ' + _this.Options.ModifyStyle.Desc + '</label><br />';

            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;font-weight: bold;" id="Demo_WarningStyle">TEST</div>';
            htmlStr += '<input style="font-size:12px;display:inline;width: 65%;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="WarningStyle" Value="'+_this.Options.WarningStyle.Value[style]+'"/> - Warning style values<br />';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['HttpWarning'];
            $("input[id='WarningStyle'][Module='" + _this.ID + "']").on("keyup", function () {
                var tmp = [];
                var demo = $("div#Demo_WarningStyle");
                demo.attr("style", "display:inline;padding-left:15px;padding-right:15px;margin-right:10px;font-weight: bold;");
                $.each($("input[id='WarningStyle'][Module='" + _this.ID + "']").val().split(";"), function (idx, val) {
                    tmp = $.trim(val).split(":");
                    if (tmp.length === 2) {
                        demo.css(tmp[0], tmp[1]);
                    }
                });
            }).trigger("keyup");
        }
    }
};
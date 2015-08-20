AVE.Modules['InjectCustomStyle'] = {
    ID: 'InjectCustomStyle',
    Name: 'Inject custom style',
    Desc: 'Apply your custom style of choice everywhere on Voat.',
    Category: 'Style',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "head",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false,
        },
        CustomStyleName: {
            Type: 'string',
            Value: "",
        },
        CustomStyleUrl: {
            Type: 'string',
            Desc: 'Enter URL of a custom CSS file: ',
            Value: "",
        },
        ApplyInEmpty: {
            Type: 'boolean',
            Desc: 'Apply choosen custom style only in subverses that do not have one.',
            Value: false,
        },
    },

    //What happens if a custom style makes the AVE prefMng link hidden?
    //  How can the user change the custom style then?
    //      add a panick mode
    //      add fixes to deactivate modules/opt that are problematic
    //          meaning InjectCustomStyle must start very early

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
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
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    CustomStyles: {
        Cashmere:    "https://cdn.rawgit.com/mijowa/Cashmere/master/css/cashmere.min.css?AVE",
        Flatron:     "https://cdn.rawgit.com/Gyyyn/Flatron-Voat/master/flatron.css?AVE", //buggy (see block info) Doesn't like big usernames
        Scribble:    "https://cdn.rawgit.com/ScribbleForVoat/Scribble/master/base.min.css?AVE",
        Simplegoats: "https://cdn.rawgit.com/relaxedzombie/simplegoats/master/simplegoats.min.css?AVE",
        SlimDark:    "https://cdn.rawgit.com/KinOfMany/SlimDark/master/style.css?AVE",
        Typogra:     "https://cdn.rawgit.com/Nurdoidz/Typogra-Voat/master/Typogra.min.css",
    },

    Start: function () {
        $("style#custom_css").ready(function () { $("style#custom_css").text(""); });

        var URL;
        
        if (this.Options.CustomStyleUrl.Value) {
            URL = this.Options.CustomStyleUrl.Value;
        } else if (this.Options.CustomStyleName.Value &&
                    this.CustomStyles[this.Options.CustomStyleName.Value]) {
            URL = this.CustomStyles[this.Options.CustomStyleName.Value];
        }

        if (URL) {
            $("head").append('<link rel="StyleSheet" href="' + URL + '" type="text/css">');

            //$("head").append('<style>@import url("' + URL + '");</style>');

            //If I use the following method, someone could too easily inject javascript and mess with the user.
            //$.ajax({
            //    url: URL,
            //    cache: true,
            //}).done(function (data, status, request) {
            //    $("head").append('<style>\n' + data + '\n</style');
            //    print(request.getResponseHeader('Content-type').split(";")[0] == "text/css");
            //})
            //.fail(function (html) {
            //    print("AVE: failed loading custom style at URL: " + URL);
            //});

            if (!this.Options.CustomStyleUrl.Value) {
                switch (this.Options.CustomStyleName.Value) {
                    case "Flatron":
                        $("div#header").ready(function () {
                            $("#header-account").css("top", "25px");
                            $("#header-account").css("maxHeight", "60px");
                            $(".logged-in").css("lineHeight", "17px");
                        });
                        break;
                    case "Cashmere":
                    case "Simplegoats":
                    case "Typogra":
                        $("#header-account").css("bottom", "auto");
                        break;
                    default:
                        break;
                }
            }
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['InjectCustomStyle'];
            var htmlStr = '';

            if (_this.Options.CustomStyleName.Value)
            { htmlStr += 'Choose a custom style: '; }
            htmlStr += '<select id="CustomStyleName">';
            if (!_this.Options.CustomStyleName.Value)
            { htmlStr += '<option disabled selected value="">Choose a custom style</option>'; }

            $.each(Object.keys(_this.CustomStyles), function () {
                htmlStr += '<option ' + (_this.Options.CustomStyleName.Value == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select>';

            htmlStr += '<br /><br />' + _this.Options.CustomStyleUrl.Desc + '<br /><input id="CustomStyleUrl" style="width:100%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" value="' + _this.Options.CustomStyleUrl.Value + '"></input><br /> <a target="_blank" href="https://userstyles.org/styles/browse/voat">Try a usertstyle<a/>: add ".css" at the end of the userstyle\'s url and paste it above.';

            return htmlStr;
        },
        callback: function () {

            //Check if URL returns MIME type text/css
            //On key up
        },
    },
};
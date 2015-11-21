AVE.Modules['DomainTags'] = {
    ID: 'DomainTags',
    Name: 'Domain tags',
    Desc: 'Choose tags to characterize domains.',
    Category: 'Domains',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        ShowOnMouseOver: {
            Type: 'boolean',
            Desc: 'Hide tags by default, only show on mouse over.',
            Value: false
        },
    },

    Style: "",

    /*
    Add a "location" icon if empty, an "info" one if not (https://api.jquerymobile.com/icons/)
        Option to only display the tag on mouse over
    Click "location" icon to replace it with a text input and a small circle for the colour (click to toggle colour palette).
        Same for complete tag following the icon
        (Same code as in the usertag's dashboard)
     */

    DomainTagObj: function (tag, colour) {
        this.t = tag.toString();
        this.c = colour.toString();
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
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.style =
                'div.AVE_Domain_tag {' +
                '   margin-left: 5px;' +
                '   border: 1px solid #929292;' +
                '   color: #777;' +
                '   padding: 0px 4px;' +
                '   border-radius: 3px;' +
                '   font-size: 10px;' +
                '   cursor: pointer;' +
                '}' +
                'div.AVE_Domain_tag:empty {' +
                '   border:0px;' +
                '   background-repeat: no-repeat;' +
                '   display: inline-block;' +
                '   width: 14px;' +
                '   height: 14px;' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20style%3D%22fill%3A%23' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '%22%20d%3D%22M7%2C0C4.791%2C0%2C3%2C1.791%2C3%2C4c0%2C2%2C4%2C10%2C4%2C10s4-8%2C4-10C11%2C1.791%2C9.209%2C0%2C7%2C0z%20M7%2C6C5.896%2C6%2C5%2C5.104%2C5%2C4%20s0.896-2%2C2-2c1.104%2C0%2C2%2C0.896%2C2%2C2S8.104%2C6%2C7%2C6z%22%2F%3E%3C%2Fsvg%3E");' +
                '}' +
                'div.AVE_Domain_tag:empty:hover {' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20style%3D%22fill%3A%23' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "BBB") + '%22%20d%3D%22M7%2C0C4.791%2C0%2C3%2C1.791%2C3%2C4c0%2C2%2C4%2C10%2C4%2C10s4-8%2C4-10C11%2C1.791%2C9.209%2C0%2C7%2C0z%20M7%2C6C5.896%2C6%2C5%2C5.104%2C5%2C4%20s0.896-2%2C2-2c1.104%2C0%2C2%2C0.896%2C2%2C2S8.104%2C6%2C7%2C6z%22%2F%3E%3C%2Fsvg%3E");' +
                '}' +
                'div.AVE_Domain_tag[hover="true"] {' +
                '   border:0px;' +
                '   background-repeat: no-repeat;' +
                '   display: inline-block;' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "4f4f4f" : "BBB") + '%22%20d%3D%22M7%2C0C3.134%2C0%2C0%2C3.134%2C0%2C7s3.134%2C7%2C7%2C7s7-3.134%2C7-7S10.866%2C0%2C7%2C0z%20M7%2C2c0.552%2C0%2C1%2C0.447%2C1%2C1S7.552%2C4%2C7%2C4S6%2C3.553%2C6%2C3%20S6.448%2C2%2C7%2C2z%20M9%2C11H5v-1h1V6H5V5h3v5h1V11z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");' +
                '   background-position: left center;' +
                '   vertical-align: middle;' +
                '}' +
                'div.AVE_Domain_tag[hover="true"]:hover {' +
                '   background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "BBB") + '%22%20d%3D%22M7%2C0C3.134%2C0%2C0%2C3.134%2C0%2C7s3.134%2C7%2C7%2C7s7-3.134%2C7-7S10.866%2C0%2C7%2C0z%20M7%2C2c0.552%2C0%2C1%2C0.447%2C1%2C1S7.552%2C4%2C7%2C4S6%2C3.553%2C6%2C3%20S6.448%2C2%2C7%2C2z%20M9%2C11H5v-1h1V6H5V5h3v5h1V11z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");' +
                '}' +
                'div.AVE_Domain_tag_content {' +
                '   display:none;' +
                '}';
            AVE.Utils.AddStyle(this.style);
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        "use strict";
        var _this;

        _this = this;

        $("p.title > span.domain > a").each(function () {
            var domain;
            domain = $(this).text();
            if (/self\.[a-zA-Z0-9]?/.test(domain)){return true;}
            if ($(this).parent().find("div.AVE_Domain_tag").length === 0){


                $('<div class="AVE_Domain_tag"></div>').insertAfter($(this));
                var JqId = $(this).parent().find("div.AVE_Domain_tag");

                var tag = "This is a longer TAG";
                //tag = "";

                //https://stackoverflow.com/questions/14255631/style-svg-circle-with-css

                //If comment exists
                if (_this.Options.ShowOnMouseOver.Value){
                    JqId.attr("hover", "true");
                    JqId.attr("title", tag);
                } else {
                    JqId.text(tag);
                }
                //If comment exists
            }

        });
    },

    Listeners: function () {
        "use strict";
        var _this;

        _this = this;

        if (_this.Options.ShowOnMouseOver.Value){
            //$("div.AVE_Domain_tag[hover='true'][tag]").off().on("mouseenter", function () {
            //    $(this).text($(this)
            //        .attr("tag"));
            //        //.css("padding-left", "18px");
            //}).on("mouseleave", function () {
            //    $(this).text("");
            //        //.css("padding-left", "");
            //});
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['DomainTags'];
            var htmlStr = '';

            htmlStr += '<input id="ShowOnMouseOver" ' + (_this.Options.ShowOnMouseOver.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowOnMouseOver"> ' + _this.Options.ShowOnMouseOver.Desc + '</label><br />';


            return htmlStr;
        },
        callback: function () {
        }
    }
};
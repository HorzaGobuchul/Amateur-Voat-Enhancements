AVE.Modules['CSSEditor'] = {
    ID: 'CSSEditor',
    Name: 'Simple in-page CSS editor',
    Desc: 'Edit your custom CSS stylesheets from within the page itself (created by <a href="https://voat.co/u/j_">/u/j_</a> [<a href="https://voat.co/v/CustomizingVoat/comments/92886">cf.</a>], adapted as a userscript by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>)',
    Category: 'ModTools',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    /*
        Automatically open the mod stylesheet page with the new css?
     */

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        Size: {
            Type: "array[2]", //Width, Height
            Desc: 'Set the size of the editor panel (in pixel [px] or percentage [%]):',
            Value: ["400px", "500px"]
        },
        Position: {
            Type: 'array[2]', // Vertically, Horizontally
            Desc: 'Set the position of the editor panel:',
            Value: ["bottom", "left"],
            All: [ { "top": "top:0", "bottom": "bottom:0"},
                   { "left": "left:0", "right": "right:0"} ]
        },
        AllowEverywhere: {
            Type: 'boolean',
            Desc: 'Enable this module and show the "CSS Editor" button everywhere, not only in subverse pages.',
            Value: false
        },
        RelocateButton: {
            Type: 'boolean',
            Desc: 'Display the "CSS Editor" button in the banner instead of in the side panel.',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var app;
        POST = POST[this.ID];

        POST.Size = ["", ""];
        if (POST.hasOwnProperty("sizeW")){
            app = POST.sizeW.indexOf("px") > 0 || POST.sizeW.indexOf("%") > 0;
            POST.Size[0] = POST.sizeW;
            if (!app){ POST.Size[0] += "px"; }
        }
        if (POST.hasOwnProperty("sizeH")){
            app = POST.sizeH.indexOf("px") > 0 || POST.sizeH.indexOf("%") > 0;
            POST.Size[1] = POST.sizeH;
            if (!app){
                POST.Size[1] += "px";
            }
        }

        POST.Position = [POST.posV, POST.posH];

        // we can remove properties safely even if they don't exit
        delete POST.sizeW;
        delete POST.sizeH;
        delete POST.posV;
        delete POST.posH;

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
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (!this.Options.AllowEverywhere.Value) {
            if ($.inArray(AVE.Utils.currentPageType, ["subverse", "thread"]) === -1) {
                this.Enabled = false;
            }
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        var button;
        if (this.Options.RelocateButton.Value || $.inArray(AVE.Utils.currentPageType, ["subverse", "thread"]) === -1){
            button = '<li class="disabled"><a class="contribute submit-text" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></li>';
            $(button).appendTo("ul.tabmenu");
        } else {
            button = '<div class="spacer"><a class="btn-whoaverse btn-block" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></div>';
            $(button).insertBefore($(".titlebox:last").parent());
        }
    },

    Listeners: function () {
        var _this = this,
            sel = "style#custom_css";
        $("a#AVE_CSSEditor_button").off().on("click", function () {
            var s = $(sel);
            if (s.hasClass("AVE_custom_css_editable")) {
                if (s.is(":hidden")){ s.show(); } else { s.hide(); }
            } else {
                if (s.length === 0)// This element may have been removed by one of the style modules
                { $("body").append('<style id="custom_css"></style>'); s = $(sel); }
                var Vpos = _this.Options.Position.All[0][_this.Options.Position.Value[0]].split(":"),
                    Hpos = _this.Options.Position.All[1][_this.Options.Position.Value[1]].split(":");

                s.attr("style", "display:block;position:fixed;z-index:2000;max-height:"+_this.Options.Size.Value[1]+";max-width:"+_this.Options.Size.Value[0]+";min-height:"+_this.Options.Size.Value[1]+";min-width:"+_this.Options.Size.Value[0]+";background:rgba(255,255,255,.9);color:#000;opacity:.5;font:10px/1.1 monospace;white-space:pre;overflow:scroll;padding:4px;-webkit-user-modify:read-write-plaintext-only;")
                 .css(Vpos[0], Vpos[1])
                 .css(Hpos[0], Hpos[1])
                 .attr("contentEditable", true)
                 .attr("onfocus", "this.style.opacity=1")
                 .attr("onblur", "this.style.opacity=.35")
                 .addClass("AVE_custom_css_editable")
                 .on("keyup", function (e) {
                     if (e.which === 27) {s.hide().trigger("blur");} //Escape key
                });
            }
            s.focus();
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['CSSEditor'],
                htmlStr = '';

            htmlStr += '<span>'+_this.Options.Position.Desc+'</span><br>';
            htmlStr += '<span style="margin-left:10px;">Vertical: </span><select id="posV">';
            $.each(Object.keys(_this.Options.Position.All[0]), function () {
                htmlStr += '<option ' + (_this.Options.Position.Value[0] == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select><br>';

            htmlStr += '<span style="margin-left:10px;">Horizontal: </span><select id="posH">';
            $.each(Object.keys(_this.Options.Position.All[1]), function () {
                htmlStr += '<option ' + (_this.Options.Position.Value[1] == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select><br><br>';

            htmlStr += '<span>'+_this.Options.Size.Desc+'</span><br>';
            htmlStr += '<input style="width: 60px;margin-left:10px;" id="sizeW" type="text" name="sizeW" value="'+_this.Options.Size.Value[0]+'" min="1" max="5000"><label style="display:inline;margin-left:5px;" for="sizeW">Width</label><br>';
            htmlStr += '<input style="width: 60px;margin-left:10px;" id="sizeH" type="text" name="sizeH" value="'+_this.Options.Size.Value[1]+'" min="1" max="5000"><label style="display:inline;margin-left:5px;" for="sizeH">Height</label><br><br>';

            htmlStr += '<input id="AllowEverywhere" ' + (_this.Options.AllowEverywhere.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AllowEverywhere"> ' + _this.Options.AllowEverywhere.Desc + '</label><br>';
            htmlStr += '<input id="RelocateButton" ' + (_this.Options.RelocateButton.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="RelocateButton"> ' + _this.Options.RelocateButton.Desc + '</label>';

            return htmlStr;
        }
    }
};
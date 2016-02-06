AVE.Modules['CSSEditor'] = {
    ID: 'CSSEditor',
    Name: 'Simple in-page CSS editor',
    Desc: 'Edit your custom CSS stylesheets from within the page itself (by <a href="https://voat.co/u/j_">/u/j_</a>, adapted as a userscipt by <a href="https://voat.co/u/dubbelnougat">/u/dubbelnougat</a>)',
    Category: 'ModTools',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    /*
    Options:
         Allow everywhere: if not only in subverses and threads
         Relocate "CSS Editor button to the top in thread/submission (no choice for the rest)
     Rewrite with Jquery
     Automatically give focus to the editor when opened
     Close on "escape" pressed
     */

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Size: {
            Type: "array[2]", //Width, Height
            Desc: 'Set the size of the editor panel',
            Value: ["400px", "800px"] // If when saving there is no "px" or "%", append "px" by default
        },
        Position: {
            Type: 'array[2]', // Vertically, Horizontally
            Desc: 'Set the position of the editor panel',
            Value: ["bottom", "left"],
            All: [ [ "top", "bottom", "center" ],
                   [ "left", "right", "center" ] ]
        },
        AllowEverywhere: {
            Type: 'boolean',
            Desc: 'Enable this module and show the "CSS Editor" button everwhere, not only in subverse pages',
            Value: false
        },
        RelocateButton: {
            Type: 'boolean',
            Desc: 'Display the "CSS Editor" button in the banner instead of ',
            Value: false
        }
    },

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var app;
        POST = POST[this.ID];

        POST.size = ["", ""];
        if (POST.hasOwnProperty("sizeW")){
            app = POST.sizeW.indexOf("px") > 0 || POST.sizeW.indexOf("%") > 0;
            POST.size[0] = POST.sizeW;
            if (!app){ POST.size[0] += "px"; }
        }
        if (POST.hasOwnProperty("sizeH")){
            app = POST.sizeH.indexOf("px") > 0 || POST.sizeH.indexOf("%") > 0;
            POST.size[0] = POST.sizeH;
            if (!app){
                POST.size[0] += "px";
            }
        }

        POST.Position = [POST.posV, POST.posH];

        // we can remove safely even if the property doesn't exit
        delete POST.sizeW;
        delete POST.sizeH;
        delete POST.posV;
        delete POST.posH;

        print(JSON.stringify(POST));
        //this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
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

        if ($.inArray(AVE.Utils.currentPageType, ["subverse", "thread"]) === -1) {
            this.Enabled = false;
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
        var button, place;

        if (this.Options.RelocateButton.Value){
            button = '<li class="disabled"><a class="btn-whoaverse btn-block" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></li>';
            place = $("ul.tabmenu > li.disabled:last");
        } else {
            button = '<div class="spacer"><a class="btn-whoaverse btn-block" id="AVE_CSSEditor_button" style="cursor:pointer;">CSS Editor</a></div>';
            place = $(".titlebox:last").parent();
        }

        $(button).insertBefore(place).parent();

        var editCSSDiv = document.createElement("div");
        editCSSDiv.className = "spacer";
        var actualButton = document.createElement("a");
        actualButton.appendChild(document.createTextNode("CSS Editor"));
        actualButton.className = "btn-whoaverse btn-block";
        actualButton.setAttribute('style', 'cursor:pointer');
        editCSSDiv.appendChild(actualButton);
        var hostSpacer = document.querySelectorAll(".whoaversename")[0].parentNode.parentNode;
        hostSpacer.parentNode.insertBefore(editCSSDiv, hostSpacer);

        //actualButton.addEventListener("click", function(e){voatCSSEditor()});
    },

    Listeners: function () {
        $("a#AVE_CSSEditor_button").off().on("click", function () {
            var s = document.getElementById("custom_css");
            if (s.classList.contains("AVE_custom_css_editable")) {
                s.style.display = s.style.display === "none" ? "block" : "none";
                s.focus();
            } else {
                s.setAttribute("style", "display:block;position:fixed;z-index:1000;bottom:0;left:0;height:400px;min-width:400px;max-width:800px;background:rgba(255,255,255,.9);color:#000;opacity:.5;font:10px/1.1 monospace;white-space:pre;overflow:scroll;-webkit-user-modify:read-write-plaintext-only;");
                s.classList.add("AVE_custom_css_editable");
                s.setAttribute("contentEditable", true);
                s.setAttribute("onfocus", "this.style.opacity=1");
                s.setAttribute("onblur", "this.style.opacity=.35");
                s.focus();
            }
        });

    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['CSSEditor'];
            var htmlStr = '';

            //Positions as droplists
            //Sizes as number type input
            return htmlStr;
        },
        callback: function () {
        }
    }
};
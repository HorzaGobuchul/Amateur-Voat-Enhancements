AVE.Modules['HeaderFixedPos'] = {
    ID: 'HeaderFixedPos',
    Name: 'Fix header position',
    Desc: 'Set the subverse list header position as fixed.',
    Category: 'Misc',

    Index: 99,
    Enabled: false,

    Store: {},

    RunAt: 'banner',

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        }
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
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
        $(window).resize(function () {
            AVE.Utils.ListHeaderHeight = $('#sr-header-area').height();
        });

        AVE.Utils.ListHeaderHeight = $('#sr-header-area').height(); //23

        this.SetAltBackground();
    },

    SetAltBackground: function () {
        // I don't remember why I added this exit condition...
        //if(!AVE.Modules['InjectCustomStyle'] || !AVE.Modules['InjectCustomStyle'].Enabled){return;}

        var bg, border, JqId;
        JqId = $("#sr-header-area");
        if(JqId.length === 0) {
            print("AVE: HeaderFixedPos > the header account element couldn't be found. Is this an error page?");
        }
        //Subverse list bg
        bg = JqId.css("background-color");
        //If alpha channel isn't 1
        if (  bg === "transparent" ||
            bg[3] === "a" &&
            parseInt(bg.replace(")", "").split(",")[3], 10) !== 1){
            //general header background
            bg = $("div#header[role='banner']").css("background-color");
            if (bg === "transparent") {
                //If there is no colour nor any image set, we set it by default
                bg = AVE.Utils.CSSstyle === "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)";
            }
        }

        border = JqId.css("borderBottomWidth") + " " +
            JqId.css("borderBottomStyle") + " " +
            JqId.css("borderBottomColor");

        JqId = $('.width-clip');
        JqId.css('position', 'fixed')
            .css("z-index", "1000")
            .css('border-bottom', border)//'1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
            .css("height", AVE.Utils.ListHeaderHeight + "px")
            .css("background-color", bg);//AVE.Utils.CSSstyle == "dark" ? "#333" : "#FFF");

        JqId.find("br:last").remove();//Chrome

        //If you have so many subscriptions that the "my subverses" list goes out of the screen, this is for you.
        JqId = $("ul.whoaSubscriptionMenu > li > ul:first");
        var li_Height = JqId.find("li > a").outerHeight();
        if (($(window).height() - AVE.Utils.ListHeaderHeight - li_Height) < JqId.height()) {
            var li_Width = JqId.find("li > a").outerWidth(),
                elPerCol = parseInt(($(window).height() - AVE.Utils.ListHeaderHeight) / li_Height, 10) - 1,
                columns = JqId.find("li").length / elPerCol - 1,
                el;

            for (var col = 0; col < columns; col++) {
                el = $("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")").find("li:gt(" + (elPerCol - 1) + ")");
                $('<ul style="width:' + li_Width + 'px;margin-left:' + (li_Width * (col + 1)) + 'px;"></ul>')
                    .insertAfter("ul.whoaSubscriptionMenu > li > ul:nth(" + col + ")")
                    .append(el);
            }
        }
    }
};
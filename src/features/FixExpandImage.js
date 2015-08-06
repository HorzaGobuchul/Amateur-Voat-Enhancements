AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlight of the image.',
    Category: 'Fixes',

    Enabled: false,

    Store: AVE.storage,

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['FixExpandImage'];

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
    
    ImgMedia: "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']",

    Start: function () {
        /*
        !! THIS CSS FIX IS BORROWED FROM /V/SCRIBBLE 1.5 !!
        */
        if ($("style[for='AVE']").length == 0) { $("head").append('<style for="AVE"></style>'); }
        AVE.Utils.AddStyle('.link-expando {overflow:visible;position:relative;z-index:1;}\
                            .usertext{overflow: visible !important;}\
                            .md{overflow: visible;}\
                            .comment{overflow: visible;}\
                            .entry{overflow:visible;}\
           div.submission > .entry{margin-left:60px;margin-top:10px;}\
              div.comment > .entry{margin-left:30px;}');

        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsImgExp: null,

    Listeners: function () {
        //Here we disable the selection of the image.
        if (this.obsImgExp) {
            this.obsImgExp.disconnect();
        }

        this.obsImgExp = new OnNodeChange($("div.expando:hidden, a" + this.ImgMedia + ":has(span.link-expando-type)"), function (e) {
            var img = $(e.target).find("img:first"); //In sub
            if (img.length == 0) { img = $(this).next("div.link-expando").find("img"); } //In thread

            if (img.length > 0) {
                var container = $(this).hasClass("link-expando") ? $(this) : //!!Weird!!
                                                                   ($(this).find("div.expando-link") || //In Sub
                                                                    $(this).find("div.link-expando"));  //In Thread
                img.OnAttrChange(function () {
                    window.getSelection().removeAllRanges();
                });
            }
        });
        this.obsImgExp.observe();
    },
};
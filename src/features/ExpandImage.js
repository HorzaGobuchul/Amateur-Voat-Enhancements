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

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsInSub: null,
    obsInThread: null,

    Listeners: function () {
        var ImgMedia = "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']";

        if (this.obsInSub) {
            this.obsInSub.disconnect();
            //Instead of disconnecting and recreating, maybe I could add the new targets to the observer.
        }
        this.obsInSub = new OnNodeChange($("a" + ImgMedia), function (e) {
            var container = $(e.target).parent().find("div.link-expando:first");
            var img = container.find("img:first");

            if (img.length > 0) {
                var parentWidth = $(this).parent().parent().width();

                img.css("position", "absolute")
                   .css("margin-top", "20px");

                img.OnAttrChange(function () {
                    window.getSelection().removeAllRanges();
                    container.width(parentWidth);//img.width());
                    container.height(img.height() + 20);
                });

                container.animate({
                    width: parentWidth + "px",
                    height: img.height() + 20 + "px",
                }, 1000);
            }
        });
        this.obsInSub.observe();

        if (this.obsInThread) {
            this.obsInThread.disconnect();
        }

        this.obsInThread = new OnNodeChange($("div.expando:hidden"), function (e) {
            //if ($(this).is(":not(div.expando)")) { print("a!!"); return true; }

            var img = $(e.target).find("img:first");
            if (img.length > 0) {
                var exp = $(this).hasClass("link-expando") ? $(this) : $(this).find("div.expando-link");
                img.css("position", "absolute")
                   .css("margin-top", "20px");

                img.OnAttrChange(function () {
                    window.getSelection().removeAllRanges();
                    exp.width(150);//img.width());
                    exp.height(img.height() + 20);
                });

                exp.animate({
                    width: 150 + "px", //just enough width to let the media info show
                    height: img.height() + 20 + "px",
                }, 150);
            }
        });
        this.obsInThread.observe()
    },
};
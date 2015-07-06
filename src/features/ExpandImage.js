AVE.Modules['FixExpandImage'] = {
    ID: 'FixExpandImage',
    Name: 'Fix expanding images',
    Desc: 'Let images expand over the sidebar and disallow the selection/highlight of the image.',
    Category: 'Posts',

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
        this.Listeners();
    },

    Listeners: function () {
        var ImgMedia = "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']";

        $("a" + ImgMedia).OnNodeChange(function () {
            var container = $(this).parent().find("div.link-expando:first");
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

        $("div[class*='expando']").OnNodeChange(function () {
            var img = $(this).find("img:first");
            if (img.length > 0) {
                var exp = $(this);
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
                }, 1000);
            }
        });
    },
};
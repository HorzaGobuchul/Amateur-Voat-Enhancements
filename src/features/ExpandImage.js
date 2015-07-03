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
        var self = AVE.Modules['FixExpandImage'];

        self.Store.SetValue(self.Store.Prefix + self.ID, JSON.stringify(POST[self.ID]));
    },

    SetOptionsFromPref: function () {
        var self = this;
        var Opt = self.Store.GetValue(self.Store.Prefix + self.ID);

        if (Opt !== null) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                self.Options[key].Value = value;
            });
        }
        self.Enabled = self.Options.Enabled.Value;
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

    AppendToPage: function () {
    },

    Listeners: function () {
        var ImgMedia = "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']";
        if (AVE.Utils.currentPageType == "thread") {
            $("a" + ImgMedia).OnNodeChange(function () {
                var container = $(this).parent().find(".link-expando:first");
                var img = container.find("img:first");

                if (img.length > 0) {
                    img.css("position", "absolute")
                       .css("margin-top", "20px");

                    img.OnAttrChange(function () {
                        window.getSelection().removeAllRanges();
                        container.width(img.width());
                        container.height(img.height() + 20);
                    });


                    container.animate({
                        width: img.width() + "px",
                        height: img.height() + 20 + "px",
                    }, 1000);
                }

                event.stopPropagation();
            });

        } else {
            $(".expando").OnNodeChange(function () {
                var img = $(this).find("img:first");
                if (img.length > 0) {
                    var exp = $(this);
                    img.css("position", "absolute")
                       .css("margin-top", "20px");

                    img.OnAttrChange(function () {
                        window.getSelection().removeAllRanges();
                        exp.width(img.width());
                        exp.height(img.height() + 20);
                    });

                    exp.animate({
                        width: img.width() + "px",
                        height: img.height() + 20 + "px",
                    }, 1000);
                }

                event.stopPropagation();
            });
        }
    },
};
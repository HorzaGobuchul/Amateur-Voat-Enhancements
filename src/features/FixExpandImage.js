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
    
    ImgMedia: "a[title='JPG'],a[title='PNG'],a[title='GIF']",//These are the only media that are resizable

    Start: function () {
        /*
        !! THIS CSS FIX IS BORROWED FROM /V/SCRIBBLE 1.5 !!
        */
        if ($("style[for='AVE']").length == 0) { $("head").append('<style for="AVE"></style>'); }
        AVE.Utils.AddStyle('.link-expando {overflow:visible;position:relative;z-index:1;margin-top: 10px;}\
                            .usertext {overflow: visible !important;}\
                            .md {overflow: visible;}\
                            .comment {overflow: visible;}\
                            .entry {overflow:visible;}\
           div.submission > .entry {margin-left:60px;}\
              div.comment > .entry {margin-left:30px;}\
    div.content-no-margin > .comment > .entry{margin-left:0px;}/*Comments outside of threads (like /username/comments*/\
                   .entry > div.collapsed {margin-left:0px;}\
          form#form-xxxxx > div.usertext-body > div.md {overflow:auto;}\
                     form > div.row {overflow:hidden;}');

        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Listeners();
        }
    },

    obsImgExp: null,

    Listeners: function () {
        var time = new Date().getTime(); var ntime = 0;

        //var a = $(this.ImgMedia);
        //print("thread " + a.length);
        //ntime = new Date().getTime();
        //print("testing for thread (" + (ntime - time) + "ms)");
        //time = ntime;

        //var b = $("div.expando");
        //print("submission: " + b.length);
        //ntime = new Date().getTime();
        //print("testing for submissions (" + (ntime - time) + "ms)");
        //time = ntime;

        //var b = $("div.expando, " + this.ImgMedia);
        //print("Combined: " + b.length);
        //ntime = new Date().getTime();
        //print("testing Combined (" + (ntime - time) + "ms)");
        //time = ntime;
        //return;

        var ntime = 0; var time = new Date().getTime();
        if (this.obsImgExp) {
            //this.obsImgExp.disconnect();
            //ntime = new Date().getTime();
            //print("Disconnecting (" + (ntime - time) + "ms)");
            //time = ntime;

            this.obsImgExp.targets = $("div.expando, " + this.ImgMedia);
            //print(this.obsImgExp.targets.length);
            //ntime = new Date().getTime();
            //print("Updating targets (" + (ntime - time) + "ms)");
            //time = ntime;
        }
        else {
            this.obsImgExp = new OnNodeChange($("div.expando, " + this.ImgMedia), function (e) {
                var img = $(e.target).find("img:first"); //In sub
                if (img.length == 0) { img = $(this).next("div.link-expando").find("img"); } //In thread

                if (img.length > 0) {
                    img.OnAttrChange(function () { window.getSelection().removeAllRanges(); });
                }
            });

            //ntime = new Date().getTime();
            //print("Setting (" + (ntime - time) + "ms)");
            //time = ntime;
        }

        this.obsImgExp.observe();
        //ntime = new Date().getTime();
        //print("Observing (" + (ntime - time) + "ms)");
        //time = ntime;
    },
};
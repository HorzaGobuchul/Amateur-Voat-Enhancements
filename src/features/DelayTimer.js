AVE.Modules['DelayTimer'] = {
    ID: 'DelayTimer',
    Name: 'Delay timer',
    Desc: 'Shows a timer informing you about the number of seconds you need to wait before posting/commenting again.',
    Category: 'Posts',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        }
        /*
        Option:
            Positions:
                top/bottom
                right/left
                next to username
                font-size
         */
    },

    OriginalOptions: "", //If ResetPref is used

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be removed.
        var _this = this;
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {
                return true;
            }
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        if (!unsafeWindow || !unsafeWindow.UI) {
            // https://bugs.chromium.org/p/chromium/issues/detail?id=222652
            print("AVE: DelayTimer > coudl not access window's JS objects");
        }
        else {
            unsafeWindow.UI.Notifications.subscribe('DOM', exportFunction(function (context) {
                _this.StuffHappened(context);

            }, unsafeWindow));
        }

        this.AppendToPage();
        this.Listeners();
    },

    StuffHappened: function (context) {
        // https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.js#L676
        // https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js
        // print(context);

        var match = /\[–]([\w\d]*)(\[\w])?(\dpoints)+\(\+0\|\-0\)(\d{1,2})seconds?ago/gi;
        match = match.exec($(context).text().replace(/\s/g, ''));

        if (!match || match.length !== 5) {return;}
        var username = match[1],
            seconds = match[4];

        if (username !== AVE.Utils.CurrUsername() || seconds > 30) {return;}

        alert("StuffHappened");
        $("div#AVE_DelayTimer_Timer").show().text("30");

        var IntIdx = setInterval(function () {
            _this.Decrement(selector, IntIdx);
        }, 1000);
    },

    AppendToPage: function () { //To insert content into the page
        var _this = this,
            selector = "div#AVE_DelayTimer_Timer";

        if ($(selector).length === 0){
            $("body").append("<div id='AVE_DelayTimer_Timer' style='position:fixed;left:0;bottom:0;font-weight:bold;font-size:18px;z-index:2000;'>30</div>");
        }
        $(selector).hide();

        // var IntIdx = setInterval(function () {
        //     _this.Decrement(selector, IntIdx);
        // }, 1000);

    },

    Decrement: function (sel, idx) {
        var JqId = $(sel),
            val = parseInt(JqId.text(), 10);

        if (val > 1){
            JqId.text(val-1);
        } else {
            var fontsize = parseInt(JqId.css("fontSize").substr(0, 2), 10);
            JqId.text("End");
            JqId.delay(1000)
                .animate({
                    fontSize: fontsize+5
                }, 500)
                .animate({
                    fontSize: 0, opacity: 0
                }, 1000);

            clearInterval(idx);
        }
    },

    Listeners: function () { //To bind event listeners to the content added in AppendToPage.
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['DelayTimer'];
            var htmlStr = '';
            return htmlStr;
        },
        callback: function () {
        }
    }
};
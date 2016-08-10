AVE.Modules['DisplayUserBasicInfo'] = {
    ID: 'DisplayUserBasicInfo',
    Name: 'Display user info',
    Desc: 'Display user information when your mouse is over a username.',
    Category: 'General',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        ContentFormat:{
            Type: 'string',
            Value: "Created&nbsp;{$age}&nbsp;ago, {$SCP}&nbsp;SCP, {$CCP}&nbsp;CCP<hr />{$bio}"
        }
    },

    OriginalOptions: "", //If ResetPref is used

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

        this.RegExp_act = new RegExp(this.RegExp_str);

        // Get rid of voat's internal tooltip triggers
        print("stff");
        if (unsafeWindow) {
            // unsafeWindow.$._data( unsafeWindow.$(".userinfo")[0], "events" );
            unsafeWindow.$(".author").off();print("truc1");
        } else if (window.wrappedJSObject) {
            window.wrappedJSObject.$(".author").off();print("truc2");
        }else {
            location.assign("javascript:$('.author').off();void(0)");print("autrs");
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    RegExp_str: "^(https?:\/\/)?(voat\.co)?\/u(ser)?\/([^\/#?=]+)$",
    RegExp_act: null,
    ContentWait: "Loading user info...",
    ContentError: "Couldn't find username",
    Cache: {"username": ""},

    // ADD TO USERTAG or keep separated?
    // Find a way to recycle the jquery selector and not due it twice stupidly

    // Link this module in usertag. trigger this module with user list
    // Recycle regexp too
    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("div#AVE_UserInfoTooltip").length > 0) {return;}

        $("body").append('<div id="AVE_UserInfoTooltip" style="display:none;position:absolute;z-index:999;background:rgb(76,76,76);border-radius:5px; border:2px solid rgb(0,0,0);font-size:14px;font-family:Arial,sans-serif;line-height:16px;padding:8px 10px;overflow:hidden;color:rgb(255,255,255);"></div>');
    },

    Listeners: function () {
        var JqId = $("div#AVE_UserInfoTooltip"),
            _this = this;

        $("a:regex(href, "+this.RegExp_str+")")
            .off()
            .on("mouseenter", function () {

                var username;
                username = _this.RegExp_act.exec($(this).attr('href'));
                username = username[username.length-1].toLowerCase();

                if (username === AVE.Utils._CurrUsername.toLowerCase()){
                    JqId.hide();
                    return false;
                }

                _this.DisplayUserInforTooltip("loading");

                var position = $(this).offset();
                position.top += 20;
                position.left -= 30;

                JqId.css(position);
                JqId.stop().fadeIn(300);
                _this.FetchUserInfoTooltip(username);
            }).on("mouseleave", function () {
                JqId.fadeOut(500);
            }
        );
    },

    FetchUserInfoTooltip: function(username){
        if (username.toLowerCase() === this.Cache["username"].toLowerCase()){
            this.DisplayUserInforTooltip("");
            return;
        }
        var _this = this;

        $.ajax({url: "https://voat.co/ajaxhelpers/userinfo/"+username, cache: true})
            .success(function(data){
                data = $(data).find("span");

                _this.Cache = {"username": username,
                               "age": data.eq(0).text().split(" ").slice(2,4).join(" "),
                               "SCP": data.eq(1).text().split(" ")[1],
                               "CCP": data.eq(2).text().split(" ")[1],
                               "bio": data.eq(3).text()};

                _this.DisplayUserInforTooltip("");
            })
            .fail(function(){
                _this.DisplayUserInforTooltip("error");
            });
    },

    DisplayUserInforTooltip: function (type) {
        var html,
            transition = true,
            JqId = $("div#AVE_UserInfoTooltip");

        switch (type){
            case null:
            case "":
                html = this.Options.ContentFormat.Value
                            .replace("{$age}", this.Cache["age"])
                            .replace("{$SCP}", this.Cache["SCP"])
                            .replace("{$CCP}", this.Cache["CCP"])
                            .replace("{$bio}", this.Cache["bio"])
                            .replace("{$username}", this.Cache["username"]);
                break;
            case "loading":
                html = this.ContentWait;
                transition = false;
                break;
            case "error":
            default:
                html = this.ContentError;
        }

        JqId.html(html);
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    // AppendToPreferenceManager: { //Use to add custom input to the pref Manager
    //     html: function () {
    //         //var _this = AVE.Modules['DisplayUserBasicInfo'];
    //         var htmlStr = '';
    //         //Short description maybe?
    //         return htmlStr;
    //     },
    //     callback: function () {
    //     }
    // }
};
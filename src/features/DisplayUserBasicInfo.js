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
        ContentFormat: {
            Type: 'string',
            Value: "Member{@nbs}for{@nbs}{@age}{@nbs}, SCP:{@nbs}{@SCP}, CCP:{@nbs}{@CCP}<hr />\n{@bio}<hr />\n{@submissions} | {@comments} | {@PM(Send PM)}"
            //alt: Created{@nbs}{@age}{@nbs}ago<br />{@SCP}{@nbs}SCPs, {@CCP}{@nbs}CCPs<hr />\n{@bio}<hr />\n{@submissions} | {@comments} | {@PM(Send PM)}
        }
    },

    OriginalOptions: "",

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
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        this.RegExp_act = new RegExp(this.RegExp_str);

        if (this.Enabled) {
            this.Start();
        }
    },

    RegExp_str: "^(https?:\/\/)?(voat\.co)?\/u(ser)?\/([^\/#?=]+)$",
    RegExp_act: null,
    ContentWait: "Loading user info...",
    ContentError: "Could not find an account with that username.",
    Cache: {"username": ""},
    OverEl: [false, false],

    // ADD TO USERTAG or keep separated?
    // Find a way to recycle the jquery selector and not due it twice stupidly

    // Link this module in usertag. trigger this module with user list
    // Recycle regexp too
    Start: function () {
        this.ClearNativeListeners();
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("div#AVE_UserInfoTooltip").length > 0) {
            return;
        }

        $("body").append('<div id="AVE_UserInfoTooltip" style="display:none;position:absolute;z-index:1999;background:rgb(76,76,76);border-radius:5px; border:2px solid rgb(0,0,0);font-size:14px;font-family:Arial,sans-serif;line-height:16px;padding:8px 10px;overflow:hidden;color:rgb(255,255,255);"></div>');
    },

    Listeners: function () {
        var JqId = $("div#AVE_UserInfoTooltip"),
            _this = this;

        $("a:regex(href, " + this.RegExp_str + ")")
            .off()
            .on("mouseenter", function () {
                _this.OverEl[0] = true;

                var username;
                username = _this.RegExp_act.exec($(this).attr('href'));
                username = username[username.length - 1].toLowerCase();

                if (username === AVE.Utils.CurrUsername().toLowerCase()) {
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
                _this.OverEl[0] = false;
                if (_this.OverEl[1]){return;}
                JqId.stop().fadeOut(500);
            }
        );

        JqId.on("mouseenter", function () {
            _this.OverEl[1] = true;
            JqId.stop().fadeIn(0).show();
        }).on("mouseleave", function () {
            _this.OverEl[1] = false;
            if (_this.OverEl[0]){return;}
            JqId.stop().fadeOut(500);
        });
    },

    FetchUserInfoTooltip: function (username) {
        if (username.toLowerCase() === this.Cache["username"].toLowerCase()) {
            this.DisplayUserInforTooltip("");
            return;
        }
        var _this = this;

        $.ajax({url: "https://voat.co/ajaxhelpers/userinfo/" + username, cache: true})
            .success(function (data) {
                data = $(data).find("span");

                _this.Cache = {
                    "username": username,
                    "age": data.eq(0).text().split(" ").slice(2, 4).join(" "),
                    "SCP": data.eq(1).text().split(" ")[1],
                    "CCP": data.eq(2).text().split(" ")[1],
                    "bio": data.eq(3).text()
                };

                _this.DisplayUserInforTooltip("");
            })
            .fail(function () {
                _this.DisplayUserInforTooltip("error");
            });
    },

    DisplayUserInforTooltip: function (type) {
        var html,
            JqId = $("div#AVE_UserInfoTooltip");

        switch (type) {
            case null:
            case "":
                html = this.Options.ContentFormat.Value
                    .replace(/\{@age}/g, this.Cache["age"])
                    .replace(/\{@SCP}/g, this.Cache["SCP"])
                    .replace(/\{@CCP}/g, this.Cache["CCP"])
                    .replace(/\{@bio}/g, this.Cache["bio"])
                    .replace(/\{@username}/g, this.Cache["username"])
                    .replace(/\{@submissions}/g, "<a target='_blank' href='/user/"+this.Cache["username"]+"/submissions'>Submissions</a>")
                    .replace(/\{@comments}/g, "<a target='_blank' href='/user/"+this.Cache["username"]+"/comments'>Comments</a>")
                    .replace(/\{@PM\(([^)]*)\)}/g, "<a target='_blank' href='/messaging/compose?recipient="+this.Cache["username"]+"'>$1</a>")
                    .replace(/\{@nbs}/g, "&nbsp;");
                break;
            case "loading":
                html = this.ContentWait;
                break;
            case "error":
            default:
                html = this.ContentError;
        }

        JqId.html(html);
    },

    ClearNativeListeners: function () {
        // Get rid of voat's internal tooltip triggers
        if (unsafeWindow) {
            // unsafeWindow.$._data( unsafeWindow.$(".userinfo")[0], "events" );
            unsafeWindow.$(".author").off()
        } else if (window.wrappedJSObject) {
            window.wrappedJSObject.$(".author").off()
        } else {
            location.assign("javascript:$('.author').off();void(0)")
        }
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['DisplayUserBasicInfo'];
            var htmlStr = '';

            _this.AppendToPage();

            htmlStr += '<textarea style="display:inline;padding:0;letter-spacing:0.35px;width:480px;height:110px;" class="form-control" Module="' + _this.ID + '" id="ContentFormat">' + _this.Options.ContentFormat.Value + '</textarea>';
            htmlStr += "<br /> <strong>{@username}</strong>: account's username";
            htmlStr += ';  <strong>{@age}</strong>: account\'s age;';
            htmlStr += "<br /> <strong>{@SCP}</strong>: Submission Contribution Points";
            htmlStr += "; <strong>{@CCP}</strong>: Comment Contribution Points;";
            htmlStr += '<br /> <strong>{@bio}</strong>: profile bio';
            htmlStr += '; <strong>{@nbs}</strong>: non-breaking space.';
            htmlStr += '<br />Links to submissions <strong>{@submissions}</strong>, comments <strong>{@comments}</strong>, PM  <strong>{@PM(Send PM)}</strong>';
            htmlStr += '<br /> The tags will autocomplete, simply enter <strong>{@a</strong> for <strong>{@age}</strong>';

            htmlStr += '<div id="AVE_DisplayUserBasicInfo_Preview"></div>';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['DisplayUserBasicInfo'],
                JqId = $("div#AVE_UserInfoTooltip");

            // We don't want the tooltip fading out (see its mouseleave event callback)
            _this.OverEl[0] = true;

            $("textarea#ContentFormat[Module='" + _this.ID + "']")
                .on("keyup", this.populateUserInfoTooltip)
                .on("focus", this.populateUserInfoTooltip)
                .on("mouseup", function () {
                    $(this).focus();
                })
                .on("blur", function () {
                    JqId.hide();
                });
        },

        populateUserInfoTooltip: function (event) {
            var _this = AVE.Modules['DisplayUserBasicInfo'],
                JqId = $("div#AVE_UserInfoTooltip");

            // $(this) here only makes sense if called by one of the even triggers above
            var value = $(this).val();

            if (event.which !== 8){ // if the last key pressed is not backspace
                var pre_len_val = value.length;
                value = value.replace(/(\{@a)([^g]|$)/g, "{@age}$2")
                             .replace(/(\{@S)([^C]|$)/g, "{@SCP}$2")
                             .replace(/(\{@C)([^C]|$)/g, "{@CCP}$2")
                             .replace(/(\{@b)([^i]|$)/g, "{@bio}$2")
                             .replace(/(\{@n)([^b]|$)/g, "{@nbs}$2")
                             .replace(/(\{@u)([^s]|$)/g, "{@username}$2")
                             .replace(/(\{@s)([^u]|$)/g, "{@submissions}$2")
                             .replace(/(\{@c)([^o]|$)/g, "{@comments}$2")
                             .replace(/(\{@P)([^M]|$)/g, "{@PM(Send PM)}$2");
                var post_len_val = value.length;

                if (pre_len_val !== post_len_val){
                    var diff = post_len_val - pre_len_val;
                    var cursor_pos = $(this).get(0).selectionStart;
                    cursor_pos += diff;

                    $(this).val(value);
                    // We need to manually set the cursor position because setting the input's value puts the cursor at its very end
                    // Also we take into account the extra characters we added when repositioning the cursor
                    $(this).get(0).setSelectionRange(cursor_pos, cursor_pos);
                }
            }

            _this.Options.ContentFormat.Value = $(this).val();
            // Show the current user's info as an example, or Atko's if you are not logged-in.
            _this.FetchUserInfoTooltip(AVE.Utils.CurrUsername() || "Atko");

            // Will position itself below at a fixed x value if the textarea is too wide
            // Otherwise it will stick to the right side of the textarea element.
            var position = $(this).offset();
            position.top += $(this).outerWidth() > 480 ? $(this).outerHeight() : 0;
            position.left += $(this).outerWidth() > 480 ? 480 : $(this).outerWidth() + 5;

            JqId.css(position)
                .show();
        }
    }
};
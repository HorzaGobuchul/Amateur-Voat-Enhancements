AVE.Modules['UserTag'] = {
    ID: 'UserTag',
    Name: 'User tagging',
    Desc: 'Tag Voat users with custom labels.',
    Category: 'General',

    Index: 3,
    Enabled: false,

    Store: {},

    StorageName: "",
    usertags: {},
    style: "",
    html: "",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },
    //Possible issues with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance) {
        this.tag = tag.toString();
        this.colour = colour;
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.balance = (typeof balance === "number" ? balance : 0);
    },

    SavePref: function (POST) {
        var _this = AVE.Modules['UserTag'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['UserTag'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        Opt = JSON.parse(Opt);
        $.each(Opt, function (key, value) {
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.style = '\
div#UserTagBox{\
    background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
    ' + (AVE.Utils.CSSstyle == "dark" ? "" : "color: #707070;") + '\
    z-index: 1000 !important;\
    position:absolute;\
    left:0px;\
    top:0px;\
    border: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
    border-radius:3px;\
    width:280px;\
}\
div#UserTagHeader{\
    font-weight:bold;   \
    height:20px;\
    border-bottom: 2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
    padding-left:5px;\
}\
div#UserTagHeader > span#username{\
    display: inline-block;\
    width: 170px;\
    overflow: hidden;\
    vertical-align: middle;\
    text-overflow: ellipsis;\
}\
input.UserTagTextInput{\
    background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "333" : "FFF") + ';\
    border: 1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "000" : "D1D1D1") + ';\
    border-radius:2px;\
    height:20px;\
    padding-left:5px;\
}\
tr#ShowPreview > td > span#PreviewBox {\
    display: inline-block;\
    max-width: 130px;\
    overflow: hidden;\
    text-overflow: ellipsis;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';\
    border-radius:3px;\
}\
span.AVE_UserTag{\
    font-weight:bold;\
    cursor:pointer;\
    margin-left:4px;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "484848") + ';\
    color:#' + (AVE.Utils.CSSstyle == "dark" ? "FFF" : "000") + ';\
    border-radius:3px;font-size:10px;\
}\
span.AVE_UserTag:empty{\
    border:0px;\
    height: 14px;\
    width: 14px;\
    margin: 0px 0px -3px 4px;\
    /* SVG from Jquery Mobile Icons Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle == "dark" ? "ABABAB" : "BBB") + '%22%20d%3D%22M5%2C0H0v5l9%2C9l5-5L5%2C0z%20M3%2C4C2.447%2C4%2C2%2C3.553%2C2%2C3s0.447-1%2C1-1s1%2C0.447%2C1%2C1S3.553%2C4%2C3%2C4z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E");\
    background-repeat: no-repeat;\
    display: inline-block;\
}\
span.AVE_UserBalance{\
    padding: 0px 4px;font-size: 10px;\
}\
span.AVE_UserBalance:empty{\
    padding: 0px;\
}\
table#formTable{\
    border-collapse: separate;\
    border-spacing: 5px;\
    margin: 0 auto;\
    font-size:12px;\
}';
            this.html = '\
<div id="UserTagBox">\
    <div id="UserTagHeader">Set tag for <span id="username"></span><span style="margin-right:5px;float:right;"><a id="CloseTagWin" href="javascript:void(0)">Close</a></span></div>\
    <div id="UserTagBody">\
        <table id="formTable">\
            <tr id="SetTag">\
                <td>Tag</td>\
                <td style="width:10px;"></td>\
                <td>\
                    <input class="UserTagTextInput" type="text" value="" id="ChooseTag" style="width:130px;"/>\
                </td>\
            </tr>\
            <tr id="SetColour">\
                <td>Colour</td>\
                <td style="width:10px;"></td>\
                <td><input name="color" type="color" title="Click me!" id="ChooseColor" style="width:60px;" />\</td>\
            </tr>\
            <tr id="ShowPreview">\
                <td>Preview</td>\
                <td style="width:10px;"></td>\
                <td><span id="PreviewBox"></span></td>\
            </tr>\
            <tr id="SetIgnore">\
                <td>Ignore</td>\
                <td style="width:10px;"></td>\
                <td><input type="checkbox" id="ToggleIgnore" class="tagInput" /></td>\
            </tr>\
            <tr id="SetBalance">\
                <td>Vote balance</td>\
                <td style="width:10px;"></td>\
                <td><input style="width:80px;" class="UserTagTextInput" type="number" id="voteBalance" class="tagInput" value="0" step="1" />\
                <a href="javascript:void(0)" style="position: absolute;right: 5px;font-weight:bold;" id="SaveTag">Save</a>\
                </td>\
            </tr>\
        </table>\
    </div>\
</div>';
            this.StorageName = this.Store.Prefix + this.ID + "_Tags";
            //this.Store.DeleteValue(this.StorageName);

            this.usertags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        //Username in userpages
        //if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) >= 0) {
        //    name = $(".alert-title").text().split(" ")[3].replace(".", "").toLowerCase();
        //    tag = this.GetTag(name);
        //    Tag_html = '<span style="font-weight:bold;background-color:"' + tag.colour + ';border:1px solid #FFF;border-radius:3px;font-size:10px;" class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "+" : tag.tag) + '</span>';
        //    $(".alert-title").html("Profile overview for " + name + Tag_html + ".");
        //}
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        var _this = AVE.Modules['UserTag'];
        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if (!$(this).attr('href').match(sel)) { return true; } //useful?
            if ($(this).parent().find("span.AVE_UserTag").length > 0) { return true; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username

            if ($(this).attr('href').split("/")[2].toLowerCase() != name) { return true; } //don't add if this is a link whose label isn't the username

            tag = _this.GetTag(name) || new _this.UserTagObj("",  (AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"), false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "" : tag.tag) + '</span>';
            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "";
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '">[ ' + sign + tag.balance + ' ]</span>';
            } else {
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '"></span>';
            }
            $(Tag_html).insertAfter($(this));


            if (tag.tag) {
                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).parent().find(".AVE_UserTag").css("background-color", tag.colour);
                $(this).parent().find(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }

            if (AVE.Modules['IgnoreUsers'] && tag.ignored) {
                if ($.inArray(name, AVE.Modules['IgnoreUsers'].IgnoreList) == -1) {
                    AVE.Modules['IgnoreUsers'].IgnoreList.push(name);
                }
            }
        });

        if ($("#UserTagBox").length == 0) {
            $("<style></style>").appendTo("head").html(_this.style);
            $(_this.html).appendTo("body");
            $("#UserTagBox").hide();
        }
    },

    Listeners: function () {
        var _this = AVE.Modules['UserTag'];

        $(".AVE_UserTag").off("click");
        $(".AVE_UserTag").on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = _this.usertags[username];

            var position = $(this).offset();

            position.top += 20;
            $("#UserTagBox").css(position);
            $("#UserTagBox").show();

            $("div#UserTagHeader > span#username").text(username);

            $("tr#SetTag > td > input.UserTagTextInput").val(oldTag == "+" ? "" : oldTag);
            $("tr#ShowPreview > td > span#PreviewBox").text(oldTag == "+" ? "" : oldTag);

            if (usertag != undefined) {
                $("tr#SetColour > td > input#ChooseColor").val(usertag.colour);
                $("tr#SetColour > td > input#ChooseColor").change();
                if (usertag.ignored) { $("tr#SetIgnore > td > input#ToggleIgnore").prop('checked', "true"); }
                $("tr#SetBalance > td > input#voteBalance").val(usertag.balance);
            } else {
                $("tr#SetColour > td > input#ChooseColor").val((AVE.Utils.CSSstyle == "dark" ? "#d1d1d1" : "#e1fcff"));
                $("tr#SetColour > td > input#ChooseColor").change();
            }
            $("tr#SetTag > td > input.UserTagTextInput").focus();
            $("tr#SetTag > td > input.UserTagTextInput").select();
        });

        $("div[class*='midcol']").OnAttrChange(function (e) {//persistent with UpdateAfterLoadingMore?
            if (!e.oldValue || e.oldValue.split(" ").length != 2) { return true; }

            _this.ChangeVoteBalance(e.target, e.oldValue);
        });

        //Close button
        $("div#UserTagHeader > span > a#CloseTagWin").off("click");
        $("div#UserTagHeader > span > a#CloseTagWin").on("click", function () {
            $("#UserTagBox").hide();
        }),
        //Show in the preview box the tag
        $("tr#SetTag > td > input.UserTagTextInput").off('keyup');
        $("tr#SetTag > td > input.UserTagTextInput").on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
        $("tr#SetColour > td > input#ChooseColor").off('change');
        $("tr#SetColour > td > input#ChooseColor").on('change', function () {
            var r, g, b;
            var newColour = $(this).val();
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val());
            $("tr#ShowPreview > td > span#PreviewBox").css("color", AVE.Utils.GetBestFontColour(r, g, b));
        });
        //Saving tag
        $("tr#SetBalance > td > a#SaveTag").off("click")
        $("tr#SetBalance > td > a#SaveTag").on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                tag: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                colour: $("tr#SetColour > td > input#ChooseColor").val(),
                ignore: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                balance: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10),
            };

            if (isNaN(opt.balance)) { opt.balance = 0; }

            if (opt.tag.length == 0 && opt.ignore == false && opt.balance == 0) {
                _this.RemoveTag(opt.username);
            } else {
                _this.SetTag(opt);
            }

            _this.UpdateUserTag(opt);

            $("#UserTagBox").hide();
        });

        //If Enter/Return is pressed while the focus is on one of the two text input, we save the tag.
        $(document).off("keyup");
        $(document).on("keyup", function (e) {
            if (e.which == 13) {
                if ($(e.target).attr("class") == "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
            if (e.which == 27 && $("#UserTagBox").is(":visible")) {
                $("div#UserTagHeader > span > a#CloseTagWin").click();
                $("#UserTagBox").hide();
            }
        });
    },

    //Because the .click JQuery event triggered by the shortkeys in ShortKeys.js triggers an OnAttrChange with false mutation values (oldValue, attributeName),
    //      we use a second function that keypresses in ShortKeys.js can invoke directly.
    // Ten mimutes later it works perfectly well. Maybe, voat's current instability was to blame. I'm not changing it back, anyway...
    ChangeVoteBalance: function (target, oldValue) {
        var _this = AVE.Modules['UserTag'];

        //print("target: "+target);
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find(".AVE_UserTag").attr("id").toLowerCase();
        if (username == undefined) { return true; }

        var tag = _this.GetTag(username);
        var opt = { username: username, tag: tag.tag || '', colour: tag.colour || "#d1d1d1", ignore: tag.ignore || false, balance: tag.balance || 0 };

        //If the previous status was "unvoted"
        if (oldValue == "midcol unvoted") {
            if ($(target).hasClass('likes')) { opt.balance += 1; }
            else if ($(target).hasClass('dislikes')) { opt.balance -= 1; }
        }
        else {
            //If the previous status was "upvoted"
            if (oldValue == "midcol likes") {
                if ($(target).hasClass('unvoted')) { opt.balance -= 1; }
                else if ($(target).hasClass('dislikes')) { opt.balance -= 2; }
            }
                //If the previous status was "downvoted"
            else if (oldValue == "midcol dislikes") {
                if ($(target).hasClass('likes')) { opt.balance += 2; }
                else if ($(target).hasClass('unvoted')) { opt.balance += 1; }
            }
        }

        _this.SetTag(opt);
        _this.UpdateUserTag(opt);
    },

    UpdateUserTag: function (tag) {
        var _this = AVE.Modules['UserTag'];
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {

            if (tag.tag != "") {
                $(this).text(tag.tag);

                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).css("background-color", tag.colour);
                $(this).css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }
            else {
                $(this).text("");
                $(this).removeAttr("style");
            }

            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "";
                $(this).parent().find("span.AVE_UserBalance").text('[ ' + sign + tag.balance + ' ]');
            } else {
                $(this).parent().find("span.AVE_UserBalance").text("");
            }
        });
    },

    RemoveTag: function (username) {
        var _this = AVE.Modules['UserTag'];
        delete _this.usertags[username];

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    SetTag: function (opt) {
        var _this = AVE.Modules['UserTag'];
        _this.usertags[opt.username] = new _this.UserTagObj(opt.tag, opt.colour, opt.ignore, opt.balance);

        _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.usertags));
    },

    GetTag: function (userName) {
        var _this = AVE.Modules['UserTag'];
        return _this.usertags[userName] || false;
    },

    GetTagCount: function () {
        return this.usertags.length;
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['UserTag'];
            if (_this.Enabled) {
                var TagLen = 0;
                var VoteLen = 0;
                var IgnoreLen = 0;
                var htmlStr = "";

                $.each(_this.usertags, function (key, value) {
                    if (value.tag.length > 0) { TagLen++; }
                    if (value.balance != 0) { VoteLen++; }
                    if (value.ignored == true) { IgnoreLen++; }
                });

                htmlStr += '<ul style="list-style:inside circle;"><li>You have tagged ' + TagLen + ' users.</li>';
                htmlStr += "<li>You have voted on submissions made by " + VoteLen + " users.</li>";
                htmlStr += "<li>You have chosen to ignore " + IgnoreLen + " users.</li></ul>";

                //Add option to remove oldest tags.
                //  Seeing as this.usertags is ordered oldest first, propose to remove X tags at the beginning of the list.
                return htmlStr;
            }
        },
        callback: function () {
        },
    },
};
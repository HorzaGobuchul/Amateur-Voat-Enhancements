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
            Value: true
        },
        VoteBalance: {
            Type: 'boolean',
            Desc: 'Track votes and display the vote balance next to usernames.',
            Value: true
        }
    },
    //Possible issues with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance) {
        this.tag = tag.toString();
        this.colour = colour;
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.balance = (typeof balance === "number" ? balance : 0);
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
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
    background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
    ' + (AVE.Utils.CSSstyle === "dark" ? "" : "color: #707070;") + '\
    z-index: 1000 !important;\
    position:absolute;\
    left:0px;\
    top:0px;\
    border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
    border-radius:3px;\
    width:280px;\
}\
div#UserTagHeader{\
    font-weight:bold;   \
    height:20px;\
    border-bottom: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
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
    background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';\
    border: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "D1D1D1") + ';\
    border-radius:2px;\
    height:20px;\
    padding-left:5px;\
}\
tr#ShowPreview > td > span#PreviewBox {\
    display: inline-block;\
    max-width: 130px;\
    overflow: hidden;\
    white-space: nowrap;\
    text-overflow: ellipsis;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "484848") + ';\
    border-radius:3px;\
}\
span.AVE_UserTag{\
    font-weight:bold;\
    cursor:pointer;\
    margin-left:4px;\
    padding: 0px 4px;\
    border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "484848") + ';\
    color:#' + (AVE.Utils.CSSstyle === "dark" ? "FFF" : "000") + ';\
    border-radius:3px;font-size:10px;\
}\
span.AVE_UserTag:empty{\
    border:0px;\
    height: 14px;\
    width: 14px;\
    margin: 0px 0px -3px 4px;\
    /* SVG from Jquery Mobile Icon Set */\
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "ABABAB" : "BBB") + '%22%20d%3D%22M5%2C0H0v5l9%2C9l5-5L5%2C0z%20M3%2C4C2.447%2C4%2C2%2C3.553%2C2%2C3s0.447-1%2C1-1s1%2C0.447%2C1%2C1S3.553%2C4%2C3%2C4z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E") !important;\
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
                <td><input name="color" type="color" title="Click me!" id="ChooseColor" style="width:60px;" /></td>\
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
        var _this = this;
        var Tag_html, name, tag;

        $("a[href^='/user/'],a[href^='/u/']").each(function () {
            if ($(this).next("span.AVE_UserTag").length > 0) { return true; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username

            if ($(this).attr('href').split("/")[2].toLowerCase() !== name) { return true; } //don't add if this is a link whose label isn't the username

            tag = _this.GetTag(name) || new _this.UserTagObj("",  (AVE.Utils.CSSstyle === "dark" ? "#d1d1d1" : "#e1fcff"), false, 0);

            Tag_html = '<span class="AVE_UserTag" id="' + name + '">' + (!tag.tag ? "" : tag.tag) + '</span>';
            if (_this.Options.VoteBalance.Value) {
                if (tag.balance !== 0) {
                    var sign = tag.balance > 0 ? "+" : "";
                    Tag_html += '<span class="AVE_UserBalance" id="' + name + '">[ ' + sign + tag.balance + ' ]</span>';
                } else {
                    Tag_html += '<span class="AVE_UserBalance" id="' + name + '"></span>';
                }
            }
            $(Tag_html).insertAfter($(this));


            if (tag.tag) {
                var r, g, b;
                var newColour = tag.colour;
                //from www.javascripter.net/faq/hextorgb.htm
                r = parseInt(newColour.substring(1, 3), 16);
                g = parseInt(newColour.substring(3, 5), 16);
                b = parseInt(newColour.substring(5, 7), 16);

                $(this).next(".AVE_UserTag").css("background-color", tag.colour);
                $(this).next(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(r, g, b));
            }

            if (AVE.Modules['IgnoreUsers'] && tag.ignored) {
                if ($.inArray(name, AVE.Modules['IgnoreUsers'].IgnoreList) === -1) {
                    AVE.Modules['IgnoreUsers'].IgnoreList.push(name);
                }
            }
        });

        if ($("#UserTagBox").length === 0) {
            AVE.Utils.AddStyle(_this.style);
            $(_this.html).appendTo("body");
            $("#UserTagBox").hide();
        }
    },

    obsVoteChange: null,

    Listeners: function () {
        var _this = this;
        var JqId1, JqId2;

        JqId1 = $("tr#SetTag > td > input.UserTagTextInput");
        JqId2 = $("tr#SetColour > td > input#ChooseColor");
        $(".AVE_UserTag").off("click")
                         .on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = _this.usertags[username];

            var position = $(this).offset();

            position.top += 20;
            $("#UserTagBox").css(position)
                            .show();

            $("div#UserTagHeader > span#username").text(username);

            JqId1.val(oldTag === "+" ? "" : oldTag);
            $("tr#ShowPreview > td > span#PreviewBox").text(oldTag === "+" ? "" : oldTag);
            if (usertag !== undefined) {
                JqId2.val(usertag.colour);
                JqId2.change();
                if (usertag.ignored) { $("tr#SetIgnore > td > input#ToggleIgnore").prop('checked', "true"); }
                $("tr#SetBalance > td > input#voteBalance").val(usertag.balance);
            } else {
                JqId2.val((AVE.Utils.CSSstyle === "dark" ? "#d1d1d1" : "#e1fcff"));
                JqId2.change();
            }
            JqId1.focus();
            JqId1.select();
        });
        

        if (_this.Options.VoteBalance.Value) {
            if (_this.obsVoteChange) { _this.obsVoteChange.disconnect(); }
            _this.obsVoteChange = new OnAttrChange($("div[class*='midcol']"), function (e) {
                if (!e.oldValue || e.oldValue.split(" ").length !== 2) { return true; }
                _this.ChangeVoteBalance(e.target, e.oldValue);
            });
            this.obsVoteChange.observe();
        }

        //Close button
        $("div#UserTagHeader > span > a#CloseTagWin")
            .off("click")
            .on("click",
            function () {
                $("#UserTagBox").hide();
        });
        //Show in the preview box the tag
        JqId1.off('keyup')
             .on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
        JqId2.off('change')
             .on('change', function () {
            var r, g, b;
            var newColour = $(this).val();
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val())
                                                      .css("color", AVE.Utils.GetBestFontColour(r, g, b));
        });
        //Saving tag
        $("tr#SetBalance > td > a#SaveTag").off("click")
                                           .on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                tag: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                colour: $("tr#SetColour > td > input#ChooseColor").val(),
                ignore: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                balance: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10)
            };

            if (isNaN(opt.balance)) { opt.balance = 0; }

            if (opt.tag.length === 0 && opt.ignore === false && opt.balance === 0) {
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
            if (e.which === 13) {
                if ($(e.target).attr("class") === "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
            if (e.which === 27 && $("#UserTagBox").is(":visible")) {
                $("div#UserTagHeader > span > a#CloseTagWin").click();
                $("#UserTagBox").hide();
            }
        });
    },

    //Because the .click JQuery event triggered by the shortkeys in ShortKeys.js triggers an OnAttrChange with false mutation values (oldValue, attributeName),
    //      we use a second function that keypresses in ShortKeys.js can invoke directly.
    // Ten mimutes later it works perfectly well. Maybe, voat's current instability was to blame. I'm not changing it back, anyway...
    ChangeVoteBalance: function (target, oldValue) {
        //print("target: "+target); 
        //print("oldvalue: "+oldValue);
        //print("newvalue: "+$(target).attr('class'));

        var username = $(target).parent().find("p.tagline").find(".AVE_UserTag:first");
        if (!username) { return true; } //If we couldn't find a username in the tagline that means this is
        username = username.attr("id").toLowerCase();
        if (!username) { return true; }

        var tag = this.GetTag(username);
        var opt = { username: username, tag: tag.tag || '', colour: tag.colour || "#d1d1d1", ignore: tag.ignore || false, balance: tag.balance || 0 };

        //If the previous status was "unvoted"
        if (oldValue === "midcol unvoted") {
            if ($(target).hasClass('likes')) { opt.balance += 1; }
            else if ($(target).hasClass('dislikes')) { opt.balance -= 1; }
        }
        else {
            //If the previous status was "upvoted"
            if (oldValue === "midcol likes") {
                if ($(target).hasClass('unvoted')) { opt.balance -= 1; }
                else if ($(target).hasClass('dislikes')) { opt.balance -= 2; }
            }
                //If the previous status was "downvoted"
            else if (oldValue === "midcol dislikes") {
                if ($(target).hasClass('likes')) { opt.balance += 2; }
                else if ($(target).hasClass('unvoted')) { opt.balance += 1; }
            }
        }
        
        this.SetTag(opt);
        this.UpdateUserTag(opt);
    },

    UpdateUserTag: function (tag) {
        var _this = this;
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {

            if (tag.tag !== "") {
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

            if (_this.Options.VoteBalance.Value) {
                if (tag.balance !== 0) {
                    var sign = tag.balance > 0 ? "+" : "";
                    $(this).nextAll("span.AVE_UserBalance:first").text('[ ' + sign + tag.balance + ' ]');
                } else {
                    $(this).nextAll("span.AVE_UserBalance:first").text("");
                }
            }
        });
    },

    RemoveTag: function (username) {
        delete this.usertags[username];

        this.Store.SetValue(this.StorageName, JSON.stringify(this.usertags));
    },

    SetTag: function (opt) {
        this.usertags[opt.username] = new this.UserTagObj(opt.tag, opt.colour, opt.ignore, opt.balance);

        this.Store.SetValue(this.StorageName, JSON.stringify(this.usertags));
    },

    GetTag: function (userName) {
        return this.usertags[userName] || false;
    },

    GetTagCount: function () {
        return this.usertags.length;
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['UserTag'];
            if (_this.Enabled) {
                var TagLen = 0, VoteLen = 0, IgnoreLen = 0;
                var htmlStr = "";

                $.each(_this.usertags, function (key, value) {
                    if (value.tag.length > 0) { TagLen++; }
                    if (value.balance !== 0) { VoteLen++; }
                    if (value.ignored === true) { IgnoreLen++; }
                });

                htmlStr += '<ul style="list-style:inside circle;"><li>You have tagged ' + TagLen + ' users.</li>';
                htmlStr += "<li>You have voted on submissions made by " + VoteLen + " users.</li>";
                htmlStr += "<li>You have chosen to ignore " + IgnoreLen + " users.</li></ul>";

                htmlStr += '<br /><input id="VoteBalance" ' + (_this.Options.VoteBalance.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="VoteBalance"> ' + _this.Options.VoteBalance.Desc + '</label><br />';
                //Add option to remove oldest tags.
                //  Seeing as this.usertags is ordered oldest first, propose to remove X tags at the beginning of the list.
                return htmlStr;
            }
        }
    },
    
    AppendToDashboard: {
        tableCSS: '',
        initialized: false,
        module: {},
        usertags: [],

        //implement quick storage for these values?
        tagsperpage: 20,
        currpage: 0,

        CSSselector: "",

        MouseOverColours: [],

        init: function () {
            this.tableCSS = '\
                table#AVE_Dashboard_usertags_table{\
                    width: 100%;\
                }\
                table#AVE_Dashboard_usertags_table > thead > tr {\
                    font-size: 14px;\
                    padding-bottom: 10px;\
                    margin-bottom: 10px;\
                }\
                table#AVE_Dashboard_usertags_table > thead > tr > th{\
                    text-align: center;\
                    font-weight: bold;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr:hover {\
                    background-color: '+(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9")+';\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td{\
                    padding-top: 5px;\
                    border-top : 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    text-align: center;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:first-child{\
                    font-weight: bold;\
                    text-align: left;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:nth-child(2){\
                    text-align: left;\
                    max-width: 150px;\
                    overflow: hidden;\
                    text-overflow: ellipsis;\
                    white-space: nowrap;\
                }\
                table#AVE_Dashboard_usertags_table > tbody > tr > td:last-child{\
                    border-left : 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    font-weight: bold;\
                    color: red;\
                    cursor: pointer;\
                }\
                a#AVE_Dashboard_navigate_tags[role]{\
                    margin: 0px 5px 10px 0px;\
                }';
            AVE.Utils.AddStyle(this.tableCSS);

            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9");
            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#534040" : "#FFC9C9");

            this.module = AVE.Modules['UserTag'];

            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";

            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Empty container
            this.usertags = [];


            var _this, tempObj, tempUsertags, keys, htmlStr;
            _this = this;
            htmlStr = "";

            AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
            tempUsertags = JSON.parse(this.module.Store.GetValue(this.module.StorageName, "{}"));
            keys = Object.keys(tempUsertags);
            keys.sort();

            //Remove all tags (prompt confirm)
            //Add a list of tags in JSON format (accept as long as the tag property exists)
            //Search function (by name, tag, colour, ignored, vote balance (< and >)
            //  Process _this.usertags to keep only usertags matching the search
            //  Paging function returning this.paging(0, this.tagsperpage);
            //Order by: username, tag, ignored, votebalance (username default and secondary always)
            //Paging function (default)

            $.each(keys, function (idx, key) {

                tempObj = tempUsertags[key];
                if (tempObj.tag.length === 0 && tempObj.ignored === false) { return true; } //Don't show empty tags

                tempObj.name = key;
                tempObj.ignored = tempObj.ignored ? "Yes" : "No";
                _this.usertags.push( JSON.stringify( tempObj ) );

            });

            var start  = this.currpage*this.tagsperpage;

            var htmlNavButtons = "";
            htmlNavButtons += '<div style="float: left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="first" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">First</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: left;">' +
                            '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="prev" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">Previous</a>' +
                        '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="last" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.usertags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Last</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="next" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.usertags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Next</a>' +
                '</div>';

            htmlStr += htmlNavButtons;

            var htmlTable = "";
            htmlTable += '<table id="AVE_Dashboard_usertags_table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th>Username</th>' +
                                    '<th>Tag</th>' +
                                    '<th>Colour</th>' +
                                    '<th>Ignored</th>' +
                                    '<th>Vote balance</th>' +
                                    '<th>Preview</th>' +
                                    '<th>Remove</th>' +
                                '</tr>' +
                            '</thead>';
            htmlTable +=    this.paging(start, this.tagsperpage);
            htmlTable += "</table>";

            htmlStr += htmlTable;

            htmlStr += '<div style="text-align: right;margin-bottom:10px;">Showing tags '+ (start+1)+' to '+ Math.min(this.usertags.length, start+this.tagsperpage) +' (total: '+this.usertags.length+')</div>';

            htmlStr += htmlNavButtons;

            return htmlStr;
        },
        callback: function () {
            "use strict";
            var _this = this;
            $('table#AVE_Dashboard_usertags_table > tbody > tr > td:last-child')
                .off()
                .on("mouseover", function () {
                    $(this).parent().css("background", _this.MouseOverColours[1]);
                })
                .on("mouseleave", function () {
                    $(this).parent().css("background", "");
                });
            $('a#AVE_Dashboard_navigate_tags')
                .off()
                .on("click", function () {
                    if ($(this).hasClass("btn-unsub")){return false;}

                    switch ($(this).attr('role')) {
                        case "prev":
                            _this.currpage--;
                            break;
                        case "next":
                            _this.currpage++;
                            break;
                        case "first":
                            _this.currpage = 0;
                            break;
                        case "last":
                            _this.currpage = Math.ceil((_this.usertags.length - _this.tagsperpage) / _this.tagsperpage);
                            break;
                        default:
                            return;
                    }

                    $(_this.CSSselector).trigger("click");
                });
            $(document)
                .off()
                .on("keyup", function (event) {
                    var ctrl, pos;
                    ctrl= event.ctrlKey;

                    if (event.which === 37){
                        pos = (ctrl ? "first" : "prev");
                    } else if (event.which === 39){
                        pos = (ctrl ? "last" : "next");
                    }
                    $('a#AVE_Dashboard_navigate_tags[role="'+ pos +'"]:first').trigger("click");

                });
        },

        paging: function (start, nb) {
            var colour, r, g, b;

            var htmlStr = "";
            var obj = {};

            for (i=start; i <= start+nb-1; i++){
                if (i >= this.usertags.length){break;}

                obj = JSON.parse(this.usertags[i]);

                htmlStr += "<tr>";

                colour = AVE.Utils.GetRGBvalues(obj.colour);
                r = colour[0], g = colour[1], b = colour[2];

                //click value to edit it
                //click X at the end of line to remove it (prompt comfirm)
                htmlStr +=  '<td><a href="/user/'+obj.name+'" >'+obj.name+'</a></td>' +
                            '<td><span title="'+obj.tag+'">'+obj.tag+'</span></td>' +
                            '<td style="background-color:'+obj.colour+'; color:'+AVE.Utils.GetBestFontColour(r, g, b)+';">'+obj.colour+'</td>' +
                            '<td>'+obj.ignored+'</td>' +
                            '<td>'+obj.balance+'</td>' +
                            '<td><span username="'+obj.name+'" id="AVE_Dashboard_usertag_td_preview" ></span></td>' +
                            '<td>X</td>';

                htmlStr += "</tr>";
            }
            return htmlStr;
        }
    }
};
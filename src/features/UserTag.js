AVE.Modules['UserTag'] = {
    ID: 'UserTag',
    Name: 'User tagging',
    Desc: 'Tag Voat users with custom labels.',
    Category: 'General',

    Index: 3,
    Enabled: false,

    Store: {},

    StorageName: "",
    usertags: "",
    style: "",
    html: "",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },
    //Issue with the fact that the username in the profil overview is in lower case
    UserTagObj: function (tag, colour, ignored, balance) {
        this.tag = tag.toString();
        this.colour = colour;
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.balance = (typeof balance === "number" ? (!isNaN(balance) ? balance : 0) : 0);
    },

    SavePref: function (POST) {
        var self = AVE.Modules['UserTag'];

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
            this.style = '\
div#UserTagBox{\
    background-color: #333;\
    z-index: 1000 !important;\
    position:absolute;\
    left:0px;\
    top:0px;\
    border: 2px solid black;\
    border-radius:3px;\
    width:280px;\
}\
div#UserTagHeader{\
    font-weight:bold;   \
    height:20px;\
    border-bottom: 2px solid black;\
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
    background-color:#292929;\
    border: 1px solid black;\
    border-radius:2px;\
    height:20px;\
    padding-left:5px;\
}\
tr#ShowPreview > td > span#PreviewBox {\
    display: inline-block;\
    max-width: 130px;\
    overflow: hidden;\
    vertical-align: middle;\
    text-overflow: ellipsis;\
    padding-left:4px;\
    padding-right:4px;\
    border:1px solid gray;\
    border-radius:4px;\
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
                <td><input name="color" type="color" title="Click me!" id="ChooseColor" value="#303030" style="width:60px;" />\</td>\
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
            this.usertags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        //Username in userpages
        if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) >= 0) {
            name = $(".alert-title").text().split(" ")[3].replace(".", "").toLowerCase();
            tag = this.GetTag(name);
            Tag_html = '<span style="background-color:"' + tag.colour + ';border:1px solid gray;border-radius:4px" class="GM_UserTag" id="' + name + '">' + (!tag.tag ? "+" : tag.tag) + '</span>';
            $(".alert-title").html("Profile overview for " + name + Tag_html + ".");
        }
    },

    Update: function () {
        this.Start();
    },

    AppendToPage: function () {
        var self = AVE.Modules['UserTag'];
        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if (!$(this).attr('href').match(sel)) { return true; } //useful?
            //if ($(this).parent().find("span.AVE_UserTag").length > 0) { return; } //don't add if it already exists
            if ($(this).parents("div#header-account").length > 0) { return true; } //don't add if it the userpage link in the account header
            //if ($(this).attr('href').split("/")[2].toLowerCase() != name) { return true; } //don't add if this is a link whose label isn't the username

            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username
            tag = self.GetTag(name);
            if (tag == false) {
                return true;
            }

            Tag_html = '<span class="AVE_UserTag" id="' + name + '" style="cursor:pointer;margin-left:4px;padding: 0px 4px;border:1px solid gray;border-radius:4px;">' + (!tag.tag ? "+" : tag.tag) + '</span>';
            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "";
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '" style="padding: 0px 4px;font-size: 10px;">[ ' + sign + tag.balance + ' ]</span>';
            } else {
                Tag_html += '<span class="AVE_UserBalance" id="' + name + '" style="padding: 0px 4px;font-size: 10px;"></span>';
            }
            $(Tag_html).insertAfter($(this));

            var r, g, b;
            var newColour = tag.colour;
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $(this).parent().find(".AVE_UserTag").css("background-color", tag.colour);
            $(this).parent().find(".AVE_UserTag").css("color", AVE.Utils.GetBestFontColour(r, g, b));
        });

        $("<style></style>").appendTo("head").html(self.style);
        $(self.html).appendTo("body");
        $("#UserTagBox").hide();

        //Close button
        $("div#UserTagHeader > span > a#CloseTagWin").on("click", function () {
            $("#UserTagBox").hide();
        }),
        //Show in the preview box the tag
        $("tr#SetTag > td > input.UserTagTextInput").on('keyup', function () {
            $("tr#ShowPreview > td > span#PreviewBox").text($(this).val());
        });
        //Show in the preview box the colour chosen and change the font-colour accordingly
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
        $("tr#SetBalance > td > a#SaveTag").on("click", function () {
            var opt = {
                username: $("div#UserTagHeader > span#username").text(),
                tag: $("tr#SetTag > td > input.UserTagTextInput").val(),//.replace(/[:,]/g, "-")
                colour: $("tr#SetColour > td > input#ChooseColor").val(),
                ignore: $("tr#SetIgnore > td > input#ToggleIgnore").get(0).checked,
                balance: parseInt($("tr#SetBalance > td > input#voteBalance").val(), 10),
            };

            if (isNaN(opt.balance)) { opt.balance = 0;}

            if (opt.tag.length > 0) {
                self.SetTag(opt);
            }
            else if (opt.tag.length == 0) {
                self.RemoveTag(opt.username);
                opt.tag = "+";
            }

            self.UpdateUserTag(opt);

            ; $("#UserTagBox").hide();
        });

        //If Enter/Return is pressed while the focus is on one of the two text input, we save the tag.
        $(document).on("keyup", function (e) {
            if (e.which == 13) {
                if ($(e.target).attr("class") == "UserTagTextInput") {
                    $("tr#SetBalance > td > a#SaveTag").click();
                }
            }
        });
    },

    Listeners: function () {
        var self = AVE.Modules['UserTag'];

        $(".AVE_UserTag").off("click");
        $(".AVE_UserTag").on("click", function () {
            var username = $(this).attr("id").toLowerCase();
            var oldTag = $(this).text();

            var usertag = self.usertags[username];

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
            }
            $("tr#SetTag > td > input.UserTagTextInput").focus();
            $("tr#SetTag > td > input.UserTagTextInput").select();
        });
    },

    UpdateUserTag: function (tag) {
        $("span[class*='AVE_UserTag'][id*='" + tag.username + "']").each(function () {
            $(this).text(tag.tag);

            var r, g, b;
            var newColour = tag.colour;
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);
            $(this).css("background-color", tag.colour);
            $(this).css("color", AVE.Utils.GetBestFontColour(r, g, b));

            if (tag.balance != 0) {
                var sign = tag.balance > 0 ? "+" : "-";
                $(this).parent().find("span.AVE_UserBalance").text('[ ' + sign + tag.balance + ' ]');
            } else {
                $(this).parent().find("span.AVE_UserBalance").text("");
            }
        });
    },

    RemoveTag: function (opt) {
        var self = AVE.Modules['UserTag'];
        delete self.usertags[opt.username];

        self.Store.SetValue(self.StorageName, JSON.stringify(self.usertags));
    },

    SetTag: function (opt) {
        var self = AVE.Modules['UserTag'];
        self.usertags[opt.username] = new self.UserTagObj(opt.tag, opt.colour, opt.ignore, opt.balance);

        self.Store.SetValue(self.StorageName, JSON.stringify(self.usertags));
    },

    GetTag: function (userName) {
        var self = AVE.Modules['UserTag'];
        return self.usertags[userName] || false;
    },

    GetTagCount: function () {
        return this.usertags.length;
    },
};
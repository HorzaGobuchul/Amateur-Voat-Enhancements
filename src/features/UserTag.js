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

    UserTagObj: function (username, tag, colour, ignored, voteWeight) {
        this.username = username.toString();
        this.tag = tag.toString();
        this.colour = colour || "#FFF";
        this.ignored = (typeof ignored === "boolean" ? ignored : false);
        this.voteWeight = (typeof voteWeight === "integer" ? voteWeight : 0);
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
                <td><input style="width:80px;" class="UserTagTextInput" type="number" id="ToggleIgnore" class="tagInput" value="0" step="1" />\
                <a href="javascript:void(0)" style="position: absolute;right: 5px;font-weight:bold;" id="SaveTag">Save</a>\
                </td>\
            </tr>\
        </table>\
    </div>\
</div>';
            this.StorageName = this.Store.Prefix + this.ID + "_Tags";
            this.usertags = this.Store.GetValue(this.StorageName, "");
            //OLD StorageName: "Voat_Tags"
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        //var a = new this.UserTagObj("aa", "bb", "#000", false, 10);

        //Username in userpages
        if ($.inArray(AVE.Utils.currentPageType, ["user", "user-comments", "user-submissions"]) >= 0) {
            name = $(".alert-title").text().split(" ")[3].replace(".", "").toLowerCase();
            tag = GetTag(name);
            Tag_html = '<span class="GM_UserTag" id="' + name + '" style="' + this.style + '">' + (!tag ? "+" : tag) + '</span>';
            $(".alert-title").html("Profile overview for " + name + Tag_html + ".");
        }
    },

    Update: function () {
        this.Start();
    },

    AppendToPage: function () {
        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if ($(this).parent().find("span.GM_UserTag").length > 0) { return; }
            if (!$(this).attr('href').match(sel)) return true;
            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username
            if ($(this).attr('href').split("/")[2].toLowerCase() != name) return true;

            tag = this.GetTag(name);
            Tag_html = '<span class="GM_UserTag" id="' + name + '" style="' + style + '">' + (!tag ? "+" : tag) + '</span>';
            $(Tag_html).insertAfter($(this));
        });

        $("<style></style>").appendTo("head").html(this.style);
        $(this.html).appendTo("body");
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
            var r,g,b;
            var newColour = $(this).val();
            //from www.javascripter.net/faq/hextorgb.htm
            r = parseInt(newColour.substring(1, 3), 16);
            g = parseInt(newColour.substring(3, 5), 16);
            b = parseInt(newColour.substring(5, 7), 16);

            $("tr#ShowPreview > td > span#PreviewBox").css("background-color", $(this).val());
            $("tr#ShowPreview > td > span#PreviewBox").css("color", AVE.Utils.GetBestFontColour(r,g,b));
        });
    },

    Listeners: function () {
        var SetTag = this.SetTag;
        var UpdateTag = this.UpdateTag;
        var RemoveTag = this.RemoveTag;
        var UpdateUserTag = this.UpdateUserTag;

        $(".GM_UserTag").on("click", function (event) {
            var username = $(this).attr("id");
            var oldTag = $(this).text();
            //var newTag = prompt("Tag for " + username, oldTag !== "+" ? oldTag : "").replace(/[:,]/g, "-") || "";
            
            $("div#UserTagHeader > span#username").text(username);

            var position = $(this).offset();
            position.top += 20;
            $("#UserTagBox").css(position);
            $("#UserTagBox").show();
            //if tag exist insert it
            //Same for color, ignore and vote balance
            //  Else: insert default values

            //if (newTag.length > 0) {
            //    if (oldTag !== "+") {
            //        UpdateTag(username, newTag);
            //    } else {
            //        SetTag(username, newTag);
            //    }
            //}
            //else if (newTag.length == 0) {
            //    if (oldTag != "+") {
            //        RemoveTag(username);
            //    }
            //    newTag = "+";
            //}
            //$(this).text(newTag);
            //UpdateUserTag(username, newTag);

            //event.stopPropagation();
        });
    },


    UpdateUserTag: function (name, tag) {
        $("span[class*='GM_UserTag'][id*='" + name + "']").each(function () {
            $(this).text(tag);
        });
    },

    //this.usertags is now an array of tag object
    // {username : UserTagObj}, {username : UserTagObj}
    //https://stackoverflow.com/questions/9273157/javascript-how-to-get-index-of-an-object-in-an-associative-array
    //$.each(_map, function(key, value) {
    //});

    RemoveTag: function (userName) {
        var self = AVE.Modules['UserTag'];
        userName = userName.toLowerCase();
        var usertags = self.usertags.split(",");
        var idx = usertags.indexOf(userName + ":" + GetTag(userName));
        if (idx < 0) {
            alert("AVE: RemoveTag -> couldn't find user " + userName + ".");
            return true;
        }
        usertags.splice(idx, 1); //remove()

        self.usertags = usertags.join(",");
        self.Store.SetValue(self.StorageName, this.usertags);
    },

    UpdateTag: function (userName, tag) {
        var self = AVE.Modules['UserTag'];
        var usertags = self.usertags.split(",");
        var user;
        var found = false;
        for (var idx in usertags) {
            user = AVE.Utils.regExpTag.exec(usertags[idx]);
            if (user == null) continue;
            if (userName.toLowerCase() == user[1].toLowerCase()) {
                usertags[idx] = userName + ":" + tag;
                found = true;
                break;
            }
        }
        if (!found) {
            alert("AVE: UpdateTag -> user " + userName + " couldn't be found in the database");
            return;
        }

        self.usertags = usertags.join(",");
        self.Store.SetValue(self.StorageName, self.usertags);
    },

    SetTag: function (userName, tag) { // new this.UserTagObj();
        var self = AVE.Modules['UserTag'];
        var usertags = self.usertags.split(",");

        self.usertags = usertags + "," + userName + ":" + tag;
        self.Store.SetValue(self.StorageName, self.usertags);
    },

    GetTag: function (userName) {
        var self = AVE.Modules['UserTag'];
        var usertags = self.usertags.split(",");
        var user = "";
        for (var idx in usertags) {
            user = AVE.Utils.regExpTag.exec(usertags[idx]);
            if (user == null) continue;

            if (userName.toLowerCase() == user[1].toLowerCase()) {
                return user[2];
            }
        }
        return false
    },

    GetTagCount: function () {
        return usertags.split(",").length;
    },
};
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
            this.style = "border:1px solid #" + (AVE.Utils.CSSstyle == "dark" ? "5452A8" : "D1D0FE") + ";background-color:#" + (AVE.Utils.CSSstyle == "dark" ? "304757" : "F4FCFF") + ";font-size:10px;padding:0px 4px;color:#6CA9E4;font-weight:bold;margin-left:4px;cursor: pointer;";
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
        //alert(typeof a);

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
        style = this.style;
        GetTag = this.GetTag;

        var Tag_html, name, tag;
        //All mention of an username as a link.
        var sel = /\/user\/[^/]*\/?$/i;

        $("a[href*='/user/']").each(function () {
            if ($(this).parent().find("span.GM_UserTag").length > 0) { return; }
            if (!$(this).attr('href').match(sel)) return true;
            name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username
            if ($(this).attr('href').split("/")[2].toLowerCase() != name) return true;

            tag = GetTag(name);
            Tag_html = '<span class="GM_UserTag" id="' + name + '" style="' + style + '">' + (!tag ? "+" : tag) + '</span>';
            $(Tag_html).insertAfter($(this));
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
            var newTag = prompt("Tag for " + username, oldTag !== "+" ? oldTag : "").replace(/[:,]/g, "-") || "";
            if (newTag.length > 0) {
                if (oldTag !== "+") {
                    UpdateTag(username, newTag);
                } else {
                    SetTag(username, newTag);
                }
            }
            else if (newTag.length == 0) {
                if (oldTag != "+") {
                    RemoveTag(username);
                }
                newTag = "+";
            }
            $(this).text(newTag);
            UpdateUserTag(username, newTag);

            event.stopPropagation();
        });
    },


    UpdateUserTag: function (name, tag) {
        $("span[class*='GM_UserTag'][id*='" + name + "']").each(function () {
            $(this).text(tag);
        });
    },

    RemoveTag: function (userName) {
        var self = AVE.Modules['UserTag'];
        userName = userName.toLowerCase();
        var usertags = self.usertags.split(",");
        var idx = usertags.indexOf(userName + ":" + GetTag(userName));
        if (idx < 0) {
            alert("AVE: RemoveTag -> couldn't find user " + userName + ".");
            return true;
        }
        usertags.splice(idx, 1);

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
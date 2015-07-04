AVE.Modules['SelectPost'] = {
    ID: 'SelectPost',
    Name: 'Select posts',
    Desc: 'A click selects/highlights a post.',
    Category: 'Posts',

    Enabled: false,

    Store: AVE.storage,

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        ContentColour: {
            Type: 'array',
            Value: ['#323E47', '#F4FCFF'],
        },
        QuoteCodeColour: {
            Type: 'array',
            Value: ['#394856', '#EAFEFF'],
        },
        VoteCountBoxColour: {
            Type: 'array',
            Value: ['#2D4A60', '#E1F9FF'],
        },
        ContextColour: {
            Type: 'array',
            Value: ['background-color: #482C2C !important; border: 1px solid #A23E3E !important;',
                    'background-color: #D5F0FF !important; border: 1px solid #4B96C4 !important;'],
        },
    },

    OriginalOptions: {}, //For reset function

    SavePref: function (POST) {
        var self = AVE.Modules['SelectPost'];
        POST = POST[self.ID];
        var colours = ["ContentColour", "QuoteCodeColour", "VoteCountBoxColour", "ContextColour"];
        $.each(colours, function (index, value) {
            self.Options[value].Value[AVE.Utils.CSSstyle == "dark" ? 0 : 1] = POST[value];
        });
        self.Options.Enabled.Value = POST.Enabled;

        self.Store.SetValue(self.Store.Prefix + self.ID, JSON.stringify(self.Options));
    },

    ResetPref: function(){
        var self = AVE.Modules['SelectPost'];
        self.Options = JSON.parse(self.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var self = AVE.Modules['SelectPost'];
        var Opt = self.Store.GetValue(self.Store.Prefix + self.ID);

        if (Opt !== null) {
            self.Options = JSON.parse(Opt);
        }

        self.Enabled = self.Options.Enabled.Value;
    },

    Load: function () {
        this.OriginalOptions = JSON.stringify(this.Options);
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
        this.Start();
    },

    Listeners: function () {
        var self = AVE.Modules['SelectPost'];
        $(".entry").off("click");
        $(".entry").on("click", function () {
            self.ToggleSelectedState($(this));
        });
    },
    
    ToggleSelectedState: function (obj) {
        var style = (AVE.Utils.CSSstyle == "dark" ? 0 : 1);
        self = AVE.Modules['SelectPost'];
        if (AVE.Utils.SelectedPost != undefined) {
            AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").css('background-color', '');
            AVE.Utils.SelectedPost.find("blockquote").css('background-color', '');
            AVE.Utils.SelectedPost.find("pre").css('background-color', '');

            if (AVE.Utils.currentPageType == "user-submissions") {
                AVE.Utils.SelectedPost.parent().find(".submission.even.link.self").css('background-color', '');
                AVE.Utils.SelectedPost.parent().css('background-color', '');
                AVE.Utils.SelectedPost.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', '');
            }
            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("highlightedComment"))
            { AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").attr('style', ''); }

            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("submission"))
            { AVE.Utils.SelectedPost.find(".md").css('background-color', ''); }
        }

        obj.parents("div[class*=' id-']:first").css('background-color', self.Options.ContentColour.Value[style]);
        obj.find("blockquote").css('background-color', self.Options.QuoteCodeColour.Value[style]);
        obj.find("pre").css('background-color', self.Options.QuoteCodeColour.Value[style]);

        //Special case: user/username/submissions
        if (AVE.Utils.currentPageType == "user-submissions") {
            obj.parent().find(".submission.even.link.self").css('background-color', self.Options.ContentColour.Value[style]);
            obj.parent().css('background-color', self.Options.ContentColour.Value[style]);
            obj.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', self.Options.VoteCountBoxColour.Value[style]);
        }
        //Special case: highlighted comment
        if (obj.parents("div[class*=' id-']:first").hasClass("highlightedComment")) {
            obj.parents("div[class*=' id-']:first").attr('style', self.Options.ContextColour.Value[style]);
        }
        //Special: is a submission post, not a comment.
        if (obj.parents("div[class*=' id-']:first").hasClass("submission"))
        { obj.find(".md").css('background-color', self.Options.QuoteCodeColour.Value[style]); }

        AVE.Utils.SelectedPost = obj;
    },

    AppendToPreferenceManager: {
        html: function () {
            var style = AVE.Utils.CSSstyle == "dark" ? 0 : 1;
            var self = AVE.Modules['SelectPost'];
            var htmlStr = "";
            htmlStr += "<div>Background colours (" + AVE.Utils.CSSstyle + " theme):</div>"
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContentColour"></div>';
            htmlStr += ' <input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + self.ID + '" id="ContentColour" Value="' + self.Options.ContentColour.Value[style] + '"/> - Post<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_QuoteCodeColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + self.ID + '" id="QuoteCodeColour" Value="' + self.Options.QuoteCodeColour.Value[style] + '"/> - Quote and Code<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_VoteCountBoxColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + self.ID + '" id="VoteCountBoxColour" Value="' + self.Options.VoteCountBoxColour.Value[style] + '"/> - Vote box in submissions page<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContextColour"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:340px;padding:0px;" class="form-control" type="text" Module="' + self.ID + '" id="ContextColour" Value="' + self.Options.ContextColour.Value[style] + '"/> - Context comment<br />';
            return htmlStr;
        },
        callback: function () {//ContentColour QuoteCodeColour VoteCountBoxColour ContextColour
            var self = AVE.Modules['SelectPost'];
            $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + self.ID + "']").val());
            $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + self.ID + "']").val());
            $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + self.ID + "']").val());
            $("div#Demo_ContextColour").attr("style", $("div#Demo_ContextColour").attr("style") + $("input[id='ContextColour'][Module='" + self.ID + "']").val());

            $("input[id='ContentColour'][Module='" + self.ID + "']").on("keyup", function () {
                $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + self.ID + "']").val());
            });
            $("input[id='QuoteCodeColour'][Module='" + self.ID + "']").on("keyup", function () {
                $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + self.ID + "']").val());
            });
            $("input[id='VoteCountBoxColour'][Module='" + self.ID + "']").on("keyup", function () {
                $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + self.ID + "']").val());
            });
            $("input[id='ContextColour'][Module='" + self.ID + "']").on("keyup", function () {
                $("div#Demo_ContextColour").attr("style", "display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" + $("input[id='ContextColour'][Module='" + self.ID + "']").val());
            });

        },
    },
};
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
        var _this = AVE.Modules['SelectPost'];
        var colours = ["ContentColour", "QuoteCodeColour", "VoteCountBoxColour", "ContextColour"];
        POST = POST[_this.ID];

        $.each(colours, function (index, value) {
            _this.Options[value].Value[AVE.Utils.CSSstyle == "dark" ? 0 : 1] = POST[value];
        });
        _this.Options.Enabled.Value = POST.Enabled;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(_this.Options));
    },

    ResetPref: function(){
        var _this = AVE.Modules['SelectPost'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['SelectPost'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID);

        if (Opt != undefined) {
            _this.Options = JSON.parse(Opt);
        }

        _this.Enabled = _this.Options.Enabled.Value;
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
        if (this.Enabled) {
            this.Start();
        }
    },

    Listeners: function () {
        var _this = AVE.Modules['SelectPost'];
        $("div[class*='id-']:has(div.entry)").off("click");
        $("div[class*='id-']:has(div.entry)").on("click", function (event) {
            _this.ToggleSelectedState($(this).find(".entry:first"));
            event.stopPropagation();
        });
    },
    
    ToggleSelectedState: function (obj) {
        var style = (AVE.Utils.CSSstyle == "dark" ? 0 : 1);
        _this = AVE.Modules['SelectPost'];
        if (AVE.Utils.SelectedPost != undefined) {
            AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").css('background-color', '');
            AVE.Utils.SelectedPost.find("blockquote").css('background-color', '');
            AVE.Utils.SelectedPost.find("pre").css('background-color', '');

            if (AVE.Utils.currentPageType == "user-submissions") {
                AVE.Utils.SelectedPost.parent().find(".submission.even.link._this").css('background-color', '');
                AVE.Utils.SelectedPost.parent().css('background-color', '');
                AVE.Utils.SelectedPost.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', '');
            }
            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("highlightedComment"))
            { AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").attr('style', ''); }

            if (AVE.Utils.SelectedPost.parents("div[class*=' id-']:first").hasClass("submission"))
            { AVE.Utils.SelectedPost.find(".md").css('background-color', ''); }
        }

        obj.parents("div[class*=' id-']:first").css('background-color', _this.Options.ContentColour.Value[style]);
        obj.find("blockquote").css('background-color', _this.Options.QuoteCodeColour.Value[style]);
        obj.find("pre").css('background-color', _this.Options.QuoteCodeColour.Value[style]);

        //Special case: user/username/submissions
        if (AVE.Utils.currentPageType == "user-submissions") {
            obj.parent().find(".submission.even.link._this").css('background-color', _this.Options.ContentColour.Value[style]);
            obj.parent().css('background-color', _this.Options.ContentColour.Value[style]);
            obj.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', _this.Options.VoteCountBoxColour.Value[style]);
        }
        //Special case: highlighted comment
        if (obj.parents("div[class*=' id-']:first").hasClass("highlightedComment")) {
            obj.parents("div[class*=' id-']:first").attr('style', _this.Options.ContextColour.Value[style]);
        }
        //Special: is a submission post, not a comment.
        if (obj.parents("div[class*=' id-']:first").hasClass("submission"))
        { obj.find(".md").css('background-color', _this.Options.QuoteCodeColour.Value[style]); }

        AVE.Utils.SelectedPost = obj;
    },

    AppendToPreferenceManager: {
        html: function () {
            var style = AVE.Utils.CSSstyle == "dark" ? 0 : 1;
            var _this = AVE.Modules['SelectPost'];
            var htmlStr = "";
            htmlStr += "<div>Background colours (" + AVE.Utils.CSSstyle + " theme):</div>"
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContentColour"></div>';
            htmlStr += ' <input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContentColour" Value="' + _this.Options.ContentColour.Value[style] + '"/> - Post<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_QuoteCodeColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="QuoteCodeColour" Value="' + _this.Options.QuoteCodeColour.Value[style] + '"/> - Quote and Code<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_VoteCountBoxColour"></div>';
            htmlStr += '<input style="display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="VoteCountBoxColour" Value="' + _this.Options.VoteCountBoxColour.Value[style] + '"/> - Vote box in submissions page<br />';
            htmlStr += '<div style="display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" id="Demo_ContextColour"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:340px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="ContextColour" Value="' + _this.Options.ContextColour.Value[style] + '"/> - Context comment<br />';
            return htmlStr;
        },
        callback: function () {//ContentColour QuoteCodeColour VoteCountBoxColour ContextColour
            var _this = AVE.Modules['SelectPost'];
            $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").val());
            $("div#Demo_ContextColour").attr("style", $("div#Demo_ContextColour").attr("style") + $("input[id='ContextColour'][Module='" + _this.ID + "']").val());

            $("input[id='ContentColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContentColour").css("background-color", $("input[id='ContentColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_QuoteCodeColour").css("background-color", $("input[id='QuoteCodeColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_VoteCountBoxColour").css("background-color", $("input[id='VoteCountBoxColour'][Module='" + _this.ID + "']").val());
            });
            $("input[id='ContextColour'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_ContextColour").attr("style", "display:inline;padding-left:15x;padding-right:15px;margin-right:10px;" + $("input[id='ContextColour'][Module='" + _this.ID + "']").val());
            });

        },
    },
};
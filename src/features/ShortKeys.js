AVE.Modules['ShortcutKeys'] = {
    ID: 'ShortcutKeys',
    Name: 'Shortcut keys',
    Desc: 'Use your keyboard to navigate Voat.',
    Category: 'Posts',

    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        OpenInNewTab: {
            Type: 'boolean',
            Desc: 'Open comments and link pages in new tabs.',
            Value: true,
        },
        UpvoteKey: {
            Type: 'char',
            Value: 'a',
        },
        DownvoteKey: {
            Type: 'char',
            Value: 'z',
        },
        NextKey: {
            Type: 'char',
            Value: 'j',
        },
        PrevKey: {
            Type: 'char',
            Value: 'k',
        },
        OpenCommentsKey: {
            Type: 'char',
            Value: 'c',
        },
        OpenLinkKey: {
            Type: 'char',
            Value: 'l',
        },
        OpenLCKey: {
            Type: 'char',
            Value: 'b',
        },
        ExpandKey: {
            Type: 'char',
            Value: 'x',
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ShortcutKeys'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ShortcutKeys'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (!AVE.Modules['SelectPost'] || !AVE.Modules['SelectPost'].Enabled) { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;

        var up = this.Options.UpvoteKey.Value;
        var down = this.Options.DownvoteKey.Value;
        var next = this.Options.NextKey.Value;
        var previous = this.Options.PrevKey.Value;
        var OpenC = this.Options.OpenCommentsKey.Value;
        var OpenL = this.Options.OpenLinkKey.Value;
        var OpenLC = this.Options.OpenLCKey.Value;
        var Expand = this.Options.ExpandKey.Value;

        $(document).keydown(function (event) {
            //Exit if there is no post currently selected
            if (!AVE.Utils.SelectedPost) { return; }
            //Exit if the focus is given to a text input
            if ($(":input").is(":focus")) { return; }
            //Exit if a key modifier is pressed (ctrl, shift)
            if (event.ctrlKey || event.shiftKey) { return; }

            var sel = AVE.Utils.SelectedPost;

            if (event.key == undefined) { //Chrome
                var key = String.fromCharCode(event.keyCode).toUpperCase();
            } else {
                var key = event.key.toUpperCase();
            }

            if (key == up.toUpperCase()) { // upvote
                sel.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
            } else if (key == down.toUpperCase()) { // downvote
                sel.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
            } else if (key == next.toUpperCase()) { // next post
                if (sel.parent().hasClass("submission")) {
                    //Submissions
                    var _next = sel.parent().nextAll("div.submission[class*='id-']:first");
                    if (_next.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(_next.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    } else if (AVE.Modules['NeverEndingVoat'] && AVE.Modules['NeverEndingVoat'].Enabled) {
                        //If the NeverEnding modules exists and is enabled, we load the next page.
                        AVE.Modules['NeverEndingVoat'].LoadMore();
                    }
                } else {
                    //Comment
                    var id = sel.parent().prop("class").split(" ")[1];
                    // :visible because comments could be hidden, with the ToggleChildComment module
                    var a = sel.parent().find("div[class*='id-']:visible").get(0) || //Child
                            $("div." + id + " ~ div[class*='id-']:visible").get(0); //Sibling

                    if (!a) { //Not a direct parent
                        var tempSel = sel.parent();
                        var tempID = id;
                        var count = 0;
                        while (!a) {
                            tempSel = $(tempSel.parent("div[class*='id-']").get(0) ||
                                      $("div." + tempID + " ~ div[class*='id-']:visible").get(0));
                            if (tempSel.length == 0) { break; }

                            if (tempSel.nextAll("div[class*='id-']:visible:last").length > 0) {
                                tempID = tempSel.nextAll("div[class*='id-']:visible:last").attr("class").split(" ")[1];
                            }
                            if (tempID != id) {
                                a = $("div." + tempSel.nextAll("div[class*='id-']:visible:first").attr("class").split(" ")[1]);
                                break;
                            }
                            count++;
                            if (count > 30) { print("AVE: breaking endless loop > looking for next comment"); break; }
                        }
                    }

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    } else { $("a#loadmorebutton").click(); }
                }

            } else if (key == previous.toUpperCase()) { // previous post
                if (sel.parent().hasClass("submission")) { // select by page type not class
                    //Submissions
                    var prev = sel.parent().prev("div.submission[class*='id-']");
                    if (prev.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(prev.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    }
                } else {
                    //Comment
                    var id = sel.parent().prop("class").split(" ")[1];

                    var a = sel.parent().prevAll("div[class*='id-']:visible:first").find("div[class*='id-']:visible:last").get(0) || //Parent's child
                            sel.parent().prevAll("div[class*='id-']:visible:first").get(0) || //Sibling
                            sel.parent().parent("div[class*='id-']:visible").get(0); //Parent

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    }
                    //if (!a) No previous comment
                }

            } else if (key == OpenC.toUpperCase()) { // Open comment page
                if (!sel.parent().hasClass("submission")) { return; }
                if (_this.Options.OpenInNewTab.Value) {
                    GM_openInTab("https://" + window.location.hostname + sel.find("a.comments").attr("href"));
                } else {
                    window.location.href = "https://" + window.location.hostname + sel.find("a.comments").attr("href");
                }
            } else if (key == OpenL.toUpperCase()) { // Open link page
                if (!sel.parent().hasClass("submission")) { return; }
                var url = sel.find("a.title").attr("href");

                if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

                if (_this.Options.OpenInNewTab.Value) {
                    GM_openInTab(url);
                } else {
                    window.location.href = url;
                }
            } else if (key == OpenLC.toUpperCase()) { // Open comment and link pages
                if (!sel.parent().hasClass("submission")) { return; }
                var url = [];

                url.push(sel.find("a.title").attr("href"));
                url.push("https://" + window.location.hostname + sel.find("a.comments").attr("href"));

                if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

                if (url[0] && url[0] == url[1]) {
                    GM_openInTab(url[0]);
                } else {
                    GM_openInTab(url[0]);
                    GM_openInTab(url[1]);
                }
            } else if (key == Expand.toUpperCase()) { // Expand media/self-text
                if (!sel.parent().hasClass("submission")) { return; }
                sel.find("div.expando-button").click();
            }
        });
    },

    ScrollToSelectedSubmission: function () {
        $('html, body').finish();
        //Scroll to selected item if out of screen
        if ($(window).scrollTop() > AVE.Utils.SelectedPost.parent().offset().top - AVE.Utils.SelectedPost.parent().height()) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
        } else if ($(window).scrollTop() + $(window).height() < AVE.Utils.SelectedPost.parent().offset().top + AVE.Utils.SelectedPost.parent().height() + 50) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - $(window).height() + AVE.Utils.SelectedPost.parent().height() + 50 }, 150);
        }
    },

    ScrollToSelectedComment: function () {
        $('html, body').finish();
        //Scroll to selected item if out of screen
        if ($(window).scrollTop() > AVE.Utils.SelectedPost.parent().offset().top - AVE.Utils.SelectedPost.height()) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
        } else if ($(window).scrollTop() + $(window).height() < AVE.Utils.SelectedPost.parent().offset().top + AVE.Utils.SelectedPost.height() + 50) {
            $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - $(window).height() + AVE.Utils.SelectedPost.height() + 50 }, 150);
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ShortcutKeys'];
            var htmlStr = "";
            //Up and Down vote
            htmlStr += '<table id="AVE_ShortcutKeys" style="text-align: right;">';
            htmlStr += '<tr>';
            htmlStr += '<td>Upvote: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Downvote: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"></input></td>';
            //Next and previous post
            htmlStr += '<td>&nbsp; Next post: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="NextKey" value="' + _this.Options.NextKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Previous post: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="PrevKey" value="' + _this.Options.PrevKey.Value + '"></input></td>';
            htmlStr += '</tr>';
            //Open Link, Comments, Comments & Link
            htmlStr += '<tr>';
            htmlStr += '<td>Open Link: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenLinkKey" value="' + _this.Options.OpenLinkKey.Value + '"></input></td>';
            htmlStr += '<td>&nbsp; Open comments: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenCommentsKey" value="' + _this.Options.OpenCommentsKey.Value + '"></input>';
            htmlStr += '<td>&nbsp; Open L&C: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="OpenLCKey" value="' + _this.Options.OpenLCKey.Value + '"></input></td>';
            //Toggle expand media
            htmlStr += '<td>&nbsp; Toggle expand: <input maxlength="1" style="display:inline;width:25px;padding:0px;text-align:center;" size="1" class="form-control" type="text" id="ExpandKey" value="' + _this.Options.ExpandKey.Value + '"></input>';
            htmlStr += '</tr>';
            htmlStr += '</table>';
            htmlStr += '<input id="OpenInNewTab" ' + (_this.Options.OpenInNewTab.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInNewTab"> ' + _this.Options.OpenInNewTab.Desc + '</label><br />';
            return htmlStr;
        },
    },
};
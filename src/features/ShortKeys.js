AVE.Modules['ShortKeys'] = {
    ID: 'ShortKeys',
    Name: 'Shortcut keys',
    Desc: 'Use your keyboard to navigate Voat. Leave field empty for Enter/Return key.',
    Category: 'Posts',

    Enabled: false,
    Index: 20,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        OpenInNewTab: {
            Type: 'boolean',
            Desc: 'Open comments and link pages in new tabs.',
            Value: true
        },
        OpenInArchive: {
            Type: 'boolean',
            Desc: 'Open link page in <strong>archives.is</strong>.',
            Value: false
        },
        UpvoteKey: {
            Type: 'char',
            Value: 'a'
        },
        DownvoteKey: {
            Type: 'char',
            Value: 'z'
        },
        NextKey: {
            Type: 'char',
            Value: 'j'
        },
        PrevKey: {
            Type: 'char',
            Value: 'k'
        },
        OpenCommentsKey: {
            Type: 'char',
            Value: 'c'
        },
        OpenLinkKey: {
            Type: 'char',
            Value: 'l'
        },
        OpenLCKey: {
            Type: 'char',
            Value: 'b'
        },
        ExpandKey: {
            Type: 'char',
            Value: 'x'
        },
        ToggleCommentChain: {
            Type: 'char',
            Value: ''
        },
        NavigateTop: {
            Type: 'char',
            Value: 'f'
        },
        NavigateBottom: {
            Type: 'char',
            Value: 'v'
        },
        HidePost: {
            Type: 'char',
            Value: 'h'
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
    },

    ResetPref: function () {
        this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        this.Enabled = this.Options.Enabled.Value;
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

        var shift, ctrl,
            up = this.Options.UpvoteKey.Value,
            down = this.Options.DownvoteKey.Value,
            next = this.Options.NextKey.Value,
            previous = this.Options.PrevKey.Value,
            OpenC = this.Options.OpenCommentsKey.Value,
            OpenL = this.Options.OpenLinkKey.Value,
            OpenLC = this.Options.OpenLCKey.Value,
            Expand = this.Options.ExpandKey.Value,
            TCC = this.Options.ToggleCommentChain.Value,
            NavTop = this.Options.NavigateTop.Value,
            NavBottom = this.Options.NavigateBottom.Value,
            HidePost = this.Options.HidePost.Value;

        $(document).keydown(function (event) {
            shift = event.shiftKey;
            ctrl = event.ctrlKey;

            //Exit if the CSSEditor panel has the focus
            if ($("style#custom_css.AVE_custom_css_editable").is(":focus")){return;}

            //Exit if the focus is given to a text input
            if ($(":input").is(":focus")) {
                if (ctrl && event.which === 13){
                    var inp = $("textarea#Content.commenttextarea:focus");
                    if (inp.length === 0){return;}

                    var submitbtn = inp.nextAll("input#submitbutton:first"); //
                    if (submitbtn.length === 0){
                        submitbtn = inp.parent().parent().nextAll("input#submitbutton:first");
                    }
                    submitbtn.trigger("click");
                }
                return;
            }

            //Exit if a key modifier is pressed (ctrl, shift)
            if (ctrl || shift) { return; }

            var sel = AVE.Utils.SelectedPost;
            var key;

            if (event.key === undefined) { //Chrome
                key = String.fromCharCode(event.keyCode).toUpperCase();
            } else {
                key = event.key.toUpperCase();
            }

            if (event.which === 13) { key = ""; } //Enter/Return key

            if (key === NavTop.toUpperCase()) { // Navigate to the top of the page
                //Scroll to top
                //Set first post as selected
                var obj = $("div.submission[class*='id']:first,div.comment[class*='id']:first").first();
                if (AVE.Modules['SelectPost']) { AVE.Modules['SelectPost'].ToggleSelectedState(obj.find(".entry:first")); }
                $(window).scrollTop(0);
            } else if (key === NavBottom.toUpperCase()) { // Navigate to the bottom of the page
                //Scroll to bottom
                $(window).scrollTop($(document).height());
                //Set last post as selected
                var obj = $("div.comment[class*='id']:last");
                if (obj.length === 0) { obj = $("div.submission[class*='id']:last"); }
                if (AVE.Modules['SelectPost']) { AVE.Modules['SelectPost'].ToggleSelectedState(obj.find(".entry:first")); }
            }

            //All following keys need a post selected to work
            if (!AVE.Utils.SelectedPost) {  return; }

            if (key === up.toUpperCase()) { // upvote
                sel.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
            } else if (key === down.toUpperCase()) { // downvote
                sel.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
            } else if (key === next.toUpperCase()) { // next post
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
                            if (tempSel.length === 0) { break; }

                            if (tempSel.nextAll("div[class*='id-']:visible:last").length > 0) {
                                tempID = tempSel.nextAll("div[class*='id-']:visible:last").attr("class").split(" ")[1];
                            }
                            if (tempID !== id) {
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

            } else if (key === previous.toUpperCase()) { // previous post
                if (sel.parent().hasClass("submission")) { // select by page type not class
                    //Submissions
                    var prev = sel.parent().prevAll("div.submission[class*='id-']:first");
                    if (prev.length > 0) {
                        AVE.Modules['SelectPost'].ToggleSelectedState(prev.find("div.entry"));
                        _this.ScrollToSelectedSubmission();
                    }
                } else {
                    //Comment
                    //var id = sel.parent().prop("class").split(" ")[1];

                    var a = sel.parent().prevAll("div[class*='id-']:visible:first").find("div[class*='id-']:visible:last").get(0) || //Parent's child
                            sel.parent().prevAll("div[class*='id-']:visible:first").get(0) || //Sibling
                            sel.parent().parent("div[class*='id-']:visible").get(0); //Parent

                    if (a) {
                        AVE.Modules['SelectPost'].ToggleSelectedState($(a).find("div.entry:first"));
                        _this.ScrollToSelectedComment();
                    }
                    //if (!a) No previous comment
                }

            } else if (key === OpenC.toUpperCase()) { // Open comment page
                if (!sel.parent().hasClass("submission")) { return; }

                var url = "https://" + window.location.hostname +sel.find("a.comments").attr("href");
                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                } else {
                    window.location.href = url;
                }
            } else if (key === OpenL.toUpperCase()) { // Open link page
                if (!sel.parent().hasClass("submission")) { return; }
                var url = sel.find("a.title").attr("href");

                if (!/^http/.test(url)) { url = "https://" + window.location.hostname + url; }

                if (_this.Options.OpenInArchive.Value && !/^https?:\/\/archive\.is/.test(url)){
                    url = 'https://archive.is/?run=1&url='+encodeURIComponent(url);
                }

                if (_this.Options.OpenInNewTab.Value) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url });
                } else {
                    window.location.href = url;
                }
            } else if (key === OpenLC.toUpperCase()) { // Open comment and link pages
                if (!sel.parent().hasClass("submission")) { return; }
                var url = [];

                url.push(sel.find("a.title").attr("href"));
                url.push("https://" + window.location.hostname + sel.find("a.comments").attr("href"));

                if (!/^http/.test(url[0])) { url[0] = "https://" + window.location.hostname + url[0]; }

                if (url[0] && url[0] === url[1]) {
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                } else {
                    if (_this.Options.OpenInArchive.Value && !/^https?:\/\/archive\.is/.test(url[0])){
                        url[0] = 'https://archive.is/?run=1&url='+encodeURIComponent(url[0]);
                    }
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[0] });
                    AVE.Utils.SendMessage({ request: "OpenInTab", url: url[1] });
                }
            } else if (key === Expand.toUpperCase()) { // Expand media/self-text
                var expand, media;
                if ( sel.parent().hasClass("submission")) {
                    //In submissions
                    if (AVE.Utils.currentPageType === "thread" && sel.parent().hasClass("self")){
                        expand = true;
                        media = sel.find("div.md:visible").find("a[title]");

                        media.each(function () {
                            //Expand is false if at least one of the media is expanded
                            if ($(this).next(".link-expando:visible").length > 0)
                            { expand = false; return false; }
                        });

                        media.each(function () {
                            if ($(this).find("span.link-expando-type").length > 0
                                && expand !== $(this).next(".link-expando:visible").length > 0)
                            { this.click(); }
                        });
                    } else {
                        sel.find("div.expando-button").click();
                    }
                } else {
                    //In comments
                    expand = true;
                    media = sel.find("div.md:visible").find("a[title]");

                    media.each(function () {
                        //Expand is false if at least one of the media is expanded
                        if ($(this).next(".link-expando:visible").length > 0)
                        { expand = false; return false; }
                        });

                    media.each(function () {
                        if ($(this).find("span.link-expando-type").length > 0 
                            && expand !== $(this).next(".link-expando:visible").length > 0)
                        { this.click(); }
                        });
                }

                if (sel.offset().top < $(window).scrollTop() &&
                    sel.find("div.expando-button").hasClass("collapsed")){// and if it was expanded
                    $('html, body').animate({ scrollTop: AVE.Utils.SelectedPost.parent().offset().top - 50 }, 150);
                }
            } else if (key === TCC.toUpperCase()) { // Toggle comment chain or load more replies
                if (sel.parent().hasClass("submission")) { return; }

                if (sel.find("a.inline-loadcomments-btn:first").length > 0) {
                    //Load more comment if possible
                    sel.find("a.inline-loadcomments-btn:first")[0].click();
                } else if (sel.find('a.expand:visible:first').length > 0) {
                    //Hide selected comment otherwise
                    sel.find('a.expand:visible:first')[0].click();
                }
            } else if (key === HidePost.toUpperCase()) { // Hide submission
                if (!AVE.Modules['HideSubmissions'] || !AVE.Modules['HideSubmissions'].Enabled){
                    if(!confirm("You are trying to hide a post but the module \"HideSubmissions\" is disabled.\nDo you want to activate and load this module?")){
                        return;
                    } else {
                        var Opt = JSON.parse(_this.Store.GetValue(_this.Store.Prefix + AVE.Modules['HideSubmissions'].ID, "{}"));
                        Opt.Enabled = true;
                        _this.Store.SetValue(_this.Store.Prefix + AVE.Modules['HideSubmissions'].ID, JSON.stringify(Opt));
                        AVE.Modules['HideSubmissions'].Load();
                        print("AVE: DomainFilter > enabled and started");
                    }
                }
                var id = sel.parent().attr("data-fullname");

                //Select the next submission
                var _next = sel.parent().nextAll("div.submission[class*='id-']:first");
                if (_next.length > 0) {
                    AVE.Modules['SelectPost'].ToggleSelectedState(_next.find("div.entry"));
                    _this.ScrollToSelectedSubmission();
                } else if (AVE.Modules['NeverEndingVoat'] && AVE.Modules['NeverEndingVoat'].Enabled) {
                    //If the NeverEnding modules exists and is enabled, we load the next page.
                    AVE.Modules['NeverEndingVoat'].LoadMore();
                }

                AVE.Modules['HideSubmissions'].AddToHiddenList(id);
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
            var _this = AVE.Modules['ShortKeys'];
            var htmlStr = "";
            //Up and Down vote
            htmlStr += '<table id="AVE_ShortcutKeys" style="text-align: right;">';
            htmlStr += '<tr>';
            htmlStr += '<td>Upvote: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="UpvoteKey" value="' + _this.Options.UpvoteKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Downvote: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="DownvoteKey" value="' + _this.Options.DownvoteKey.Value + '"/></td>';
            //Next and previous post
            htmlStr += '<td>&nbsp; Next post: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NextKey" value="' + _this.Options.NextKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Previous post: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="PrevKey" value="' + _this.Options.PrevKey.Value + '"/></td>';
            htmlStr += '</tr>';
            //Open Link, Comments, Comments & Link
            htmlStr += '<tr>';
            htmlStr += '<td>Open Link: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenLinkKey" value="' + _this.Options.OpenLinkKey.Value + '"/></td>';
            htmlStr += '<td>&nbsp; Open comments: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenCommentsKey" value="' + _this.Options.OpenCommentsKey.Value + '"/>';
            htmlStr += '<td>&nbsp; Open L&C: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="OpenLCKey" value="' + _this.Options.OpenLCKey.Value + '"/></td>';
            //Toggle expand media
            htmlStr += '<td>&nbsp; Toggle expand: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="ExpandKey" value="' + _this.Options.ExpandKey.Value + '"/>';
            htmlStr += '</tr>';
            //Toggle expand comment
            htmlStr += '<tr>';
            htmlStr += '<td>&nbsp; <span title="Toggle comment chain or load more replies">Toggle comment</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="ToggleCommentChain" value="' + _this.Options.ToggleCommentChain.Value + '"/>';
            //Navigate to Top and Bottom of the page
            htmlStr += '<td>&nbsp; <span title="Navigate to the top of the page">Top of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NavigateTop" value="' + _this.Options.NavigateTop.Value + '"/>';
            htmlStr += '<td>&nbsp; <span title="Navigate to the bottom of the page">Bottom of the page</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="NavigateBottom" value="' + _this.Options.NavigateBottom.Value + '"/></td>';
            //Hide submission
            htmlStr += '<td>&nbsp; <span title="This feaure requires the module HideSubmission to be enabled!">Hide post</span>: <input maxlength="1" style="display:inline;width:25px;padding:0;text-align:center;" size="1" class="form-control" type="text" id="HidePost" value="' + _this.Options.HidePost.Value + '"/></td>';
            htmlStr += '</tr>';

            htmlStr += '</table>';
            htmlStr += '<input id="OpenInNewTab" ' + (_this.Options.OpenInNewTab.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInNewTab"> ' + _this.Options.OpenInNewTab.Desc + '</label><br>';
            htmlStr += '<input id="OpenInArchive" ' + (_this.Options.OpenInArchive.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="OpenInArchive"> ' + _this.Options.OpenInArchive.Desc + '</label><br>';
            return htmlStr;
        },

        callback: function () {

        }
    }
};
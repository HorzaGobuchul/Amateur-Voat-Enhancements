AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse voat as one page, loading more posts when you hit the bottom.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    RunAt: 'load',

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        AutoLoad: {
            Type: 'boolean',
            Desc: 'If checked, scroll to load more content. Click the "load more" button to load the next page otherwise.',
            Value: true
        },
        ExpandSubmissionBlock: {
            Type: 'boolean',
            Desc: 'Expand the new submission posts over the empty sidebar\'s space',
            Value: true
        },
        DisplayDuplicates: {
            Type: 'boolean',
            Desc: 'Display duplicate submissions (greyed).',
            Value: true
        },
        ExpandNewMedia: {
            Type: 'boolean',
            Desc: 'Expand media in inserted pages, if you already clicked the \"View Media\" button.',
            Value: false
        },
    },

    OriginalOptions: "",

    NSFWlink: false,

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "user-comments", "user-submissions"]) === -1 ||
            $("div.pagination-container").find("li.btn-whoaverse-paging").length === 0) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.SepStyle = 'background-color:#' + (AVE.Utils.CSSstyle === "dark" ? "5C5C5C" : "F6F6F6") + ';height:20px;text-align:center;border:1px dashed #' + (AVE.Utils.CSSstyle === "dark" ? "111" : "BCBCBC") + ';border-radius:3px;padding:2px 0px;margin:4px 0px;';
            this.Start();
        }
    },

    Labels: ["Load more",
             "Sit tight...",
             "Sorry, I couldn't find more content.",
             "Something went wrong. Maybe try again?",
             "An error occured. No point in trying again right now I'm afraid."],
    PostsIDs: [],
    SepStyle: '',
    currentPage: 0,

    Start: function () {
        var _this = this;
        $("div.submission[class*='id-']").each(function () {
            _this.PostsIDs.push($(this).attr("data-fullname"));
        });

        this.currentPage = parseInt(AVE.Utils.POSTinfo["page"]) || 0;

        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("a#AVE_loadmorebutton").length === 0 && $("div.pagination-container").find("li.btn-whoaverse-paging").length > 0) {
            var LoadBtn = '<a href="javascript:void(0)" style="margin: 5px 0px;" class="btn-whoaverse btn-block" id="AVE_loadmorebutton">' + this.Labels[0] + '</a>';
            $("div.pagination-container").html(LoadBtn);
        }

        var sitetable = $("div.sitetable");
        var nsfwlink = $("div.sitetable > a[href='/randomnsfw']");
        if (nsfwlink.length > 0){
            $("<div id='AVE_randomlinks'></div>").appendTo(sitetable);
            sitetable.contents().slice(-5, -2).appendTo("div#AVE_randomlinks");
            this.NSFWlink = true;
        }
    },

    Listeners: function () {
        var _this = this;

        if (_this.Options.AutoLoad.Value) {
            $(window).scroll(function () {
                if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
                    _this.LoadMore();
                }
            });
        }

        $("a#AVE_loadmorebutton").on("click", function () { _this.LoadMore(); });
    },

    LoadMore: function () {
        //Don't load another page if one is already being loaded.
        if ($("a#AVE_loadmorebutton").text() === this.Labels[1]) { return false; }

        var _this = this;

        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") !== -1) {
            nextPageURL = nextPageURL.replace(/\?page=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://" + window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }

        $.each(AVE.Utils.POSTinfo, function (key, val) {
            if (key.toLowerCase() === "page"){return true;}
            nextPageURL +=  "&"+key+"="+val;
        });

        print('AVE: loading page > ' + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false,
        }).done(function (html) {
            var error = "sticky";
            var content = $(html).find("div[class*='id-'][data-downs][data-ups]");
            if (content.length === 0) { $("a#AVE_loadmorebutton").text(_this.Labels[4]); return false; } //catchall for error pages
            _this.currentPage++;
            //print($(html).find("div.submission[class*='id-']").length);

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") !== "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
                $("div.side").css("z-index", "100");
            }

            var sitetable = $("div.sitetable");
            if (sitetable.length === 0){ sitetable = $("div.content-no-margin");}
            sitetable.append('<div style="' + _this.SepStyle + '" id="AVE_page_' + (_this.currentPage) + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');

            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            var tempID;
            content.each(function () {
                tempID = $(this).attr("class").split(" ")[1];
                if ($.inArray(tempID, _this.PostsIDs) === -1) {
                    error = null;
                    _this.PostsIDs.push(tempID);
                    sitetable.append($(this));
                } else if (_this.Options.DisplayDuplicates.Value && !$(this).hasClass("stickied")) {
                    sitetable.append($(this));
                    $(this).css("opacity", "0.3");
                } else if (!$(this).hasClass("stickied")){
                    error = true;
                }
            });

            if (!error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[0]);
            } else if (error === "sticky") {
                //In a sub, a page with no content will still show the sticky.
                $("a#AVE_loadmorebutton").text(_this.Labels[2]);
                $("div.AVE_postSeparator#AVE_page_" + (_this.currentPage)).remove();
                _this.currentPage--;
                return;
            } if (error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[4]);
                print("AVE: oups error in NeverEndingVoat:LoadMore()");
                $("div.AVE_postSeparator#AVE_page_" + (_this.currentPage)).remove();
                _this.currentPage--;
                return;
            }

            // Update mail info
            _this.UpdateMailInfo($(html).find("span.notification-container > a#mail").attr("class"),
                $(html).find("span#mailcounter.notification-counter").text());
            _this.UpdateCPInfo($(html).find("a#scp.userkarma").text(),
                               $(html).find("a#ccp.userkarma").text());

            // Add expando links to the new submissions
            // from https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js#L163
            if (!window.wrappedJSObject || !window.wrappedJSObject.UI) { //Chrome
                location.assign("javascript:UI.ExpandoManager.execute();void(0)");
            } else {//Firefox, because it stopped working with the location hack above
                window.wrappedJSObject.UI.ExpandoManager.execute();
            }

            //Ugly, isn't it?
            if (_this.Options.ExpandNewMedia.Value) {
                if (AVE.Modules['ToggleMedia'] && AVE.Modules['ToggleMedia'].Enabled) {
                    if ($("[id='GM_ExpandAllImages']").hasClass("expanded")) {
                        setTimeout(function () { AVE.Modules['ToggleMedia'].ToggleMedia(true); }, 1000);
                    }
                }
            }

            setTimeout(AVE.Init.UpdateModules, 500);
            window.location.hash = 'p=' + _this.currentPage;

            //Next lines are needed because the front page (^voat.co$) is a bit different from a subverse page. div.pagination-container isn't normally inside div.sitetable
            if (sitetable.find("div.pagination-container").length > 0) {
                $("div.pagination-container").appendTo(sitetable);
                if (_this.NSFWlink){
                    $("div#AVE_randomlinks").appendTo(sitetable);
                } else { // This default case is needed when the nsfwlink isn't displayed (as it used to be if the nsfw option was disabled in the user preferences)
                    $("div.sitetable > a[href='/random']").appendTo(sitetable);
                }
            }
        }).fail(function () {
            $("a#AVE_loadmorebutton").text(_this.Labels[3]);
        });
    },

    UpdateMailInfo: function (newmail, newcount) {
        var hasmail = $("span.notification-container > a#mail"),
            mailcounter = $("span#mailcounter.notification-counter"),
            oldmail = hasmail.attr("class"),
            oldcount = mailcounter.text();

        if (oldmail !== newmail){
            hasmail.removeClass(oldmail)
                   .addClass(newmail);
            if (newmail === "havemail"){
                mailcounter.show();
            } else {
                mailcounter.hide();
            }
        }
        if (oldcount !== newcount){
            mailcounter.text(newcount);
        }
    },

    UpdateCPInfo: function (newSCP, newCCP) {
        var SCP = $("a#scp.userkarma"),
            CCP = $("a#ccp.userkarma"),
            oldSCP = SCP.text(),
            oldCCP = CCP.text();

        if (newSCP !== oldSCP){
            SCP.text(newSCP);
        }
        if (newCCP !== oldCCP){
            CCP.text(newCCP);
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['NeverEndingVoat'];

            var htmlStr = "";
            var opt = ["AutoLoad", "ExpandSubmissionBlock", "DisplayDuplicates", "ExpandNewMedia"];

            $.each(opt, function () {
                htmlStr += '<input id="' + this + '" ' + (_this.Options[this].Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="' + this + '"> ' + _this.Options[this].Desc + '</label><br />';
            });
            return htmlStr;
        }
    }
};
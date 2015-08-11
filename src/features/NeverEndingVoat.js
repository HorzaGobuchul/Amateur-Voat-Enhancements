AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse an entire subverse in one page.',
    Category: 'Subverse',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        AutoLoad: {
            Type: 'boolean',
            Desc: 'If checked, scroll to load more content. Click the "load more" button to load the next page otherwise.',
            Value: true,
        },
        ExpandSubmissionBlock: {
            Type: 'boolean',
            Desc: 'Expand the new submission posts over the empty sidebar\'s space',
            Value: true,
        },
        DisplayDuplicates: {
            Type: 'boolean',
            Desc: 'Display duplicate submissions (greyed).',
            Value: true,
        },
        ExpandNewMedia: {
            Type: 'boolean',
            Desc: 'Expand media in inserted pages, if you already clicked the \"View Media\" button.',
            Value: false,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['NeverEndingVoat'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['NeverEndingVoat'];
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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse"]) == -1 ||
            $("div.pagination-container").find("li.btn-whoaverse-paging").length == 0) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.SepStyle = 'background-color:#' + (AVE.Utils.CSSstyle == "dark" ? "5C5C5C" : "F6F6F6") + ';height:20px;text-align:center;border:1px dashed #' + (AVE.Utils.CSSstyle == "dark" ? "111" : "BCBCBC") + ';border-radius:3px;padding:2px 0px;margin:4px 0px;';
            this.Start();
        }
    },

    Labels: ["Load more", "Sit tight ...", "Sorry, I couldn't find more content", "Something went wrong. Maybe try again?"],
    PostsIDs: [],
    SepStyle: '',
    currentPage: 0,

    Start: function () {
        var _this = this;
        $("div.submission[class*='id-']").each(function () {
            _this.PostsIDs.push($(this).attr("data-fullname"));
        });

        this.currentPage = window.location.href.match(/\?page\=([0-9]*)/);
        if (!this.currentPage) { this.currentPage = 0; }
        else { this.currentPage = parseInt(this.currentPage[1], 10); }

        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () {
        if ($("a#AVE_loadmorebutton").length == 0 && $("div.pagination-container").find("li.btn-whoaverse-paging").length > 0) {
            var LoadBtn = '<a href="javascript:void(0)" style="margin: 5px 0px;" class="btn-whoaverse btn-block" id="AVE_loadmorebutton">' + this.Labels[0] + '</a>';
            $("div.pagination-container").html(LoadBtn);
        }
    },

    Listeners: function () {
        var _this = this;

        if (_this.Options.AutoLoad.Value) {
            $(window).scroll(function () {
                if ($(document).scrollTop() + $(window).height() >= $("body").height()) {
                    _this.LoadMore();
                }
            });
        }

        $("a#AVE_loadmorebutton").on("click", function () { _this.LoadMore(); });
    },

    LoadMore: function () {
        //Don't load another page if one is already being loaded.
        if ($("a#AVE_loadmorebutton").text() == this.Labels[1]) { return false; }

        var _this = this;

        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") != -1) {
            nextPageURL = nextPageURL.replace(/\?page\=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://" + window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }
        print("AVE: loading page: " + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false,
        }).done(function (html) {
            var error = false;
            if ($(html).find("div.submission[class*='id-']").length == 0) { $("a#AVE_loadmorebutton").text(_this.Labels[2]); return false; } //catchall for error pages
            _this.currentPage++;
            //print($(html).find("div.submission[class*='id-']").length);

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") != "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
                $("div.side").css("z-index", "100");
            }

            $("div.sitetable").append('<div style="' + _this.SepStyle + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');

            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            $(html).find("div.submission[class*='id-']").each(function () {
                if ($.inArray($(this).attr("data-fullname"), _this.PostsIDs) == -1) {
                    _this.PostsIDs.push($(this).attr("data-fullname"));
                    $("div.sitetable").append($(this));
                } else if (_this.Options.DisplayDuplicates.Value && !$(this).hasClass("stickied")) {
                    $("div.sitetable").append($(this));
                    $(this).css("opacity", "0.3");
                } else {
                    error = true;
                }
            });

            if (!error) {
                $("a#AVE_loadmorebutton").text(_this.Labels[0]);
            } else {
                $("a#AVE_loadmorebutton").text("An error occured. No point in trying again I'm afraid.");
                print("AVE: oups error in NeverEndingVoat:LoadMore()");
            }

            // Add expando links to the new submissions
            location.assign("javascript:UI.ExpandoManager.execute();void(0)");
            // from https://github.com/voat/voat/blob/master/Voat/Voat.UI/Scripts/voat.ui.js#L190

            //Ugly, isn't it?
            if (_this.Options.ExpandNewMedia.Value) {
                if (AVE.Modules['ToggleMedia'] && AVE.Modules['ToggleMedia'].Enabled) {
                    if ($("[id='GM_ExpandAllImages']").hasClass("expanded")) {
                        setTimeout(function () { AVE.Modules['ToggleMedia'].ToggleMedia(true) }, 750);
                    }
                }
            }

            setTimeout(AVE.Init.UpdateModules, 500);
            window.location.hash = 'p=' + _this.currentPage;

            //Next lines are needed because the front page (^voat.co$) is a bit different from subverses' pages. div.pagination-container isn't normally inside div.sitetable 
            if ($("div.sitetable").find("div.pagination-container").length > 0) {
                $("div.pagination-container").appendTo($("div.sitetable"))
                $("div.sitetable > a[href='/random']").appendTo($("div.sitetable"))
            }
        }).fail(function () {
            $("a#AVE_loadmorebutton").text(_this.Labels[3]);
        });
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
        },
    },
};
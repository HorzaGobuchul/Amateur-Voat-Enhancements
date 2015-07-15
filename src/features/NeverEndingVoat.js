AVE.Modules['NeverEndingVoat'] = {
    ID: 'NeverEndingVoat',
    Name: 'Never Ending Voat',
    Desc: 'Browse an entire subverse in one page.',
    Category: 'Subverse',

    Index: 100,
    Debug: true,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Auto: {
            Type: 'boolean',
            Desc: 'If true, a new page will be loaded whent the user scrolls below the "load more" line, if false the user needs to click the "Load more" button.',
            Value: true,
        },
        ExpandSubmissionBlock: {
            Type: 'boolean',
            Desc: 'If true, the new submissions will expand over the empty sidebar\'s space',
            Value: true,
        },
        DisplayDuplicates: {
            Type: 'boolean',
            Desc: 'If true duplicate submissions will be displayed, albeit greyed.',
            Value: true,
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

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse"]) == -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.SepStyle = 'background-color:#' + (AVE.Utils.CSSstyle == "dark" ? "5C5C5C" : "F6F6F6") + ';height:20px;text-align:center;border:1px dashed #' + (AVE.Utils.CSSstyle == "dark" ? "111" : "BCBCBC") + ';border-radius:3px;padding:2px 0px;margin:4px 0px;';
            this.Start();
        }
    },

    Labels: ["Load more", "Sit tight ...", "Sorry, I couldn't find more content"],
    PostsIDs: [],
    SepStyle: '',
    currentPage: 0,
    //!!Write it so it works fine even if voat loads a page that isn't the first one!!
    //Get the #p=x value and load all pages between the current href location and the last x page.

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
        $(window).scroll(function () {
            if ($(document).scrollTop() + $(window).height() >= $("body").height()) {
                _this.LoadMore();
            }
        });
        $("a#AVE_loadmorebutton").on("click", function () { _this.LoadMore(); });
    },

    LoadMore: function () {
        var _this = this;
        $("a#AVE_loadmorebutton").text(this.Labels[1]);
        var nextPageURL = window.location.href;
        if (nextPageURL.indexOf("?page=") != -1) {
            nextPageURL = nextPageURL.replace(/\?page\=[0-9]*/, "?page=" + (this.currentPage + 1));
        } else {
            nextPageURL = "https://"+window.location.hostname + window.location.pathname + "?page=" + (this.currentPage + 1);
        }
        print("loading page: " + nextPageURL);
        $.ajax({
            url: nextPageURL,
            cache: false
        }).done(function (html) {
            if ($(html).find("div.submission[class*='id-']").length == 0) { $("a#AVE_loadmorebutton").text(_this.Labels[2]);return false; } //catchall for error pages
            _this.currentPage++;

            if (_this.Options.ExpandSubmissionBlock.Value && $("div.content[role='main']").css("margin-right") != "0") {
                $("div.content[role='main']").css("margin", "0px 10px");
            }

            $("div.sitetable.linklisting").append('<div style="' + _this.SepStyle + '" class="AVE_postSeparator">Page ' + (_this.currentPage) + '</div>');
            //$("div.sitetable.linklisting").append('<div class="AVE_postSeparator alert-singlethread">Page ' + (_this.currentPage) + '</div>');
            $(html).find("div.submission[class*='id-']").each(function () {
                if ($.inArray($(this).attr("data-fullname"), _this.PostsIDs) == -1) {
                    _this.PostsIDs.push($(this).attr("data-fullname"));
                    $("div.sitetable.linklisting").append($(this));
                } else if (_this.Options.DisplayDuplicates.Value) {
                    $("div.sitetable.linklisting").append($(this));
                    $(this).css("opacity", "0.45");
                }
            });

            $("a#AVE_loadmorebutton").text(_this.Labels[0]);

            setTimeout(AVE.Init.UpdateModules, 500);
        }).fail(function () {
            $("a#AVE_loadmorebutton").text(_this.Labels[2]);
        });

        window.location.hash = 'p='+this.currentPage;
    },

    AppendToPreferenceManager: {
        html: function () {
            var htmlStr = "";
            return htmlStr;
        },
        callback: function () {
        },
    },
};
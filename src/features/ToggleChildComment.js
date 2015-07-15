AVE.Modules['ToggleChildComment'] = {
    ID: 'ToggleChildComment',
    Name: 'Toggle display child comments',
    Desc: 'Adds "Hide child comments" link to hide a chain of posts',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    LabelHide: "hide child comments",
    LabelShow: "show child comments",

    SavePref: function (POST) {
        var _this = AVE.Modules['ToggleChildComment'];
        POST = POST[_this.ID];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['ToggleChildComment'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        var _this = AVE.Modules['ToggleChildComment'];
        $("ul[class*='flat-list']").each(function () {
            if ($(this).find("a#AVE_ToggleChildComment").length > 0) { return true; }
            if ($(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']").length == 0) { return true; }

            $('<li><a id="AVE_ToggleChildComment" href="javascript:void(0)" style="font-weight:bold;">' + _this.LabelHide + '</a></li>').insertAfter($(this).find("li:contains(report spam)"));
        });
    },

    Listeners: function () {
        var _this = AVE.Modules['ToggleChildComment'];
        $("a#AVE_ToggleChildComment").off("click");
        $("a#AVE_ToggleChildComment").on("click", function () {

            var NextLevelComments = $(this).parents("div[class*='comment']:first").children("div[class*='child'][class*='comment']")
            if (NextLevelComments.is(":visible")) {
                NextLevelComments.hide();
                $(this).text(_this.LabelShow);
            } else {
                NextLevelComments.show();
                $(this).text(_this.LabelHide);
            }
        });
    },
};
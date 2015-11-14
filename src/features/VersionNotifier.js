AVE.Modules['VersionNotifier'] = {
    ID: 'VersionNotifier',
    Name: 'Version notifier',
    Desc: 'Show a short notification the first time a new version of AVE is used.',
    Category: 'General',

    Index: 0.5,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
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

        //this.Store.DeleteValue(this.Store.Prefix + this.ID + "_Version")

        if (this.Enabled) {
            if (this.Store.GetValue(this.Store.Prefix + this.ID + "_Version") !== AVE.Utils.MetaData.version) {
                this.Start();
            }
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    LabelNew: "New Version downloaded:",
    LabelShow: "Changelog, version",
    Trigger: "new",

    ChangeLog: [
        "V2.28.2.5",
        "   Dashboard:",
        "       Displaying the dashboard changes the page's title",
        "       Usertag: fixed issue with arrow keys changing page even while editing a value",
        "V2.28.2.3",
        "   UserInfoFixedPos:",
        "       Renamed module and changed its description to be more general",
        "       Added option to always hide contribution points in the userblock",
        "V2.28.1.2",
        "   Dashboard:",
        "       Implemented a manager for the Usertag module",
        "V2.28.0.2",
        "   New feature: Dashboard",
        "       Use it to manage your saved data",
        "   RememberCommentCount:",
        "       The purging function will now delete 1/8th of the maximum stored values at once every time this max is reached",
        "   VersionNotifier:",
        "       The changelog box can now be closed by pressing \"Escape\"",
        "V2.27.0.2",
        "   RememberCommentCount:",
        "       Changed default highlight colour for the light theme to #ffffcf",
        "V2.27.0.1",
        "   New feature: RememberCommentCount",
        "       For all visited threads show the number of new comments since the last time they were opened (and hilight them)",
        "   ContributionDelta:",
        "       Replaced browser-specific function with shared one",
        "V2.26.1.14",
        "   ToggleMedia:",
        "       Fixed bug preventing the module from detecting any media in submissions' pages",
        "V2.26.1.13",
        "   Filter modules:",
        "     Fixed bug where (starting with two filters) removing the first filter, reloading, adding a new one would have the now first one be erased.",
        "     Fixed issues with new or modified filters not triggering the PrefMngr's save function",
        "   NeverEndingVoat",
        "       Fixed typo that would stop the Load more button from working",
        "   ContributionDelta:",
        "       Fixed bug crashing AVE, relative to the use of the 'let' keyword",
        "V2.26.1.9",
        "   FixContainerWidth:",
        "       Fixed bug that would set the container's width when opening the PrefMngr even when disabled",
        "   ContributionDeltas:",
        "       Fixed bug related to the PrefMngr trying to display values related to a user that didn't exist yet",
        "   UserTag:",
        "       Quick fix",
        "   ContributionDeltas:",
        "       Added option to show mutliple delta in tooltip (hour, day, week)",
        "V2.26.0.6",
        "   New feature: ContributionDeltas",
        "       Show the difference in contribution points between now and X ago",
        "   Preference manager:",
        "       The mngr will now be displayed with full width and height",
        "       Scrolling is deactivated for the rest of the page while the manager is displayed",
        "       Press Escape to close the mngr",
        "   IgnoreUsers:",
        "       Small optimizations",
        "       Corrected a CSS value",
        "   FixContainerWidth:",
        "       Fixed bug in the setting that stopped the slider from updating the page's width live",
        "V2.25.3.6",
        "   NeverEndingVoat:",
        "       Fixed a bug related to expando buttons not appearing in Chrome and preventing more modules from updating",
        "V2.25.3.5",
        "   New feature: Domain filter",
        "       Use filters to remove submissions linking to particular domains",
        "   InjectCustomStyle:",
        "       Added option to inject style without removing the original subverse's custom style",
        "       Added option to inject the external style after the subverse's custom style",
        "   ToggleCustomStyle:",
        "       This module will now start when InjectCustomStyle is enabled but RemoveSubverseStyle is set to false",
        "   UserInfoFixedPost:",
        "       To reduce bugs and improve compatibility with custom styles the user block is now set once regardless of any scrolling by the user",
        "   ToggleMedia & NeverEndingVoat:",
        "       Fixed bug where media in new pages weren't expanded but those already expanded were toggled off and on",
        "   AppendQuote & ReplyWithQuote:",
        "       Didn't work anymore because a DOM id has changed and needed to be updated in the code",
        "   ShortKeys:",
        "       Expand key:",
        "           If the window is scrolled below a submission title and its media is being collapsed the view will scroll up just above the title",
        "   VersionNotifier:",
        "       Purged all previous changelog entries but the last three versions. Past entries can be found on GitHub",
        "V2.24.6.6",
        "   InjectCustomStyle & ToggleCustomStyle:",
        "       Thanks to a fix by /u/FuzzyWords these modules will now identify custom styles way faster",
        "   FixExpandImage:",
        "       Added back fix for reply box's buttons positioned below the sidebar",
        "   Init:",
        "       AVE will now stop loading modules only if the page's title is exactly that of error pages",
        "       Beware: Choosing an error message as the title of a subverse would be a very efficient way of disabling AVE",
        "   UserTag:",
        "       Fixed bug where the vote balance would be updated for the first username found in the self-text when the submission is made in an anonymised subverse",
        "   Updated source with JSlint recommendations",
        "V2.24.2.3",
        "   New feature: Inject custom style",
        "       Apply a custom style everywhere on Voat. Choose from a list or input your own CSS from an URL",
        "   FixExpandImage:",
        "       Trying a simpler solution to the CSS fix",
        "   UserInfoFixedPos & HeaderFixedPos",
        "       Those modules now have more possiblities available when trying to choose a background color.",
        "   ToggleMedia:",
        "       Fixed bug where, in threads, media that were expanded when the user loaded more content weren't detected by the module, thus couldn't be collapsed back.",
        "   FixContainerWidth:",
        "       The module used to update the container's width when starting the prefMngr even if disabled.",
                "V2.23.2.2",
        "   New feature: Hide username",
        "       Options to hide or replace references to your username (not in posts)",
        "   PreferenceManager:",
        "       Added \"style\" tab",
        "       Added visual of the saving process",
        "       In order to save processing time, instead of saving all modules, only those which pref have been modified will be saved now",
        "   ToggleMedia",
        "       Corrected fix that prevented module from detecting media in self-text posts"],

    AppendToPage: function () {
        var CSSstyle = 'div.VersionBox' +
                      '{background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "292929" : "F6F6F6") + ';' +
                       'border:1px solid black;' +
                       'z-index: 1000 ! important;' +
                       'position:fixed;' +
                       'right:0px;' +
                       'top:64px;' +
                       'width:250px;' +
                       'font-size:12px;' +
                       '}' +
                    'p.VersionBoxTitle' +
                       '{background-color: ' + (AVE.Utils.CSSstyle === "dark" ? "#575757" : "#D5D5D5") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#BFBFBF" : "535353") + ';' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle === "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'text-align: center;' +
                       'font-weight: bold;' +
                       '}' +
                    'p.VersionBoxInfo' +
                       '{' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#AAA" : "#565656") + ';' +
                       'margin-top: 5px;' +
                       'padding: 5px;' +
                       '}' +
                    'p.VersionBoxToggle' +
                       '{padding: 5px;}' +
                    'div.VersionBoxClose{' +
                       'border:1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "5452A8" : "D1D0FE") + ';' +
                       'background-color:#' + (AVE.Utils.CSSstyle === "dark" ? "304757" : "F4FCFF") + ';' +
                       'font-size:12px;' +
                       'text-align: center;' +
                       'color:#6CA9E4;' +
                       'font-weight:bold;' +
                       'float: right;' +
                       'margin: 0 5px 5px 0;' +
                       'cursor: pointer;' +
                       'width:50px;' +
                       '}' +
                    'textarea.VersionBoxText{' +
                       'resize:none;' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle === "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle === "dark" ? "#BFBFBF" : "535353") + ';' +
                       'font-size:12px;' +
                       'font-weight:bold;' +
                       'width:100%;' +
                       'padding:10px;' +
                       'padding-bottom:10px;' +
                       '}';
        var notifierHTML = '<div class="VersionBox">' +
                                '<p class="VersionBoxTitle">' + AVE.Utils.MetaData.name + '</p>' +
                                '<p class="VersionBoxInfo">' + (this.Trigger === "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px">' + AVE.Utils.MetaData.version + '</strong></p>' +
                                '<p class="VersionBoxToggle"><a href="javascript:void(0)" id="ShowChangelog">See Changelog?</a><p>' +
                                '<div class="VersionBoxClose">Close</div>' +
                            '</div>';

        $("<style></style>").appendTo("head").html(CSSstyle);
        $("body").append(notifierHTML);
    },

    Listeners: function () {
        var _this = AVE.Modules['VersionNotifier'];
        var ChangeLog = this.ChangeLog;
        var VersionBox = $(".VersionBox");

        $("p.VersionBoxToggle").on("click", function () {
            var ChangeLogHTML = '<textarea class="VersionBoxText" readonly="true">';
            for (var idx in ChangeLog) {
                ChangeLogHTML += ChangeLog[idx] + "\n";
            }
            ChangeLogHTML += '</textarea>';
            $(this).remove();
            $(ChangeLogHTML).insertAfter(VersionBox.find("p.VersionBoxInfo"));

            $("textarea.VersionBoxText").animate({
                height: "370px",
            }, 1000);
            VersionBox.animate({
                width: "85%",
                height: "450px",
            }, 1000);
        });
        $("div.VersionBoxClose").on("click", function () {
            VersionBox.hide("slow");
            _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Version", AVE.Utils.MetaData.version);
        });

        $(window).on("keyup", function (e) {
            if (e.which === 27 && $("div.VersionBox").is(":visible")) {
                $("div.VersionBoxClose").trigger("click");
            }
        });
    },
};
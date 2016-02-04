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
            Value: true
        }
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
        "V2.36.2.8",
        "   New feature: CSSEditor",
        "       First modtool, edit your custom CSS stylesheets from within the page itself (by /u/j_ and /u/dubbelnougat)",
        "   New feature: httpWarning",
        "       This module shows a warning for submissions that link to HTTP URL instead of HTTPS(ecure)",
        "       Added option to choose to show a warning icon and/or change the titles' CSS style",
        "   Init:",
        "       Added loading step \"BannerReady\"",
        "       Moved AVE.Utils.LateSet() to be triggered as soon as Head is loaded",
        "   New feature: AccountSwitcher",
        "       Store information for several accounts and switch between them quickly",
        "       Will start when the header/banner is ready",
        "   HeaderFixedPos:",
        "       Fixed issue that prevented this module from working when the module InjectCustomStyle was disabled",
        "       Optimized JQuery's selectors",
        "       Will now be loaded when the banner element is ready",
        "   UserInfoFixedPos:",
        "       Added back an old feature:",
        "           The user block smoothly follow the scrolling from its original position:",
        "           It doesn't stick to the right side anymore, only to the top",
        "           It will adapt to custom styles modifications",
        "           It will adapt to the window being resized",
        "       Optimized JQuery's selectors",
        "       Will now be loaded when the banner element is ready",
        "V2.33.18.30",
        "   New module category: Modtools",
        "       Misc tools made for helping our dedicated mods (all disabled by default)",
        "   PreferenceManager:",
        "       Added category Modtools",
        "       Renamed category \"Fixes\" to \"Misc\"",
        "   NeverEndingVoat",
        "       Parses fetched page and updates the current mail status and CCP/SCP (Module ContributionDeltas is not updated with the new info)",
        "       \" or a NSFW random subverse\" part is no longer left behind",
        "       This module will now also activate in user-comments and user-submissions",
        "   RememberCommentCount:",
        "       Since user-comments pages can now be read with NeverEndingVoat the process can no longer be repeated twice for the same post ID",
        "   UpdateAfterLoadingMore:",
        "       Will now only start and update when the current page is a thread",
        "   Shortkey:",
        "       Pressing the expand key in a thread with the OP's self-text submission selected will toggle all media within it",
        "       Ctrl+Return can be used to submit comments (key non-configurable)",
        "V2.33.14.26",
        "   Many linguistical improvements",
        "       by LudwikJaniuk",
        "   General:",
        "       Changed some print instances to use DevMode",
        "   FixContainerWidth:",
        "       Will now start at container DOM ready",
        "   Domaintag:",
        "       Forgot to implement the removeTag function",
        "       Updated code for links to subverse domains (used to be self.sub, now v/sub)",
        "   General:",
        "       Implemented DevMode console.log option",
        "   NeverEndingVoat:",
        "       Added support for POST info in general",
        "           Next loaded page will remember info like \"time\", \"page\", \"frontpage=guest\", etc.",
        "   Utils:",
        "       Implemented POST info parser",
        "V2.33.13.20",
        "   General:",
        "       Added support for the new guest frontpage",
        "   HideSubmissions:",
        "       Added reference to the key used to hide posts in the preference manager",
        "   ShortKeys:",
        "       Added option to open external link with archive.is",
        "   ArchiveSubmission:",
        "       Enabled in threads",
        "V2.33.11.18",
        "   ArchiveSubmission:",
        "       No link added to posts linking to archive.is",
        "       Added option (def.: false) to archive self-posts",
        "V2.33.11.16",
        "   New feature: ThemeSwitcher",
        "       Switch between the light and dark themes without reloading",
        "   HeaderFixedPos & UserInfoFixedPos:",
        "       Changed rules choosing the best background colour (fallbacks in case it is transparent because of a custom style)",
        "   New feature: ArchiveSubmission",
        "       Add a link to open an archived version of the submission link",
        "   ShortKeys:",
        "       Linked with HideSubmissions to hide posts with the keyboard (def.: h)",
        "       Automatically select the next submission after hiding one",
        "   New feature: HideSubmissions",
        "       Hide submissions you voted on",
        "       Hide with H",
        "       Insert a \"hide\" button",
        "       If the submission isn't removed as soon as marked hidden, \"hide\" becomes \"unhide\"",
        "   New feature: SingleClickOpener",
        "       Adds '[l+c]' link to submissions, opens link and comment pages.",
        "   Usertags:",
        "       Dashboard:",
        "           Fixed issue with tags having no colour value (e.g. only an ignore value)",
        "           Added options to display data",
        "           Added vote colour gradient",
        "   Utils:",
        "       Fixed bug that prevented AVE from detecting the current page if it was a userpage of someone with an hyphen",
        "   DomainFilter:",
        "       Moved to the Domains tab in the prefmanager",
        "       Linked to the DomainTags module for the ignore feature",
        "       Enabled in user-submissions and saved pages",
        "   Shorcuts:",
        "       Dashboard support",
        "       Adding your first subverse into the list now replaces the default ones",
        "   DomainTags:",
        "       Dashboard support",
        "       Change box's position so that it doesn't get offscreen",
        "       Started implementing ignore option (not functional yet)",
        "           In: dashboard, box",
        "V2.29.6.6",
        "   New feature: DomainTags",
        "       Choose tags to characterize domains",
        "       Added possibility to tag subverses too (i.e. domains like: self.whatever)",
        "       New tab in the PrefMngr: Domains",
        "   UserTag:",
        "       Only used data will be saved for optimization's sake. E.g. upvoting someone will no longer save a new and complete UserTagObj but a simple object containing a username and a votebalance",
        "       Context is a new element saved with the tag. When tagging a user, a link will now be added as context of the tag (permalink to submission or comment)",
        "       An empty votebalance span is not displayed anymore, this is so that it doesn't show an empty space after the tag/username",
        "   RememberCommentCount:",
        "       Comments made by the user will no longer be highlighted",
        "       Comments made by the user will automatically increment the comment count of the thread",
        "       Added comment count in user-comment pages (voat.co/user/username/comments)",
        "       Attempt at fixing a highlighting error related to Voat displaying comment's dates in CET (GMT+1) (can be disabled in the preferences)",
        "       Changed default highlight colour for the dark theme to #423C3C",
        "   Dashboard:",
        "       In the Usertags section, added context entry",
        "       Added dashboard for Domaintags (empty for the moment)",
        "   PreferenceManager:",
        "       You can no longer open several changelogs by clicking the version number multiple times",
        "   BuilDep.js files",
        "       Added callback option to SendMessage (postMessage) function",
        "   Utils:",
        "       Added new Jquery filter",
        "V2.28.3.7",
        "   Usertag:",
        "       New option to add a background colour to vote balances (green to red)",
        "       Added a border radius of 2px to the previous background colour",
        "   Dashboard:",
        "       In the Usertags section, modifying the colour is now done with a colour palette",
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

        $('<style id="AVE_Version_notif"></style>').appendTo("head").html(CSSstyle);
        $("body").append(notifierHTML);
    },

    Listeners: function () {
        var _this = AVE.Modules['VersionNotifier'];
        var ChangeLog = this.ChangeLog;
        var VersionBox = $(".VersionBox");

        $("p.VersionBoxToggle").on("click", function () {
            var ChangeLogHTML = '<textarea class="VersionBoxText" readonly="true">';
            //for (var idx in ChangeLog) {
            //    ChangeLogHTML += ChangeLog[idx] + "\n";
            //}
            ChangeLogHTML += ChangeLog.join("\n");

            ChangeLogHTML += '</textarea>';
            $(this).remove();
            $(ChangeLogHTML).insertAfter(VersionBox.find("p.VersionBoxInfo"));

            $("textarea.VersionBoxText").animate({
                height: "370px"
            }, 1000);
            VersionBox.animate({
                width: "85%",
                height: "450px"
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
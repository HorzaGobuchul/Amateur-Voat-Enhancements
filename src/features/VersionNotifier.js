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
        "V2.25.3.1",
        "   New feature: Domain filter",
        "       Use filters to remove submissions linking to particular domains.",
        "   InjectCustomStyle:",
        "       Added option to inject style without removing the original subverse's custom style",
        "       Added option to inject the external style after the subverse's custom style",
        "   UserInfoFixedPost:",
        "       To reduce bugs and improve compatibility with custom styles the user block is now set once regardless of any scrolling by the user",
        "   ShortKeys:",
        "       Expand key:",
        "           if the windows is scrolled below a submission title and its media is being collapsed the view will scroll up just above the title",
        "V2.24.6.6",
        "   InjectCustomStyle & ToggleCustomStyle:",
        "       Thanks to a fix by /u/FuzzyWords these modules will now identify custom styles way faster",
        "   FixExpandImage:",
        "       Added back fix for reply box's buttons positioned below the sidebar",
        "   Shortkeys:",
        "       When collapsing a media, the page will scroll back to its post (submission, comment) if it was out of page while expanded",
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
        "       Corrected fix that prevented module from detecting media in self-text posts",
        "V2.22.5.11",
        "   FixExpandImage:",
        "       Corrected CSS selector that was adding a margin-left of 30px to comments in /user/username page",
        "   Dark mode fix for \"play pen improvements\" and \"checking your bits\" pages. Thanks /u/Jammi!",
        "   UserInfoFixedPos:",
        "       Added option to have the userblock collapsed by default",
        "   ToggleCustomStyle",
        "       In thread, when re-enabled, a custom style is no longer added to both style#custom_css elements (one is deleted prior)",
        "   ToggleMedia:",
        "       Fixed bug happening when more than one link to an image were on the same line",
        "   Core > Init:",
        "       Fixed a bug touching modules that were set to start after the page is fully loaded, but weren't started at all",
        "V2.22.4.6",
        "   Added option to start modules on DOMready or DOMload",
        "       Resolved the issue causing the DisableShareALink module to be useless on Chrome",
        "   PreferenceManager:",
        "       Increased width by 100px",
        "   ShortKeys:",
        "       Corrected a bug where (in comment) it would expand link that have as title a media signature (e.g. JPG, PNG)",
        "V2.22.3.4",
        "   ShortKeys:",
        "       Added keys to navigate to top and bottom of the page (key also selects first or last post in page)",
        "V2.22.1.4",
        "   ToggleCustomStyle:",
        "       Adds a checkbox to enable/disable custom style on a per subverse basis",
        "   ToggleMedia:",
        "       Fixed bug that let ToggleMedia expand links that add media triggers as title (e.g. JPG, Youtube, ...)",
        "   PreferenceManager:",
        "       Added option to toggle off the change loss warning",
        "   NeverEndingVoat",
        "       The module no longer creates a new page separator when an error happened or when there is no more content to insert",
        "       A normal occurrence was labeled as an error, now labeled as \"no more content\"",
        "       Corrected a bug where the ToggleMedia module would detect 0 media in the page after NeverEndingVoat tried loading a new page and showed an error",
        "V2.21.12.28:",
        "   SelectPost:",
        "       CSS selector optimized (x10 improvement)",
        "   Filter modules:",
        "       Keywords and sbverses should now be seperated by commas instead of spaces",
        "   HeaderFixedPos & UserInfoFixedPos:",
        "       The elements' colour and border's values now adapt to the current style (custom style if it exists)",
        "   ToggleMedia:",
        "       Filter elements who have a media title but don't contain an expando span",
        "V2.21.12.24:",
        "   AppendQuote:",
        "       Changed preview's background colour (light theme)",
        "   FixExpandImage:",
        "       Modified CSS selector that needed 500ms to process (down to ~3ms)",
        "       OnNodeChange function has also been modified, but shows no significant improvement",
        "V2.21.12.22:",
        "   VersionNotifier:",
        "       Can now be disable (won't show a notification when AVE is updated)",
        "   PreferenceManager:",
        "       When a setting is modified the save button changes colour",
        "       If changes have been recorded but not saved, you will be asked to confirm when exiting",
        "V2.21.10.21:",
        "   SelectPost",
        "       Fixed an old issue that would let user select a submission only by clicking a precise part of the post. Submissions can now be selected by clicking anywhere on it.",
        "   fixExpandImage fixed CSS bugs:",
        "       Collapsed comment-chains were positioned too far right",
        "       Reply forms next to the sidebar would leave a blank space below",
        "       Submissions' title et al. were lowered by 10px compared to the vote count",
        "       Expando element in submissions were positioned below the rest of the post without any margin",
        "       Sidebar text could overflow without scrollbars",
        "   ShowSubmissionVoatBalance:",
        "       Force-deactivated until I find a better solution",
        "       The new vote now keeps the vote colour instead of showing the neutral gray (unvoted)",
        "   ShortKeys:",
        "       Use the Enter key (default value) to collapse/expand child-comment and also to load new replies",
        "       You can now expand media in a comment by pressing the expand key: if all media are collapsed they are expanded, if at least one is expanded they are collapsed",
        "   FixContainerWidth:",
        "       Added a right padding of 10px for comments",
        "   UserInfoFixedPos:",
        "       Toggle's >> and << have been replaced with SVG icons",
        "       Toggle icons are not displayed when not logged-in",
        "   AVE will no longer start on the \"Are you trying to hurt us\" page",
        "   Added support for /about/ pages and catch-all for account and sub related pages",
        "V2.21.7.11:",
        "   Added Utils function \"AddStyle\"",
        "   UserInfoFixedPos:",
        "       Changed and centered collapse/expand icons",
        "   FixExpandImage:",
        "       Still fixing new CSS solution",
        "V2.21.6.9:",
        "   FixExpandImage:",
        "       Small appearance fix",
        "V2.21.6.8:",
        "   FixExpandImage: fixed issue due to collision with some custom styles",
        "       Implemented solution from /V/SCRIBBLE by /U/HEWITT",
        "       Simplified module",
        "   UserTag:",
        "       Added detection of user-links of form a[href^='/u/']",
        "V2.21.6.6:",
        "   Fixed issue with the Cashmere custom style that hid the usertag icon",
        "   Fixed issue where ToggleMedia would trigger a click on failed media (e.g. error 404), thus redirecting instead of toggling the non-existent expando.",
        "V2.21.6.4:",
        "   New feature: ShowSubmissionVoatBalance",
        "       This module adds the possibility to display the actual balance of down/upvotes for a submission you voted on, instead of only the up or downvote count depending on your vote.",
        "   Excluded API pages at the extension level (instead of simply in the script)",
        "   UserInfoFixedPos:",
        "       Added option to toggle the user block with an icon (arrow)",
        "   FixContainerWidth:",
        "       Added option to justify text in comments",
        "       Fixed comments' max-width being set to 60em by default, replaced with 100%",
        "V2.20.3.3:",
        "   New feature: CommentFilter",
        "       You can choose keywords to filter comments (and specify subverses too)",
        "       By default the filtered comments will be replaced by a short label informing about the responsible keyword and a link to display the text.",
        "       If RemoveFiltered is checked, the comments will be removed, along with their children.",
        "   IgnoreUsers:",
        "       Added feature to display hidden comments by clicking the replacement label",
        "   Corrected bug in SubmissionFilter and CommentFilter where filters weren't saved properly",
        "   Corrected CSS issue with the SubmissionFilter and CommentFilter modules in PrefManager ",
        "   Corrected bug in ToggleMedia that prevented the module from detecting media in comments, but only in sublission posts",
        "   Added support /modlog/ pages:",
        "       NeverEndingVoat will no longer try to insert itself in those pages",
        "V2.19.11.22:",
        "   New feature: SubmissionFilter",
        "   Extend what a submission page is (to \"search\" and \"domains\" pages)",
        "   Replaced unicode character used for the close button in the PreferenceManager that wasn't displayed right in all extensions",
        "V2.18.10.20:",
        "   Removed backcompatibility module for V1 to V2 (explains why the version's Minor was decremented)",
        "   Released Firefox and Chrome extensions",
        "   Added support for more voat pages:",
        "       Api (excluded)",
        "       Saved",
        "       Domain",
        "       Submit",
        "       Account-login",
        "       Account-register",
        "V2.19.10.16:",
        "   NeverEndingVoat:",
        "       Corrected a bug that prevented going back to the previous submissions if the \"page #\" was just before it",
        "   UserTag:",
        "       Fixed bug: voteBalance listener was added instead of replaced. Result: after more content is loaded several time, one vote can count as several for the voteBalance feature",
        "   UserInfoFixedPos:",
        "       Added option to divide in two parts the user account header (disabled by default)",
        "   PreferenceManager:",
        "       Changed CSS of custom input so that it is more independent from the rest of the layout",
        "V2.19.10.12:",
        "   Shortkey:",
        "       Added new shortcuts:",
        "           Select next or previous post",
        "           Open comments page",
        "           Open link page",
        "           Open link and comments pages",
        "           Expand media",
        "       Hitting the next key, at the bottom of a subverse page or thread, triggers loading more content",
        "       Added option to open links and comments pages in new tabs. Redirects otherwise",
        "       Doesn't work anymore when a key modifier is pressed (ctrl, shift)",
        "   NeverEndingVoat:",
        "       Added option to expand media in new pages if you already clicked the \"View Media\" button",
        "           Disabled by default to save bandwidth",
        "           Duplicate submissions aren't expanded",
        "       Duplicate submissions' opacity has been lowered to 0.3",
        "       AutoLoad option",
        "   UserTag:",
        "       Added option to disabled the vote balance feature",
        "       Fixed a bug that made it so, in comment/self-text, only the first reference to a user, in the same line, was detected and tagged",
        "       The tag preview area is now limited to one line",
        "   PreferenceManager:",
        "       The 'AVE' link now appears even when not logged-in",
        "   UserInfoFixedPos:",
        "       If the page loads already scrolled down (e.g. refreshed), the account info block now positions itself accordingly",
        "   Added support for voat.co/search",
        "   Added support for voat.co/new",
        "V2.19.2.4:",
        "   New fix: DisableShareALink",
        "   NeverEndingVoat:",
        "       won't show sticky submission duplicates anymore",
        "       add expandos icon and feature to new submissions",
        "       updates enabled modules (ToggleMedia, ExpandImage, UserTag, ...)",
        "   IgnoreUsers:",
        "       Forgot to let the module show its current setting in the prefMngr",
        "   PreferenceManager:",
        "       Fixed a bug where a module alone in its category wouldn't reset as it should",
        "V2.18.0.1:",
        "   New feature: NeverEndingVoat",
        "   Fixed issue where NeverEndingVoat would update all updatable modules",
        "   UserTag:",
        "       Replaced empty tag (\"[ + ]\") with a tag icon",
        "       Fixed bug that made deleting tags impossible",
        "V2.17.0.2:",
        "    New feature: FixContainerWidth",
        "V2.16.0.3:",
        "    New feature: IgnoreUsers (deactivated by default)",
        "    Reinstated css fixes for chrome that were erased during refactoring",
        "    implemented a solution for users who have so many subscriptions that the \"my subverses\" list goes out of the screen",
        "V2.15.0.8: in AppendQuote, fixed issue with quoting self-text posts.",
        "V2.15.0.7: fixed and improved expanding images",
        "V2:",
        "Refactoring:",
        "    all modules are now completely separated/autonomous",
        "    the module class can implement default methods:",
        "        to save/load options",
        "        to reset data to default options through the prefMngr",
        "        to inject custom html (e.g. inputs) into the prefMngr and retrieve the form data",
        "        to insert elements into the current page",
        "        to add custom event listeners",
        "        to update when triggered by UpdateAfterLoadingMore",
        "Feature: New PrefManager",
        "Feature: UpdateAfterLoadingMore",
        "    Triggers modules to update when more content is loaded at the end of a thread",
        "Feature: BackCompatibility",
        "    Import data from v1",
        "Feature: ToggleChildComment",
        "    Adds \"Hide child comments\" link to hide a chain of posts",
        "Improved ExpandImage:",
        "    Works in subverse and thread pages",
        "improved Usertagging:",
        "    A tag box appears below the username instead of the javascript prompt",
        "    You can choose a colour to go with the tag",
        "Feature: vote balance (in UserTag)",
        "Design implementation of Ignore (but not yet implemented)",
        "AppendQuote: added \"quote\" link to self-text OP in thread pages",
        "Storage Module with GM_storage (localStorage later)",
        "Added an option to ToggleMedia: toggle media in the sidebar (default: false)",
        "Light and Dark theme for the PrefMngr and Tag box"],

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
    },
};
AVE.Modules['VersionNotifier'] = {
    ID: 'VersionNotifier',
    Name: 'Version notifier',
    Desc: 'Show a short notification the first time a new version of AVE is used.',
    Category: 'General',

    Index: 0.5,
    Enabled: false,

    Store: {},

    Options: {
    },

    Load: function () {
        this.Store = AVE.Storage;
        //this.Store.DeleteValue(this.Store.Prefix + this.ID + "_Version")
        this.Enabled = this.Store.GetValue(this.Store.Prefix + this.ID + "_Version") != GM_info.script.version;

        if (this.Enabled) {
            this.Start();
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
        "Light and Dark theme for the PrefMngr and Tax box", ],

    AppendToPage: function () {
        var CSSstyle = 'div.VersionBox' +
                      '{background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "292929" : "F6F6F6") + ';' +
                       'border:1px solid black;' +
                       'z-index: 1000 ! important;' +
                       'position:fixed;' +
                       'right:0px;' +
                       'top:64px;' +
                       'width:250px;' +
                       'font-size:12px;' +
                       '}' +
                    'p.VersionBoxTitle' +
                       '{background-color: ' + (AVE.Utils.CSSstyle == "dark" ? "#575757" : "#D5D5D5") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#BFBFBF" : "535353") + ';' +
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'text-align: center;' +
                       'font-weight: bold;' +
                       '}' +
                    'p.VersionBoxInfo' +
                       '{' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#AAA" : "#565656") + ';' +
                       'margin-top: 5px;' +
                       'padding: 5px;' +
                       '}' +
                    'p.VersionBoxToggle' +
                       '{padding: 5px;}' +
                    'div.VersionBoxClose{' +
                       'border:1px solid #' + (AVE.Utils.CSSstyle == "dark" ? "5452A8" : "D1D0FE") + ';' +
                       'background-color:#' + (AVE.Utils.CSSstyle == "dark" ? "304757" : "F4FCFF") + ';' +
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
                       'border-bottom:1px solid ' + (AVE.Utils.CSSstyle == "dark" ? "#6E6E6E" : "#939393") + ';' +
                       'color: ' + (AVE.Utils.CSSstyle == "dark" ? "#BFBFBF" : "535353") + ';' +
                       'font-size:12px;' +
                       'font-weight:bold;' +
                       'width:100%;' +
                       'padding:10px;' +
                       'padding-bottom:10px;' +
                       '}';
        var notifierHTML = '<div class="VersionBox">' +
                                '<p class="VersionBoxTitle">' + GM_info.script.name + '</p>' +
                                '<p class="VersionBoxInfo">' + (this.Trigger == "new" ? this.LabelNew : this.LabelShow) + ' <strong style="font-size:14px">' + GM_info.script.version + '</strong></p>' +
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
            _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Version", GM_info.script.version);
        });
    },
};
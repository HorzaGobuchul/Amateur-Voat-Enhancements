AVE.Modules['Shortcuts'] = {
    ID: 'Shortcuts',
    Name: 'Subverse and Set shortcuts',
    Desc: 'Replace the subverse list header with a custom list.',
    Category: 'General',

    Order: 4,
    Enabled: false,

    Store: {},
    StorageName: "",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST[this.ID]));
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
        this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;

        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_shortcuts";
            this.Start();
        }
    },

    Start: function () {
        this.DisplayCustomSubversesList();
        if (AVE.Utils.isPageSubverse) {
            this.AppendShortcutButton();
        } else if (AVE.Utils.currentPageType === "subverses") {
            this.AddShortcutsButtonInSubversesPage();
        } else if ($.inArray(AVE.Utils.currentPageType, ["mysets", "sets"]) >= 0) {
            this.AddShortcutsButtonInSetsPage();
        } else if (AVE.Utils.currentPageType === "set") {
            this.AddShortcutsButtonInSetPage();
        }
    },

    AddShortcutsButtonInSetPage: function () {
        //Not implemented yet.
        //The set pages are bound to change soon.
        return false;
    },

    AddShortcutsButtonInSetsPage: function () {
        var _this = this;
        var inShortcut = false;
        var tempSetName = "";
        var tempSetId = "";

        $("div[id*='set']").each(function () {
            tempSetName = $(this).find(".h4").text();//.replace(/([&\/\\#,+()$~%.'":*?<>{}])/g, '\\$1');
            tempSetId = $(this).find(".h4").attr("href").substr(5);
            inShortcut = this.isSubInShortcuts(tempSetName + ":" + tempSetId);

            var btnHTML = '<br /><button style="margin-top:5px;" id="AVE_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default' + (inShortcut ? "" : "btn-sub") + '">' +
                                    (inShortcut ? "-" : "+") + ' shortcut' +
                            '</button>';
            $(btnHTML).appendTo($(this).find(".midcol").first());
        });

        $(document).on("click", "#AVE_Sets_Shortcut", function () {
            var setName = $(this).attr("setName");
            var setId = $(this).attr("setId");

            if (setName === null || setName === undefined || setName === "undefined" ||
                setId === null || setId === undefined) {
                alert("AVE: Error adding set " + setName + ", id: " + setId);
                return;
            }

            var set = setName + ":" + setId;
            if (_this.isSubInShortcuts(set)) {
                _this.RemoveFromShortcuts(set);
                _this.ToggleShortcutButton(true, this);
            }
            else {
                _this.AddToShortcuts(set);
                _this.ToggleShortcutButton(false, this);
            }

            this.DisplayCustomSubversesList();
        });
    },

    // Special to voat.co/subverses: adds a "shortcut" button for each subverse////
    AddShortcutsButtonInSubversesPage: function () {
        var _this = this;
        var inShortcut = false;
        var tempSubName = "";

        $('.col-md-6').each(function () {
            tempSubName = $(this).find(".h4").attr("href").substr(3);
            inShortcut = _this.isSubInShortcuts(tempSubName);

            var btnHTML = '<br /><button style="margin-top:5px;" id="AVE_Subverses_Shortcut" subverse="' + tempSubName + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">' + (inShortcut ? "-" : "+") + ' shortcut </button>';
            $(btnHTML).appendTo($(this).find(".midcol").first());
        });

        $(document).on("click", "#AVE_Subverses_Shortcut", function () {
            var subName = $(this).attr("subverse");
            if (_this.isSubInShortcuts(subName)) {
                _this.RemoveFromShortcuts(subName);
                _this.ToggleShortcutButton(true, this);
            }
            else {
                _this.AddToShortcuts(subName);
                _this.ToggleShortcutButton(false, this);
            }

            _this.DisplayCustomSubversesList();
        });
    },

    /// Common to voat.co: modifies the subverses header list with custom subverses ////
    DisplayCustomSubversesList: function () {
        var SubString = '';
        var subArr = this.GetSubversesList();
        var setInfo = [];

        for (var idx in subArr) {
            if (subArr[idx] == "") { continue; }
            if (AVE.Utils.regExpSet.test(subArr[idx])) { //ex: name:12
                setInfo = this.GetSetParam(subArr[idx]);
                SubString += '<li><span class="separator">-</span><a href="/set/' + setInfo[1] + '/" style="font-weight:bold;font-style: italic;">' + setInfo[0] + '</a></li>';
            }
            else {
                SubString += '<li><span class="separator">-</span><a href="/v/' + subArr[idx] + '/">' + subArr[idx] + '</a></li>';
            }
        }
        $('ul#sr-bar').html(SubString);
    },

    //// Special to subverse: adds a "shortcut" button for this subverse////
    AppendShortcutButton: function () {
        var _this = this;

        if (!this.isPageInShortcuts()) {
            //style="display:inline" is a fix for the Scribble custom style that tries to hide the block button, but instead hides this shorcut button.
            var btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            var btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
        }

        if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
        }
        else {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
        }

        $(document).on("click", "#AVE_Shortcut", function () {
            if (_this.isPageInShortcuts()) {
                _this.RemoveFromShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(true, "#AVE_Shortcut");
            }
            else {
                _this.AddToShortcuts(AVE.Utils.subverseName);
                _this.ToggleShortcutButton(false, "#AVE_Shortcut");
            }

            _this.DisplayCustomSubversesList();
        });
    },
    /// Special methods related to shortcuts ///
    GetSubversesList: function () {
        return this.Store.GetValue(this.StorageName, "newsubverses,introductions,news").split(',');
    },

    GetSetParam: function (str) {
        var m = AVE.Utils.regExpSet.exec(str);

        if (m == null) { return null; }
        else { return [m[1].toLowerCase(), m[2]]; }
    },

    AddToShortcuts: function (SubName) {
        var subversesArr = this.GetSubversesList();
        var str = subversesArr.join(",") + "," + SubName;

        this.Store.SetValue(this.StorageName, str);
    },

    RemoveSetFromShortcut: function (id) {
        var subversesArr = this.GetSubversesList();

        for (var x in subversesArr) {
            if (AVE.Utils.regExpSet.test(subversesArr[x])) {
                if (this.GetSetParam(subversesArr[x])[1] == id) {
                    this.RemoveFromShortcuts(subversesArr[x]);
                    return true;
                }
            }
        }
        return false;
    },

    RemoveFromShortcuts: function (SubName) {
        var subversesArr = this.GetSubversesList();
        var idx = subversesArr.indexOf(SubName);

        if (idx < 0) {
            alert("AVE: sub or set name not found in Header list\n(" + SubName + ")");
            return false;
        }

        subversesArr.splice(idx, 1);
        this.Store.SetValue(this.StorageName, subversesArr.join(","));
    },

    ToggleShortcutButton: function (state, sel) {
        if (state == true) {
            $(sel).text('+ shortcut');
            $(sel).addClass('btn-sub')
        }
        else {
            $(sel).text('- shortcut');
            $(sel).removeClass('btn-sub');
        }
    },

    isSubInShortcuts: function (Sub) {
        var subversesArr = this.GetSubversesList();

        for (var i in subversesArr) {
            if (subversesArr[i].toLowerCase() == Sub.toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    isPageInShortcuts: function () {
        var subversesArr = this.GetSubversesList();

        return this.isSubInShortcuts(AVE.Utils.subverseName);
    },

    AppendToDashboard: {
        initialized: false,
        CSSselector: "",
        module: {},

        init: function () {
            this.module = AVE.Modules['Shortcuts'];
            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";
            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}
            var htmlStr = "";

            $.each(this.module.GetSubversesList(), function (idx, sub) {
                htmlStr += '<div> '+sub+' </div>';
            });

            return htmlStr;
        },
        callback: function () {
            "use strict";
        }
    }
};
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
            Value: true
        }
    },

    defaultList: "newsubverses,introductions,news",

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
        return;
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

    /// Common to voat.co: modifies the subverse header list with custom subverse ////
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
        var btnHTML;

        if (!this.isPageInShortcuts()) {
            //style="display:inline" is a fix for the Scribble custom style that tries to hide the block button, but instead hides this button.
            btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline;" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
        }
        else {
            btnHTML = '\xa0<button id="AVE_Shortcut" style="display:inline;" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
        }

        if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
        }
        else {
            $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
        }

        $("#AVE_Shortcut").on("click", function () {
            var subverseName = $("h1.whoaversename > a:first").text();
            if (_this.isPageInShortcuts()) {
                _this.RemoveFromShortcuts(subverseName);
                _this.ToggleShortcutButton(true, "#AVE_Shortcut");
            }
            else {
                _this.AddToShortcuts(subverseName);
                _this.ToggleShortcutButton(false, "#AVE_Shortcut");
            }

            _this.DisplayCustomSubversesList();
        });
    },
    /// Special methods related to shortcuts ///
    GetSubversesList: function () {
        return this.Store.GetValue(this.StorageName, this.defaultList).split(',');
    },
    GetSubversesListRaw: function () {
        return this.Store.GetValue(this.StorageName, this.defaultList);
    },

    GetSetParam: function (str) {
        var m = AVE.Utils.regExpSet.exec(str);

        if (m == null) { return null; }
        else { return [m[1].toLowerCase(), m[2]]; }
    },

    AddToShortcuts: function (SubName) {
        if (SubName === "") {return;}
        var subversesArr = this.GetSubversesListRaw();
        if (subversesArr.toLowerCase().split(",").indexOf(SubName.toLowerCase()) !== -1){
            print("AVE: AddToShortcuts > \""+SubName+"\" is already present in the shortcut list");
            return;
        }
        if (subversesArr === this.defaultList){
            this.Store.SetValue(this.StorageName, SubName);
            return;
        }

        subversesArr = this.GetSubversesList();
        this.Store.SetValue(this.StorageName, subversesArr.join(",") + "," + SubName);
    },

    EditShortcut: function (x, newname) {
        if (newname === "") {return;}
        var subversesArr = this.GetSubversesList();
        if (isNaN(x)){
            //x is the sub's name
            var idx = subversesArr.indexOf(x);
            if (idx !== -1){
                subversesArr[idx] = newname;
            } else {
                print("AVE: EditShortcut > "+x+" couldn't be found");
                return;
            }

        } else {
            //x is an index
            if (x >= 0 && x < subversesArr.length){
                subversesArr[x] = newname;
            } else {
                print("AVE: EditShortcut > index out of bound");
                return;
            }
        }

        this.Store.SetValue(this.StorageName, subversesArr.join(","));
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
        var subversesArr = this.GetSubversesListRaw().toLowerCase().split(",");
        var idx = subversesArr.indexOf(SubName.toLowerCase());

        if (idx === -1) {
            alert("AVE: sub or set name not found in header list (" + SubName + ")");
            return;
        }

        subversesArr = this.GetSubversesList();
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

            var CSS = '' +
                'svg#AVE_subversetable {' +
                '   vertical-align: middle;' +
                '   cursor: pointer;' +
                '   margin-left:10px;' +
                '}' +
                'div#AVE_Dashboard_shortcuts_buttons{' +
                '   margin-bottom: 20px;' +
                '   margin-left: 45px;' +
                '}' +
                'div#AVE_Dashboard_shortcuts_table{' +
                '   margin-left: 45px;' +
                '   margin-bottom: 10px;' +
                '}';
            AVE.Utils.AddStyle(CSS);
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Update data storage
            AVE.Storage.Update();
            this.module.DisplayCustomSubversesList();

            var htmlStr = "";
            var subs = this.module.GetSubversesList();
            var len = subs.length;

            htmlStr += '<div id="AVE_Dashboard_shortcuts_buttons">' +
                '<input placeholder="Enter here a list of subverses separated by commas" class="form-control valid" style="width:400px;display: inline;" type="text" />' +
                '<a href="javascript:void(0);" title="Add new subverse names to the shortcut list" role="append" class="btn-whoaverse-paging btn-xs btn-default" style="margin-left:10px;margin-right:15px;">Append</a>' +
                '<a href="javascript:void(0);" title="Replace the shortcut list with a new one" role="set" class="btn-whoaverse-paging btn-xs btn-default" style="margin-right:15px;">Set</a>' +
                '<a href="javascript:void(0);" title="Export list as a string of subverse names separated by commas" role="export" class="btn-whoaverse-paging btn-xs btn-default">Export</a>' +
                '</div>';

            $.each(subs, function (idx, sub) {
                htmlStr += '' +
                    '<div subname="'+sub+'" id="AVE_Dashboard_shortcuts_table"> ' +
                    '<svg title="Delete" role="remove" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><rect y="5" style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + ';" width="14" height="4"/></svg>' +
                    '<svg title="Move down" role="down" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;' + (idx === len-1 ? "cursor:not-allowed;" : "") + '" xml:space="preserve"><polygon style="fill:#' + (idx === len-1 ? "AAA" : "377da8") + ';" points="11.949,3.404 7,8.354 2.05,3.404 -0.071,5.525 7,12.596 14.07,5.525 "/></svg>' +

                    '<svg title="Move up" role="up" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;' + (idx === 0 ? "cursor:not-allowed;" : "") + '" xml:space="preserve"><polygon style="fill:#' + (idx === 0 ? "AAA" : "377da8") + ';" points="2.051,10.596 7,5.646 11.95,10.596 14.07,8.475 7,1.404 -0.071,8.475 "/></svg>' +

                    '<svg title="edit" role="edit" version="1.1" id="AVE_subversetable" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#377da8" d="M1,10l-1,4l4-1l7-7L8,3L1,10z M11,0L9,2l3,3l2-2L11,0z"/></svg>' +

                    '<span id="AVE_subname" style="font-size:14px;color:#' + (AVE.Utils.CSSstyle === "dark" ? "AAA" : "666") + ';margin-left:15px;font-weight: bold;">'+sub+'</span>' +
                    '</div>';
            });

            htmlStr += '<div><svg role="add" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;margin-left: 160px;cursor:pointer;" xml:space="preserve"><polygon fill="#27a32b" points="14,5 9,5 9,0 5,0 5,5 0,5 0,9 5,9 5,14 9,14 9,9 14,9 "/></svg></div>';

            return htmlStr;
        },

        callback: function () {
            "use strict";
            var _this = this;
            var JqId = $("section[role='AVE_Dashboard'][module='Shortcuts']");
            var input = JqId.parent().find("input");

            JqId.find("a[role='append']").off().on("click", function () {
                var newset = $.trim(input.val().replace(/\s/g, '')).split(",");
                var newsubs = _this.module.GetSubversesList();

                for (var i = 0; i < newset.length; i++){
                    if (!newset[i] ||  $.inArray(newset[i], newsubs) !== -1){continue;}
                    newsubs.push(newset[i]);
                }
                if (newsubs.length === 0) {return;}

                _this.module.Store.SetValue(_this.module.StorageName, newsubs.join(","));
                _this.Reload();
            });
            JqId.find("a[role='set']").off().on("click", function () {
                var newset = $.trim(input.val().replace(/\s/g, '')).split(",");
                var newsubs = [];

                for (var i = 0; i < newset.length; i++){
                    if (!newset[i] ||  $.inArray(newset[i], newsubs) !== -1){continue;}
                    newsubs.push(newset[i]);
                }
                if (newsubs.length === 0) {return;}

                _this.module.Store.SetValue(_this.module.StorageName, newsubs.join(","));
                _this.Reload();
            });
            JqId.find("a[role='export']").off().on("click", function () {
                prompt("Copy the string below", _this.module.GetSubversesListRaw());
            });
            JqId.find("svg[role='add']").off().on("click", function () {
                var subname = $.trim(prompt("Enter below the subverse's name you want to add"));
                if (subname === ""){return false;}

                _this.module.AddToShortcuts(subname);
                _this.Reload();
            });

            JqId.find("svg[role='remove']").off().on("click", function () {
                var subname = $(this).parent().attr("subname");

                if (!confirm("Are you sure you want to remove \""+subname+"\" from your shortcuts?")){return false;}

                _this.module.RemoveFromShortcuts(subname);
                _this.Reload();
            });
            JqId.find("svg[role='edit']").off().on("click", function () {
                var oldsubname = $(this).parent().attr("subname");
                var newsubname = $.trim(prompt("Edit below the subverse's name.", oldsubname));
                if (newsubname === ""){return false;}

                _this.module.EditShortcut(oldsubname, newsubname);
                _this.Reload();
            });
            JqId.find("svg[role='down']").off().on("click", function () {
                if ($(this).css("cursor") !== "pointer"){return;}

                var subversesArr = _this.module.GetSubversesList();
                var idx = $(this).parent().index() -1;
                AVE.Utils.move(subversesArr, idx, idx+1);

                _this.module.Store.SetValue(_this.module.StorageName, subversesArr.join(","));
                _this.Reload();
            });
            JqId.find("svg[role='up']").off().on("click", function () {
                if ($(this).css("cursor") !== "pointer"){return;}

                var subversesArr = _this.module.GetSubversesList();
                var idx = $(this).parent().index() -1;
                AVE.Utils.move(subversesArr, idx, idx-1);

                _this.module.Store.SetValue(_this.module.StorageName, subversesArr.join(","));
                _this.Reload();
            });
        },

        Reload: function () {
            this.module.DisplayCustomSubversesList();
            $(this.CSSselector).trigger("click"); //Reload-update
        }
    }
};
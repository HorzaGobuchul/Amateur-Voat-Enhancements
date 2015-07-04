AVE.Modules['Shortcuts'] = {
    ID: 'Shortcuts',
    Name: 'Subverse and Set shortcuts',
    Desc: 'Replace the subverse list header with a custom list.',
    Category: 'General',

    Order: 4,
    Debug: true,
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
        var self = AVE.Modules['Shortcuts'];

        self.Store.SetValue(self.Store.Prefix + self.ID, JSON.stringify(POST[self.ID]));
    },

    SetOptionsFromPref: function () {
        var self = this;
        var Opt = self.Store.GetValue(self.Store.Prefix + self.ID);

        if (Opt !== null) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                self.Options[key].Value = value;
            });
        }
        this.Enabled = self.Options.Enabled.Value;
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

        DisplayCustomSubversesList();
        if (AVE.Utils.isPageSubverse) {
            AppendShortcutButton();
        } else if (AVE.Utils.currentPageType == "subverses") {
            AddShortcutsButtonInSubversesPage();
        } else if ($.inArray(AVE.Utils.currentPageType, ["mysets", "sets"]) >= 0) {
            AddShortcutsButtonInSetsPage();
        } else if (AVE.Utils.currentPageType == "set") {
            AddShortcutsButtonInSetPage();
        }

        function AddShortcutsButtonInSetsPage() {
            var inShortcut = false;
            var tempSetName = "";
            var tempSetId = "";

            $("div[id*='set']").each(function () {
                tempSetName = $(this).find(".h4").text();//.replace(/([&\/\\#,+()$~%.'":*?<>{}])/g, '\\$1');
                tempSetId = $(this).find(".h4").attr("href").substr(5);
                inShortcut = isSubInShortcuts(tempSetName + ":" + tempSetId);

                var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default' + (inShortcut ? "" : "btn-sub") + '">'
                                        + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
                $(btnHTML).insertAfter($(this).find(".midcol").first());
            });

            $(document).on("click", "#GM_Sets_Shortcut", function () {
                var setName = $(this).attr("setName");
                var setId = $(this).attr("setId");

                if (setName == null || setName == undefined || setName == "undefined" ||
                    setId == null || setId == undefined) {
                    alert("AVE: Error adding set " + setName + ", id: " + setId);
                    return;
                }

                var set = setName + ":" + setId;
                if (isSubInShortcuts(set)) {
                    RemoveFromShortcuts(set);
                    ToggleShortcutButton(true, this);
                }
                else {
                    AddToShortcuts(set);
                    ToggleShortcutButton(false, this);
                }

                DisplayCustomSubversesList();
            });
        }

        //// Special to voat.co/subverses: adds a "shortcut" button for each subverse////
        function AddShortcutsButtonInSubversesPage() {
            var inShortcut = false;
            var tempSubName = "";

            $('.col-md-6').each(function () {
                tempSubName = $(this).find(".h4").attr("href").substr(3);
                inShortcut = isSubInShortcuts(tempSubName);

                var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Subverses_Shortcut" subverse="'+ tempSubName + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">'
                                        + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
                $(btnHTML).insertAfter($(this).find(".midcol").first());
            });

            $(document).on("click", "#GM_Subverses_Shortcut", function () {
                var subName = $(this).attr("subverse");
                if (isSubInShortcuts(subName)) {
                    RemoveFromShortcuts(subName);
                    ToggleShortcutButton(true, this);
                }
                else {
                    AddToShortcuts(subName);
                    ToggleShortcutButton(false, this);
                }

                DisplayCustomSubversesList();
            });
        }

        /// Common to voat.co: modifies the subverses header list with custom subverses ////
        function DisplayCustomSubversesList() {
            var SubString = '';
            var subArr = GetSubversesList();
            var setInfo = [];

            for (var idx in subArr) {
                if (subArr[idx] == "") { continue; }
                if (AVE.Utils.regExpSet.test(subArr[idx])) { //ex: name:12
                    setInfo = GetSetParam(subArr[idx]);
                    SubString += '<li><span class="separator">-</span><a href="/set/' + setInfo[1] + '/" style="font-weight:bold;font-style: italic;">' + setInfo[0] + '</a></li>';
                }
                else {
                    SubString += '<li><span class="separator">-</span><a href="/v/' + subArr[idx] + '/">' + subArr[idx] + '</a></li>';
                }
            }
            $('ul#sr-bar').html(SubString);
        }

        //// Special to subverse: adds a "shortcut" button for this subverse////
        function AppendShortcutButton() {

            if (!isPageInShortcuts()) {
                var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
            }
            else {
                var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
            }

            if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length) {
                $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
            }
            else {
                $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
            }

            $(document).on("click", "#GM_Shortcut", function () {
                if (isPageInShortcuts()) {
                    RemoveFromShortcuts(AVE.Utils.subverseName);
                    ToggleShortcutButton(true, "#GM_Shortcut");
                }
                else {
                    AddToShortcuts(AVE.Utils.subverseName);
                    ToggleShortcutButton(false, "#GM_Shortcut");
                }

                DisplayCustomSubversesList();
            });
        }
        /// Special methods related to shortcuts ///
        function GetSubversesList() {
            self = AVE.Modules['Shortcuts'];
            return self.Store.GetValue(self.StorageName, "newsubverses,introductions,news").split(',');
        }

        function GetSetParam(str) {
            var m = AVE.Utils.regExpSet.exec(str);

            if (m == null) { return null; }
            else { return [m[1].toLowerCase(), m[2]]; }
        }

        function AddToShortcuts(SubName) {
            self = AVE.Modules['Shortcuts'];
            var subversesArr = self.GetSubversesList();
            var str = subversesArr.join(",") + "," + SubName;

            self.Store.SetValue(self.StorageName, str);
        }

        function RemoveSetFromShortcut(id) {
            self = AVE.Modules['Shortcuts'];
            var subversesArr = self.GetSubversesList();

            for (var x in subversesArr) {
                if (AVE.Utils.regExpSet.test(subversesArr[x])) {
                    if (self.GetSetParam(subversesArr[x])[1] == id) {
                        self.RemoveFromShortcuts(subversesArr[x]);
                        return true;
                    }
                }
            }
            return false;
        }

        function RemoveFromShortcuts(SubName) {
            self = AVE.Modules['Shortcuts'];
            var subversesArr = self.GetSubversesList();
            var idx = subversesArr.indexOf(SubName);

            if (idx < 0) {
                alert("AVE: sub or set name not found in Header list\n(" + SubName + ")");
                return false;
            }

            subversesArr.splice(idx, 1);
            self.Store.SetValue(self.StorageName, subversesArr.join(","));
        }

        function ToggleShortcutButton(state, sel) {
            if (state == true) {
                $(sel).text('+ shortcut');
                $(sel).addClass('btn-sub')
            }
            else {
                $(sel).text('- shortcut');
                $(sel).removeClass('btn-sub');
            }
        }

        function isSubInShortcuts(Sub) {
            self = AVE.Modules['Shortcuts'];
            var subversesArr = self.GetSubversesList();

            for (var i in subversesArr) {
                if (subversesArr[i].toLowerCase() == Sub.toLowerCase()) {
                    return true;
                }
            }
            return false;
        }

        function isPageInShortcuts() {
            self = AVE.Modules['Shortcuts'];
            var subversesArr = self.GetSubversesList();

            return self.isSubInShortcuts(AVE.Utils.subverseName);
        }
    },
};
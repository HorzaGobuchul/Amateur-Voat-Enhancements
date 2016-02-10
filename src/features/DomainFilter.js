AVE.Modules['DomainFilter'] = {
    ID: 'DomainFilter',
    Name: 'Domain filter',
    Desc: 'Use filters to remove submissions linking to particular domains.',
    Category: 'Domains',

    Index: 101,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Filters: {
            Type: 'array',
            Desc: "Example of filter",
            Value: [] //not JSONified
        }
    },

    filters: [],

    Filter: function (id, keyword, sub) {
        this.Id = id || 0;
        this.Keywords = keyword || []; //List of keywords
        this.ApplyToSub = sub || []; //List of subs
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        var id, kw, sub, tV;

        this.Options.Filters.Value = [];

        $.each(POST, function (k, v) {
            tV = k.split("-");
            if (tV.length === 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] === "kw") {
                if (v.length === 0) { return true; } //If no kw were specified: continue
                else {
                    _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(","), []));
                }
            } else if (tV[1] === "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id === id; });
                if (inArr.length === 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length !== 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(",");
                }
            }
        });

        //print(JSON.stringify( _this.Options.Filters.Value));

        this.Store.SetValue(this.Store.Prefix + this.ID,
            JSON.stringify(
                {
                    Enabled: POST.Enabled,
                    Filters: this.Options.Filters.Value,
                }
            )
        );
    },

    ResetPref: function () {
        var _this = this;
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        var _this = this;
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions", "saved"]) === -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.filters = jQuery.extend([], _this.Options.Filters.Value);

            if (AVE.Modules['DomainTags'].Enabled){
                var id = _this.Options.Filters.Value.length;
                $.each(AVE.Modules['DomainTags'].DomainTags, function (name, tag) {
                    if (tag.i){
                        _this.filters.push(new _this.Filter(id++, [name.toLowerCase()]));
                    }
                });
            }

            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        //When a submission is filtered it is simply removed, so no need to check anything special when the update method is triggered.

        var re, found;
        $("div.entry > p.title > span.domain > a").each(function () {
            var DomainRef = $(this);
            var DomainStr = DomainRef.text().toLowerCase(); //if str == self.(SubName) continue
            $.each(_this.filters, function () {
                found = false;
                if (this.ApplyToSub.length === 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) !== -1) {
                    $.each(this.Keywords, function () {
                        if (this.length === 0) { return true;}//Just in case
                        // ((Start of string OR preceded by a period) OR (End of line OR followed by a period))
                        re = new RegExp("(^|\\.)"+this+"($|\\.)");
                        // An issue could arise if a filter matches a subdomain's name. Unfortunately, I cannot check to see if an TLD always follows.
                        if (re.test(DomainStr)) {
                            print("AVE: removed submission from domain \"" + DomainStr + "\" (kw: \"" + this + "\")");
                            DomainRef.parents("div.submission:first").remove();
                            found = true; //no point in continuing since the submission no longer exists
                            return false; //break
                        }
                    });
                }
                if (found) { return false; } //break
            });
            if (found) { return true; } //continue
        });
    },

    Update: function () {//Use if this module needs to be update by UpdateAfterLoadingMore or NeverEndingVoat, remove otherwise
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        htmlNewFilter: '',

        html: function () {
            var _this = AVE.Modules['DomainFilter'];
            var Pref_this = this;
            var htmlStr = "";

            this.htmlNewFilter = '<span class="AVE_Domain_Filter" id="{@id}">\
                                Keyword(s) \
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@keywords}"/>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="DomainFilter" value="{@subverses}"/>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "abc" matches "abc.com", "en.abc.com" but not "abcd.com".<br />Separate keywords and subverse names by a comma.</span><br />';

            var count = 0;
            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />";
                filter = filter.replace(/\{@id\}/ig, count);
                filter = filter.replace("{@keywords}", this.Keywords.join(","));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(","));
                count++;
                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            var JqId = $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter");
            $("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />";
                html = html.replace(/\{@id\}/ig, parseInt($("div#DomainFilter > div.AVE_ModuleCustomInput > span.AVE_Domain_Filter:last").attr("id"), 10) + 1);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#DomainFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
                $("div#DomainFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                    print("Remove link: " + $(this).attr("id"), true);
                    print("Remove span: " + $(this).prev("span.AVE_Domain_Filter").attr("id"), true);
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Domain_Filter").remove();
                    $(this).remove();
                });
                AVE.Modules.PreferenceManager.ChangeListeners();
            });

            JqId.off("click");
            JqId.on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Domain_Filter").remove();
                $(this).remove();

                AVE.Modules.PreferenceManager.AddToModifiedModulesList("DomainFilter");
            });
        },
    },
};
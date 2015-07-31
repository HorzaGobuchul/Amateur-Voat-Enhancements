AVE.Modules['SubmissionFilter'] = {
    ID: 'SubmissionFilter',
    Name: 'Submission Filter',
    Desc: 'Remove submissions which title matches one of the filters. Additionally, you can specify a subverse, where a filter will only be applied.',
    Category: 'Subverse',

    Index: 100,
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
            Value: [], //not JSONified
        },
    },

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
            if (tV.length == 2) {
                id = parseInt(tV[0], 10);
            } else { return true; } //if this isn't a filter value: continue

            if (tV[1] == "kw") {
                if (v.length == 0) { return true; } //If no kw were specified: continue
                else {
                    _this.Options.Filters.Value.push(new _this.Filter(id, v.toLowerCase().split(" "), []))
                }
            } else if (tV[1] == "sub") {
                var inArr = $.grep(_this.Options.Filters.Value, function (e) { return e.Id == id; });
                if (inArr.length == 0) {
                    //if there is no filter with this ID: continue
                    return true;
                } else if (v.length != 0) {
                    var idx = $.inArray(inArr[0], _this.Options.Filters.Value);
                    _this.Options.Filters.Value[idx].ApplyToSub = v.toLowerCase().split(" ");
                }
            }
        });

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
            _this.Options[key].Value = value;
        });

        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain"]) == -1) {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        //When a submission is filtered it is removed, so no need to check anyting special when the update method is triggered.

        var re, found;
        $("div.entry > p.title > a.title").each(function () {
            var titleStr = $(this).text().toLowerCase();
            var titleRef = $(this);
            $.each(_this.Options.Filters.Value, function () {
                found = false;
                if (this.ApplyToSub.length == 0 || $.inArray(AVE.Utils.subverseName, this.ApplyToSub) != -1) {
                    $.each(this.Keywords, function () {
                        re = new RegExp(this);
                        if (re.test(titleStr)) {
                            print("AVE: removed submission with title \"" + titleStr + "\" (kw: \"" + this + "\")");
                            titleRef.parents("div.submission:first").remove();
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
            var _this = AVE.Modules['SubmissionFilter'];
            var Pref_this = this;
            var htmlStr = "";

            this.htmlNewFilter = '<span class="AVE_Submission_Filter" id="{@id}">\
                                Keyword(s) \
                                    <input id="{@id}-kw" style="width:40%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input id="{@id}-sub" style="width:29%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            htmlStr += '<span style="font-weight:bold;"> Example: "ex" matches "rex", "example" and "bexter".<br />Separate keywords and subverse names by a space.</span><br />';

            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />"
                filter = filter.replace(/{@id}/ig, this.Id);
                filter = filter.replace("{@keywords}", this.Keywords.join(" "));
                filter = filter.replace("{@subverses}", this.ApplyToSub.join(" "));

                htmlStr += filter;
            });

            htmlStr += '<a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            var Pref_this = this;
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                var html = Pref_this.htmlNewFilter + "<br />"
                html = html.replace(/{@id}/ig, $("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter").length);
                html = html.replace("{@keywords}", "");
                html = html.replace("{@subverses}", "");

                $(html).insertBefore("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

                $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
                $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                    //print("Remove link: " + $(this).attr("id"));
                    //print("Remove span: " + $(this).prev("span.AVE_Submission_Filter").attr("id"));
                    $(this).next("br").remove();
                    $(this).prev("span.AVE_Submission_Filter").remove();
                    $(this).remove();
                });
            });

            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").off("click");
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                $(this).next("br").remove();
                $(this).prev("span.AVE_Submission_Filter").remove();
                $(this).remove();
            });
        },
    },
};
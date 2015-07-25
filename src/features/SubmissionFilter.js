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
        RemoveFiltered: {
            Type: 'boolean',
            Desc: "Remove altogether the comment and all child comments.",
            Value: false,
        },
    },

    Filter: function (id, sub, keyword) {
        this.Id = id || 0;
        this.ApplyToSub = sub || []; //List of subs
        this.Keywords = keyword || []; //List of keywords
    },

    /*
    What is a filter?
    A filter then is an asso array like:
        {sub: null|string, word: "string of words separated by spaces"}
        //If sub is null, it applies everywhere
    */

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        //toLowerCase
        //parse new keyword: [a-z0-9]

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
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
        //When a submission is filtered it is removed, so no need to check anyting special when update is triggered.

        this.Options.Filters.Value.push(new this.Filter(0, ["ave"], ["beta"]));

        //AVE.Utils.subverseName
        var re;
        $("div.entry > p.title > a.title").each(function () {
            var titleStr = $(this).text().toLowerCase();
            var titleRef = $(this);
            $.each(_this.Options.Filters.Value, function () {
                if (this.ApplyToSub.length == 0 ||
                    $.inArray(AVE.Utils.subverseName, this.ApplyToSub) != -1) {
                    $.each(this.Keywords, function () {
                        re = new RegExp(this);
                        if (re.test(titleStr)) {
                            print("AVE: removed submission with title \"" + titleStr + "\" (tag: \"" + this + "\")");
                            titleRef.parents("div.submission:first").remove();
                        }
                    });
                }
            });
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
                                    <input style="width:40%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input style="width:30%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            //Add short info about filters before inserting them
            // Use only approved symbols (get those used by voat cs)
            // Show examples: like "ex" matches "rex", "example", "bexter", ...

            $.each(_this.Options.Filters.Value, function () {
                var filter = Pref_this.htmlNewFilter + "<br />"
                filter = filter.replace(/{@id}/ig, $("div#SubmissionFilter > div.AVE_ModuleCustomInput > span.AVE_Submission_Filter").length);
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
                    //print("Remove link: "+ $(this).attr("id"));
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
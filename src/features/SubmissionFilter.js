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
            Value: "", //JSONified
        },
        RemoveFiltered: {
            Type: 'boolean',
            Desc: "Remove altogether the comment and all child comments.",
            Value: false,
        },
    },

    Filter: {
        Id: 0,
        ApplyToSub: [], //List of subs
        Keywords: [], //List of keywords
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

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        //When a submission is filtered it is removed, so no need to check anyting special when updating.
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

            this.htmlNewFilter = '<span id="{@id}">\
                                Keyword(s) \
                                    <input style="width:40%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@keywords}"></input>\
                                    Subverse(s) \
                                    <input style="width:30%;background-color: #' + (AVE.Utils.CSSstyle == "dark" ? "2C2C2C" : "DADADA") + ';" type="text" Module="SubmissionFilter" value="{@subverses}"></input>\
                                </span>\
                                <a href="javascript:void(0)" title="Remove filter" style="font-size: 16px;font-weight: bold;" class="RemoveFilter" id="{@id}">-</a>';

            var htmlStr = '<a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AddNewFilter">Add new filter</a>';

            return htmlStr;
        },

        callback: function () {
            Pref_this = this;
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter").on("click", function () {
                $(Pref_this.htmlNewFilter+"<br />").insertBefore("div#SubmissionFilter > div.AVE_ModuleCustomInput > a#AddNewFilter");

            });
            $("div#SubmissionFilter > div.AVE_ModuleCustomInput > a.RemoveFilter").on("click", function () {
                alert("click");
                //Remove
            });


            //parse new keyword: [a-zA-Z0-9]
        },
    },
};
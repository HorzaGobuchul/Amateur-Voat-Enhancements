AVE.Modules['RememberCommentCount'] = {
    ID: 'RememberCommentCount',
    Name: 'Remember comment count',
    Desc: 'For all visited threads show the number of new comments since the last time they were opened.',
    Category: 'Thread',

    Index: 100,
    Enabled: false,

    Store: {},
    StorageName: "",
    Data: {},
    Processed: [],
    TimeStamp: 0,

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        HighlightNewComments: {
            Type: 'boolean',
            Desc: "Highlight new comments.",
            Value: false
        },
        HighlightStyle: {
            Type: 'string',
            Desc: "Highlight CSS value",
            Value: ['#473232',
                    '#ffffcf']
        },
        MaxStorage: {
            Type: 'int',
            Range: [1,5000],
            Desc: "Max number of threads to remember",
            Value: 400
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        POST = POST[this.ID];

        //Clamping
        if(POST.MaxStorage > 5000){POST.MaxStorage=5000;}
        else if(POST.MaxStorage < 1){POST.MaxStorage=1;}

        //Save style for both theme
        this.Options.HighlightStyle.Value[style] = POST.HighlightStyle;
        POST.HighlightStyle = this.Options.HighlightStyle.Value;

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.StorageName = this.Store.Prefix + this.ID + "_Data";
            //this.Data = JSON.parse(this.Store.SetValue(this.StorageName, "{}"));
            this.Data = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));
            this.Pruning();
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Pruning: function(){
        var count, key;
        count = Object.keys(this.Data).length - this.Options.MaxStorage.Value;

        if (count < 1) {return;}

        count += Math.ceil(this.Options.MaxStorage.Value / 8); //If over the limit we remove 1/8th of the total value

        for (key in this.Data){
            delete(this.Data[key]);
            count--;
            if (count === 0){break;}
        }
        this.Store.SetValue(this.StorageName, JSON.stringify(this.Data));
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        var _this = this;
        var _style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
        var _count, _id;
        //this.Data = {448721: 2, 594824: 2, 592949: 1};

        if (AVE.Utils.currentPageType === "thread") { // comments
            var JqId = $("a.comments.may-blank:first");
            var _new = JqId.find("span").length == 0;
            _count = parseInt(JqId.text().split(" ")[0], 10) || 0;
            if (_count > 0){
                _id = $("div.submission[class*='id-']:first").attr("id").split("-")[1];
                if (this.Data.hasOwnProperty(_id)){
                    if (_new){
                        _this.TimeStamp = _this.Data[_id][1];
                        if (_count > this.Data[_id][0]){
                            JqId.append('&nbsp;<span style="font-weight:bold;color:#4189B1;">(+'+(_count - this.Data[_id][0])+')</span>');
                        }
                    }

                    if(_this.Options.HighlightNewComments.Value){
                        var CommId, CommTimeStamp;
                        var CommAuthor, Username;

                        Username = $("span.user > a[title='Profile']");
                        Username = Username.length > 0 ? Username.text().toLowerCase() : "";
                        $("div.noncollapsed").each(function () {
                            CommId = $(this).attr("id");
                            CommAuthor = $(this).find("a.userinfo.author").text().toLowerCase();

                            if ($.inArray(CommId, _this.Processed) === -1 && CommAuthor !== Username){
                                CommTimeStamp = new Date($(this).find("time:first").attr("datetime")).getTime();
                                if (CommTimeStamp > _this.TimeStamp){
                                    $(this).parents("div[class*=' id-']:first").css('background-color', _this.Options.HighlightStyle.Value[_style]);
                                }

                                _this.Processed.push(CommId)
                            }
                        });
                    }

                    //print("AVE: RememberCommentCount > updating "+ _id);
                } else {
                    //print("AVE: RememberCommentCount > adding "+ _id);
                }

                if (this.Data.hasOwnProperty(_id) && _count === this.Data[_id][0]){
                    //Pass
                } else if (_new) {
                    //s("AVE: RememberCommentCount > Writing");
                    //Update Stored Data in case multiple threads were opened at the same time (we don't want them to overwrite each others).
                    AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
                    this.Data = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));

                    this.Data[_id] = [_count, Date.now()];
                    this.Store.SetValue(this.StorageName, JSON.stringify(this.Data));
                }
            }
        } else if ($.inArray(AVE.Utils.currentPageType, ["frontpage", "set", "subverse", "search", "domain", "user-submissions"]) !== -1) { // submissions
            $("a.comments.may-blank").each(function () {
                _id = $(this).parents("div.submission[class*='id-']:first").attr("data-fullname");
                if ($.inArray(_id, _this.Processed) !== -1){return true;}

                _count = parseInt($(this).text().split(" ")[0], 10) || 0;
                if (_count > 0){
                    if (_this.Data.hasOwnProperty(_id) && _count > _this.Data[_id][0]){
                        $(this).append('&nbsp;<span style="font-weight:bold;color:#4189B1;">(+'+(_count - _this.Data[_id][0])+')</span>');
                    }
                }
                _this.Processed.push(_id)
            });
        }
    },

    Listeners: function () {
        var _this = this;
        $("body")//Doesn't work. Not "live"
            .off()
            .on("click", "form[id^='commentreplyform-'] > input#submitbutton[value='Submit reply']",  function () {
                var _id;
                alert("New comment by user");
                _id = $("div.submission[class*='id-']:first").attr("id").split("-")[1];

                AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
                _this.Data = JSON.parse(_this.Store.GetValue(_this.StorageName, "{}"));

                if (_this.Data.hasOwnProperty(_id)){
                    _this.Data[_id][0] = _this.Data[_id][0]++;
                    _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.Data));
                }
            });
    },

    AppendToPreferenceManager: {
        html: function () {
            var style = AVE.Utils.CSSstyle === "dark" ? 0 : 1;
            var _this = AVE.Modules['RememberCommentCount'];
            var htmlStr = '';

            htmlStr += '<label style="display:inline;" for="MaxStorage"> ' + _this.Options.MaxStorage.Desc + ': </label><input style="width: 60px;" id="MaxStorage" type="number" name="MaxStorage" value="'+_this.Options.MaxStorage.Value+'" min="1" max="5000"> (Currently: '+ Object.keys(_this.Data).length+')<br />'; //Max: '+_this.Options.MaxStorage.Range[1]+',
            htmlStr += '<input id="HighlightNewComments" ' + (_this.Options.HighlightNewComments.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="HighlightNewComments"> ' + _this.Options.HighlightNewComments.Desc + '</label><br />';

            htmlStr += '<div style="display:inline;padding-left:15px;padding-right:15px;margin-right:10px;" id="Demo_HighlightStyle"></div>';
            htmlStr += '<input style="font-size:12px;display:inline;width:60px;padding:0px;" class="form-control" type="text" Module="' + _this.ID + '" id="HighlightStyle" Value="'+_this.Options.HighlightStyle.Value[style]+'"/> - Highlight CSS value<br />';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['RememberCommentCount'];

            $("input[id='HighlightStyle'][Module='" + _this.ID + "']").on("keyup", function () {
                $("div#Demo_HighlightStyle").css("background-color", $("input[id='HighlightStyle'][Module='" + _this.ID + "']").val());
            }).trigger("keyup");
        }
    }
};
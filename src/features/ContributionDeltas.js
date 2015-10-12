AVE.Modules['ContributionDeltas'] = {
    ID: 'ContributionDeltas',
    Name: 'CCP and SCP differences',
    Desc: 'Show the difference in contribution points between now and X time ago.',
    Category: 'General',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "load",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        AddAsToolTip: {
            Type: 'boolean',
            Desc: 'Show deltas in a tooltip instead of inline.',
            Value: false
        },
        ShowColourDelta: {
            Type: 'boolean',
            Desc: 'Show points in green (+) or red (-) according to the change.',
            Value: true
        },
        ShowSinceLast: {
            Type: 'string',
            Desc: 'Show contribution points deltas for the last: ',
            Value: 'week'
        }
    },

    SinceLast: ["reset", "connection", "30 minutes",
                "hour", "2 hours", "6 hours", "12 hours",
                "day", "2 days", "4 days", "week", "2 weeks",
                "month", "2 months", "5 months", "year"],
    /*
        Do we need to keep all intermediary timestamps?
    Number of TimeStamps sampled (","):
        30min ,,, (every ten minutes)
        1h ,,, (every ten minutes)
        2h ,,,, (every fifteen minutes)
        6h ,,,, (every hour)
        12h ,,,,,, (every hour)
            Don't log automatically the previous values unless the users as selected one of them
        1d , (every day) After this point it will basically show "since last connection" for users who log in daily or less frequently
        2d , (evey day)
        4d ,, (every day)
        1w ,,, (every day)
        2w ,,,,,,, (every day)
        1m ,, (every week)
        2m ,,,, (every week)
        5m ,,, (every month)
        1y ,,,,,,, (every month)

        Total:
            49 TimeStamps.
            1 updated every ten minutes
            2 updated every fifteen minutes

            3 updated every hour

            24 updated every day.

            If we use a trickle down system, the updates are simpler

       With this solution all need to be checked and updated often. Not just the one selected.
    */
    // Since last visit? How can I do this with a GM script? With Voat's cookies (NotFirstTime)?
    // Don't add this option, this can be done by selecting the SinceLast value corresponding the frequency at which the users logs-in.

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
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

    Username: "",
    StoredDeltas: {},
    CCP: 0,
    SCP: 0,

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        this.Username = $(".logged-in > .user > a[title='Profile']");
        if (this.Username.length > 0){
            this.Username = this.Username.text();
        } else {
            this.Enabled = false;
        }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        var _this = this;
        this.CCP = $("a.userkarma#ccp").text();
        this.SCP = $("a.userkarma#scp").text();

        this.StoredDeltas = JSON.parse(this.Store.GetValue(this.Store.Prefix + this.ID + "_Deltas", "{}"));
        if (this.StoredDeltas[this.Username] === undefined) {
            this.StoredDeltas[this.Username] = {};
            $.each(_this.SinceLast, function () {
                _this.StoredDeltas[_this.Username][this] = {ts: Date.now(), S: _this.SCP, C: _this.CCP};
            });

            this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", JSON.stringify(this.StoredDeltas));
        } else {
            // Only check new value for the SinceLast selected

            //save changes if any was made
            //this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", StoredDeltas);
        }

        this.AppendToPage();
    },

    AppendToPage: function () {
        var delta, JqId, data;

        data = this.StoredDeltas[this.Username][this.Options.ShowSinceLast.Value];

        //SCP
        JqId = $("a.userkarma#scp");
        delta = JqId.text() - data.S;
        if (this.Options.AddAsToolTip.Value){
            JqId.parent().attr("title", (delta > 0 ? "+": "") +delta);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                JqId.css("color", ( delta > 0 ?"#1BB61B": "#FF4B4B") );
            }
        } else {
            $('<span title="SCP delta" id="AVE_SCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_SCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }

        //CCP
        JqId = $("a.userkarma#ccp");
        delta = JqId.text() - data.C;
        if (this.Options.AddAsToolTip.Value){
            JqId.parent().attr("title", (delta > 0 ? "+": "") +delta);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                JqId.css("color", ( delta > 0 ?"#1BB61B" : "#FF4B4B") );
            }
        } else {
            $('<span title="CCP delta" id="AVE_CCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_CCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var htmlStr = '';

            htmlStr += '<input id="AddAsToolTip" ' + (_this.Options.AddAsToolTip.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AddAsToolTip"> ' + _this.Options.AddAsToolTip.Desc + '</label><br />';
            htmlStr += '<input id="ShowColourDelta" ' + (_this.Options.ShowColourDelta.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowColourDelta"> ' + _this.Options.ShowColourDelta.Desc + '</label><br />';

            htmlStr += "<br />"+_this.Options.ShowSinceLast.Desc;
            htmlStr += '<select id="ShowSinceLast">';
            $.each(_this.SinceLast, function () {
                htmlStr += '<option ' + (_this.Options.ShowSinceLast.Value == this ? "selected" : "") + ' value="' + this + '">' + this + '</option>';
            });
            htmlStr += '</select>';

            /*
            Button to display all SinceLast: (in a table?)
                SinceLast[]: CCP/SCP
                e.g. In last week: #/#
             */

            if (_this.Username.length > 0) {
                htmlStr += '<br /><br />Current user: ' + _this.Username + '.<br /> <a style="margin-top: 10px;" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub" id="AVE_Reset_SinceLast">Reset count</a> <span id="AVE_LastReset">Last reset on ' + this.GetParsedDate(_this.StoredDeltas[_this.Username]["reset"].ts) + '</span>';
            }
            return htmlStr;
        },

        callback: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var _Mngthis = this;
            var JqId;

            JqId = $("div#ContributionDeltas > div.AVE_ModuleCustomInput > a#AVE_Reset_SinceLast");

            JqId.off("click");
            JqId.on("click", function () {
                $("span#AVE_LastReset").text('Last reset on '+ _Mngthis.GetParsedDate(Date.now()));

                _this.StoredDeltas[_this.Username]["reset"] = {ts: Date.now(), S: $("a.userkarma#scp").text(), C: $("a.userkarma#ccp").text()};
                _this.Store.SetValue(_this.Store.Prefix + _this.ID + "_Deltas", JSON.stringify(_this.StoredDeltas));
            });
        },

        GetParsedDate: function(timeStamp) {
            var r = new Date(timeStamp);
            return r.getFullYear()+'-'+ (r.getMonth()+1)+'-'+ r.getDate()+' '+ r.getHours()+':'+ r.getMinutes()+':'+ r.getSeconds();
        }
    }
};
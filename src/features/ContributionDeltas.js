AVE.Modules['ContributionDeltas'] = {
    ID: 'ContributionDeltas',
    Name: 'CCP and SCP differences',
    Desc: 'Show the difference in contribution points between now and X time ago.',
    Category: 'General',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        },
        AddAsToolTip: {
            Type: 'boolean',
            Desc: 'Show differences in a tooltip instead of inline.',
            Value: false
        },
        ShowColourDelta: {
            Type: 'boolean',
            Desc: 'Show points in green (+) or red (-) according to the change.',
            Value: true
        },
        ShowMultipleDeltas: {
            Type: 'boolean',
            Desc: 'Show multiple differences in the tooltip (Hour, Day, Week).',
            Value: false
        },
        ShowSinceLast: {
            Type: 'string',
            Desc: 'Show contribution point differences for the last: ',
            Value: 'day'
        }
    },

    SinceLast: ["reset", "page", "hour", "6 hours",
                "12 hours", "day", "week"],

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be removed.
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
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
        var _now = Date.now();
        this.CCP = $("a.userkarma#ccp").text();
        this.SCP = $("a.userkarma#scp").text();

        //this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", "{}");

        this.StoredDeltas = JSON.parse(this.Store.GetValue(this.Store.Prefix + this.ID + "_Deltas", "{}"));
        if (this.StoredDeltas[this.Username] === undefined) {
            var tempVal = {ts: new Date (0), S: _this.SCP, C: _this.CCP};
            this.StoredDeltas[this.Username] = {};
            $.each(_this.SinceLast, function () {
                _this.StoredDeltas[_this.Username][this] = tempVal;
            });

            this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", JSON.stringify(this.StoredDeltas));
        }

        var dateDiff, change, newTs, epsilon;
        epsilon = 2000; //2 sec.
        change = false;

        if ((_now - _this.StoredDeltas[_this.Username]["page"].ts) > epsilon){//page
            change = true;
            print("AVE: ContribDelta > Updated \"Page\"", true);
            _this.StoredDeltas[_this.Username]["page"] = {ts: _now, S: _this.SCP, C: _this.CCP};

            dateDiff = (_now - _this.StoredDeltas[_this.Username]["hour"].ts) /1000;
            if (dateDiff > 3600) { //Hour
                print("AVE: ContribDelta > Updated \"hour\"", true);

                newTs = new Date (_now).setMinutes(0, 0);
                _this.StoredDeltas[_this.Username]["hour"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                dateDiff = (_now - _this.StoredDeltas[_this.Username]["6 hours"].ts) / 1000;
                if (dateDiff > 21600) { //6 hours
                    print("AVE: ContribDelta > Updated \"6 hours\"", true);

                    var newTsHour = new Date (newTs).getHours();
                    newTs = new Date (newTs).setHours(
                        (newTsHour < 4 ? 0 :
                            (newTsHour < 10 ? 6 :
                                (newTsHour < 16 ? 12 : 18)
                                )
                            )
                        );
                    _this.StoredDeltas[_this.Username]["6 hours"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    dateDiff = (_now - _this.StoredDeltas[_this.Username]["12 hours"].ts) / 1000;
                    if (dateDiff > 43200) { //12 hours
                        print("AVE: ContribDelta > Updated \"12 hours\"", true);

                        newTs = new Date (newTs).setHours(newTsHour < 12 ? 0 : 12);
                        _this.StoredDeltas[_this.Username]["12 hours"] = {ts: newTs, S: _this.SCP, C: _this.CCP};
                    }
                }
                //Only check for days once per hour (and only check for week once per day)
                dateDiff = (_now - _this.StoredDeltas[_this.Username]["day"].ts) / 1000;
                if (dateDiff > 86400) { //day
                    print("AVE: ContribDelta > Updated \"Day\"", true);

                    newTs = new Date (newTs).setHours(6);

                    _this.StoredDeltas[_this.Username]["day"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    dateDiff = (_now - _this.StoredDeltas[_this.Username]["week"].ts) / 1000;
                    if (dateDiff > 604800) { //week
                        print("AVE: ContribDelta > Updated \"Week\"", true);
                        newTs -= 86400000 * ((new Date (newTs)).getDay() - 1);
                        _this.StoredDeltas[_this.Username]["week"] = {ts: newTs, S: _this.SCP, C: _this.CCP};

                    }
                }
            }
        }

        //save changes if any was made
        if (change) {
            this.Store.SetValue(this.Store.Prefix + this.ID + "_Deltas", JSON.stringify(this.StoredDeltas));
        }

        this.AppendToPage();
    },

    AppendToPage: function () {
        var _this = this;
        var delta, JqId, data, multipleD;

        multipleD = ["hour", "day", "week"];
        if ($.inArray(this.Options.ShowSinceLast.Value, multipleD) == -1){
            //Add selected SinceLast if it isn't already in the list
            multipleD.splice(0, 0, this.Options.ShowSinceLast.Value);
        }
        data = this.StoredDeltas[this.Username][this.Options.ShowSinceLast.Value];


        //SCP
        JqId = $("a.userkarma#scp");
        delta = JqId.text() - data.S;
        if (this.Options.AddAsToolTip.Value){
            if (this.Options.ShowMultipleDeltas.Value){
                JqId.parent().attr("title", (delta > 0 ? "+": "") +delta);
                if (this.Options.ShowColourDelta.Value && delta !== 0){
                    JqId.css("color", ( delta > 0 ?"#1BB61B": "#FF4B4B") );
                }
            }
        } else {
            $('<span title="SCP delta" id="AVE_SCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_SCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }

        if (this.Options.ShowMultipleDeltas.Value){
            var _str, _data, _delta;
            _str = "";
            $.each(multipleD, function (i, v) {
                _data = _this.StoredDeltas[_this.Username][v];
                _delta = JqId.text() - _data.S;
                _str += v + ": "+   (_delta > 0 ? "+": "") +_delta;
                if (i+1 != multipleD.length){
                    _str += "\n";
                }
            });

            if (this.Options.AddAsToolTip.Value){
                JqId.parent().attr("title", _str);
            } else {
                $("#AVE_SCP-delta").attr("title", _str);
            }
        }

        //CCP
        JqId = $("a.userkarma#ccp");
        delta = JqId.text() - data.C;
        if (this.Options.AddAsToolTip.Value){
            if (this.Options.ShowMultipleDeltas.Value) {
                JqId.parent().attr("title", (delta > 0 ? "+" : "") + delta);
                if (this.Options.ShowColourDelta.Value && delta !== 0) {
                    JqId.css("color", ( delta > 0 ? "#1BB61B" : "#FF4B4B"));
                }
            }
        } else {
            $('<span title="CCP delta" id="AVE_CCP-delta"> ('+ (delta > 0 ? "+": "") +delta+')</span>')
                .insertAfter(JqId);
            if (this.Options.ShowColourDelta.Value && delta !== 0){
                $("#AVE_CCP-delta").css("color", delta > 0 ?"#1BB61B" : "#FF4B4B");
            }
        }

        if (this.Options.ShowMultipleDeltas.Value){
            var _str, _data, _delta;
            _str = "";
            $.each(multipleD, function (i, v) {
                _data = _this.StoredDeltas[_this.Username][v];
                _delta = JqId.text() - _data.C;
                _str += v + ": "+   (_delta > 0 ? "+": "") +_delta;
                if (i+1 != multipleD.length){
                    _str += "\n";
                }
            });

            if (this.Options.AddAsToolTip.Value){
                JqId.parent().attr("title", _str);
            } else {
                $("#AVE_CCP-delta").attr("title", _str);
            }
        }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ContributionDeltas'];
            var htmlStr = '';

            htmlStr += '<input id="AddAsToolTip" ' + (_this.Options.AddAsToolTip.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="AddAsToolTip"> ' + _this.Options.AddAsToolTip.Desc + '</label><br />';
            htmlStr += '<input id="ShowColourDelta" ' + (_this.Options.ShowColourDelta.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowColourDelta"> ' + _this.Options.ShowColourDelta.Desc + '</label><br />';
            htmlStr += '<input id="ShowMultipleDeltas" ' + (_this.Options.ShowMultipleDeltas.Value ? 'checked="true"' : "") + ' type="checkbox"/><label style="display:inline;" for="ShowMultipleDeltas"> ' + _this.Options.ShowMultipleDeltas.Desc + '</label><br />';

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

            if (_this.StoredDeltas[_this.Username] && _this.Username.length > 0) {
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
            return new Date(timeStamp).toLocaleString();
        }
    }
};
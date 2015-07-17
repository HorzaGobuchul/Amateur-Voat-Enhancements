AVE.Modules['FixContainerWidth'] = {
    ID: 'FixContainerWidth',
    Name: 'Set Voat container\'s width',
    Desc: 'By default, Voat shows a margin at both sides of the container. You can modify this by setting the new width as a percentage of the available horizontal space.',
    Category: 'Fixes',

    Index: 100,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Width: {
            Type: 'int',
            Range: [1,100],
            Value: 100,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['FixContainerWidth'];
        POST = POST[_this.ID];

        POST.Width = parseInt(POST.Width);
        if (typeof POST.Width != "number" || isNaN(POST.Width)) {
            POST.Width = _this.Options.Width.Value;
        }

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        var _this = AVE.Modules['FixContainerWidth'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = AVE.Modules['FixContainerWidth'];
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        $("div#container").css("max-width", this.Options.Width.Value + "%");
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            var htmlStr = '<input style="width:50%;display:inline;" id="Width" value="'+_this.Options.Width.Value+'" type="range" min="' + _this.Options.Width.Range[0] + ' max="' + _this.Options.Width.Range[1] + '"/> <span id="FixContainerWidth_Value"></span>%';
            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            $("input#Width[type='range']").on("change", function () {
                $("span#FixContainerWidth_Value").text($(this).val());
                $("div#container").css("max-width", $(this).val() + "%");
            });
            $("input#Width[type='range']").change();
        },
    },
};
AVE.Modules['FixContainerWidth'] = {
    ID: 'FixContainerWidth',
    Name: 'Set Voat page width',
    Desc: 'By default, Voat shows a margin on both sides of the page. You can modify this by setting a custom width as a percentage of the available horizontal space.',
    Category: 'Misc',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "head",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true
        },
        Width: {
            Type: 'int',
            Range: [1,100],
            Value: 100
        },
        Justify: {
            Type: 'boolean',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[_this.ID];

        POST.Width = parseInt(POST.Width, 10);
        if (typeof POST.Width !== "number" || isNaN(POST.Width)) {
            POST.Width = _this.Options.Width.Value;
        }

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
            if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
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
        AVE.Utils.AddStyle('div#container{max-width:' + this.Options.Width.Value + '% !important}\
                            div.md{max-width:100% !important;}');

        if (this.Options.Justify.Value)
        { AVE.Utils.AddStyle('div.md{text-align:justify;padding-right:10px;}'); }
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            var htmlStr = '<input style="width:50%;display:inline;" id="Width" value="' + _this.Options.Width.Value + '" type="range" min="' + _this.Options.Width.Range[0] + ' max="' + _this.Options.Width.Range[1] + '"/> <span id="FixContainerWidth_Value">' + _this.Options.Width.Value + '</span>%';

            htmlStr += '<br /><input ' + (_this.Options.Justify.Value ? 'checked="true"' : "") + ' id="Justify" type="checkbox"/><label for="Justify">Justify text in comments.</label>';

            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['FixContainerWidth'];
            $("input#Width[type='range']").on("change", function () {
                $("span#FixContainerWidth_Value").text($(this).val());
                $("div#container").get(0).style.setProperty("max-width", $(this).val() + "%", 'important');
            });
            if (_this.Enabled){
                $("div#container").trigger("change");
            }
        },
    },
};
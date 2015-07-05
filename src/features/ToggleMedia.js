AVE.Modules['ToggleMedia'] = {
    ID: 'ToggleMedia',
    Name: 'Toggle media',
    Desc: 'Add a button to toggle chosen media types.',
    Category: 'Posts',

    Index: 5,
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        MediaTypes: {
            Type: 'string',
            Value: "110", // Images, Videos, self-Texts
        },
        ToggleInSidebar: {
            Desc: 'Also toggle Media present in the sidebar of the subverse.',
            Type: 'boolean',
            Value: false,
        },
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = AVE.Modules['ToggleMedia'];
        POST = POST[_this.ID];
        var opt = {};
        opt.Enabled = POST.Enabled;
        opt.MediaTypes = (POST.Images ? "1" : "0") + (POST.Videos ? "1" : "0") + (POST["self-texts"] ? "1" : "0")
        opt.ToggleInSidebar = POST.ToggleInSidebar;

        //Add ToggleInSidebar
        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(opt));
    },

    ResetPref: function () {
        var _this = AVE.Modules['ToggleMedia'];
        _this.Options = JSON.parse(_this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                _this.Options[key].Value = value;
            });
        }
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

    sel: [],
    ImgMedia: "[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']",
    VidMedia: "[title='YouTube'],[title='Vimeo']",
    SelfText: "[onclick^='loadSelfText']",
    // voat.co/v/test/comments/37149

    Start: function () {
        AcceptedTypes = this.Options.MediaTypes.Value;
        if (AcceptedTypes != "000" && $.inArray(AVE.Utils.currentPageType, ["subverses", "sets", "mysets", "user", "user-manage"]) == -1) {

            var strSel = (AcceptedTypes[0] == true ? this.ImgMedia + "," : "") +
                         (AcceptedTypes[1] == true ? this.VidMedia + "," : "") +
                         (AcceptedTypes[2] == true ? this.SelfText : "");

            if (strSel[strSel.length - 1] == ",")
            { strSel = strSel.slice(0, -1); }

            this.sel = $(strSel);

            if (!this.Options.ToggleInSidebar.Value)
            { this.sel = $(this.sel).filter(':parents(.titlebox)'); }

            this.AppendToPage();
            this.Listeners();
        }
    },

    Update: function () {
        this.Start();
    },

    AppendToPage: function () {
        if (this.sel.length == 0) { return; }
        if ($("a#GM_ExpandAllImages").length > 0) {
            $("a#GM_ExpandAllImages").text().replace(/\([0-9]*\)/, this.sel.length);
            return;
        }

        var btnHTML = '<li class="disabled"><a id="GM_ExpandAllImages" class="contribute submit-text">View Media (' + this.sel.length + ')</a></li>';
        $(btnHTML).insertAfter(".disabled:last");
    },

    Listeners: function () {
        sel = this.sel;
        var isExpanded = false;
        $("[id='GM_ExpandAllImages']").on("click", function () {
            if ($(this).hasClass("expanded")) {
                $(this).text('View Media (' + sel.length + ')');
                $(this).removeClass("expanded")
                isExpanded = false;
            } else {
                $(this).text('Hide Media (' + sel.length + ')');
                $(this).addClass("expanded")
                isExpanded = true;
            }

            for (var el in sel) {
                if (
                    (isExpanded && sel.eq(el).parent().find(".expando,.link-expando").length == 0) ||
                    isExpanded === sel.eq(el).parent().find(".expando,.link-expando").first().is(':hidden')
                    ) {
                    sel[el].click();
                }
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['ToggleMedia']
            var mediaTypes = ["Images", "Videos", "self-texts"];
            var value = _this.Options.MediaTypes.Value;
            var htmlString = '<div style="margin-left:30px;padding:5px 0 0 5px;border-left:2px solid #' + (AVE.Utils.CSSstyle == "dark" ? "222" : "DDD") + ';">';
            for (var i in mediaTypes) {
                htmlString += '<span style="margin-right:20px;" >' +
                              '<input ' + (value[i] == 1 ? 'checked="checked"' : '') + ' id="' + mediaTypes[i] + '" name="' + mediaTypes[i] + '" type="checkbox"></input>' +
                               '<label for="' + mediaTypes[i] + '">' + mediaTypes[i] + '</label>' +
                               '</span>';
            }
            //ToggleInSidebar
            htmlString += '<br /><input ' + (_this.Options.ToggleInSidebar.Value ? 'checked="checked"' : '') + ' id="ToggleInSidebar" name="ToggleInSidebar" type="checkbox"></input>' +
            '<label for="ToggleInSidebar">' + _this.Options.ToggleInSidebar.Desc + '</label>';

            return htmlString+'</div>';
        },
    },
};
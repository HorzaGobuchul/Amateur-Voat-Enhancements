AVE.Modules['ReplyWithQuote'] = {
    ID: 'ReplyWithQuote',
    Name: 'Reply with quote',
    Desc: 'Insert selected/highlighted text in a comment into the reply box toggled by "reply".',
    Category: 'Thread',

    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
    },

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = _this.Store.GetValue(_this.Store.Prefix + _this.ID, "{}");

        if (Opt != undefined) {
            Opt = JSON.parse(Opt);
            $.each(Opt, function (key, value) {
                if (!_this.Options.hasOwnProperty(key)) {print("AVE: loading "+_this.ID+" > option key " +key+" doesn't exist", true);return true;}
                _this.Options[key].Value = value;
            });
        }
        _this.Enabled = _this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
    },

    Quote: '',

    Listeners: function () {
        var _this = this;

        $("li > a:contains(reply)").on("click", function () {
            //Needed because when the reply text input appears, the text is deselected.
            //  Thus, we get the selected text before that.
            _this.Quote = _this.getQuote();
        });

        $("div[class*='entry']").OnNodeChange(function () {
            if (_this.Quote === "") { return; }

            var ReplyBox = $(this).find("textarea[class='commenttextarea'][id='Content']");
            if (ReplyBox.length > 0) {
                ReplyBox.val(_this.Quote + "\n\n");
            }
        });
    },

    getQuote: function () {
        var nodes = this.getSelectedNodes();

        if (!nodes) {
            return "";
        }

        if ($(nodes[0]).parents(".usertext-body:first").attr("id") === undefined ||
            $(nodes[0]).parents(".usertext-body:first").attr("id") !== $(nodes[1]).parents(".usertext-body:first").attr("id")) {
            return "";
        }

        return AVE.Utils.ParseQuotedText(this.getSelectedText().toString());
    },

    getSelectedNodes: function () {
        // Thanks to InvisibleBacon @ https://stackoverflow.com/questions/1335252/how-can-i-get-the-dom-element-which-contains-the-current-selection
        var selection = window.getSelection();
        if (selection.rangeCount > 0)
        { return [selection.getRangeAt(0).endContainer.parentNode, selection.getRangeAt(0).startContainer.parentNode]; }
    },

    getSelectedText: function () {
        var t = '';
        if (window.getSelection) {
            t = window.getSelection();
            if (t.rangeCount) {
                for (var i = 0, len = t.rangeCount; i < len; ++i) {
                    return new XMLSerializer().serializeToString(t.getRangeAt(i).cloneContents());
                }
            }
        }
        else {
            alert("AVE: Quoting is not supported by your browser. Sorry");
            return "";
        }
    }
};
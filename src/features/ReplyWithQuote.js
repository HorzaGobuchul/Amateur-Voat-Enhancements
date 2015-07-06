AVE.Modules['ReplyWithQuote'] = {
    ID: 'ReplyWithQuote',
    Name: 'Reply with quote',
    Desc: 'Insert selected/highlighted text (in a comment) into the reply box toggled by "reply".',
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
        var _this = AVE.Modules['ReplyWithQuote'];

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
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
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.Listeners();
    },

    Update: function () {
        this.Start();
    },

    AppendToPage: function () {
    },

    Quote: '',

    Listeners: function () {
        var SelectedNodes = this.getSelectedNodes;
        var SelectedText = this.getSelectedText;
        var Quote = this.Quote;

        $("div[class*='entry']").OnNodeChange(function () {
            if (Quote == "") { return; }
            var ReplyBox = $(this).find("textarea[class='commenttextarea'][id='CommentContent']");
            if (ReplyBox.length > 0) {
                ReplyBox.val(Quote + "\n\n");
            }
        });

        $(".usertext").on("mouseup", function () {
            var nodes = SelectedNodes();

            if (!nodes) {
                Quote = "";
                return;
            }
            if ($(nodes[0]).parents(".usertext").attr("id") == undefined ||
                $(nodes[0]).parents(".usertext").attr("id") != $(nodes[1]).parents(".usertext").attr("id")) {
                Quote = "";
                return;
            }

            Quote = AVE.Utils.ParseQuotedText(SelectedText().toString());
            //event.stopPropagation();
        });
    },
    getSelectedNodes: function () {
        // Thanks to InvisibleBacon @ https://stackoverflow.com/questions/1335252/how-can-i-get-the-dom-element-which-contains-the-current-selection
        var selection = window.getSelection();
        if (selection.rangeCount > 0)
            return [selection.getRangeAt(0).endContainer.parentNode, selection.getRangeAt(0).startContainer.parentNode];
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
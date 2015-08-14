AVE.Modules['AppendQuote'] = {
    ID: 'AppendQuote',
    Name: 'Append quote',
    Desc: 'Add a "quote" link to automatically insert the quoted comment into the closest reply box.',
    Category: 'Thread',
    Enabled: false,

    Store: {},

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Formatting: {
            Type: 'string',
            Value: '[{@username}]({@permaLink}) wrote:{@n}{@n}{@comment}',
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;

        _this.Store.SetValue(_this.Store.Prefix + _this.ID, JSON.stringify(POST[_this.ID]));
    },

    ResetPref: function () {
        var _this = this;
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

        if (AVE.Utils.currentPageType !== "thread") { this.Enabled = false; }

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();
    },

    Update: function () {
        if (this.Enabled) {
            this.Start();
        }
    },

    AppendToPage: function () {
        $("ul[class*='flat-list']").each(function () {
            if ($(this).find("a#AVE_QuotePost").length > 0) { return; }

            $('<li><a id="AVE_QuotePost" href="javascript:void(0)" style="font-weight:bold;">quote</a></li>').insertAfter($(this).find("li:contains(source)"));
        });
    },

    Listeners: function () {
        var _this = this;

        $("a#AVE_QuotePost").off("click");
        $("a#AVE_QuotePost").on("click", function () {
            var comment = AVE.Utils.ParseQuotedText($(this).parent().parent().parent().find('.md:first').html())
            var permaLink = $(this).parents("ul[class*='flat-list']").first().find("a[class*='bylink']").attr("href");
            if (!permaLink) { permaLink = window.location.href; }
            var userpageLink = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").attr("href");
            var username = $(this).parents("ul[class*='flat-list']").first().parent().find("a[class*='author']").text();
            
            var quote = _this.Options.Formatting.Value.replace(/{@username}/gi, username);
            quote = quote.replace(/{@permaLink}/gi, permaLink);
            quote = quote.replace(/{@userpage}/gi, userpageLink);
            quote = quote.replace(/{@comment}/gi, comment);
            quote = quote.replace(/{@n}/g, "\n");

            var NearestReplyBox = $(this).parents(":has(textarea[class*='commenttextarea'][id*='CommentContent']:visible)").first().find("textarea[class*='commenttextarea'][id*='CommentContent']:visible");
            if (NearestReplyBox.val() != "") {
                NearestReplyBox.val(NearestReplyBox.val() + "\n\n" + quote);
            } else {
                NearestReplyBox.val(quote);
            }
        });
    },

    AppendToPreferenceManager: {
        html: function () {
            var _this = AVE.Modules['AppendQuote'];
            var htmlStr = "";
            htmlStr += '<input style="display:inline;width:80%;padding:0px;letter-spacing:0.35px;" class="form-control" type="text" Module="'+ _this.ID +'" id="Formatting" value="' + _this.Options.Formatting.Value + '"></input>';
            htmlStr += ' <button id="AutoQuoteFormatShowPreview" class="btn-whoaverse-paging" type="button">Show Preview</button>'
            htmlStr += '<div class="md" id="AutoQuoteFormatPreview" style="height:150px; background-color: #' +(AVE.Utils.CSSstyle == "dark" ? "292929": "FFF") + '; position: fixed; width:430px;padding: 10px; border-radius: 6px; border: 2px solid black;display: none;overflow: auto;"></div>';
            htmlStr += "<br /> {@username}: username of the comment's author,";
            htmlStr += '<br /> {@permaLink}: permaLink to the comment,';
            htmlStr += "<br /> {@userpage}: link to the username's page,";
            htmlStr += "<br /> {@comment}: comment's content as a quote,";
            htmlStr += '<br /> {@n}: new line.';
            return htmlStr;
        },
        callback: function () {
            var _this = AVE.Modules['AppendQuote'];
            $('button#AutoQuoteFormatShowPreview').on("click", function () {
                if ($(this).text() == "Show Preview") {
                    $(this).text("Hide Preview");
                    $("div#AutoQuoteFormatPreview").show();

                    var quote = $("input[id='Formatting'][Module='" + _this.ID + "']").val().replace(/{@username}/gi, "Username");
                    quote = quote.replace(/{@permaLink}/gi, "/v/whatever/comments/111111/111111");
                    quote = quote.replace(/{@userpage}/gi, "/user/atko");
                    quote = quote.replace(/{@comment}/gi, "> This is a comment.\n\n> Another line.");
                    quote = quote.replace(/{@n}/g, "\n");

                    $("div#AutoQuoteFormatPreview").text("Loading...");
                    var r = { MessageContent: quote }
                    $.ajax({
                        url: "https://voat.co/ajaxhelpers/rendersubmission/",
                        type: "post",
                        dataType: "html",
                        success: function (n) {
                            $("div#AutoQuoteFormatPreview").html(n);
                        },
                        data: r
                    });
                } else {
                    $(this).text("Show Preview");
                    $("div#AutoQuoteFormatPreview").hide();
                }
            });
        },
    },
};
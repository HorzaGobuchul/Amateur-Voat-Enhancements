AVE.Utils = {
    regExpSet: /([^:]*):([0-9]*)/i,
    regExpTag: /([^:]*):([^:]*)/i,
    subverseName: "",
    isPageSubverse: "",
    CSSstyle: "",
    currentPageType: "",
    
    Set: function () {
        this.subverseName = this.GetSubverseName();
        this.isPageSubverse = this.isPageSubverse();
        this.CSSstyle = this.CSS_Style();
        this.currentPageType = this.Page();
    },

    CSS_Style: function () {
        return $("body").attr("class");
    },

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?$/i,
            subverse: /voat.co\/v\/[a-z]*\/?$/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            subverses: /voat.co\/subverses/i,
            set: /voat.co\/set\/\d*/i,
            mySet: /voat.co\/mysets/i,
            sets: /voat.co\/sets/i,
            user: /voat.co\/user\/[\w\d]*\/?$/i,
            comments: /voat.co\/user\/[\w\d]*\/comments/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            messaging: /voat.co\/messaging/i,
            manage: /voat.co\/account\/manage/i,
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
        else if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        else if (RegExpTypes.thread.test(url)) { return "thread"; }
        else if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        else if (RegExpTypes.set.test(url)) { return "set"; }
        else if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        else if (RegExpTypes.sets.test(url)) { return "sets"; }
        else if (RegExpTypes.user.test(url)) { return "user"; }
        else if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        else if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        else if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        else if (RegExpTypes.manage.test(url)) { return "user-manage"; }

        return "none";
    },

    isPageSubverse: function () {
        if (this.subverseName != null)
        { return true; }

        return false;
    },

    GetSubverseName: function () {
        var m = new RegExp(/voat\.co\/v\/([\w\d]*)/).exec(window.location.href);

        if (m == null) { return null; }
        else { return m[1].toLowerCase(); }
    },

    ParseQuotedText: function (text) {
        converter = { filter: 'span', replacement: function (innerHTML) { return ''; } };
        return toMarkdown(text, { converters: [converter] }).replace(/^(.)/img, "> $1");
    },
};

(function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    $.fn.OnAttrChange = function (callback) {
        if (MutationObserver) {
            var options = {
                attributes: true,
            };

            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    if (e.attributeName != null) {
                        callback.call(e.target);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    }
})(jQuery);
(function ($) {
    //Thanks to Mr Br @ https://stackoverflow.com/questions/1950038/jquery-fire-event-if-css-class-changed#answer-24284069
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    $.fn.OnNodeChange = function (callback) {
        if (MutationObserver) {
            var options = {
                subtree: true,
                childList: true,
            };

            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    if (e.addedNodes != null) {
                        callback.call(e.target);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    }
})(jQuery);
function print(str) { console.log(str); }
//Thanks to Paolo Bergantino https://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector#answer-965962
jQuery.expr[':'].parents = function (a, i, m){return jQuery(a).parents(m[3]).length < 1;};
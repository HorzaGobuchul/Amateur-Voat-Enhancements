/* global self */

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

    MetaData: null,

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(new)?(\?page=[0-9]*)?(\#[^\\\/]*)?$/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            comments: /voat.co\/user\/[\w\d]*\/comments/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            register: /voat.co\/account\/register/i,
            userShort: /voat.co\/u\/[\w\d]*\/?$/i,
            modlog: /voat.co\/v\/[a-z]*\/modlog/i,
            user: /voat.co\/user\/[\w\d]*\/?$/i,
            manage: /voat.co\/account\/manage/i,
            saved: /voat.co\/user\/.*\/saved/i,
            login: /voat.co\/account\/Login/i,
            subverses: /voat.co\/subverses/i,
            messaging: /voat.co\/messaging/i,
            search: /voat.co\/search\?q=/i,
            domain: /voat.co\/domains\//i,
            submit: /voat.co\/submit/i,
            set: /voat.co\/set\/\d*/i,
            mySet: /voat.co\/mysets/i,
            sets: /voat.co\/sets/i,
            api: /voat.co\/api/i,
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
        else if (RegExpTypes.api.test(url)) { return "api"; }
        else if (RegExpTypes.thread.test(url)) { return "thread"; }
        else if (RegExpTypes.submit.test(url)) { return "submit"; }
        else if (RegExpTypes.modlog.test(url)) { return "modlog"; }
        else if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        else if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        else if (RegExpTypes.domain.test(url)) { return "domain"; }
        else if (RegExpTypes.set.test(url)) { return "set"; }
        else if (RegExpTypes.search.test(url)) { return "search"; }
        else if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        else if (RegExpTypes.sets.test(url)) { return "sets"; }
        else if (RegExpTypes.user.test(url)) { return "user"; }
        else if (RegExpTypes.userShort.test(url)) { return "user"; }
        else if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        else if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        else if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        else if (RegExpTypes.manage.test(url)) { return "user-manage"; }
        else if (RegExpTypes.saved.test(url)) { return "saved"; }
        else if (RegExpTypes.register.test(url)) { return "account-register"; }
        else if (RegExpTypes.login.test(url)) { return "account-login"; }

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

    GetBestFontColour: function (r,g,b) {
        //from http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
        var o = Math.round(((parseInt(r) * 299) + (parseInt(g) * 587) + (parseInt(b) * 114)) / 1000);
        return (o > 125) ? 'black' : 'white';
    },
};

(function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    $.fn.OnAttrChange = function (callback) {
        if (MutationObserver) {
            var options = {
                attributes: true,
                attributeOldValue: true,
            };

            //https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationRecord
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (e) {
                    if (e.attributeName != null) {
                        callback.call(e.target, e);
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
                characterData: true,//needed for it to work in Chrome
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
jQuery.expr[':'].parents = function (a, i, m) { return jQuery(a).parents(m[3]).length < 1; };

//Might be overkill, but I need to be able to disconnect the listener before updating.
var OnNodeChange = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var cls = function (t, c) {
        this.options = {
            subtree: true,
            childList: true,
        };
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.addedNodes != null) {
                    c.call(e.target, e);
                }
            });
        });

        this.observe = function () {
            var _this = this;
            return this.targets.each(function () {
                _this.observer.observe(this, _this.options);
            });
        };

        this.disconnect = function () {
            this.observer.disconnect();
        };
    };

    return cls;
})();
var OnAttrChange = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var cls = function (t, c) {
        this.options = {
            attributes: true,
            attributeOldValue: true,
        };
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.attributeName != null) {
                    c.call(e.target, e);
                }
            });
        });

        this.observe = function () {
            var _this = this;
            return this.targets.each(function () {
                _this.observer.observe(this, _this.options);
            });
        };

        this.disconnect = function () {
            this.observer.disconnect();
        };
    };

    return cls;
})();
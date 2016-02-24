AVE.Utils = {
    regExpSet: /([^:]*):([0-9]*)/i,
    regExpTag: /([^:]*):([^:]*)/i,
    subverseName: "",
    isPageSubverse: "",
    CSSstyle: "",
    currentPageType: "",
    DevMode: false,
    POSTinfo: {},

    _CurrUsername: "",
    CurrUsername: function () {
        // "" means that it is not set
        if (this._CurrUsername === "") {
            // is the header-account block already loaded?
            if ($("div#header-account").length > 0){
                var profil = $("span.user > a[title='Profile']");
                // is the user logged-in
                if (profil.length > 0) {
                    this._CurrUsername = profil.text();
                } else { // If not null is returned
                    this._CurrUsername = null;
                }
                // else "" is returned until the banner is DOM ready
            }
        }
        return this._CurrUsername;
    },
    
    LateSet: function () {
        this.CSSstyle = this.CSS_Style();
    },

    EarlySet: function () {
        this.DevMode = this.GetDevMode();
        this.subverseName = this.GetSubverseName();
        this.isPageSubverse = this.GetPageSubverse();
        this.currentPageType = this.Page();
        this.ParsePOSTinfo();
    },

    CSS_Style: function () {
        return $('link[rel="stylesheet"][href^="/Content/Dark"]').length > 0 ? "dark" : "light";
        //return $("body").attr("class"); //Doesn't work because the class is added after DOMready and this is evaluated before DOMload
    },

    MetaData: null,

    Page: function () {
        var RegExpTypes = {
            frontpage: /voat.co\/?(new)?(\?[^#]+)*(#[^\\\/]*)?$/i,
            //front_guest: /voat.co\/?(new)?(\?frontpage=guest)?(\?page=[0-9]*)?(#[^\\\/]*)?$/i,
            submissions: /voat.co\/user\/[\w\d-]*\/submissions/i,
            subverse: /voat.co\/v\/[a-z]*\/?(\?page=[0-9]*)?/i,
            comments: /voat.co\/user\/[\w\d-]*\/comments/i,
            thread: /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            sub_rel: /voat.co\/v\/[a-z]*\/[a-z]+/i,
            register: /voat.co\/account\/register/i,
            userShort: /voat.co\/u\/[\w\d-]*\/?$/i,
            modlog: /voat.co\/v\/[a-z]*\/modlog/i,
            about: /voat.co\/v\/[a-z]*\/about/i,
            sub_new: /voat.co\/v\/[a-z]*\/new/i,
            sub_top: /voat.co\/v\/[a-z]*\/top/i,
            user: /voat.co\/user\/[\w\d-]*\/?$/i,
            manage: /voat.co\/account\/manage/i,
            saved: /voat.co\/user\/.*\/saved/i,
            login: /voat.co\/account\/Login/i,
            account_rel: /voat.co\/account/i,
            subverses: /voat.co\/subverses/i,
            messaging: /voat.co\/messaging/i,
            search: /voat.co\/search\?q=/i,
            domain: /voat.co\/domains\//i,
            submit: /voat.co\/submit/i,
            set: /voat.co\/set\/\d*/i,
            mySet: /voat.co\/mysets/i,
            sets: /voat.co\/sets/i,
            api: /voat.co\/api/i
        };
        var url = window.location.href;

        if (RegExpTypes.frontpage.test(url)) { return "frontpage"; }
        //if (RegExpTypes.front_guest.test(url)) { return "frontpage"; }
        if (RegExpTypes.api.test(url)) { return "api"; }
        if (RegExpTypes.thread.test(url)) { return "thread"; }
        if (RegExpTypes.sub_new.test(url)) { return "subverse"; }
        if (RegExpTypes.sub_top.test(url)) { return "subverse"; }
        if (RegExpTypes.submit.test(url)) { return "submit"; }
        if (RegExpTypes.modlog.test(url)) { return "modlog"; }
        if (RegExpTypes.about.test(url)) { return "about"; }
        if (RegExpTypes.sub_rel.test(url)) { return "sub_related"; }
        if (RegExpTypes.subverse.test(url)) { return "subverse"; }
        if (RegExpTypes.subverses.test(url)) { return "subverses"; }
        if (RegExpTypes.domain.test(url)) { return "domain"; }
        if (RegExpTypes.set.test(url)) { return "set"; }
        if (RegExpTypes.search.test(url)) { return "search"; }
        if (RegExpTypes.mySet.test(url)) { return "mysets"; }
        if (RegExpTypes.sets.test(url)) { return "sets"; }
        if (RegExpTypes.user.test(url)) { return "user"; }
        if (RegExpTypes.userShort.test(url)) { return "user"; }
        if (RegExpTypes.comments.test(url)) { return "user-comments"; }
        if (RegExpTypes.submissions.test(url)) { return "user-submissions"; }
        if (RegExpTypes.messaging.test(url)) { return "user-messages"; }
        if (RegExpTypes.manage.test(url)) { return "user-manage"; }
        if (RegExpTypes.saved.test(url)) { return "saved"; }
        if (RegExpTypes.register.test(url)) { return "account-register"; }
        if (RegExpTypes.login.test(url)) { return "account-login"; }
        if (RegExpTypes.account_rel.test(url)) { return "account-related"; }

        return "none";
    },

    ParsePOSTinfo: function () {
        var url, l, _this;
        _this = this;
        url = window.location.href.split("?");

        if (url.length == 1){return;}

        url = url[1].split("#")[0];
        url = url.split("&");

        $.each(url, function (idx, str) {
            l = str.split("=");
            _this.POSTinfo[l[0]] = l[1];
        });
    },

    GetDevMode: function () {
        return AVE.Storage.GetValue(AVE.Storage.Prefix+"DevMode", "0") === "1" ? true : false;
    },

    GetPageSubverse: function () {
        if (this.subverseName)
        { return true; }

        return false;
    },

    GetSubverseName: function () {
        var m = new RegExp(/voat\.co\/v\/([\w\d]*)/).exec(window.location.href);

        if (!m) { return null; }
        return m[1].toLowerCase();
    },

    ParseQuotedText: function (text) {
        var converter = { filter: 'span', replacement: function () { return ''; } };
        return toMarkdown(text, { converters: [converter] }).replace(/^(.)/img, "> $1");
    },

    GetBestFontColour: function (r,g,b) {
        //from http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
        var o = Math.round(((parseInt(r, 10) * 299) + (parseInt(g, 10) * 587) + (parseInt(b, 10) * 114)) / 1000);
        return (o > 125) ? 'black' : 'white';
    },

    GetRGBvalues: function (colour) {
        var r, g, b;
        //from www.javascripter.net/faq/hextorgb.htm
        r = parseInt(colour.substring(1, 3), 16);
        g = parseInt(colour.substring(3, 5), 16);
        b = parseInt(colour.substring(5, 7), 16);

        return [r, g, b];
    },

    AddStyle: function (StyleStr) {
        if ($("style[for='AVE']").length === 0) { $("head").append('<style for="AVE"></style>'); }
        $("style[for='AVE']").append("\n" + StyleStr);
    }
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
                    if (e.attributeName) {
                        callback.call(e.target, e);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    };
}($));
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
                    if (e.addedNodes) {
                        callback.call(e.target);
                    }
                });
            });

            return this.each(function () {
                observer.observe(this, options);
            });
        }
    };
}($));
function print(str, dev) {if(dev && !AVE.Utils.DevMode){return;} console.log(str); }
//Thanks to Paolo Bergantino https://stackoverflow.com/questions/965816/what-jquery-selector-excludes-items-with-a-parent-that-matches-a-given-selector#answer-965962
jQuery.expr[':'].parents = function (a, i, m) { return jQuery(a).parents(m[3]).length < 1; };
//Thanks to Narnian https://stackoverflow.com/questions/6673777/select-link-by-text-exact-match#answer-8447189
jQuery.expr[':'].textEquals = function(a, i, m) { return jQuery(a).text().match("^" + m[3] + "$"); };
    //Thanks to digiguru https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another#answer-7180095
AVE.Utils.move = function(arr, from, to) { arr.splice(to, 0, arr.splice(from, 1)[0]);};
//Might be overkill, but I need to be able to disconnect the listener before updating.
var OnNodeChange = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    var cls = function (t, c) {
        this.options = {
            subtree: true,
            childList: true,
        };
        this.observed = [];
        this.targets = t;

        this.observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (e) {
                if (e.addedNodes) {
                    c.call(e.target, e);
                }
            });
        });

        this.observe = function () {
            var _this = this;
            return this.targets.each(function () {
                if ($.inArray(this, _this.observed) === -1) {
                    _this.observer.observe(this, _this.options);
                    _this.observed.push(this);
                }
            });
        };

        this.disconnect = function () {
            this.observer.disconnect();
        };
    };

    return cls;
}());
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
                if (e.attributeName) {
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
}());
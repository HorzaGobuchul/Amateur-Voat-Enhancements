AVE.Modules['DomainTags'] = {
    ID: 'DomainTags',
    Name: 'Domain tags',
    Desc: 'Choose tags to characterize domains.',
    Category: 'Domains',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        }
    },

    Style: "",
    DomainTags: "",
    Processed: [],

    DomainTagObj: function (tag, colour) {
        this.t = tag.toString();
        this.c = colour.toString();
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {
        this.Options = JSON.parse(this.OriginalOptions);
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            if (_this.Options.hasOwnProperty(key)){
                _this.Options[key].Value = value;
            }
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.OriginalOptions = JSON.stringify(this.Options);
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.style =
                'div.AVE_Domain_tag {' +
                '   margin-left: 5px;' +
                '   cursor: pointer;' +
                '   display: inline-block;' +
                '}' +
                'div.AVE_Domaintag_box > span {' +
                '   cursor: pointer;' +
                '   font-size: 14px;' +
                '   margin-left: 2px;' +
                '   margin-right: 2px;' +
                '}' +
                'div.AVE_Domaintag_box > div#ColourDot {' +
                '	width: 15px;' +
                '	height: 15px;' +
                '	border-radius: 10px;' +
                '	display: inline;' +
                '	float: right;' +
                '   margin: 2px 8px 2px 0px;' +
                '	border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '   cursor: pointer;' +
                '/* overrides */' +
                //'	width: 20px;' +
                //'	height: 20px;' +
                //'	border-radius: 0px 10px 10px 0px;' +
                //'	display: inline;' +
                //'	float: right;' +
                //'	margin: 0px 5px 0px 0px;' +
                //'	border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                //'	cursor: pointer;' +
                //'	min-width: 10px;' +
                //'	border-width: 0px 2px 0px 1px;' +
                '}' +
                'div.AVE_Domaintag_box > input[type="text"] {' +
                '	height: 20px;' +
                '	width: 220px;' +
                '	border: none;' +
                '   border-left: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '   border-right: 1px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                '	padding-left: 5px;' +
                '	background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "414141" : "F8F8F8") + ';' +
                '}' +
                'div.AVE_Domaintag_box {' +
                    'background-color: #' + (AVE.Utils.CSSstyle === "dark" ? "333" : "FFF") + ';' +
                    (AVE.Utils.CSSstyle === "dark" ? "" : "color: #707070;") +
                    'z-index: 1000 !important;' +
                    'position:absolute;' +
                    'left:0px;' +
                    'top:0px;' +
                    'border: 2px solid #' + (AVE.Utils.CSSstyle === "dark" ? "000" : "AAA") + ';' +
                    'border-radius:3px;' +
                    'width:300px;' +
                '}' +
                'div.AVE_Domain_tag > svg {' +
                '   vertical-align: middle;' +
                '}' +
                'div.AVE_Domaintag_box > svg {' +
                '   vertical-align: middle;' +
                '   margin-left: 2px;' +
                '}';
            AVE.Utils.AddStyle(this.style);

            this.StorageName = this.Store.Prefix + this.ID + "_Tags";
            this.DomainTags = JSON.parse(this.Store.GetValue(this.StorageName, "{}"));

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
        "use strict";
        var _this  = this;

        $("p.title > span.domain > a").each(function () {
            var id = $(this).parents("div.submission[class*='id-']:first").attr("data-fullname");
            if ($.inArray(id, _this.Processed) !== -1){return true;}
            else {_this.Processed.push(id);}

            var domain;
            var tag, colour;
            domain = $(this).text();

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
            }
            //Commented out so that we can tag subverses (self-text submissions) too.
            //if (/self\.[a-zA-Z0-9]?/.test(domain)){return true;}

            if ($(this).parent().find("div.AVE_Domain_tag").length === 0) {
                $('<div class="AVE_Domain_tag"></div>').insertAfter($(this));
                var el = $(this).parent().find("div.AVE_Domain_tag");

                if (!tag && !colour) {
                    el.html('<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>');
                    el.attr("title", "Click to create a new tag");
                } else {
                    if (!tag) { tag = "No tag"; }
                    else if (!colour) { colour = (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB"); }
                    el.attr("title", tag);
                    el.html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="' + colour + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>');
                }
            }
        });
    },

    Listeners: function () {
        "use strict";
        var _this = this;

        $("div.AVE_Domain_tag").off().on("click", function (e) {
            //e.stopPropagation();
            var domain, box;
            var tag, colour;

            domain = $(this).parent().find("a").text();

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
            }
            box = $("div.AVE_Domaintag_box");

            if (box.length === 0){
                var boxHtml;

                boxHtml = '' +
                    '<div domain="void" class="AVE_Domaintag_box">' +
                    '   <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#FF0000" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>' +
                    '   <input placeholder="Click here to create a new tag" id="AVE_Domaintag_box_textinput" type="text" value="">' +
                    '   <span id="cancel" title="Cancel and close" style="float:right;">✖</span>' +
                    '   <span id="submit" title="Accept and save" style="float:right;">✔</span>' +
                    '   <div id="ColourDot" title="Click to choose a color"></div><input style="opacity:0;visiblity: hidden; position: absolute;width:0px;height:0px" type="color" value="">' +
                    '</div>'; //Weird css values for the colour input because of Chrome not wanting to trigger it if hidden with "display:none;"

                $("body").append(boxHtml);

                box = $("div.AVE_Domaintag_box");
                box.find("div#ColourDot").on("click", function () {
                    var dot = $(this);
                    dot.parent().find("input[type='color']")
                        .trigger("click")
                        .on("change", function () {
                            dot.css("background-color", $(this).val());
                            dot.parent().find("svg > path").css("fill", $(this).val());
                        });
                });
                box.find("input[type='text']").on("input", function () {
                    box.find("svg").attr("title", $(this).val() || "No tag");
                });

                box.find("span#cancel").off().on("click", function () {
                    box.hide();
                });
                box.find("span#submit").off().on("click", function () {
                    domain = box.attr("domain");
                    tag = box.find("input[type='text']").val();
                    colour = box.find("input[type='color']").val();

                    _this.setTag(domain, tag, colour);
                    _this.updateTag(domain);
                    box.hide();
                });
                box.hide();
            }

            var position = $(this).offset();
            position.top -= 5;
            box.css(position)
                .show();

            box.attr("domain", domain);
            box.find("input[type='text']").val(tag).select();
            box.find("input[type='color']").val(colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("div#ColourDot").css("background-color", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg > path").css("fill", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg").attr("title", tag || "No tag");
        });

        $(document).on("keyup", function (e) {
            var box = $("div.AVE_Domaintag_box");
            if (box.is(":visible")){
                //print(e.key + " - "+e.which);
                if (e.which === 13) { //enter
                    if ($(e.target).attr("id") === "AVE_Domaintag_box_textinput") {
                        box.find("span#submit").trigger("click");
                    }
                }
                else if (e.which === 27) { //escape
                    box.find("span#cancel").trigger("click");
                }
            }
        });
    },

    updateTag: function (domain) {
        "use strict";
        var _this = this;
        $("p.title > span.domain > a:textEquals("+domain+")").each(function(){
            var tag, colour;

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
            }

            var el = $(this).parent().find("div.AVE_Domain_tag");

            if (!tag && !colour) {
                el.html('<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>');
                el.attr("title", "Click to create a new tag");
            } else {
                if (!tag) { tag = "No tag"; }
                else if (!colour) { colour = (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB"); }
                el.attr("title", tag);
                el.html('<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="' + colour + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>');
            }
        });
    },

    setTag: function (domain, tag, colour) {
        "use strict";
        var obj = new this.DomainTagObj(tag, colour);
        if(!obj.t && !obj.c){ return;}
        this.DomainTags[domain] = obj;

        //print(JSON.stringify(this.DomainTags[domain]));
        this.Store.SetValue(this.StorageName, JSON.stringify(this.DomainTags));
    },
    removeTag: function (domain) {
        "use strict";
        delete this.DomainTags[domain];
    },

    AppendToPreferenceManager: {
        html: function () {
            "use strict";
            var _this = AVE.Modules['DomainTags'];
            var htmlStr = '' +
                '<span>' +
                '   Click the default icon (<svg onmouseleave="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '\');return false;" onmouseover="javascript:$(this).find(\'path:first\').css(\'fill\', \'#' + (AVE.Utils.CSSstyle === "dark" ? "438BB7" : "4AABE7") + '\');return false;" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="vertical-align: middle;enable-background:new 0 0 14 14;" xml:space="preserve"><path style="fill:#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C4.791,0,3,1.791,3,4c0,2,4,10,4,10s4-8,4-10C11,1.791,9.209,0,7,0z M7,6C5.896,6,5,5.104,5,4 s0.896-2,2-2c1.104,0,2,0.896,2,2S8.104,6,7,6z"/></svg>) to display the tagbox and create a new tag.' +
                '   <br/>Move your mouse over the I icon (<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="vertical-align: middle;enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#' + (AVE.Utils.CSSstyle === "dark" ? "777" : "BBB") + '" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>) to see the tag, click this icon to edit the current tag.' +
                '   <br/>You don\'t have to choose a tag label to create a new domainTag; a colour alone is enough.';

            if (_this.Enabled){
                var len = Object.keys(_this.DomainTags).length;
                htmlStr += '<br /><br />You have tagged <strong>'+ len +'</strong> domain'+ (len > 1 ? "s" : "") +'.';
            }

            htmlStr += '</span>';
            return htmlStr;
        }
    },

    AppendToDashboard: {
        initialized: false,
        CSSselector: "",
        module: {},

        init: function () {
            this.module = AVE.Modules['DomainTags'];
            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";
            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}
            var htmlStr;

            htmlStr = '<div>Dashboard functionalities for '+this.module.ID+' are not yet implemented.</div>';

            return htmlStr;
        },
        callback: function () {
            "use strict";
        }
    }
};
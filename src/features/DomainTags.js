AVE.Modules['DomainTags'] = {
    ID: 'DomainTags',
    Name: 'Domain tags',
    Desc: 'Choose tags to characterize domains.',
    Category: 'Domains',

    Index: 200,
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
    StorageName: "",
    Processed: [],

    DomainTagObj: function (tag, colour, ignore) {
        this.t = tag.toString();
        this.c = colour.toString();
        this.i = !!ignore;
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
                    'width:320px;' +
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
            //Commented out so that we can tag subverses too (self-text submissions).
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
            var tag, colour, ignore;

            domain = $(this).parent().find("a").text();

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
                ignore = _this.DomainTags[domain].i;
            }
            box = $("div.AVE_Domaintag_box");

            if (box.length === 0){
                var boxHtml;

                boxHtml = '' +
                    '<div domain="void" class="AVE_Domaintag_box">' +
                    '   <svg version="1.1" id="infoicon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"  width="14px" height="14px" viewBox="0 0 14 14" style="enable-background:new 0 0 14 14;" xml:space="preserve"><path fill="#FF0000" d="M7,0C3.134,0,0,3.134,0,7s3.134,7,7,7s7-3.134,7-7S10.866,0,7,0z M7,2c0.552,0,1,0.447,1,1S7.552,4,7,4S6,3.553,6,3 S6.448,2,7,2z M9,11H5v-1h1V6H5V5h3v5h1V11z"/></svg>' +
                    '   <input placeholder="Click here to create a new tag" id="AVE_Domaintag_box_textinput" type="text" value="">' +
                    '   <svg version="1.1" id="ignoreDomain" title="Click to toggle ignored" style="cursor:pointer;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="14px" height="14px" viewBox="0 0 14 14" xml:space="preserve"><path style="fill:#ABABAB;" d="M7,2C3,2,0,7,0,7s3,5,7,5s7-5,7-5S11,2,7,2z M7,10c-1.657,0-3-1.344-3-3c0-1.657,1.343-3,3-3 s3,1.343,3,3C10,8.656,8.657,10,7,10z M7,6C6.448,6,6,6.447,6,7c0,0.553,0.448,1,1,1s1-0.447,1-1C8,6.447,7.552,6,7,6z" />' +
                    '       <polyline style="stroke:#ABABAB;stroke-width:0px;" points="13,1 1,13"/></svg>' +
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
                            dot.parent().find("svg:first").find("path").css("fill", $(this).val());
                        });
                });
                box.find("input[type='text']").on("input", function () {
                    box.find("svg:first").attr("title", $(this).val() || "No tag");
                });
                box.find("svg:last").off().on("click", function () {
                    var Opt;
                    if (!AVE.Modules['DomainFilter'].Enabled){
                        if (!confirm("This feature relies on DomainFilter to work, but this module is disabled.\nDo you want to activate it?")){
                            return;
                        } else {
                            Opt = JSON.parse(_this.Store.GetValue(_this.Store.Prefix + AVE.Modules['DomainFilter'].ID, "{}"));
                            Opt.Enabled = true;
                            _this.Store.SetValue(_this.Store.Prefix + AVE.Modules['DomainFilter'].ID, JSON.stringify(Opt));
                            print("AVE: DomainFilter > Enabled");
                        }
                    }

                    var poly = $(this).find("polyline");
                    poly.css("stroke-width", poly.css("stroke-width") !== "2px" ? "2px" : "0px");
                });

                box.find("span#cancel").off().on("click", function () {
                    box.hide();
                });
                box.find("span#submit").off().on("click", function () {
                    domain = box.attr("domain");
                    tag = box.find("input[type='text']").val();
                    colour = box.find("input[type='color']").val();
                    ignore = box.find("svg > polyline").css("stroke-width") === "2px";

                    _this.setTag(domain, tag, colour, ignore);
                    _this.updateTag(domain);
                    box.hide();
                });
                box.hide();
            }

            var position = $(this).offset();
            position.top -= 5;
            position.left = Math.max(position.left - 280, 20);
            box.css(position)
                .show();

            box.attr("domain", domain);
            box.find("input[type='text']").val(tag).select();
            box.find("input[type='color']").val(colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("div#ColourDot").css("background-color", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg:first").find("path").css("fill", colour || (AVE.Utils.CSSstyle === "dark" ? "#438BB7" : "#4AABE7"));
            box.find("svg:first").attr("title", tag || "No tag");
            box.find("svg:last > polyline").css("stroke-width", ignore ? "2px" : "0px");
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
            var tag, colour, ignore;

            if (_this.DomainTags[domain]) {
                tag = _this.DomainTags[domain].t;
                colour = _this.DomainTags[domain].c;
                ignore = _this.DomainTags[domain].i || false;
            }

            var el = $(this).parent().find("div.AVE_Domain_tag");
            if(!el){return;}

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

    setTag: function (domain, tag, colour, ignore) {
        "use strict";
        var obj = new this.DomainTagObj(tag, colour, ignore);
        if(!obj.t && !obj.c){return;}
        this.DomainTags[domain] = obj;

        //print(JSON.stringify(this.DomainTags[domain]));
        this.Store.SetValue(this.StorageName, JSON.stringify(this.DomainTags));
    },
    removeTag: function (domain) {
        "use strict";
        delete this.DomainTags[domain];
        this.Store.SetValue(this.StorageName, JSON.stringify(this.DomainTags));
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
        tableCSS: '',
        initialized: false,
        module: {},
        domaintags: [],

        tagsperpage: 20,
        currpage: 0,

        CSSselector: "",

        MouseOverColours: [],

        init: function () {
            this.tableCSS = '\
                table#AVE_Dashboard_domaintags_table{\
                    width: 100%;\
                }\
                table#AVE_Dashboard_domaintags_table > thead > tr {\
                    font-size: 14px;\
                    padding-bottom: 10px;\
                    margin-bottom: 20px;\
                }\
                table#AVE_Dashboard_domaintags_table > thead > tr > th{\
                    text-align: center;\
                    font-weight: bold;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr:hover {\
                    background-color: '+(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9")+';\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td{\
                    padding-top: 5px;\
                    border-top : 1px solid #'+(AVE.Utils.CSSstyle === "dark" ? "3F3F3F" : "DDD")+';\
                    text-align: center;\
                    margin\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(1){\
                    /* Username */\
                    font-weight: bold;\
                    text-align: left;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(2){\
                    /* Tag */\
                    text-align: left;\
                    width: 250px;\
                    overflow: hidden;\
                    text-overflow: ellipsis;\
                    white-space: nowrap;\
                    padding-right: 10px;\
                }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(3){\
                    /* Colour */\
                    width: 120px;\
            }\
                table#AVE_Dashboard_domaintags_table > tbody > tr > td:last-child{\
                    /* Delete */\
                    height: 14px;\
                    width: 14px;\
                    /* SVG from Jquery Mobile Icon Set */\
                    background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + '%22%20points%3D%2214%2C3%2011%2C0%207%2C4%203%2C0%200%2C3%204%2C7%200%2C11%203%2C14%207%2C10%2011%2C14%2014%2C11%2010%2C7%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
                    background-repeat: no-repeat;\
                    cursor: pointer;\
                    background-position: center;\
                }\
                a#AVE_Dashboard_navigate_tags[role]{\
                    margin: 0px 5px 10px 0px;\
                }\
                td > span#PreviewBox {\
                    margin: -2px 0px -2px 0px;\
                }';
            AVE.Utils.AddStyle(this.tableCSS);

            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#484648" : "#EDE9E9");
            this.MouseOverColours.push(AVE.Utils.CSSstyle === "dark" ? "#534040" : "#FFC9C9");

            this.module = AVE.Modules['DomainTags'];

            this.CSSselector = "a[id^='AVE_Dashboard_Show'][name='"+this.module.ID+"']";

            this.initialized = true;
        },

        html: function () {
            if (!this.initialized){this.init();}

            //Empty container
            this.domaintags = [];

            var _this, tempObj, tempDomaintags, keys, htmlStr, start;
            _this = this;
            start  = this.currpage*this.tagsperpage;
            htmlStr = "";

            AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
            tempDomaintags = JSON.parse(this.module.Store.GetValue(this.module.StorageName, "{}"));
            keys = Object.keys(tempDomaintags);
            keys.sort();

            $.each(keys, function (idx, key) {

                tempObj = tempDomaintags[key];
                tempObj.name = key;

                tempObj.c = tempObj.c || "#FFF";
                tempObj.i = tempObj.i ? "Yes" : "No";
                _this.domaintags.push( JSON.stringify( tempObj ) );

            });

            var htmlNavButtons = this.navbuttons();

            htmlStr += htmlNavButtons;

            htmlStr += '<input style="display:none;" id="AVE_Dashboard_domaintags_quickedit" data="colour" style="width:50px;" type="color" original="#FFFFFF" value="#FFFFFF">';

            var htmlTable = "";
            htmlTable += '<table id="AVE_Dashboard_domaintags_table">' +
                '<thead>' +
                '<tr>' +
                '<th>Domain</th>' +       //click to go to user page
                '<th>Tag</th>' +            //click to show input box
                '<th>Colour</th>' +         //click to show color picker
                '<th>Ignored</th>' +        //click to toggle ignore
                '<th role="remove"></th>' + //click to remove entire tag
                '</tr>' +//ADD link to open page to this domain
                '</thead>';
            htmlTable +=    this.paging(start, this.tagsperpage);
            htmlTable += "</table>";

            htmlStr += htmlTable;

            htmlStr += '<div style="text-align: right;margin-bottom:10px;">Showing tags '+ (start+1)+' to '+ Math.min(this.domaintags.length, start+this.tagsperpage) +' ('+this.domaintags.length+' total)</div>';

            htmlStr += htmlNavButtons;

            htmlStr +='<br><div style="margin-top:20px;font-weight:bold;">Click on a value to modify it.'+
                '<br> Click the buttons on either sides to navigate through the table pages or use the arrow keys (+Ctrl to go to the first or last page)';

            return htmlStr;
        },
        callback: function () {
            "use strict";
            var _this = this;
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:last-child') //remove
                .off()
                .on("mouseover", function () {
                    $(this).parent().css("background", _this.MouseOverColours[1]);
                })
                .on("mouseleave", function () {
                    $(this).parent().css("background", "");
                })
                .on("click", function () {
                    var name = $(this).parent().attr("domain");
                    if (confirm("Are you sure you want to delete the tag attached to \""+name+"\"?")){
                        _this.module.removeTag(name);
                        $(_this.CSSselector).trigger("click");
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(2)') //edit tag
                .off()
                .on("click", function (e, artificial) {
                    var tag = $(this).text() || $(this).find("input").val() || "";

                    if ($(this).find("input").length === 0){
                        $(this).html('<input id="AVE_Dashboard_domaintags_quickedit" data="tag" style="width:95%;" type="text" original="'+tag+'" value="'+tag+'">');
                        var input = $(this).find("input");
                        input.focus().select();
                        input.one("focusout", function () {
                            input.val(input.attr("original"));
                            $(this).trigger("click", true);
                        });
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus because of a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+tag+'">'+tag+'</span>');
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(3)') //edit colour
                .off()
                .on("click", function (e, artificial) {
                    var colour = $(this).text() || $(this).find("input").val();

                    if ($(this).find("input").length === 0){
                        var input = $("input#AVE_Dashboard_domaintags_quickedit[type='color'][data='colour']");
                        input.attr("original", colour).attr("u", $(this).parent().attr("domain")).val(colour);
                        input.one("change", function () {
                            _this.editTag(input, "colour");
                        });
                        input.show().css("opacity", "0"); //Because of Chrome which doesn't want to show the colour palette if the input is hidden ("display: none;")
                        input.trigger("click");
                    } else {
                        if (!artificial) {return;}//we don't want to lose the focus by a click in the same input text
                        $(this).find("input").off();
                        $(this).html('<span title="'+colour+'">'+colour+'</span>');
                    }
                });
            $('table#AVE_Dashboard_domaintags_table > tbody > tr > td:nth-child(4)') //edit ignore
                .off()
                .on("click", function () {
                    var ignore, newval;
                    ignore = $(this).text();
                    newval = ignore === "No" ? "Yes" : "No";

                    $(this).text(newval);
                    _this.editTag($(this), "ignore");
                });
            $('a#AVE_Dashboard_navigate_tags') //navigate with buttons
                .off()
                .on("click", function () {
                    if ($(this).hasClass("btn-unsub")){return false;}

                    switch ($(this).attr('role')) {
                        case "prev":
                            _this.currpage--;
                            break;
                        case "next":
                            _this.currpage++;
                            break;
                        case "first":
                            _this.currpage = 0;
                            break;
                        case "last":
                            _this.currpage = Math.ceil((_this.domaintags.length - _this.tagsperpage) / _this.tagsperpage);
                            break;
                        default:
                            return;
                    }

                    $(_this.CSSselector).trigger("click");
                });
            $(document)
                .off()
                .on("keyup", function (event) {
                    var ctrl, pos, input;
                    ctrl= event.ctrlKey;

                    input = $("input#AVE_Dashboard_domaintags_quickedit:not([type='color'])");

                    if (input.length === 0){ //navigate with arrow keys
                        //We don't want to change page when a user is using the arrow key to edit a value
                        if (event.which === 37){
                            pos = (ctrl ? "first" : "prev");
                        } else if (event.which === 39){
                            pos = (ctrl ? "last" : "next");
                        }
                        if (pos){
                            $('a#AVE_Dashboard_navigate_tags[role="'+ pos +'"]:first').trigger("click");
                        }
                    }

                    if (event.which === 13){ //Press enter to confirm change
                        _this.editTag(input, input.attr("data"));
                    }
                });
        },

        editTag: function (input, dtype) {
            "use strict";
            var _this = this;

            if (input.length === 1){
                if (input.attr("original") === input.val() && dtype !== "ignore"){input.trigger("click", true);return;}//No need to update nor reload if nothing changed
                var root, tag, colour;

                if (dtype === "colour"){
                    var u  = input.attr("u");
                    root = $("tr[domain='"+u+"']");
                } else {
                    root = input.parents("tr:first");
                }

                var domain = root.attr("domain");
                var ignore = root.find("td[data='ignore']").text() === "Yes";

                if (dtype === "tag"){
                    tag = input.val();
                } else {
                    tag = root.find("td[data='tag']").text();
                }

                if (dtype === "colour"){
                    colour = input.val() || input.attr("original");
                } else {
                    colour = root.find("td[data='colour']").text();
                }

                _this.module.setTag(domain, tag, colour, ignore); //save tag

                $(_this.CSSselector).trigger("click"); //Reload-update
            }
        },

        navbuttons: function () {
            var htmlNavButtons = "";
            htmlNavButtons += '<div style="float: left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="first" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">First</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: left;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="prev" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage === 0 ? "btn-unsub" : "btn-sub" ) +'">Previous</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="last" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.domaintags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Last</a>' +
                '</div>';
            htmlNavButtons += '<div style="float: right;">' +
                '<a href="javascript:void(0)" id="AVE_Dashboard_navigate_tags" role="next" class="btn-whoaverse-paging btn-xs btn-default '+ (this.currpage >= Math.ceil((this.domaintags.length-this.tagsperpage)/this.tagsperpage) ? "btn-unsub" : "btn-sub" ) +'">Next</a>' +
                '</div>';
            return htmlNavButtons;
        },

        paging: function (start, nb) {
            var colour, r, g, b, bestColour;

            var htmlStr = "";
            var obj = {};
            var direct = false;

            for (var i=start; i <= start+nb-1; i++){
                if (i >= this.domaintags.length){break;}

                obj = JSON.parse(this.domaintags[i]);

                colour = AVE.Utils.GetRGBvalues(obj.c);
                r = colour[0]; g = colour[1]; b = colour[2];
                bestColour = AVE.Utils.GetBestFontColour(r, g, b);

                direct = /v\/[a-zA-Z0-9]?/.test(obj.name);

                htmlStr += '<tr domain="'+obj.name+'">';
                htmlStr += '<td><a target="_blank" href="/'+ (direct ? obj.name : "domains/"+obj.name)+'" >'+obj.name + '</a></td>' +
                    '<td data="tag"><span title="'+obj.t+'">'+obj.t+'</span></td>' +
                    '<td data="colour" style="background-color:'+obj.c+'; color:'+bestColour+';">'+obj.c+'</td>' +
                    '<td data="ignore">'+obj.i+'</td>' +
                    '<td role="remove_icon"></td>';
                htmlStr += "</tr>";
            }
            return htmlStr;
        },

        destructor: function () {
            //set all listeners to off
        }
    }
};
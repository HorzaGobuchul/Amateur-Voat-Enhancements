
// ==UserScript==
// @name        Amateur Voat Enhancements
// @author      Horza
// @date        25 june 2015
// @description Add new features to voat.co
// @license     MIT; https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/blob/master/LICENSE
// @match       *://voat.co/*
// @match       *://*.voat.co/*
// @version     1
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @run-at      document-end
// @updateURL   https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements_meta.user.js
// @downloadURL https://github.com/HorzaGobuchul/Amateur-Voat-Enhancements/raw/master/Amateur-Voat-Enhancements.user.js
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// ==/UserScript==

var data = {};

data.option = {
    FixedAccountHeader: true,
    FixedListHeader: true,
    EnableTags: true,
    EnableImage: true,
    EnableSubHeader : true
};

$(window).ready(function () {
    data.regExpSet = /([^:]*):([0-9]*)/i;
    data.regExpTag = /([^:]*):([^:]*)/i;
    data.subverseName = GetSubverseName();
    data.isPageSubverse = isPageSubverse();
    data.currentPageType = GetCurrentPageType();
    data.ListHeaderHeight = 0,
    data.CSSstyle = GetCSSStyle();
    
    for (var key in data.option) {
        data.option[key] = GM_getValue(key, true);
    }
    
    if (data.option.FixedListHeader) {
        SetSubListHeaderPosAsFixed();
    }
    
    if (data.option.FixedAccountHeader) {
        SetAccountHeaderPosAsFixed();
    }

    if (data.option.EnableImage && $.inArray(data.currentPageType, ["subverses", "sets", "user", "user-manage", "mysets"]) == -1) {
        AppendImageButton();
    }
    
    if (data.option.EnableSubHeader){
        DisplayCustomSubversesList();
        if (data.isPageSubverse) {
            AppendShortcutButton();
        } else if (data.currentPageType == "subverses") {
            AddShortcutsButtonInSubversesPage();
        } else if ($.inArray(data.currentPageType, ["mysets", "sets"]) >= 0) {
            AddShortcutsButtonInSetsPage();
        } else if (data.currentPageType == "set") {
            AddShortcutsButtonInSetPage(); //https://voat.co/set/xx
        }
    }
    
    if (data.option.EnableTags)
    {
        data.usertags = GM_getValue("Voat_Tags", "");
        ShowUserTag();
    }

    if (data.currentPageType == "user-manage") {
        InsertAVEManager();
    }
});

//// Special to voat.co/set/xx: adds a "shortcut" button for this set ////
function AddShortcutsButtonInSetPage() {
    //Not implemented yet.
    //The set pages are boud to change soon.
    return false;
}
//// END ////

//// Special to voat.co/sets & /mysets: adds a "shortcut" button for each sets ////
function AddShortcutsButtonInSetsPage() {
    var inShortcut = false;
    var tempSetName = "";
    var tempSetId = "";

    $("div[id*='set']").each(function () {
        tempSetName = $(this).find(".h4").text();//.replace(/([&\/\\#,+()$~%.'":*?<>{}])/g, '\\$1');
        tempSetId = $(this).find(".h4").attr("href").substr(5);
        inShortcut = isSubInShortcuts(tempSetName + ":" + tempSetId);

        var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Sets_Shortcut" setName="' + tempSetName + '" setId="' + tempSetId + '" type="button" class="btn-whoaverse-paging btn-xs btn-default ' + (inShortcut ? "" : "btn-sub") + '">'
                                + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
        $(btnHTML).insertAfter($(this).find(".midcol").first());
    });
}

$(document).on("click", "#GM_Sets_Shortcut", function () {
    var setName = $(this).attr("setName");
    var setId = $(this).attr("setId");

    if (setName == null || setName == undefined || setName == "undefined" ||
        setId == null || setId == undefined) {
        alert("Error adding set " + setName + ", id: " + setId);
        return;
    }

    var set = setName + ":" + setId;
    if (isSubInShortcuts(set)) {
        RemoveFromShortcuts(set);
        ToggleShortcutButton(true, this);
    }
    else {
        AddToShortcuts(set);
        ToggleShortcutButton(false, this);
    }

    DisplayCustomSubversesList();
});
//// END ////

//// Special to voat.co/subverses: adds a "shortcut" button for each subverse////
function AddShortcutsButtonInSubversesPage() {
    var inShortcut = false;
    var tempSubName = "";

    $('.col-md-6').each(function () {
        tempSubName = $(this).find(".h4").attr("href").substr(3);
        inShortcut = isSubInShortcuts(tempSubName);

        var btnHTML = '<div style="float: left; width: 100%; margin-top: 10px;" class="midcol">\
                            <button id="GM_Subverses_Shortcut" subverse="'+tempSubName+'" type="button" class="btn-whoaverse-paging btn-xs btn-default '+(inShortcut ? "" : "btn-sub")+'">'
                                + (inShortcut ? "-" : "+") + ' shortcut\
                            </button>\
                      </div>';
        $(btnHTML).insertAfter($(this).find(".midcol").first());
    });
}

$(document).on("click", "#GM_Subverses_Shortcut", function () {
    var subName = $(this).attr("subverse");
    if (isSubInShortcuts(subName)) {
        RemoveFromShortcuts(subName);
        ToggleShortcutButton(true, this);
    }
    else {
        AddToShortcuts(subName);
        ToggleShortcutButton(false, this);
    }

    DisplayCustomSubversesList();
});
//// END ////

//// Utils ////
function GetCSSStyle() {
    return $("head > link[href*='/Content/Dark?']").length > 0 ? "dark" : "light";
}

function GetCurrentPageType() {
    var RegExpTypes = {
            frontpage:   /voat.co\/?$/i,
            subverse:    /voat.co\/v\/[a-z]*\/?$/i,
            thread:      /voat.co\/v\/[a-z]*\/comments\/\d*/i,
            subverses:   /voat.co\/subverses/i,
            set:         /voat.co\/set\/\d*/i,
            mySet:       /voat.co\/mysets/i,
            sets:        /voat.co\/sets/i,
            user:        /voat.co\/user\/[\w\d]*\/?$/i,
            comments:    /voat.co\/user\/[\w\d]*\/comments/i,
            submissions: /voat.co\/user\/[\w\d]*\/submissions/i,
            messaging:   /voat.co\/messaging/i,
            manage:      /voat.co\/account\/manage/i,
    };
    var url = window.location.href;

    if (RegExpTypes.frontpage.test(url))        {return "frontpage";}
    else if (RegExpTypes.subverse.test(url))    {return "subverse";}
    else if (RegExpTypes.thread.test(url))      {return "thread";}
    else if (RegExpTypes.subverses.test(url))   {return "subverses";}
    else if (RegExpTypes.set.test(url))         {return "set";}
    else if (RegExpTypes.mySet.test(url))       {return "mysets";}
    else if (RegExpTypes.sets.test(url))        {return "sets";}
    else if (RegExpTypes.user.test(url))        {return "user";}
    else if (RegExpTypes.comments.test(url))    {return "user-comments";}
    else if (RegExpTypes.submissions.test(url)) {return "user-submissions";}
    else if (RegExpTypes.messaging.test(url))   {return "user-messages";}
    else if (RegExpTypes.manage.test(url))      {return "user-manage";}

    return "none";
}

function isPageSubverse() {

    if (data.subverseName != null)
    { return true; }

    return false;
}

function GetSubverseName() {
    var m = new RegExp(/voat\.co\/v\/([\w\d]*)/).exec(window.location.href);

    if (m == null) { return null; }
    else { return m[1].toLowerCase(); }
}
//// END ////

/// Special methods related to shortcuts ///
function GetSubversesList() {
    return GM_getValue("Voat_Subverses", "newsubverses,introductions,news").split(',');
}

function GetSetParam(str) {
    var m = data.regExpSet.exec(str);

    if (m == null) { return null; }
    else { return [m[1].toLowerCase(), m[2]]; }
}

function AddToShortcuts(SubName) {
    var subversesArr = GetSubversesList();
    var str = subversesArr.join(",") + "," + SubName;

    GM_setValue("Voat_Subverses", str);
}

function RemoveSetFromShortcut(id) {
    var subversesArr = GetSubversesList();

    for (var x in subversesArr) {
        if (data.regExpSet.test(subversesArr[x]))
        {
            if ( GetSetParam(subversesArr[x])[1] == id){
                RemoveFromShortcuts(subversesArr[x]);
                return true;
            }
        }
    }
    return false;
}

function RemoveFromShortcuts(SubName) {
    var subversesArr = GetSubversesList();
    var idx = subversesArr.indexOf(SubName);

    if (idx < 0) {
        alert("sub or set name not found in Header list\n(" + SubName + ")");
        return false;
    }

    subversesArr.splice(idx, 1);
    GM_setValue("Voat_Subverses", subversesArr.join(","));
}

function ToggleShortcutButton(state, sel) {
    if (state == true) {
        $(sel).text('+ shortcut');
        $(sel).addClass('btn-sub')
    }
    else {
        $(sel).text('- shortcut');
        $(sel).removeClass('btn-sub');
    }
}

function isSubInShortcuts(Sub) {
    var subversesArr = GetSubversesList();

    for (var i in subversesArr) {
        if (subversesArr[i].toLowerCase() == Sub.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function isPageInShortcuts() {
    var subversesArr = GetSubversesList();

    return isSubInShortcuts(data.subverseName);
}
/// END ///

/// Common to voat.co: modifies the subverses header list with custom subverses ////
function DisplayCustomSubversesList() {
    var SubString = '';
    var subArr = GetSubversesList();
    var setInfo = [];

    for (var idx in subArr) {
        if (subArr[idx] == "") { continue;}
        if (data.regExpSet.test(subArr[idx])) { //ex: name:12
            setInfo = GetSetParam(subArr[idx]);
            SubString += '<li><span class="separator">-</span><a href="/set/' + setInfo[1] + '/" style="font-weight:bold;font-style: italic;">' + setInfo[0] + '</a></li>';
        }
        else {
            SubString += '<li><span class="separator">-</span><a href="/v/' + subArr[idx] + '/">' + subArr[idx] + '</a></li>';
        }
    }
    $('ul#sr-bar').html(SubString);
}

//// Special to subverse: adds a "shortcut" button for this subverse////
function AppendShortcutButton() {

    if (!isPageInShortcuts()) {
        var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default btn-sub">+ shortcut</button>';
    }
    else {
        var btnHTML = '<button id="GM_Shortcut" type="button" class="btn-whoaverse-paging btn-xs btn-default">- shortcut</button>';
    }

    if ($(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub").length){
        $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-unsub");
    }
    else {
        $(btnHTML).insertAfter(".btn-whoaverse-paging.btn-xs.btn-default.btn-sub");
    }
}

$(document).on("click", "#GM_Shortcut", function () {
    if (isPageInShortcuts()) {
        RemoveFromShortcuts(data.subverseName);
        ToggleShortcutButton(true, "#GM_Shortcut");
    }
    else {
        AddToShortcuts(data.subverseName);
        ToggleShortcutButton(false, "#GM_Shortcut");
    }

    DisplayCustomSubversesList();
});
//// END ////


/// Highlight and Select a comment/thread in particular ///
$(document).on("click", ".entry", function () {
    ToggleSelectedState($(this));
});

function ToggleSelectedState(obj) {
    if (data.SelectedPost != undefined)
    { 
        data.SelectedPost.closest("div[class*=' id-']").css('background-color', '');
        data.SelectedPost.find("blockquote").css('background-color', '');
        //data.SelectedPost.find("pre").css('background-color', '');

        if (data.currentPageType == "user-submissions"){
            data.SelectedPost.parent().find(".submission.even.link.self").css('background-color', '');
            data.SelectedPost.parent().css('background-color', '');
            data.SelectedPost.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', '');
        }
        if (data.SelectedPost.closest("div[class*=' id-']").hasClass("highlightedComment"))
        { data.SelectedPost.closest(".highlightedComment").attr('style', ''); }

        if (data.SelectedPost.closest("div[class*=' id-']").hasClass("submission"))
        { data.SelectedPost.find(".md").css('background-color', ''); }
    }

    obj.closest("div[class*=' id-']").css('background-color', data.CSSstyle == "dark" ? '#323E47' : '#F4FCFF');
    obj.find("blockquote").css('background-color', data.CSSstyle == "dark" ? '#394856' : '#EAFEFF');
    //obj.find("pre").css('background-color', data.CSSstyle == "dark" ? '#394856' : '#EAFEFF'); //deactivated because a colour is attributed to the text in "pre" elements.

    //Special case: user/username/submissions
    if (data.currentPageType == "user-submissions") {
        obj.parent().find(".submission.even.link.self").css('background-color', data.CSSstyle == "dark" ? '#323E47' : '#F4FCFF');
        obj.parent().css('background-color', data.CSSstyle == "dark" ? '#323E47' : '#F4FCFF');
        obj.prevAll(".midcol.unvoted").first().find(".submissionscore").css('background-color', data.CSSstyle == "dark" ? '#2D4A60' : '#E1F9FF');
    }
    //Special case: highlighted comment
    if (obj.closest("div[class*=' id-']").hasClass("highlightedComment")) {
        obj.closest(".highlightedComment").attr('style', data.CSSstyle == "dark" ?
          'background-color: rgb(84, 47, 47) !important; border: 1px solid rgb(162, 62, 62) !important;' :
          'background-color: rgb(209, 238, 249) !important; border: 1px solid rgb(49, 142, 200) !important;');
    }
    //Special: is a submission post, not a comment.
    if (obj.closest("div[class*=' id-']").hasClass("submission"))
    { obj.find(".md").css('background-color', data.CSSstyle == "dark" ? '#394856' : '#EAFEFF'); }

    data.SelectedPost = obj;
}

//A and Z to vote
$(document).keypress(function (event) {
    if ($(":input").is(":focus")) { return; }

    if (data.SelectedPost != undefined) {
        if (event.which === 97) { //a to upvote
            data.SelectedPost.parent().find(".midcol").find("div[aria-label='upvote']").first().click();
        }   
        else if (event.which === 122) { //z to downvote
            data.SelectedPost.parent().find(".midcol").find("div[aria-label='downvote']").first().click();
        }
    }
});
/// END ///

/// Fixed position header-account info ///
function SetAccountHeaderPosAsFixed(){
    var headerAccountPos = $('#header-account').offset().top;
    $(window).scroll(function () {
        if (!data.option.FixedAccountHeader) {return;}

        if ($(window).scrollTop() + (data.option.FixedListHeader ? data.ListHeaderHeight : 0) > headerAccountPos) {
            $('#header-account').css('position', 'fixed')
                                .css('top', data.option.FixedListHeader ? data.ListHeaderHeight : "0")
                                .css('right', '0')
                                .css("text-align", "center")
                                .css("height", "0px");
            $('.logged-in').css("background", data.CSSstyle == "dark" ? "rgba(41, 41, 41, 0.80)" : "rgba(246, 246, 246, 0.80)");
        } else {
            $('#header-account').css('position', '')
                                .css('top', '')
                                .css("text-align", "")
                                .css("height", "");
            $('.logged-in').css("background", "");
        }
    });
}
/// END ///

/// Fixed position subverse list header ///
function SetSubListHeaderPosAsFixed (){
    data.ListHeaderHeight = $('#sr-header-area').height();
    
    $('.width-clip').css('position', 'fixed')
        .css('border-bottom', '1px solid ' + (data.CSSstyle == "dark" ? "#222" : "#DCDCDC"))
        .css("height", data.ListHeaderHeight + "px")
        .css("background-color", data.CSSstyle == "dark" ? "#333" : "#FFF");
}
/// END ///

/// Toggle expand all images ///
function AppendImageButton() {
    var sel = $("[title='JPG'],[title='PNG'],[title='GIF'],[title='Gfycat'],[title='Gifv'],[title='Imgur Album']"); //,[title=''] voat.co/v/test/comments/37149

    var NbImg = sel.length;
    var isExpanded = false;

    if (NbImg == 0) return;

    var btnHTML = '<li class="disabled"><a id="GM_ExpandAllImages" class="contribute submit-text">View images (' + NbImg + ')</a></li>';
    $(btnHTML).insertAfter(".disabled:last");

    $('#GM_ExpandAllImages').click(function () {
        if ($(this).hasClass("expanded")) {
            $(this).text('View images (' + NbImg + ')');
            $(this).removeClass("expanded")
            isExpanded = false;
        } else {
            $(this).text('Hide images (' + NbImg + ')');
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
}
/// END ///

/// Taggging ///

function ShowUserTag() {
    var Tag_html, name, tag;
    var style = "border:1px solid #" + (data.CSSstyle == "dark" ? "5452A8" : "D1D0FE") + ";background-color:#" + (data.CSSstyle == "dark" ? "304757" : "F4FCFF") + ";font-size:10px;padding:0px 4px;color:#6CA9E4;font-weight:bold;margin-left:4px;cursor: pointer;";

    //All mention of an username as a link.
    var sel = /\/user\/[^/]*\/?$/i;
    $("a[href*='/user/']").each(function () {
        if (!$(this).attr('href').match(sel)) return true;
        name = $(this).html().replace("@", "").replace("/u/", "").toLowerCase(); //Accepts: Username, @Username, /u/Username
        if ($(this).attr('href').split("/")[2].toLowerCase() != name) return true;

        tag = GetTag(name);
        Tag_html = '<span class="GM_UserTag" id="' + name + '" style="' + style + '">' + (!tag ? "+" : tag) + '</span>';
        $(Tag_html).insertAfter($(this));
    });

    //Username in userpages
    if ($.inArray(data.currentPageType, ["user", "user-comments", "user-submissions"]) >= 0) {
        name = $(".alert-title").text().split(" ")[3].replace(".", "");
        tag = GetTag(name);
        Tag_html = '<span class="GM_UserTag" id="' + name + '" style="' + style + '">' + (!tag ? "+" : tag) + '</span>';
        $(".alert-title").html("Profile overview for "+name+Tag_html+".");
    }
}

function UpdateUserTag(name, tag) {
    $("span[class*='GM_UserTag'][id*='" + name + "']").each(function () {
        $(this).text(tag);
    });
}

$(document).on("click", ".GM_UserTag", function () {
    var username = $(this).attr("id");
    var oldTag = $(this).text();
    var newTag = prompt("Tag for "+username, oldTag !== "+" ? oldTag : "").replace(/[:,]/g,"-");
    if (newTag.length > 0) {
        if (oldTag !== "+") {
            UpdateTag(username, newTag);
        } else {
            SetTag(username, newTag);
        }
    }
    else if (newTag.length == 0) {
        if (oldTag != "+") {
            RemoveTag(username);
        }
        newTag = "+";
    }
    $(this).text(newTag);
    UpdateUserTag(username, newTag);
});

function RemoveTag(userName) {
    var usertags = data.usertags.split(",");
    var idx = usertags.indexOf(userName + ":" + GetTag(userName));
    if (idx < 0) {
        alert("RemoveTag: No tag was found for this user (" + userName + ").");
        return false;
    }
    usertags.splice(idx, 1);

    data.usertags = usertags.join(",");
    GM_setValue("Voat_Tags", data.usertags);
}

function UpdateTag(userName, tag) {
    var usertags = data.usertags.split(",");
    var user;
    for (var idx in usertags) {
        user = data.regExpTag.exec(usertags[idx]);
        if (user == null) continue;

        if (userName.toLowerCase() == user[1].toLowerCase()) {
            usertags[idx] = userName + ":" + tag;
            break;
        }
    }

    data.usertags = usertags.join(",");
    GM_setValue("Voat_Tags", data.usertags);
}

function SetTag(userName, tag) {
    var usertags = data.usertags;

    data.usertags = usertags + "," + userName + ":" + tag;
    GM_setValue("Voat_Tags", data.usertags);
}

function GetTag(userName) {
    var usertags = data.usertags.split(",");
    var user = "";
    for (var idx in usertags) {
        user = data.regExpTag.exec(usertags[idx]);
        if (user == null) continue;

        if (userName.toLowerCase() == user[1].toLowerCase()) {
            return user[2];
        }
    }
    return false
}

function GetTagCount() {
    return data.usertags.split(",").length;
}
/// END ////


/// AVE Manager ///

function InsertAVEManager() {
    var Labels = {
        FixedAccountHeader: "Enable fixed position for the account block",
        FixedListHeader: "Enable fixed position for the Subverse list header",
        EnableTags: "Enable user tags",
        EnableImage: "Enable button to display images",
        EnableSubHeader: "Replace Subverse list header with custom choice of shortcuts",
    }

    var MngHTML = '<br /><div class="alert-title">AVE Preferences</div>';
    MngHTML += '<section id="AVEPreferences">'
    MngHTML += '<form class="form-horizontal" action="/account/manage" method="get">';
    for (var i in data.option) {
        MngHTML += '<div class="checkbox">'+
                       '<input '+ (data.option[i] ? 'checked="checked"' : '') +' id="' + i + '" name="' + i + '" value="' + data.option[i] + '" type="checkbox"></input>' +
                       '<label for="' + i + '">' + Labels[i] + '</label>' +
                   '</div>';
    }

    MngHTML += '<br /><input value="Save" id="AVEPrefSave" class="btn btn-whoaverse" type="submit" title="Save!"></input>';
    MngHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input value="Reset Stored Data" id="AVEPrefRest" class="btn btn-whoaverse" type="submit" title="Warning: this will delete your preferences, shortcut list and all usertags!"></input>';
    MngHTML += '</form></section><br />';

    $(MngHTML).insertBefore($(".alert-title").get(2));
}

$(document).on("click", "#AVEPrefSave", function () {
    $("#AVEPreferences").find(":checkbox").each(function () {
        data.option[$(this).attr("id")] = $(this).is(":checked");
        GM_setValue($(this).attr("id"), $(this).is(":checked"));
    });
});

$(document).on("click", "#AVEPrefRest", function () {
    for (var key in data.option)
    {GM_deleteValue(key);}
    GM_deleteValue("Voat_Tags");
    GM_deleteValue("Voat_Subverses");
});
/// END ///

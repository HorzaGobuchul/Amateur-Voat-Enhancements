AVE.Modules['Dashboard'] = {
    ID: 'Dashboard',
    Name: 'AVE\'s dashboard',
    Desc: 'Use it to manage your saved data.',
    Category: null,
    //Category set to null will make this module invisible to the pref-mngr

    Index: 1000,
    Enabled: false,

    Store: {},

    RunAt: "container",

    Modules: {
        "UserTag": "User tags",
        "DomainTags": "Domain tags",
        "Shortcuts": "Subverse shortcuts",
        "ToggleCustomStyle": "Custom style permissions"},

    Load: function () {
        if (AVE.Utils.currentPageType === "user-manage"){
            this.Enabled = true;
        }

        if (this.Enabled){
            this.Start();
        }
    },

    Start: function () {
        this.AppendToPage();
        this.Listeners();

        if(location.hash === "#dashboard"){
            $("a#AVE_ShowDashboard:first").trigger("click");
        }
    },

    AppendToPage: function () {
        "use strict";
        var TempHtml;
        var _this = this;

        if ($("a#AVE_ShowDashboard").length === 0){
            TempHtml = '<ul class="tabmenu"><li class="selected"><a id="AVE_ShowDashboard" style="font-weight: bold;margin-right: 20px;" title="Show AVE\'s dashboard" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub">Show dashboard</a>';


            $.each(_this.Modules, function (id, name) {
                /*
                 Subverse list (rearrange, delete, update, add(list",")
                 ToggleCustomStyle (stored subverse and if show or hide)
                 */
                //Replace buttons with a droplist
                TempHtml += '<a style="margin-left:10px;" name="'+id+'" id="AVE_Dashboard_Show_'+id+'" title="Show '+name+'" href="javascript:void(0)" class="btn-whoaverse-paging btn-xs btn-default btn-sub">'+name+'</a>';
            });
            TempHtml += '</li></ul>';

            $(TempHtml).insertAfter("#show-menu-button");
            $("a[id^='AVE_Dashboard_Show']").hide();
        }
        if ($('div.content').length === 1){
            TempHtml = '<div style="display: none;" class="content" id="AVE_Dashboard_content" role="default"><div class="row nomargin"></div></div>';

            $(TempHtml).insertAfter('div.content[role="main"]');

            var JqId = $('div.content#AVE_Dashboard_content[role="default"] > div.row.nomargin');
            TempHtml = '<div class="alert-title">AVE\'s dashboard</div>';
            TempHtml += '<section id="userPreferences">';
            TempHtml += '   <div style="font-weight: bold;font-size: 12px;" >Click one of the buttons above to display the data associated with it.<br />';
            TempHtml += '   <span style="text-decoration: underline;">Nota Bene</span>: stored data aren\'t cached; they are retrieved and processed every time you click one of the button to always display the most up to date values.</div>';
            TempHtml +='</section>';
            JqId.append(TempHtml);
        }
    },

    Listeners: function () {
        var _this = this;
        $("a#AVE_ShowDashboard")
            .off("click")
            .on("click", function () {_this.ToggleMainContent();});

        $("a[id^='AVE_Dashboard_Show']")
            .off("click")
            .on("click", function (el) {
                "use strict";
                _this.ToggleContent($(this).attr("name"), $(this).text());
        });
    },

    ToggleContent: function (module, name) {
        if (AVE.Modules[module].AppendToDashboard !== undefined) {
            if (typeof AVE.Modules[module].AppendToDashboard.html === "function") {
                var html;

                html = '<div class="alert-title">'+name+'</div>';
                html += '<section id="userPreferences" role="AVE_Dashboard" module="'+module+'">';
                html += AVE.Modules[module].AppendToDashboard.html();
                html +='</section>';

                $('div.content#AVE_Dashboard_content[role="default"] > div.row.nomargin').html(html);
            } else {print("AVE: Dashboard > Module \""+module+"\" doesn't implement function \"AppendToPreferenceManager.html()\"");return;}
            if (typeof AVE.Modules[module].AppendToDashboard.callback === "function") {
                AVE.Modules[module].AppendToDashboard.callback();
            }

        } else {print("AVE: Dashboard > Module \""+module+"\" doesn't implement asso. array \"AppendToPreferenceManager\"");}
    },

    ToggleMainContent: function(){
        "use strict";
        var JqMain = $('div.content[role="main"]:first');
        var JqNew = $('div.content#AVE_Dashboard_content[role="default"]');
        if (JqMain.is(":visible")){
            JqMain.hide();
            JqNew.show();
            $("a[id^='AVE_Dashboard_Show']").show();

            $("a#AVE_ShowDashboard").text("Hide Dashboard");
            document.title = "Manage AVE's Data";
            location.hash = "#dashboard";
        } else {
            JqMain.show();
            JqNew.hide();
            $("a[id^='AVE_Dashboard_Show']").hide();

            $("a#AVE_ShowDashboard").text("Show Dashboard");
            document.title = "Manage Account";
            location.hash = "";
        }
    }
};
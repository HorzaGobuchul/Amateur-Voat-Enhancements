var AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        var _this = this;

        AVE.Utils.EarlySet();
        
        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) == -1) {

            //Start as soon as possible
            $.each(AVE.Modules, function () {
                if (this.RunAt && this.RunAt === "start") {
                    _this.LoadModules(this);
                }
            });

            //On head ready
            $("head").ready(function () {
                $.each(AVE.Modules, function () {
                    if (this.RunAt && this.RunAt === "head") {
                        _this.LoadModules(this);
                    }
                });
            });

            //On container ready
            //$("div#container").ready(function () { print("container ready"); });

            //On doc ready
            $(document).ready(function () {
                AVE.Utils.LateSet();

                print("AVE: Current page > " + AVE.Utils.currentPageType);
                //print("AVE: Current style > " + AVE.Utils.CSSstyle);

                title = document.title.toLowerCase();

                //By /u/Jammi: voat.co/v/AVE/comments/421861
                if (~title.indexOf('checking your bits') || ~title.indexOf('play pen improvements')) {
                    if (~document.cookie.indexOf('theme=dark')) {
                        $.each(["body background #333", "body color #dfdfdf", "#header background #333", "#header-container background #333", "#header-container borderBottomColor #555", "#header-container borderTopColor #555", ".panel-info background #222", ".panel-heading background #222", ".panel-heading borderColor #444", ".panel-title background #222", ".panel-title color #dfdfdf", ".panel-body background #222", ".panel-body borderColor #444"],
                               function () { var _this = this.split(" "); $(_this[0]).css(_this[1], _this[2]) });
                    }
                    return;
                }//Error pages that are empty

                //print("AVE: Loading " + Object.keys(AVE.Modules).length + " modules.")
                $.each(AVE.Modules, function () {
                    var mod = this;
                    if (!mod.RunAt || mod.RunAt === "ready") {
                        _this.LoadModules(mod);
                    }
                });
            });

            //On window loaded
            var LoadModuleOnLoadComplete = function () {
                $.each(AVE.Modules, function () {
                    if (this.RunAt && this.RunAt === "load") {
                        _this.LoadModules(this);
                    }
                });
            };

            //$(window).load's callback isn't triggered if it is processed as the page's readystate already is "complete"
            if (document.readyState == "complete") { LoadModuleOnLoadComplete(); }
            else { $(window).load(function () { LoadModuleOnLoadComplete(); }); }
        }
    },

    LoadModules: function (module) {
        //print("AVE: Loading: " + module.Name + " (RunAt: " + (module.RunAt || "ready" ) + ")");

        try { module.Load(); }
        catch (e) { print("AVE: Error loading " + module.ID); }
    },

    UpdateModules: function () {
        $.each(AVE.Modules, function () {
            //var ntime = 0; var time = new Date().getTime();
            
            if (typeof this.Update === "function") {
                this.Update();

                //ntime = new Date().getTime();
                //print("updated > " + this.Name + " (" + (ntime - time) + "ms)");
                //time = ntime;
            }
        });
    },
};
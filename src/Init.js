var AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        var _this = this;    

        AVE.Utils.EarlySet();

        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) == -1) {

            $(document).ready(function () {

                AVE.Utils.LateSet();

                print("AVE: Current page > " + AVE.Utils.currentPageType);
                //print("AVE: Current style > " + AVE.Utils.CSSstyle);
                
                //if ($("div.content.error-page").length > 0) { print("AVE: error page "); return; }//DDOS protection page

                //print("AVE: Loading " + Object.keys(AVE.Modules).length + " modules.")
                $.each(AVE.Modules, function () {
                    var mod = this;
                    if (!mod.RunAt || mod.RunAt == "ready") {
                        _this.LoadModules(mod);
                    } else {
                        $(window).load(function () {
                            _this.LoadModules(mod);
                        });
                    }
                });
            });
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
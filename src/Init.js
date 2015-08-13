var AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        this.LoadModules();
    },

    LoadModules: function () {
        AVE.Utils.Set();
        print("AVE: Current page > " + AVE.Utils.currentPageType);
        
        //DDOS protection page
        if ($("div.content.error-page").length > 0) { return;}

        if ($.inArray(AVE.Utils.currentPageType, ["none", "api"]) == -1) {
            $(document).ready(function () {
                $.each(AVE.Modules, function () {
                    //print("Loading: "+this.Name + " - " + Object.keys(AVE.Modules).length+ " modules.");
                    this.Load();
                });
            });
        }
    },

    UpdateModules: function () { //Get this in the reload module?
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
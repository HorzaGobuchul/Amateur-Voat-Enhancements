AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        this.LoadModules();
    },

    LoadModules: function () {
        AVE.Utils.Set();

        //print(AVE.Storage.Persistence());
        if (AVE.Utils.currentPageType != null) {
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
            if (typeof this.Update === "function") {
                this.Update();
                //print("updating: " + this.Name);
            }
        });
    },
};
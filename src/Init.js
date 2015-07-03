AVE = {};
AVE.Modules = {};

AVE.Init = {
    Start: function () {
        this.LoadModules();
    },

    LoadModules: function () {
        /*
        Javascrip page states
        http://www.codeproject.com/Tips/632672/Javascripts-document-ready-Vs-window-load
        $(document).ready(function() {});https://stackoverflow.com/questions/2683072/jquery-events-load-ready-unload
        $(window).ready(function () {}); https://api.jquery.com/category/events/document-loading/
        $(window).load(function() {}); https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/lib/core/init.js 19:26
        $(window).unload(function() {}); wiki.greasespot.net/DOMContentLoaded
        */

        AVE.Utils.Set();

        //Find a way to start some modules when document.ready and some earlier
        //$.each(AVE.Modules, function () {
        //    if (this.Options)
        //    this.Load();
        //});

        $(window).ready(function () {
            $.each(AVE.Modules, function () {
                this.Load();
            });
        });
    },

    UpdateModules: function () { //Get this in the reload module?
        $.each(AVE.Modules, function () {
            if (typeof this.Update === "function") {
                this.Update();
                console.log("updating: " + this.Name);
            }
        });
    },
};
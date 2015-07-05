AVE.Storage = {
    Prefix: "AVE_",

    Test: function () {
        try { return localStorage.setItem(StoragePrefix+'localStorageTest', 'test') == undefined;
        } catch (e) { return false;}
    },

    //localStorage: window.localStorage,

    Persistence: function(){
        var val = { GM: "", LS: "" };
        //val.GM = GM_setValue("GM_Persistence", "true")
        //val.LS = this.SetValue("LS_Persistence", "true")

        val.GM = GM_getValue("GM_Persistence", "null")
        val.LS = this.GetValue("LS_Persistence", "null")
        return val;
    },

    GetValue: function (key, def) {
        //var val = localStorage.getItem(key);
        var val = GM_getValue(key);
        if (val == undefined) {
            if (def == undefined) {
                return null;
            } else{ return def}
        } return val;
    },

    SetValue: function (key, val) {
        var val = GM_setValue(key, val);
        //localStorage.setItem(key, val);
    },

    DeleteValue: function (key) {
        var val = GM_deleteValue(key);
        //localStorage.removeItem(key);
    },

    ExportToJSON: function () {
        //Get options from all modules
        return 'Not Implemented Yet';
    },

    ImportToJSON: function () {
        //Set options for all modules
        return 'Not Implemented Yet';
    },
};
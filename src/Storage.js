AVE.Storage = {
    Prefix: "AVE_",

    Test: function () {
        try { return localStorage.setItem(StoragePrefix+'localStorageTest', 'test') == undefined;
        } catch (e) { return false;}
    },

    GetValue: function (key, def) {
        var val = localStorage.getItem(key);
        if (val == undefined) {
            if (def == undefined) {
                return null;
            } else{ return def}
        } return val;
    },

    SetValue: function (key, val) {
        localStorage.setItem(key, val);
    },

    DeleteValue: function (key) {
        localStorage.removeItem(key);
    },

    ExportToXml: function () {
        return 'Not Implemented Yet';
    },

    ExportToJSON: function () {
        //Get options from all modules
        return 'Not Implemented Yet';
    },

    ImportToXml: function () {
        return 'Not Implemented Yet';
    },

    ImportToJSON: function () {
        //Set options for all modules
        return 'Not Implemented Yet';
    },

};
AVE.Storage = {
    Prefix: "AVE_",

    Test: function () {
        try {
            return localStorage.setItem(StoragePrefix + 'localStorageTest', 'test') == undefined;
        } catch (e) { return false; }
    },

    Data: null,

    Persistence: function () {
        //print("Storage: " + this.Storage);
        var val = { S: null };
        //val.LS = this.SetValue("LS_Persistence", "true")

        val.S = this.GetValue("LS_Persistence", "null")
        return val;
    },

    GetValue: function (key, def) {
        if (!this.Data) { return null; }
        //AVE.Utils.SendMessage({ request: "Storage", type: "GetValue", key: key});

        var val = this.Data[key];
        if (val == undefined) {
            if (def == undefined) {
                return null;
            } else { return def }
        } return val;
    },

    SetValue: function (key, val) {
        if (!this.Data) { return null; }
        AVE.Utils.SendMessage({ request: "Storage", type: "SetValue", key: key, value: val });

        this.Data[key] = val;
    },

    DeleteValue: function (key) {
        if (!this.Data) { return null; }
        AVE.Utils.SendMessage({ request: "Storage", type: "DeleteValue", key: key });

        delete this.Data[key];
    },

    ExportToJSON: function () {
        //'data:application/json;charset=utf-8, {a: "patate"}'
        //https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
        //data:application/json;charset=utf-8,'+ JSON
        //Get options from all modules
        return 'Not Implemented Yet';
    },

    ImportFromJSON: function () {
        //Set options for all modules
        return 'Not Implemented Yet';
    },
};
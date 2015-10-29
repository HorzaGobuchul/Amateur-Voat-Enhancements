AVE.Utils.SendMessage = function (Obj) {
    switch (Obj.request) {
        case "Storage":
            switch (Obj.type) {
                case "SetValue":
                    GM_setValue(Obj.key, Obj.value);
                    break;
                case "DeleteValue":
                    GM_deleteValue(Obj.key);
                    break;
                case "Update":
                    AVE.Storage.Data = {};
                    $.each(GM_listValues(), function () {
                        AVE.Storage.Data[this] = GM_getValue(this.toString());
                    });
                    break;
            }
            break;
        case 'OpenInTab':
            GM_openInTab(Obj.url);
            break;
    }
};
AVE.Utils.MetaData = { version: GM_info.script.version, name: GM_info.script.name };
AVE.Utils.SendMessage({ request: "Storage", type: "Update"});
AVE.Init.Start();
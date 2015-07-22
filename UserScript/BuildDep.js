AVE.Utils.SendMessage = function (Obj) {
    switch (Obj.type) {
        case "SetValue":
            GM_setValue(Obj.key, Obj.value);
            break;
        case "DeleteValue":
            GM_deleteValue(Obj.key);
            break;
    }
};
AVE.Utils.MetaData = { version: GM_info.script.version, name: GM_info.script.name };
AVE.Storage.Data = {};
$.each(GM_listValues(), function () {
    AVE.Storage.Data[this] = GM_getValue(this.toString());
});
AVE.Init.Start();
AVE.Utils.SendMessage = function (Obj, callback) {
    chrome.runtime.sendMessage(Obj, callback);
};

AVE.Utils.SendMessage({ request: "GetMetadata" }, function (data) {
    if (AVE.Utils.MetaData) { return; }
    AVE.Utils.MetaData = data.message;

    chrome.storage.local.get(null, function (items) {
        var on = !!AVE.Storage.Data;
        AVE.Storage.Data = items;
        if (!on) { AVE.Init.Start(); }
    });
});
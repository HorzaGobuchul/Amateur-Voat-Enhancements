AVE.Utils.SendMessage = function (Obj) {
    self.postMessage(Obj);
};

self.port.on("Start", function () {
    self.postMessage({ request: "GetMetadata" });
    self.postMessage({ request: "GetStorage" });
});

self.on('message', function (data) {
    switch (data.request) {
        case 'SetStorage':
            var on = !!AVE.Storage.Data;
            AVE.Storage.Data = data.message;
            if (!on) { AVE.Init.Start(); }
            break;
        case 'SetMetadata':
            if (AVE.Utils.MetaData) { return; }
            AVE.Utils.MetaData = data.message;
            break;
        default:
            console.log("Utils Default: " + data);
            break;
    }
    if (data.hasOwnProperty("callback")){
        data.callback();
    }
});
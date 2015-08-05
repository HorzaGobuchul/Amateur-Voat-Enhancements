let tabs = require("sdk/tabs");
let info = require("./package.json");
let pageMod = require("sdk/page-mod");
let ss = require("sdk/simple-storage"); 

//From RES (Reddit-Enhancement-Suite:
//  https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/master/XPI/lib/main.js#L48
let Storage = ss.storage;
Storage.GetValue = function (key, def) {
    var val = ss.storage[key];
    if (val == undefined) {
        if (def == undefined) {
            return null;
        } else { return def }
    } return val;
};
Storage.SetValue = function (key, value) {
    ss.storage[key] = value;
};
Storage.DeleteValue = function (key) {
    delete ss.storage[key];
};

pageMod.PageMod({
    include: ['*.voat.co'],
    exclude: ['*.voat.co/api'],
    contentScriptWhen: 'ready',//start
    contentScriptFile: [
    "./Ext/jquery.min.js",
    "./Ext/to-markdown.js",
    "./Ext/FileSaver.min.js",
    "./Core/Init.js",
    "./Core/Storage.js",
    "./Core/Utils.js",
    "./Modules/PreferenceManager.js",
    "./Modules/VersionNotifier.js",
    "./Modules/HeaderFixedPos.js",
    "./Modules/UpdateAfterLoadingMore.js",
    "./Modules/UserInfoFixedPos.js",
    "./Modules/UserTag.js",
    "./Modules/ToggleMedia.js",
    "./Modules/AppendQuote.js",
    "./Modules/DisableShareALink.js",
    "./Modules/FixExpandImage.js",
    "./Modules/FixContainerWidth.js",
    "./Modules/IgnoreUsers.js",
    "./Modules/NeverEndingVoat.js",
    "./Modules/ReplyWithQuote.js",
    "./Modules/SelectPost.js",
    "./Modules/Shortcuts.js",
    "./Modules/ShortKeys.js",
    "./Modules/ToggleChildComment.js",
    "./Modules/SubmissionFilter.js",
    "./Modules/CommentFilter.js",
    "./Modules/ShowSubmissionVoatBalance.js",
    "./BuildDep.js",
    ],
    onAttach: function (worker) {
        worker.on('message', function (data) {
            switch (data.request) {
                case 'GetStorage':
                    worker.postMessage({ request: "SetStorage", message: Storage });
                    break;
                case 'Storage':
                    switch (data.type) {
                        case 'SetValue':
                            Storage.SetValue(data.key, data.value);
                            worker.postMessage({ request: "SetStorage", message: Storage });
                            break;
                        case 'GetValue':
                            Storage.GetValue(data.key);
                            break;
                        case 'DeleteValue':
                            Storage.DeleteValue(data.key);
                            break;
                    }
                    break;
                case 'GetMetadata':
                    worker.postMessage({ request: "SetMetadata", message: { version: info.version, name: info.title } });
                    break;
                case 'OpenInTab':
                    tabs.open(data.url);
                    break;
                default:
                    console.log("On Message Default: "+data);
                    break;
            }
        }),
        worker.port.emit("Start");
    }
});
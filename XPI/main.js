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
    contentScriptWhen: 'start',
    contentScriptFile: [
        "./Ext/jquery-2.1.4.min.js",
        "./Ext/to-markdown.js",
        "./Ext/FileSaver.min.js",
        "./Core/Init.js",
        "./Core/Storage.js",
        "./Core/Utils.js",
        "./Modules/PreferenceManager.js",
        "./Modules/VersionNotifier.js",
        "./Modules/UpdateAfterLoadingMore.js",
        "./Modules/UserTag.js",
        "./Modules/ToggleMedia.js",
        "./Modules/HideSubmissions.js",
        "./Modules/SelectPost.js",
        "./Modules/ShortKeys.js",
        "./Modules/InjectCustomStyle.js",
        "./Modules/ToggleCustomStyle.js",
        "./Modules/HeaderFixedPos.js",
        "./Modules/CommentFilter.js",
        "./Modules/ToggleChildComment.js",
        "./Modules/ShowSubmissionVoatBalance.js",
        "./Modules/ThemeSwitcher.js",
        "./Modules/NeverEndingVoat.js",
        "./Modules/ReplyWithQuote.js",
        "./Modules/FixContainerWidth.js",
        "./Modules/HttpWarning.js",
        "./Modules/SubmissionFilter.js",
        "./Modules/CSSEditor.js",
        "./Modules/IgnoreUsers.js",
        "./Modules/FixExpandImage.js",
        "./Modules/ContributionDeltas.js",
        "./Modules/RememberCommentCount.js",
        "./Modules/AppendQuote.js",
        "./Modules/DisableShareALink.js",
        "./Modules/Shortcuts.js",
        "./Modules/ArchiveSubmission.js",
        "./Modules/DomainFilter.js",
        "./Modules/SingleClickOpener.js",
        "./Modules/HideUsername.js",
        "./Modules/DomainTags.js",
        "./Modules/UserInfoFixedPos.js",
        "./Modules/AccountSwitcher.js",
        "./Modules/Dashboard.js",
        "./BuildDep.js"
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
                        case "Update":
                            worker.postMessage({ request: "SetStorage", message: Storage });
                            break;
                    }
                    break;
                case 'GetMetadata':
                    worker.postMessage({ request: "SetMetadata", message: { version: info.version, name: info.title } });
                    break;
                case 'OpenInTab':
                    tabs.open({url: data.url, inBackground: true});
                    break;
                default:
                    console.log("On Message Default: "+data);
                    break;
            }
        });
        worker.port.emit("Start");
    }
});
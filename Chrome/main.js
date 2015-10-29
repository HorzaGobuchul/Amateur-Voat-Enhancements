var info = chrome.runtime.getManifest();
var Storage = {};

Storage.SetValue = function (key, value) {
    var newObj = {};
    newObj[key] = value;
    console.log(newObj);
    chrome.storage.local.set(newObj, function (result) {
        console.log("result:");

        if (result) { // defined
            console.log('Saved');
        } else { // uninitialised
            console.log("failed");
        }
    });
};
Storage.DeleteValue = function (key) {
    chrome.storage.local.remove(key);
};

chrome.runtime.onMessage.addListener(
	function (data, sender, sendResponse) {
	    switch (data.request) {
	        case 'Storage':
	            switch (data.type) { //Get this in the Browser-Specific script?
	                case 'SetValue':
	                    Storage.SetValue(data.key, data.value);
	                    Storage.GetAll(sendResponse);
	                    break;
	                case 'DeleteValue':
	                    Storage.DeleteValue(data.key);
	                    break;
	            }
	            break;
	        case 'GetMetadata':
	            sendResponse({ request: "SetMetadata", message: { version: info.version, name: info.name } });
	            break;
	        case 'OpenInTab':
	            chrome.tabs.create({ url: data.url, selected: false, openerTabId: sender.tab.id });
	            break;
	        default:
	            console.log("On Message Default: ");
	            console.log(data);
	            console.log(sender);
	            break;
	    }
	}
);
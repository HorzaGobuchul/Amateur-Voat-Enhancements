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

chrome.runtime.onMessage.addListener(
	function (data, sender, sendResponse) {
	    switch (data.request) {
	        case 'SetStorage':
	            chrome.storage.local.get(null, function (items) {
			        var on = !!AVE.Storage.Data;
			        AVE.Storage.Data = items;
			        if (!on) { AVE.Init.Start(); }
			    });
	        	break;
	        default:
	            console.log("On Message Default: ");
	            console.log(data);
	            console.log(sender);
	            break;
	    }
	}
);
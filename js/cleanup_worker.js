chrome.runtime.onMessage.addListener(

	async (request, sender, sendResponse) => {
console.log('service-worker!!!!!!!!!');

		try{
			await chrome.tabs.sendMessage( request.tab_id, { stat: 'ARE_YOU_INJECTED'}).then((resp)=> console.log(resp) );
		}
		catch{

			await chrome.scripting.executeScript({
				target: { tabId: request.tab_id },
				files: [ 'js/background_color.js' ],
				injectImmediately: true,
			});
		}
	}
);


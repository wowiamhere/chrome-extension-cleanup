chrome.runtime.onMessage.addListener(

	async (request, sender, sendResponse) => {

			try{
				await chrome.tabs.sendMessage( request.tab_id, { stat: 'ARE_YOU_THERE'});
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


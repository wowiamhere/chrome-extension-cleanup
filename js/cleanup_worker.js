chrome.runtime.onMessage.addListener(

	async (request, sender, sendResponse) => {

		if(request.type == 'initial'){

			try{
				await chrome.tabs.sendMessage( request.tab_id, { stat: 'ARE_YOU_INJECTED'});
			}
			catch{

				await chrome.scripting.executeScript({
					target: { tabId: request.tab_id },
					files: [ 'js/background_color.js' ],
					injectImmediately: true,
				});


			}

		}


	}
);


const sites = {
	'fox': 'https://www.foxnews.com',
	'waPo': 'https://www.washingtonpost.com',
	'nyt': 'https://www.nytimes.com',
};

chrome.action.onClicked.addListener(async (tab) => {
	if ( tab.url.startsWith( sites.fox ) ) {
		await chrome.scripting.insertCSS({
			files:['css/fox.css'],
			target: { tabId: tab.id },
		});
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: ['js/fox.js'],
		});
	}
	else if ( tab.url.startsWith( sites.waPo ) ){
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/waPo.js' ],
		});
	}
	else if ( tab.url.startsWith( sites.nyt ) ){
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/nyt.js' ],
		});
	}
	else{
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/background_color.js' ],
			world: 'MAIN',
		});
	}
});


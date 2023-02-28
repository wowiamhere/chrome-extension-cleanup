const sites = {
	'fox': 'https://www.foxnews.com',
	'cnn': 'https://www.cnn.com/',
	'waPo': 'https://www.washingtonpost.com/',
	'nyt': 'https://www.nytimes.com/',
	'ktla': 'https://ktla.com/'
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
	else if (tab.url == sites.cnn){
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/cnnMainPage.js' ],
		});
	}
	else if ( tab.url.startsWith( sites.cnn ) ){
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/cnnRest.js' ],
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
	else if ( tab.url.startsWith( sites.ktla ) ){
		await chrome.scripting.executeScript({
			target: { tabId: tab.id },
			files: [ 'js/ktla.js' ],
		});
	}
});

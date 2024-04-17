chrome.runtime.onMessage.addListener(

	async (message, sender, sendResponse) => {

			try{
		
				await chrome.tabs.sendMessage( message.tab_id, { stat: 'ARE_YOU_THERE'});
			}
			catch{

				await chrome.scripting.executeScript({
					target: { tabId: message.tab_id },
					files: [ 'js/background_color.js' ],
					injectImmediately: true,
				});

			}
	}
);


// BELOW: FOR RIGHT CLICK MENU

const reg = /[\W_]/g;

chrome.contextMenus.onClicked.addListener( handleSelection );

function handleSelection(info){

console.log("!!!!!!!!!!!!!!!!-------->", info);	
	switch (info.menuItemId){
	case 'youtube':
		search_site('https://youtube.com/results?search_query=', info.selectionText);
		break;
	case 'amazon':
		search_site('https://www.amazon.com/s?k=', info.selectionText);
		break;
	case 'googleSearch':
		search_site('https://www.google.com/search?q=', info.selectionText);
		break;
	case 'fileName':
		to_filename(info.selectionText);
		break;
	case 'camelcase':
		to_camelcase(info.selectionText);
		break;
	case 'underscore':
		to_underscore(info.selectionText);
		break;
	case 'src':
		get_file_src(info);
		break;
	}
}

chrome.contextMenus.create({
	title: "youtube",
	contexts: ["all"],
	id: "youtube"
});
chrome.contextMenus.create({
	title: "amazon",
	contexts: ["all"],
	id: "amazon"
});
chrome.contextMenus.create({
	title: "googleSearch",
	contexts: ["all"],
	id: "googleSearch"
});
chrome.contextMenus.create({
	title: "fileName",
	contexts: ["all"],
	id: "fileName"
});
chrome.contextMenus.create({
	title: "camelcase",
	contexts: ["all"],
	id: "camelcase"
});
chrome.contextMenus.create({
	title: "underscore",
	contexts: ["all"],
	id: "underscore"
});
chrome.contextMenus.create({
	title: "src",
	contexts: ["all"],
	id: "src"
});

async function search_site(url, to_search){
	let [tab, tab_idx] = await getActiveTab();
	chrome.tabs.create({
 		active: true,
 		openerTabId: tab[tab_idx].id,
 		url: url + to_search
 	});	
}

async function to_filename(txt_to_reformat){
	let file_name = txt_prep(txt_to_reformat).join('-');
	let [tab, tab_idx] = await getActiveTab();

	showTxt(file_name, tab, tab_idx);

}

async function to_camelcase(txt_to_reformat){
	let camelcase_txt = txt_prep(txt_to_reformat).map((txt) => txt.toLowerCase() ).map((txt) => txt[0].toUpperCase()+txt.substring(1,) ).join('');
	let [tab, tab_idx] = await getActiveTab();

	showTxt(camelcase_txt, tab, tab_idx);

}

async function to_underscore(txt_to_reformat){
	let file_name = txt_prep(txt_to_reformat).join('_');
	let [tab, tab_idx] = await getActiveTab();

	showTxt(file_name, tab, tab_idx);
}

async function get_file_src(info){
	let [tab, tab_idx] = await getActiveTab();
	
	if(info.srcUrl)
		showTxt(info.srcUrl, tab, tab_idx);
	else
		showTxt("NO srcURL", tab, tab_idx);

}

// *******HELPER FUNCTIONS
function txt_prep(txt){
	return txt.split( reg ).filter( (el) => el.length > 1 )
}

async function getActiveTab(){

	let tab = await chrome.tabs.query( { lastFocusedWindow:true } );
	let tab_idx = 0;

	for(let i=0; i < tab.length;++i){
		if(tab[i].active == true){
			tab_idx = i;
			break;
		}
	}

	return [tab, tab_idx];
}

async function showTxt(txt_to_show, tab, tab_idx){
	chrome.scripting.executeScript({
		target: {tabId: tab[tab_idx].id},
		args: [ txt_to_show ],
		function: alertTxt
	});
	function alertTxt(f_name){
		alert(f_name);
	}	
}
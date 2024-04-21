chrome.runtime.onMessage.addListener(

	async (message, sender, sendResponse) => {
			try{
		
				await chrome.tabs.sendMessage( message.tab_id, 
					{ stat: 'ARE_YOU_THERE'});
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
	case 'deleteStop':
		delete_element();
		break;
	}
}

chrome.contextMenus.create({
	title: "deleteStop",
	contexts: ["all"],
	id: "deleteStop"
});
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


async function delete_element(){
	let [tab, tab_idx] = await getActiveTab();
	
	let stat = await chrome.action.getBadgeText( { tabId:tab[tab_idx].id } );
	if(stat == "DEL"){
		let [tab, tab_idx] = await getActiveTab();		
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'OFF' } );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "" } );
		return;
	}else
		await chrome.tabs.sendMessage( tab[tab_idx].id, {msg:"THERE?"}, are_you_there);
}

async function are_you_there( resp ){

	if(resp == undefined && chrome.runtime.lastError ){
console.log("!!!!!!!!!!!!!!!!!!!INJECT!!!!!!!!!____>");
		let [tab, tab_idx] = await getActiveTab();
		chrome.scripting.executeScript({
			files: ['js/test.js'],
			injectImmediately: true,
			target: {tabId: tab[tab_idx].id}
		});
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text:"DEL" } );
	}
	else{
		let [tab, tab_idx] = await getActiveTab();
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text:"DEL" } );
	}
}


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



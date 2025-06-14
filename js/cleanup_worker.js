const reg = /[\W_]/g;

//--------------------------------------------------
// ----- chrome.runtime.OnMessage AND ITS CALLBACK 
//---------------------------------------------------
let handleHostResponse = async (message, sender, sendResponse) => {
	console.log('cleanup_worker.js, chrome.runtime.onMessage --> ', message);

	//------------------------------------------------------
	//---- port creating and port.OnMessage, port.OnDisconnect LISTENERS
	//--------------------------------------------------------

	let msg = message;

	let port = chrome.runtime.connectNative('com.get_script');
	port.postMessage( msg );

	port.onMessage.addListener( async function(resp){
		console.log('cleanup_worker.js, port.onMessage: --> ', resp );
		
		let  conversion_response = { 'msg': Object.keys(resp)[0], 'stat': resp[Object.keys(resp)[0]] };
		let [tab ,tab_idx ,w_id] = await getActiveTab();
		let send_message = async () => {
			await chrome.tabs.sendMessage( tab[tab_idx].id, conversion_response );
		}

		let check_if_script_there = async (resp) => {
			check_send(resp, tab, tab_idx, send_message);
		}

	    try{
	    	let check_msg = { msg: 'INJECTED?'};
	    	console.log('cleanup_worker.js, chrome.tabs.sendMessage --> ', check_msg);
	    	await chrome.tabs.sendMessage( tab[tab_idx].id, check_msg, check_if_script_there );
	    }
	    catch{
	    	console.log('NO ACTIVE TABS TO DISPLAY MESSAGE --> \n', conversion_response.stat );
	    }		
	});
	port.onDisconnect.addListener( (info) => {
		console.log('DISCONECTED --> ', info) 
	});
}
chrome.runtime.onMessage.addListener( handleHostResponse );


//-----------------------------------------------------------
//---- contextMenu.onClicked.addListener AND ITS CALLBACK
//-----------------------------------------------------------
chrome.contextMenus.onClicked.addListener( handleSelection );
async function handleSelection(info){
	switch (info.menuItemId){
	case 'youtube':
		search_site('https://youtube.com/results?search_query=', info.selectionText);
		break;
	case 'amazon':
		search_site('https://www.amazon.com/s?k=', info.selectionText);
		break;
	case 'imdbPro':
		search_site('https://pro.imdb.com/api/instantSearch?retina=false&q=', info.selectionText);
		break;
	case 'define':
		search_site('https://www.google.com/search?q=define ', info.selectionText);
		break;
	case 'theFreeDic':
		search_site('https://www.thefreedictionary.com/', info.selectionText);
		break;
	case 'thesaurus':
		search_site('https://www.thesaurus.com/browse/', info.selectionText);
		break;
	case 'engToSpa':
		search_site('https://translate.google.com/?sl=en&tl=es&op=translate&text=', info.selectionText);
		break;
	case 'spaToEng':
		search_site('https://translate.google.com/?sl=es&tl=en&op=translate&text=', info.selectionText);
		break;
	case 'dicReal':
		search_site('https://dle.rae.es/', info.selectionText);
		break;
	case 'sinonimEsp':
		search_site('https://www.wordreference.com/sinonimos/', info.selectionText);
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
	case 'vid':
	case 'mp3':
	case 'pdf':
	case 'docx':
	case 'odt':
	case 'plain':
	case 'markdown_strict':
	case 'set_tags':
		get_file(info);
		break;
	case 'gmaps':
		get_map(info.selectionText)
		break;
	case 'gearth':
		get_map(info.selectionText, src='gearth')
		break;
	case 'gdir':
		get_map(info.selectionText, src='gdir')
		break;		
	case 'Delete on/off':
		if ( get_stat() != 'COL' )
			delete_element();
		break;
	case 'Start':
		if( get_stat() != 'DEL' )
			start_coloring('START_COLORING');
		break;
	case 'Stop':
		coloring_func('COLORING_OFF');
		break;
	case 'Color':
		get_color('GET_COLOR');
		break;
	case 'Back':
		coloring_func('COLORING_BACK');
		break;
	case 'Save':
		coloring_func('COLORING_SAVE');
		break;
	case 'REMOVE_CSS':
		coloring_func('COLORING_REMOVE_CSS');
		break;
	case 'RESTORE_SAVED_CSS':
		coloring_func('COLORING_RESTORE_SAVED_CSS');
		break;
	case 'CLEAR_STORAGE':
		coloring_func('COLORING_CLEAR_STORAGE');
		break;
	case 'DELETE_PAGE_COLORING':
		coloring_func('COLORING_REMOVE_WEBSITE');
		break;
	}
}

//------------------------------------------------------------------------
//----------------GETS THE STATUS OF THE BADGE (COLORING OR DELETING MODE)
//------------------------------------------------------------------------
async function get_stat(){
	let [tab, tab_idx] = await getActiveTab();
	return await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );
}


//                           ARRAY FOR RIGHT-CLICK MENU
let items = [ 
	'youtube', 
	'amazon', 
	'imdbPro',
	'gmaps',
	'gdir',
	'gearth',
	'textAssist',
	'get_file',
	'Color on/off',
	'Delete on/off',
	'src',
	'href'
	];

//    						ARRAY FOR TEXT ASSISTANCE
let text_assist = [
	'define',
	'theFreeDic',
	'thesaurus',
	'engToSpa',
	'spaToEng',
	'dicReal',
	'sinonimEsp',
	'fileName', 
	'camelcase', 
	'underscore' 	
	];


// 						ARRAY FOR COLORING RIGHT CLICK MENU
let items_coloring = [ 
	'Start',
	'Stop',
	'Color', 
	'Back', 
	'Save', 
	'REMOVE_CSS',
	'RESTORE_SAVED_CSS', 
	'CLEAR_STORAGE', 
	'DELETE_PAGE_COLORING'
	];

let items_file = [
	'vid',
	'mp3',
	'set_tags',
	'pdf',
	'docx',
	'odt',
	'plain',
	'markdown_strict'
	];

//----------------------------------------------
//------CREATING RIGHT CLICK MENUS--------------
//----------------------------------------------

for(let i = 0; i < items.length; ++i){
	console.log('--ITEMS--> ', items[i]);
	chrome.contextMenus.create({
		title: items[i],
		contexts: ['all'],
		id: items[i]
	});
}

for(let i = 0; i < text_assist.length; ++i){
	console.log('--text_assist--> ', text_assist[i]);
	chrome.contextMenus.create({
		title: text_assist[i],
		contexts: ['all'],
		id: text_assist[i],
		parentId: 'textAssist'
	});
}


for(let i = 0; i < items_coloring.length; ++i){
	console.log('--ITEMS_COLORING--> ', items_coloring[i]);
	chrome.contextMenus.create({
		title: items_coloring[i],
		contexts: ['all'],
		id: items_coloring[i],
		parentId: 'Color on/off'
	});
}

for(let i=0; i < items_file.length; ++i){
	console.log('-- items_file--> ', items_file[i])
	chrome.contextMenus.create({
		title: items_file[i],
		contexts: ['all'],
		id: items_file[i],
		parentId: 'get_file'
	});
}


//------------------------------------------------------------
//------------------------------------------------------------
//-- USER SELECTED TEXT TO OPEN IN MAPS AND GOOGLE EARTH -----
//------------------------------------------------------------
//------------------------------------------------------------
async function get_map(info, src='gmaps'){
	let [tab, tab_idx] = await getActiveTab();
	let url = '';
	let reg = /[ \n]/g; 
	info = info.replaceAll(reg, '+');

	if(src == 'gearth')
		url = 'https://earth.google.com/web/search/';
	else if(src == 'gdir')
		url = 'https://www.google.com/maps/dir/';
	else
		url = 'https://www.google.com/maps/place/';

	chrome.tabs.create({
			active: true,
			openerTabId: tab[tab_idx].id,
			url: url + info
		});	
}

//------------------------------------------------------------
//------------------------------------------------------------
//-- FOR GETTING A PDF, DOCX, MARKDOWN, PLAINTEXT,------------
//-- ODT FILE FROM HTML SELECTION, SET TAGS OF AN MP3 FILE----
//------------------------------------------------------------
//------------------------------------------------------------

async function get_file(info){
	to_do_var = info.menuItemId;
	let [tab, tab_idx, w_id] = await getActiveTab();

	if( to_do_var == 'vid' || to_do_var == 'mp3' )
		handleHostResponse( {to_do: to_do_var, url: info.selectionText })
	else{

		let send_messages = () => {
			chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'GET_FILE', to_do: to_do_var } );
		}

		let check_if_injected = async ( resp ) => {
			check_send(resp, tab, tab_idx, send_messages);
		}

		chrome.tabs.sendMessage( 
			tab[tab_idx].id, 
			{ msg: 'INJECTED?' }, 
			check_if_injected );
	}
}

//----------------------------------------------
//-----------COLORING FUNCTIONALITY-------------
//----------------------------------------------
//----------------------------------------------


//                     FUNCTIONS FOR COLORING FUNCTIONALITY
async function start_coloring(){
	let [tab, tab_idx, w_id] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

//			CALLBACK TO MESSAGE FOR INSERTING THE MAIN CONTENT SCRIPT INTO TAB IN start_coloring()
	set_badge_send_message = () => {
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "COL"} );
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'yellow'} );
		chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_COLORING' } );
	}

	let coloring_are_you_there = async ( resp ) => {
		check_send(resp, tab, tab_idx, set_badge_send_message, script='js/extension_functions.js', coloring=true);
	}

	if( stat !='COL')
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg:'INJECTED?' }, coloring_are_you_there);
}


//		USED WHEN RIGHT CLICKE MENU ITEM CLICKED WITH to_do FUNCTIONALITY
//		SENDS MESSAGE TO CONTENT SCRIPT AND SETS BADGES FOR FUNCTIONALITY
async function coloring_func(to_do){

	let [ tab, tab_idx ] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	let send_message = async () => {
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do } );
	}

	if( stat == 'COL'){
		
		if( to_do == 'COLORING_OFF' || to_do == 'COLORING_SAVE' || to_do == 'COLORING_REMOVE_WEBSITE'){
			send_message();
			chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: ''} );
			chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "" });
		}
		else{
			send_message();
		}
	}else{
		coloring_func_callback = async (resp) => { check_send(resp, tab, tab_idx, send_message); };

		if( to_do == 'COLORING_REMOVE_CSS' || to_do == 'COLORING_RESTORE_SAVED_CSS' ){
			await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do }, coloring_func_callback );

		}
	}

}

async function get_color(to_do){
	let [ tab, tab_idx, w_id ] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	let send_message = async () => {
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do });
	}
	
	let is_get_color_there = async (resp) => {
		check_send(resp, tab, tab_idx, send_message, 'js/get_color_script.js');
	}

	if( stat == 'COL'){
		await chrome.tabs.sendMessage( 
			tab[tab_idx].id, 
			{ msg: 'GET_COLOR_INJECTED?' }, 
			is_get_color_there );


	}
}

//----------------------------------------------
//----------------------------------------------
//--------------DELETING FUNCTINALITY-----------
//----------------------------------------------
//----------------------------------------------


//		WHEN RIGHT CLICKE MENU ITEM CLICKED CHECKS BADGE AND SENDS MESSAGE TO 
//			CONTENT SCRIPT TO EXECUTE FUNCTIONALITY
async function delete_element(){
	let [tab, tab_idx] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId:tab[tab_idx].id } );

	let set_badge_send_message = () => {
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'red'} );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text:"DEL" } );
		chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_DELETING' });
	};

	let delete_script = async ( resp ) => {
		check_send( resp, tab, tab_idx, set_badge_send_message );
	}	

	if(stat == "DEL"){
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'DELETE_OFF' } );		
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: ''} );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: '' } );
		return;
	}else
		await chrome.tabs.sendMessage( tab[tab_idx].id, {msg:"INJECTED?"}, delete_script);
}

//----------------------------------------------
//-------------THE REST-------------------------
//----------------------------------------------
//----------------------------------------------


//		FUNCTIONS FOR SEARCHING WEBSITE, MANIPULATING SELECTED TEXT AND RETURNING src PROPERTY OF ELEMENT

async function search_site(url, to_search, site='google'){
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
	console.log(info);
	let [tab, tab_idx] = await getActiveTab();
	
	if(info.srcUrl)
		showTxt(info.srcUrl, tab, tab_idx);
	else if(info.linkUrl)
		showTxt(info.linkUrl, tab, tab_idx);
	else
		showTxt("NO srcURL/linkUrl", tab, tab_idx);

}

// ************************************************
// ************************************************
// ************************************************
// *******HELPER FUNCTIONS
// ************************************************
// ************************************************
// ************************************************

function txt_prep(txt){
	return txt.split( reg ).filter( (el) => el.length > 1 )
}

async function getActiveTab(){

	let tab = await chrome.tabs.query( { lastFocusedWindow:true } );
	let tab_idx = 0;

	for(let i=0; i < tab.length;++i){
		if(tab[i].active == true){
			tab_idx = i;
			w_id = tab[i].windowId;
			break;
		}
	}

	return [tab, tab_idx, w_id];
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

async function check_send(resp, tab, tab_idx, send_fn, script='js/extension_functions.js', coloring=false){
	if(resp == undefined && chrome.runtime.lastError ){
		console.log("----- extension_functions.js -- NOT injected ------");

		await chrome.scripting.executeScript({
			files: [ script ],
			injectImmediately: true,
			target: {tabId: tab[tab_idx].id}
		});
		send_fn();
	}
	else{
		if(coloring){
			if(chrome.action.getBadgeText( { tabId: tab[tab_idx].id } ) != 'COL' ){
				send_fn();
			}
		}
		else{
			console.log('!!!!!!!!!!!!!!!!!!!trying again');
			send_fn();
		}
	}
}
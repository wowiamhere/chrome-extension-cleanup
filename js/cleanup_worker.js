const reg = /[\W_]/g;

chrome.contextMenus.onClicked.addListener( handleSelection );

chrome.runtime.onMessage.addListener( handleResponse );

async function handleResponse(message, sender, sendResponse){

	if(message.from_py_script){
		console.log('runtimeOnmessage-->', message );	
	}
	else
		send_file_msg(message.to_do)
}

async function send_file_msg(to_do){
	console.log("-------> ", to_do);
	let msg = {to_do:to_do};
	console.log(msg);
	await chrome.runtime.sendNativeMessage( 
		'com.get_file_bash', 
		msg , 
		(response) => {console.log('!---!---> ', response);} );
}

///        CALLBACK FUNCTION TO contextMenu.onClicked.addListener
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
	case 'get_vid':
		get_vid(info.selectionText);
		break;
	case 'get_pdf':
		get_file(info);
		break;
	case 'get_docx':
		get_file(info);
		break;
	case 'Delete on/off':
		if ( await get_stat() != 'COL' )
			delete_element();
		break;
	case 'Start':
		if( await get_stat() != 'DEL' )
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


//                           ARRAY FOR RIGHT-CLICK MENU
let items = [ 
	'Color on/off',
	'Delete on/off', 
	'youtube', 
	'amazon', 
	'imdbPro', 
	'fileName', 
	'camelCase', 
	'underscore', 
	'src',
	'get_vid',
	'get_file'
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
	'get_pdf',
	'get_docx'
	];

//------CREATING RIGHT CLICK MENUS--------------
//----------------------------------------------
//----------------------------------------------

for(let i = 0; i < items.length; ++i){
	chrome.contextMenus.create({
		title: items[i],
		contexts: ['all'],
		id: items[i]
	});
}

for(let i = 0; i < items_coloring.length; ++i){
	chrome.contextMenus.create({
		title: items_coloring[i],
		contexts: ['all'],
		id: items_coloring[i],
		parentId: 'Color on/off'
	});

}

for(let i=0; i < items_file.length; ++i){
	chrome.contextMenus.create({
		title: items_file[i],
		contexts: ['all'],
		id: items_file[i],
		parentId: 'get_file'
	});
}

//----------------------------------------------
//----------------------------------------------
//----------------------------------------------

async function get_file(info){

	to_do_var = info.menuItemId;
	let [tab, tab_idx] = await getActiveTab();
	await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'GET_FILE', to_do: to_do_var }, check_if_injected );
}

async function check_if_injected( resp ){
console.log('REST!!!!!!!!!!!!!!!!!!--> ', resp);
	if(resp == undefined && chrome.runtime.lastError ){
		let [tab, tab_idx] = await getActiveTab();
		
		await chrome.scripting.executeScript({
			files: ['js/extension_functions.js'],
			injectImmediately: true,
			target: {tabId: tab[tab_idx].id}
		});
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'GET_FILE', to_do: to_do_var }, check_if_injected );
	}
	else{
	}

}


//----------------------------------------------
//-----------COLORING FUNCTIONALITY-------------
//----------------------------------------------
//----------------------------------------------

async function get_color(to_do){
	let [ tab, tab_idx, w_id ] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	if( stat == 'COL'){
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'GET_COLOR_INJECTED?' }, is_get_color_there );

		async function is_get_color_there(resp){
			if( resp == undefined && chrome.runtime.lastError ){
				await chrome.scripting.executeScript({
					target: { tabId: tab[tab_idx].id },
					injectImmediately: true,
					files: ['js/get_color_script.js']
				});

				await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do });
			}else{
				await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do });
			}
		}

	}
}


//					GETS THE STATUS OF THE BADGE (IS APP IN COLORING OR DELETING MODE)
async function get_stat(){
	let [tab, tab_idx] = await getActiveTab();
	return await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );
}


//                     FUNCTIONS FOR COLORING FUNCTIONALITY
async function start_coloring(){
	let [tab, tab_idx] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	if( stat !=='COL')
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg:'INJECTED?' }, coloring_are_you_there);
}


//			CALLBACK TO MESSAGE FOR INSERTING THE MAIN CONTENT SCRIPT INTO TAB IN start_coloring()
async function coloring_are_you_there( resp ){

//				IF NO RESPONSE AND ERROM SET FROM CALL TO SCRIPT; SCRIPT NEEDS TO BE INSERTED
	if(resp == undefined && chrome.runtime.lastError ){
		let [tab, tab_idx] = await getActiveTab();
		await chrome.scripting.executeScript({
			files: ['js/extension_functions.js'],
			injectImmediately: true,
			target: { tabId: tab[tab_idx].id }
		});
//          UPON INSERTION, ACTIVATION OF APP BADGE AND FUNCTIONALITY FOLLOW
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'yellow'} );
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "COL"} );
		chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_COLORING' } );
	}
	else{
//			IF RESPONSE FROM SCRIPT RECEIVED THE SCRIPT ALREADY INSERTED
//			SETTING BADGE AND SENDING MESSAGE TO START FUNCTIONALITY		
		let [tab, tab_idx] = await getActiveTab();
		if(chrome.action.getBadgeText( { tabId: tab[tab_idx].id } ) != 'COL' ){
		   	chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "COL"} );
			chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'yellow'} );
			chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_COLORING' });
		}
	}

}

//		USED WHEN RIGHT CLICKE MENU ITEM CLICKED WITH to_do FUNCTIONALITY
//		SENDS MESSAGE TO CONTENT SCRIPT AND SETS BADGES FOR FUNCTIONALITY
async function coloring_func(to_do){
	let [ tab, tab_idx ] = await getActiveTab();
	
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	if( stat == 'COL'){
		
		if( to_do == 'COLORING_OFF' || to_do == 'COLORING_SAVE' || to_do == 'COLORING_REMOVE_WEBSITE'){
			await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do } );
			chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: ''} );
			chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: "" });
		}
		else{
			await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do } );
		}
	}else{
		if( to_do == 'COLORING_REMOVE_CSS' || to_do == 'COLORING_RESTORE_SAVED_CSS' ){
			await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do }, async (resp) => {
				if( resp == undefined && chrome.runtime.lastError ){
					await chrome.scripting.executeScript({
						files: ['js/extension_functions.js'],
						injectImmediately: true,
						target: { tabId: tab[tab_idx].id }
					});
					await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do } );
				}else{
					await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: to_do } );
				}

			} );

		}
	}
}

//----------------------------------------------
//--------------DELETING FUNCTINALITY-----------
//----------------------------------------------
//----------------------------------------------


//		WHEN RIGHT CLICKE MENU ITEM CLICKED CHECKS BADGE AND SENDS MESSAGE TO 
//			CONTENT SCRIPT TO EXECUTE FUNCTIONALITY
async function delete_element(){
	let [tab, tab_idx] = await getActiveTab();
	
	let stat = await chrome.action.getBadgeText( { tabId:tab[tab_idx].id } );
	if(stat == "DEL"){
		let [tab, tab_idx] = await getActiveTab();	
		await chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'DELETE_OFF' } );		
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: ''} );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text: '' } );
		return;
	}else
		await chrome.tabs.sendMessage( tab[tab_idx].id, {msg:"INJECTED?"}, delete_script);
}


//		CALLBACK TO MESSAGE SENT TO CONTENT SCRIPT FROM delete_element() FUNCTION ABOVE
//		IF NOT PRESENT, INSERTS SCRIPT AND SETS APP BADGE
//		SENDS MESSAGE BACK TO START FUNCTIONALITY
async function delete_script( resp ){

	if(resp == undefined && chrome.runtime.lastError ){
		let [tab, tab_idx] = await getActiveTab();
		
		await chrome.scripting.executeScript({
			files: ['js/extension_functions.js'],
			injectImmediately: true,
			target: {tabId: tab[tab_idx].id}
		});
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'red'} );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text:"DEL" } );
		chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_DELETING' });

	}
	else{
		let [tab, tab_idx] = await getActiveTab();
		chrome.action.setBadgeBackgroundColor( { tabId: tab[tab_idx].id, color: 'red'} );		
		chrome.action.setBadgeText( { tabId: tab[tab_idx].id, text:"DEL" } );
		chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_DELETING' });
	}
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

function get_vid(txt){
	
	let s = txt.length;
	s = s.toString().padStart(4,'0');
	msg = { [s]:txt };

	try{
		chrome.runtime.sendNativeMessage(
			'com.test_bash',
			msg,
			function (response){
				console.log( 'RECEIVED ' + response);
				console.log( 'chrome ERROR ---> ' + chrome.runtime.lastError.message);
			}
			);
	}
	catch (e){
		console.log("ERRORR--->", e);
	}

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



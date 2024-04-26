const reg = /[\W_]/g;

chrome.contextMenus.onClicked.addListener( handleSelection );


///        CALLBACK FUNCTION TO contextMenu.onClicked.addListener
async function handleSelection(info){
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
	case 'delete/Stop':
		if ( await get_stat() != 'COL' )
			delete_element();
		break;
	case 'START':
		if( await get_stat() != 'DEL' )
			start_coloring('START_COLORING');
		break;
	case 'STOP':
		coloring_func('COLORING_OFF');
		break;
	case 'COLOR':
		get_color('COLOR');
		break;
	case 'BACK':
		coloring_func('COLORING_BACK');
		break;
	case 'SAVE':
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
	case 'CLEAR_WEBSITE':
		coloring_func('COLORING_REMOVE_WEBSITE');
		break;
	}
}


//                           ARRAY FOR RIGHT-CLICK MENU
let items = [ 
	'COLOR ON/OFF',
	'delete/Stop', 
	'youtube', 
	'amazon', 
	'googleSearch', 
	'fileName', 
	'camelCase', 
	'underscore', 
	'src'
	];

// 						ARRAY FOR COLORING RIGHT CLICK MENU
let items_coloring = [ 
	'START',
	'STOP',
	'COLOR', 
	'BACK', 
	'SAVE', 
	'REMOVE_CSS',
	'RESTORE_SAVED_CSS', 
	'CLEAR_STORAGE', 
	'CLEAR_WEBSITE'
	];

//                           CREATING RIGHT CLICK MENUS
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
		parentId: 'COLOR ON/OFF'
	});

}


async function get_color(){
	let [ tab, tab_idx, w_id ] = await getActiveTab();
	let stat = await chrome.action.getBadgeText( { tabId: tab[tab_idx].id } );

	if( stat == 'COL')
		await chrome.scripting.executeScript({
			target: { tabId: tab[tab_idx].id },
			injectImmediately: true,
			func: color_getter
		});
}


function color_getter(){

	let color_element_div = document.createElement('div');
	color_element_div.id = 'color_element_div';

	let color_element = document.createElement('input');
	color_element.type = 'color';
	color_element.value = '#ababab';
	color_element.id = 'color_choose';
	color_element.style = 'width: 30vw;height: 10vw;position: relative;margin: auto;display: block;';

	color_element.addEventListener( 'click', (ev) => { 
		color_button.value = ev.srcElement.value;
	});

	let color_button = document.createElement('button');
	color_button.name = 'color_choose_button';
	color_button.type = 'button';
	color_button.innerText = 'CHOOSE COLOR';
	color_button.value = 'rgb(171,171,171)';
	color_button.style = 'position:relative;display:block;margin:auto;';

	color_button.addEventListener( 'click' , (ev) => {
		bg_color = document.querySelector('#color_choose').value;
		color_element_div.remove();
		opacity_children('100%');
	});

	color_element_div.append( color_element );
	color_element_div.append( color_button );

	children = document.body.children;
	opacity_children('20%');

	document.body.insertBefore( color_element_div , children[0] );

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
			chrome.tabs.sendMessage( tab[tab_idx].id, { msg: 'START_COLORING' })			
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
				}
			} );

		}
	}
}


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


//		FUNCTIONS FOR SEARCHING WEBSITE, MANIPULATING SELECTED TEXT AND RETURNING src PROPERTY OF ELEMENT

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



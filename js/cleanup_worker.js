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
	case 'del_el':
		delete_element();
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
chrome.contextMenus.create({
	title: "del_el",
	contexts: ["all"],
	id: "del_el"
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

async function delete_element(){
	let [tab, tab_idx] = await getActiveTab();	
	chrome.scripting.executeScript({
		//files: ['js/test.js'],
		function: kill,
		injectImmediately: true,
		target: {tabId: tab[tab_idx].id}
	});

	function kill(){

		// FOR DELETING ELEMENT

		let sel = null;

		document.body.addEventListener("mouseover", highlight_el, {once:false} );
		document.body.addEventListener("mouseout", remove_highlight, {once:false} );
		document.body.addEventListener("click", delete_el, {once:false});

		// ev from event listener. this is a callback f()
		function highlight_el(ev){
		  sel = get_selector( document.querySelectorAll(':hover') );
		console.log('############>', sel);

		  document.querySelector( sel ).style.border = "1px solid red";
		  document.querySelector( sel + ' :first-child').style.border = "1px solid green";

		  all_children('show');
		}

		function remove_highlight(){
		console.log('---------->',sel);
		  document.querySelector( sel ).style.border = "";
		  document.querySelector( sel + ' :first-child').style.border = "";
		  all_children('hide');
		  sel = null;
		}

		function all_children(to_do){
		  children = document.querySelector( sel ).children;
		  for(let i=1;i < children.length;i++){
		    if(to_do == 'show')
		      children[i].style.border="1px solid black";
		    else
		      children[i].style.border="";
		  }
		}

		function delete_el(){
		  sel = get_selector( document.querySelectorAll(':hover') );
		  document. querySelector( sel ).remove();
		  sel = null;
		}

		function get_selector(nodes){

		  let selector_array = [];
		  let idx;
		  let nodes_arr = [];

		  nodes_arr = Array.from(nodes);
		  nodes_arr.shift();

		  selector_array = Array.prototype.map.call( nodes_arr, (node) => {

		    idx = Array.prototype.indexOf.call( node.parentElement.children, node ) + 1;

		    if(node.id)
		      return node.tagName.toLowerCase() + '#' + node.id.substring(0, node.id.indexOf(' ') ? node.id.length : node.id.indexOf(' ') ) + ':nth-child(' + idx + ')';
		    if(node.className)
		      return node.tagName.toLowerCase() + '.' + node.classList[0] + ':nth-child(' + idx + ')';
		    else
		      return node.tagName.toLowerCase() != 'body' ? '> ' + node.tagName.toLowerCase() + ':nth-child(' + idx + ')' : node.tagName.toLowerCase() + ':nth-child(' + idx + ')' ;

		  });

		  return selector_array.join(' ');
		}				
	}

}

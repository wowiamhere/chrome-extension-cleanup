//    SCRIPT THAT CONTAINS BACKGROUND COLORING AND ELEMENT DELETION FUNCTIONS
//    SCRIPT RECEIVES MESSAGE, CHECKS IF ITS FOR THIS SCRIPT AND IF ALL if STATEMENTS FAIL
//      IT ROLLS OVER TO NEXT LISTENING SCRIPT
//     IT CHECKS THE MESSAGE FOR FUNCTIONALITY INSTRUCTION
//    DELETES ELEMENTS AND COLORS WEB PAGE
//    SAVES CSS DATA IN storage.local AND RETREIVES DATA TO RE-APPLIED TO WEB PAGE


chrome.runtime.onMessage.addListener( 
   async (message, sender, sendResponse) => {

console.log('----EXTENSION_FUNCTIONS.JS---->', message );
    if(message.msg == 'INJECTED?')
      sendResponse( { msg: 'EXTENSION_FUNCTIONS_HERE'} );
    else if( message.msg == 'START_DELETING'){
      console.log('----DELETING!!!---START!!!!!!!!');
      start_deleting();
    }
    else if( message.msg == 'DELETE_OFF' ){
      stop_deleting();
      console.log('----DONE DELETING @@@@@@@@@@@@');
    }
    else if(message.msg == 'START_COLORING'){
      console.log('----COLOIRNG!!!---START!!!!!!!!');
      begin_coloring();
    }
    else if(message.msg == 'COLORING_OFF'){
      console.log('----DONE COLORING @@@@@@@@@@');
      end_coloring();
    }
    else if(message.msg == 'COLOR')
      ; //bg_color = message.color;
    else if(message.msg == 'COLORING_BACK')
      delete_rule(0);
    else if(message.msg == 'COLORING_SAVE'){
      persist_user_css();
      end_coloring();
    }
    else if(message.msg == 'COLORING_REMOVE_CSS')
      clear_css();
    else if(message.msg == 'COLORING_RESTORE_SAVED_CSS')
      restore_last();
    else if(message.msg == 'COLORING_CLEAR_STORAGE'){
      await chrome.storage.local.clear();
    }
    else if(message.msg == 'COLORING_REMOVE_WEBSITE'){
      let site = document.location.origin + document.location.pathname;
      await chrome.storage.local.remove( site );
      extension_user_stylesheet.replaceSync('');
      end_coloring();
    }
    else if(message.msg == 'GET_FILE'){
      sendResponse({here: 'here', to_do: message.to_do});
      get_file(message.to_do);
      }
    else{
      console.log('MESSAGE NOT RECOGNIZED!!!!!!!!!!!!!!');
      return;
    }

});

console.log('----SCRIPT INJECTED #############3');

// STYLE SHEET FOR KILLING LINKS ON WEBPAGE
let extension_stylesheet_links = new CSSStyleSheet();

// STYLE SHEET FOR DELETE FUNCTIONALITY
let extension_stylesheet_hide = new CSSStyleSheet();

// STYLE SHEET FOR COLORING
let extension_user_stylesheet = new CSSStyleSheet();

// STYLE SHEET FOR EXTENSION
let extension_stylesheet = new CSSStyleSheet();

let sel = null;

document.adoptedStyleSheets = [ 
  extension_stylesheet, 
  extension_user_stylesheet, 
  extension_stylesheet_links,
  extension_stylesheet_hide ];

//---------------------------------------------------------
//----------------------------------------------------------
//---THIS IS FOR GETTING PDF VERSION OF PORTION OF A WEBPAGE---
//----------------------------------------------------------
//----------------------------------------------------------
function get_file(to_do){

 prep_file = async ()=>{
  let sel = get_selector( document.querySelectorAll(':hover') );

  let dom_el = document.querySelector( sel );
  dom_el.style = '';

  let content_div = document.createElement('div');
  content_div.appendChild( dom_el.cloneNode(true) );
  let data = new Blob( [ content_div.outerHTML ], { type: 'text/html'});

  try{
    const file_handle = await window.showSaveFilePicker( { start_in: '/home/user1/Downloads/misc/temp/', suggestedName: 'file-conversion.html' } );
    const writable = await file_handle.createWritable( { mode:'exclusive' } );
    await writable.write( data );
    await writable.close();
  }
  catch (err){
    console.log('File error--> ', err);
  }

  chrome.runtime.sendMessage( { to_do: to_do.substring(to_do.indexOf('_')+1)  });

  document.body.removeEventListener('mouseover', highlight_el);
  document.body.removeEventListener('mouseout', remove_highlight);
  document.body.removeEventListener('click', prep_file);
  remove_highlight();
  handle_links('open');

  }

  handle_links('kill');
  document.body.addEventListener('mouseover', highlight_el, {once:false} );
  document.body.addEventListener('mouseout', remove_highlight, {once:false} );
  document.body.addEventListener('click', prep_file, {once:false} );  


}

//---------------------------------------------------------
//----------------------------------------------------------
//---THIS IS FOR DELETING ELEMENTS IN THE WEBPAGE------------
//---RECEIVES MSG FROM WORKER AND STARTS DELETING FUNCTION---
//----------------------------------------------------------
//----------------------------------------------------------


//      INSERTS BODY LISTENERS TO body ELEMENT TO HIGHLIGHT HOVERED ELEMENT UPON CLICKING ELEMENT IS DELETED
//      DEACTIVATES ALL LINKS ON WEB PAGE
function start_deleting(){
  handle_links('kill');
  document.body.addEventListener("mouseover", highlight_el, {once:false} );
  document.body.addEventListener("mouseout", remove_highlight, {once:false} );
  document.body.addEventListener("click", delete_el, {once:false});
}

//      REMOVES LISTENERS FROM start_deleting AND REACTIVATES LINKS
function stop_deleting(){
  remove_highlight();
  document.body.removeEventListener("mouseover", highlight_el);
  document.body.removeEventListener("mouseout", remove_highlight);
  document.body.removeEventListener("click", delete_el);
  handle_links('open');
}


//      FUNCTION FOR eventListener FROM start_deleting
//      DELETES AN ELEMENT THAT IS BEING HOVERED ON BY USER.
//      THE ELEMENT IS ALSO BEING HIGHLITED WITH style.border CSS ATTIBUTE
function delete_el(){
  try{
    sel = get_selector( document.querySelectorAll(':hover') );
  
    document.querySelector( sel ).remove();
    
    sel = null;
  }
  catch{}
}

//-------------------------------------------------------------
//-------------------------------------------------------------
//------THIS IS FOR COLORING-----------------------------------
//----- RECEIVES MESSGE FROM WORKER AND STARTS COLORING--------
//-------------------------------------------------------------
//-------------------------------------------------------------

//        DEFAULT COLOR TO USE
let bg_color = '#ababab';

//      CHECKS storage.local TO SEE IF THERE IS ANY CSS STYLESHEET PRESENT FOR CURRENT WEB PAGE
//        IF NOT THEY PROCEED TO DEACTIVATE ALL LINKS IN PAGE AND ADD A click eventListener TO SELECT ELEMENTS TO CHANGE BACKGROUND COLOR
async function begin_coloring(){
  check_db();
  bg_color = 'rgb(171,171,171)';
  handle_links('kill');
  document.body.addEventListener("click", body_listener, {once:false} );

  document.body.addEventListener("mouseover", highlight_el, {once:false} );
  document.body.addEventListener("mouseout", remove_highlight, {once:false} );
}

//      OPENS UP ALL LINKS AND REMOVES THE eventListener FROM begin_coloring.  STOPS ALL COLORING FUNCTIONS.
function end_coloring(){
  remove_highlight();
  document.body.removeEventListener('click', body_listener);
  document.body.removeEventListener("mouseover", highlight_el);
  document.body.removeEventListener("mouseout", remove_highlight);  
  handle_links('open');
}


//      FUNCTION FOR eventListener FROM begin_coloring
//      UPON USER CLICKING, GET A RULE TO INSERT USING get_selector FOR THE ELEMENT CLICKED, CHECK storage.local TO SEE IF RULE EXISTS,
//        AND INSERT IF NOT
function body_listener(ev){

  let index;
  let selector;
  let rule;
  
  if(ev){

    selector = get_selector( document.querySelectorAll(':hover') );
    rule =  selector + '{background-color:' + bg_color + ' !important;}';
    index = check_sheet( selector );

    if( index != undefined ){
        extension_user_stylesheet.deleteRule( index );
        extension_user_stylesheet.insertRule( rule );
      }else{
        extension_user_stylesheet.insertRule( rule );
      }

    }else
    return undefined;
}


//-------------------------------------------------------------
//-------------------------------------------------------------
//--------- REST OF FUNCTIONALITY -----------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------

function delete_rule(idx){
  if(extension_user_stylesheet.cssRules.length > 0)
  extension_user_stylesheet.deleteRule( idx ); 
}

async function persist_user_css(){
  let css_rules = extension_user_stylesheet.cssRules
  let css_rules_arr = [];

  for(let i=0; i<css_rules.length; ++i){
    css_rules_arr.push( css_rules[i].cssText );
  }

  let name = document.location.origin + document.location.pathname;
  let arr = [ [ name, css_rules_arr ] ];

  chrome.storage.local.set( Object.fromEntries( arr ) );

console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );

  end_coloring();
}

async function restore_last(){
  let rules = await chrome.storage.local.get();
  let site = document.location.origin + document.location.pathname;

  for(const [ste, arr_rules] of Object.entries(rules) ){
    if(ste == site){
      extension_user_stylesheet = new CSSStyleSheet();
      for(const rule of arr_rules ){
        extension_user_stylesheet.insertRule( rule );
      }

    }
  }
  document.adoptedStyleSheets = [ 
  extension_stylesheet, 
  extension_user_stylesheet, 
  extension_stylesheet_links,
  extension_stylesheet_hide ];

console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );
}

function clear_css(){
  extension_user_stylesheet.replace("");
}


//-------------------------------------------------------------
//-------------------------------------------------------------
//--------HELPER FUNCITONS-------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------

//      RECEIVES A SELECTOR AND RETURNS A STRING TO BE STORED IN storage.local
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

//      TO BE ABLE TO CLICK ON ANY PORTION OF THE PAGE FOR DELETING AND COLORING,
//        ALL LINKS ARE DEACTIVATED AND REACTIVATED AS NEEDED BY INSERTING A CSS RULE INTO A CUSTOM STYLE SHEET 
function handle_links(to_do){
  if(to_do == 'kill'){
    if(!extension_stylesheet_links.cssRules[0])
      extension_stylesheet_links.insertRule('a{pointer-events:none !important;}');
  }
  else{
    if(extension_stylesheet_links.cssRules.length > 0)
      extension_stylesheet_links.deleteRule(0);
  }
}

//    FUNCTION FOR eventListener mouseover FROM start_deleting
//    UPON USER HOVERING OVER AN ELEMENT, A SELECTOR IS RETREIVED AND STORED IN GLOBAL VARIABLE AND 
//      THE ELEMENT AND ITS CHILDRENS CSS BORDER ATTRIBUTE IS ACTIVATED TO HIGHLIGHT ELEMENT TO USER 
function highlight_el(){
  try{
    sel = get_selector( document.querySelectorAll(':hover') );

    document.querySelector( sel ).style.border = "1px solid red";
    //document.querySelector( sel + ' :first-child').style.border = "1px solid green";

    //all_children('show');
  }
  catch{}
}

//      HELPER FUNCTION TO ACTIVATE AND DEACTIVATE THE  style.border ATTRIBUTE OF ALL CHILDREN OF AN ELEMENT
//        HOVERED OVER BY USER.
function all_children(to_do){
  children = document.querySelector( sel ).children;
  for(let i=1;i < children.length;i++){
    if(to_do == 'show')
      children[i].style.border="1px solid black";
    else
      children[i].style.border="";
  }
}

//      FUNCTION FOR eventListener mouseout FROM start_deleting
//      QUERY UPON SELECTOR FROM GLOBAL SCOPE TO DEACTIVATE CSS FOR BORDER
function remove_highlight(){
  try{
    document.querySelector( sel ).style.border = "";
    document.querySelector( sel + ' :first-child').style.border = "";
    all_children('hide');
    sel = null;
  }
  catch{

  }
}

function check_sheet(slctr){
  
  let rules = extension_user_stylesheet.cssRules;
  
    for (let i=0; i < rules.length; ++i){
      if ( slctr == rules[i].selectorText)
        return i;
    }
  return undefined;

}

async function check_db(){
  
  let loc = document.location.origin + document.location.pathname;

  let db_item = await chrome.storage.local.get( loc );

  if( Object.keys(db_item).length > 0 ){
    
    let rules = db_item[ loc ];

    for(const rule of rules){

      let sel =  (rule.slice( 0, rule.indexOf('{') ) ).trim();

      if( check_sheet( sel ) == undefined )
        extension_user_stylesheet.insertRule( rule );
    }

  }

}
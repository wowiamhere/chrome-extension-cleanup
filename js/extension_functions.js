//    SCRIPT THAT CONTAINS BACKGROUND COLORING AND ELEMENT DELETION FUNCTIONS
//    SCRIPT RECEIVES MESSAGE, CHECKS IF ITS FOR THIS SCRIPT AND IF ALL if STATEMENTS FAIL
//      IT ROLLS OVER TO NEXT LISTENING SCRIPT
//     IT CHECKS THE MESSAGE FOR FUNCTIONALITY INSTRUCTION
//    DELETES ELEMENTS AND COLORS WEB PAGE
//    SAVES CSS DATA IN storage.local AND RETREIVES DATA TO RE-APPLIED TO WEB PAGE


console.log('----extension_functions.js INJECTED #############');

chrome.runtime.onMessage.addListener( 
   async (message, sender, sendResponse) => {

console.log('----EXTENSION_FUNCTIONS.JS, message received ---->\n', message );
    if(message.msg == 'INJECTED?')
      sendResponse( { msg: 'EXTENSION_FUNCTIONS_HERE'} );
    else if( message.msg == 'START_DELETING'){
      start_deleting();
      console.log('----DELETING STARTED!!!!!!!!');
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
      sendResponse({stat: 'here', to_do: message.to_do});

      if(message.to_do == 'set_tags')
        set_tags();
      else
        get_file(message.to_do);
    }
    else if(message.msg == 'APP_RESULT'){
      html_for_app_result( message.stat );
    }
    else{
      console.log('MESSAGE NOT RECOGNIZED!!!!!!!!!!!!!!');
      return;
    }

});

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


//----------------------------------------------
//-----------SET META TAGS FOR AN MP3 FILE------
//----------------------------------------------
//----------------------------------------------
async function set_tags(){
  let dialog_el = document.createElement('dialog');
  dialog_el.id = 'dialog-for-tags';
  dialog_el.class = 'dialog-for-tags';
  dialog_el.style = 'margin:auto';

  //-------------------------------------------------------
  //-------------------------------------------------------
  //-- INPUT ELEMENTS FOR TITLE, ARTIST AND GENRE METAGS---
  //-- FILE NAME AND PATH TO FILE--------------------------
  //-------------------------------------------------------
  //-------------------------------------------------------
  let input_path = document.createElement('input');
  input_path.id = 'input_path_id';
  input_path.class = 'input_path_id';
  input_path.style = 'display:inline-block;border:1px dotted red;';
  input_path.type = 'text';
  input_path.name = 'path';
  input_path.placeholder = 'path'

  let input_title = document.createElement('input');
  input_title.id = 'title_id';
  input_title.class = 'title_id';
  input_title.style = 'display:inline-block;border:1px dotted red;';
  input_title.type = 'text';
  input_title.name = 'title';
  input_title.placeholder = 'title'

  let input_artist = document.createElement('input');
  input_artist.id = 'artist_id';
  input_artist.class = 'artist_id';
  input_artist.style = 'display:inline-block;border:1px dotted red;';
  input_artist.type = 'text';
  input_artist.name = 'artist';
  input_artist.placeholder = 'artist';

  let input_genre = document.createElement('input');
  input_genre.id = 'genre_id';
  input_genre.class = 'genre_id';
  input_genre.style = 'display:inline-block;border:1px dotted red;';
  input_genre.type = 'text';
  input_genre.name = 'genre';
  input_genre.placeholder = 'genre';

  const f_handle = await window.showOpenFilePicker( );


  //----------------------------------------------------------------
  //-- button ATTACHED TO input. INCLUDES A CLICK EVENT
  //-- SENDS MESSAGE TO NATIVE APP FOR UPDATING MP3 FILE TAGS
  //-- SENDS FILE NAME, PATH TO FILE, TITLE, ARTIST, GENRE TO UPDATE
  //----------------------------------------------------------------
  let btn_set_tags = document.createElement('button');
  btn_set_tags.id = 'set-tags-button';
  btn_set_tags.class = 'set-tags-button';
  btn_set_tags.style = 'display:inline-block;border:1px solid black;color:black;';
  btn_set_tags.innerText = "Set Tags";
  btn_set_tags.type = 'button';

  btn_set_tags.onclick = () => {
    msg = { 
        to_do: 'set_tags',
        path: input_path.value,
        f_name: f_handle[0]['name'],
        title: input_title.value, 
        artist: input_artist.value, 
        genre: input_genre.value 
    };

    chrome.runtime.sendMessage( msg );
    dialog_el.close();
    dialog_el.remove();
  }

  dialog_el.appendChild( input_path );
  dialog_el.appendChild( input_title );
  dialog_el.appendChild( input_artist );
  dialog_el.appendChild( input_genre );
  dialog_el.appendChild( btn_set_tags );

  //-------------------------------------------------------------
  //-- modal APPENDED TO PAGE body AND ACTIVATED
  //-------------------------------------------------------------
  let dialog_el_appended = document.body.appendChild( dialog_el );
  dialog_el_appended.showModal();

}

//---------------------------------------------------------
//----------------------------------------------------------
//---GET DIFFERENT FILE VERSION OF HTML PORTION OF A WEBPAGE
//----------------------------------------------------------
//----------------------------------------------------------
async function get_file(to_do){

  function get_file_open_page(){
    document.body.removeEventListener('mouseover', highlight_el);
    document.body.removeEventListener('mouseout', remove_highlight);
    document.body.removeEventListener('click', prep_file);
    remove_highlight();
    handle_links('open');
  }

  prep_file = async ()=>{
  let sel = get_selector( document.querySelectorAll(':hover') );

  let dom_el = document.querySelector( sel );
  dom_el.style = '';

  let content_div = document.createElement('div');
  content_div.appendChild( dom_el.cloneNode(true) );
  let data = new Blob( [ content_div.outerHTML ], { type: 'text/html'});

  try{
    const file_handle = await window.showSaveFilePicker( { suggestedName: 'file-conversion.html' } );
    const writable = await file_handle.createWritable( { mode:'exclusive' } );
    await writable.write( data );
    await writable.close();
  
    chrome.runtime.sendMessage( { to_do: to_do  });

    get_file_open_page();
  }
  catch (err){
    console.log('File error--> ', err);
    get_file_open_page();
  }


  }

  handle_links('kill');
  document.body.addEventListener('mouseover', highlight_el, {once:false} );
  document.body.addEventListener('mouseout', remove_highlight, {once:false} );
  document.body.addEventListener('click', prep_file, {once:false} );  


}

//--------------------------------------------------------
//--------------------------------------------------------
//-- dialog ELEMENT FOR DISPLAYING RESULT (MESSAGE FROM HOST APP)
//--------------------------------------------------------
//--------------------------------------------------------

function html_for_app_result(conversion_message){
  //--------------------------------------------------------
  //--- DIV FOR DISPLAYING dialog ELEMENT WITH RESPONSE FROM HOST APP (PYTHON)
  //--------------------------------------------------------
  let div_for_msg = document.createElement('div');
  div_for_msg.id = "conversion-result-div";
  div_for_msg.style = 'margin:2vh 2vw;'

  let span_for_code = document.createElement('span');
  span_for_code.id = 'span-for-code';
  span_for_code.style = 'display:block;margin:2vh 2vw;'

  let span_for_msg = document.createElement('span');
  span_for_msg.id = 'span-for-msg';
  span_for_msg.style = 'display:block;margin:2vh 2vw;'
  
  div_for_msg.appendChild( span_for_code );
  div_for_msg.appendChild( span_for_msg );

  let dialog_el = document.createElement('dialog');
  dialog_el.id = 'dialog-for-response';
  dialog_el.class = 'dialog-for-response';
  dialog_el.style = 'margin:auto';

  dialog_el.appendChild( div_for_msg );

  //--------------------------------------------------------
  //---- button TO DISREGARD THE dialog ELEMENT WITH HOST APP MESSAGE
  //--------------------------------------------------------
  let btn_to_hide = document.createElement('button');
  btn_to_hide.id = 'close-dialog';
  btn_to_hide.class = 'close-dialog';
  btn_to_hide.style = 'display:inline-block;margin:auto;border:1px solid black;color:black';
  btn_to_hide.innerText = 'Close';
  btn_to_hide.type = 'button';
  btn_to_hide.onclick = () => { 
    dialog_el.close();
    dialog_el.remove();
     }

  div_for_msg.appendChild( btn_to_hide );

  //--------------------------------------------------------
  //-- button TO OPEN AND VIEW FILE IN NEW CHROME TAB
  //--------------------------------------------------------
  let btn_view_file = document.createElement('button');
  btn_view_file.id = 'view-file-btn';
  btn_view_file.class = 'view-file-btn';
  btn_view_file.style = 'display:inline-block;margin:auto;border:1px solid black;color:black';
  btn_view_file.innerText = 'Open File';
  btn_view_file.type = 'button';

  div_for_msg.appendChild( btn_view_file ); 

  //-------------------------------------------------------------
  //-- modal appended to div and activated
  //-------------------------------------------------------------
  let dialog_el_appended = document.body.appendChild( dialog_el );
  dialog_el_appended.showModal();

  //-------------------------------------------------------------
  //--  CHECK THE RESPONSE FROM APP FOR TYPE OF ACTION PERFORMED 
  //--  AND ANY OUTPUT FROM OPERATION
  //-------------------------------------------------------------    
  if(conversion_message.output.done == 'Conversion'){

    //----------- SET THE MESSAGE FROM APP -------------
    span_for_msg.innerText = conversion_message.output.type;
    span_for_code.innerText = conversion_message.stat;

    btn_view_file.onclick = () => {
      let ext_n = conversion_message.output.type
      let msg = {to_do:'open_file', file_type: ext_n };
      chrome.runtime.sendMessage( msg );
    }

    //--------------------------------------------------------
    //--- input ELEMENT TO ENTER NEW FILE NAME FOR RENAMING.
    //--------------------------------------------------------
    let input_el = document.createElement('input');
    input_el.id = 'input_name_id';
    input_el.class = 'input_name_id';
    input_el.style = 'display:inline-block;border:1px dotted red;';
    input_el.type = 'text';
    input_el.value = '';

    div_for_msg.appendChild( input_el );

    //--------------------------------------------------------
    //-- button ATTACHED TO input. INCLUDES A CLICK EVENT
    //-- GET THE NEW FILE NAME FROM USER AND SEND IT TO HOST APP FOR UPDATING FILE IN SYSTEM
    //--------------------------------------------------------
    let btn_rename_file = document.createElement('button');
    btn_rename_file.id = 'rename-move-button';
    btn_rename_file.class = 'rename-move-button';
    btn_rename_file.style = 'display:inline-block;border:1px solid black;color:black;';
    btn_rename_file.innerText = "Rename/Move";
    btn_rename_file.type = 'button';
    btn_rename_file.form = input_el.id;
    btn_rename_file.onclick = () => { 
      msg = { to_do: 'rename', new_file_name: input_el.value   };
      chrome.runtime.sendMessage( msg );
      dialog_el.close();
      dialog_el.remove();
    }

    div_for_msg.appendChild( btn_rename_file );
  }
  else if(conversion_message.output.done == 'Move/Rename'){

    //--------------------------------------------------------
    //--------------------------------------------------------
    //-- button TO VIEW RENAMED/MOVED FILE.
    //--------------------------------------------------------
    //--------------------------------------------------------

    //---- SET THE MESSAGE FROM HOST APP ------
    span_for_code.innerText = conversion_message.stat;
    span_for_msg.innerText = conversion_message.output.done;

    btn_view_file.onclick = () => {
      let msg = {to_do: 'open_file', file_loc: conversion_message.output.file_loc };
      chrome.runtime.sendMessage( msg );
    }

  }
  else if( conversion_message.output.done == 'VIDEO DOWNLOADED'){
    btn_view_file.remove()

    span_for_msg.innerText = conversion_message.output.done;
    span_for_code.innerText = conversion_message.stat;    
  }
  else if(conversion_message.output.done == 'VIDEO TO MP3' ){
    btn_view_file.remove()

    span_for_msg.innerText = conversion_message.output.done;
    span_for_code.innerText = conversion_message.stat;
  } 

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
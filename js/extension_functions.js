chrome.runtime.onMessage.addListener( 
   async (message, sender, sendResponse) => {
    sendResponse( { msg: 'SCRIPT_ALREADY_INJECTED'} );
console.log('glitchglitchglitchglitchxxxxxx-->', message );

/////
///// THIS IS FOR DELETING ELEMENTS IN THE WEBPAGE
///// RECEIVES MSG FROM WORKER AND STARTS DELETING FUNCTION
    if( message.msg == 'START_DELETING'){
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
    else if(message.msg == 'COLORING_REMOVE_CSS'){
      clear_css();
    }
    else if(message.msg == 'COLORING_RESTORE_SAVED_CSS'){
      restore_last();
    }
    else if(message.msg == 'COLORING_CLEAR_STORAGE'){
      await chrome.storage.local.clear();
    }
    else if(message.msg == 'COLORING_REMOVE_WEBSITE'){
      let site = document.location.origin + document.location.pathname;
      await chrome.storage.local.remove( site );
      extension_user_stylesheet.replaceSync('');
      end_coloring();
    }

});

console.log('----SCRIPT INJECTED #############3');

// STYLE SHEET FOR DELETE FUNCTIONALITY
let extension_stylesheet_misc = new CSSStyleSheet();

// STYLE SHEET FOR COLORING
let extension_user_stylesheet = new CSSStyleSheet();

// STYLE SHEET FOR EXTENSION
let extension_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ 
  extension_stylesheet, 
  extension_user_stylesheet, 
  extension_stylesheet_misc ];


/////
///// THIS IS FOR DELETING ELEMENTS IN THE WEBPAGE
///// RECEIVES MSG FROM WORKER AND STARTS DELETING FUNCTION
/////

let sel = null;

function start_deleting(){
  handle_links('kill');
  document.body.addEventListener("mouseover", highlight_el, {once:false} );
  document.body.addEventListener("mouseout", remove_highlight, {once:false} );
  document.body.addEventListener("click", delete_el, {once:false});
}

function stop_deleting(){
  remove_highlight();
  document.body.removeEventListener("mouseover", highlight_el);
  document.body.removeEventListener("mouseout", remove_highlight);
  document.body.removeEventListener("click", delete_el);
  handle_links('open');
}

function highlight_el(){
  try{
    sel = get_selector( document.querySelectorAll(':hover') );

    document.querySelector( sel ).style.border = "1px solid red";
    document.querySelector( sel + ' :first-child').style.border = "1px solid green";

    all_children('show');
  }
  catch{}
}

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

function delete_el(){
  try{
    sel = get_selector( document.querySelectorAll(':hover') );
    document. querySelector( sel ).remove();
    sel = null;
  }
  catch{}
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

function handle_links(to_do){
  if(to_do == 'kill'){
    if(!extension_stylesheet_misc.cssRules[0])
      extension_stylesheet_misc.insertRule('a{pointer-events:none !important;}');
  }
  else{
    if(extension_stylesheet_misc.cssRules.length > 0)
      extension_stylesheet_misc.deleteRule(0);
  }
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


///////////// 
///////////// THIS IS FOR COLORING
///////////// RECEIVES MESSGE FROM WORKER AND STARTS COLORING

let bg_color = '#ababab';

function opacity_children(op){
  let children = document.body.children;
  for(let i=0;i<children.length;++i){
    children[i].style.opacity = op;
  } 
}

async function begin_coloring(){
  check_db();
  bg_color = 'rgb(171,171,171)';
  handle_links('kill');
  document.body.addEventListener("click", body_listener, {once:false} );
}

function end_coloring(){
  handle_links('open');
  document.body.removeEventListener('click', body_listener);
}



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

function check_sheet(slctr){
  
  let rules = extension_user_stylesheet.cssRules;
  
    for (let i=0; i < rules.length; ++i){
      if ( slctr == rules[i].selectorText)
        return i;
    }
  return undefined;

}

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
  extension_stylesheet_misc ];
console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );
}

function clear_css(){
  extension_user_stylesheet.replace("");
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
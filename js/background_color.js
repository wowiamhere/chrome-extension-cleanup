
chrome.runtime.onMessage.addListener(
  async (message, sender, sendResponse) =>{

    if(message.msg == 'CLOSE'){
      console.log('----DONE @@@@@@@@@@');
      end_coloring();
    }
    if(message.msg == 'COLOR')
      //bg_color = message.color;

    if(message.msg == 'BACK')
      delete_rule(0);

    if(message.msg == 'SAVE'){
      persist_user_css();
      end_coloring();
    }
    if(message.msg == 'RESTORE'){
      restore_last();
      end_coloring();
    }
    if(message.msg == 'RESET_ALL'){
      await chrome.storage.local.clear();
      end_coloring();
    }
    if(message.msg == 'RESET_THIS'){
      let site = document.location.origin + document.location.pathname;
      await chrome.storage.local.remove( site );
      extension_user_stylesheet.replaceSync('');
      end_coloring();
    }
    if(message.msg == 'COLOR_SCRIPT?'){
      sendResponse( { msg: 'COLORING_HERE'} );
      if(message.stat != 'COL'){
        console.log('----COLOIRNG!!!---START!!!!!!!!');
        begin_coloring();
      }
    }

  }

);

let extension_user_stylesheet = new CSSStyleSheet();
let extension_stylesheet = new CSSStyleSheet();
document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet ];

let bg_color;

begin_coloring();

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

function handle_links(to_do){
  if(to_do == 'kill'){
    if(!extension_stylesheet.cssRules[0])
      extension_stylesheet.insertRule('a{pointer-events:none !important;}');
  }
  else{
    if(extension_stylesheet.cssRules.length > 0)
      extension_stylesheet.deleteRule(0);
  }
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
  document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet];
  end_coloring();
console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );
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

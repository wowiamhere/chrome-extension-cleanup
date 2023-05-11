let extension_user_stylesheet = new CSSStyleSheet();
let extension_stylesheet = new CSSStyleSheet();
document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet ];

let bg_color;

begin_coloring();

chrome.runtime.onMessage.addListener(
  
  async (message, sender, sendResponse) =>{
console.log( await chrome.storage.local.get() );
    if(message.stat == 'ARE_YOU_THERE')
      begin_coloring();

    if(message.color)
      bg_color = message.color;

    if(message.back)
      delete_last_rule();

    if(message.save){
      persist_user_css();
      end_coloring();
    }
    if(message.restore){
      restore_last();
      end_coloring();
    }
    if(message.reset_all){
      await chrome.storage.local.clear();
      end_coloring();
    }
    if(message.reset_this){
      let site = document.location.origin + document.location.pathname;
      await chrome.storage.local.remove( site );
      extension_user_stylesheet.replaceSync('');
      end_coloring();
    }

    if(message.close){
      end_coloring();
    }
  }

);

async function begin_coloring(){
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
  else
    extension_stylesheet.deleteRule(0);
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

function delete_last_rule(){
  if(extension_user_stylesheet.cssRules.length > 0)
  extension_user_stylesheet.deleteRule(0);
}

async function persist_user_css(){
  let css_rules = extension_user_stylesheet.cssRules
  let css_rules_arr = [];

  for(let i=0; i<css_rules.length; ++i){
    css_rules_arr.push( [ css_rules[i].selectorText, css_rules[i].cssText ] );
  }

  let temp = Object.fromEntries( css_rules_arr );
  let name = document.location.origin + document.location.pathname;
  let arr = [ [ name, temp ] ];

  chrome.storage.local.set( Object.fromEntries( arr ) );

console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );
}

async function restore_last(){
  let saved_css = new CSSStyleSheet();
  let rules = await chrome.storage.local.get();
  let site = document.location.origin + document.location.pathname;

  for(const [i, j] of Object.entries(rules) ){
    if(i == site){
      for(const [h, k] of Object.entries(j) ){
        let idx = check_sheet( h );
        if( idx != undefined){
          extension_user_stylesheet.deleteRule( idx );
          extension_user_stylesheet.insertRule( k );

        }
        else{
          extension_user_stylesheet.insertRule( k );
        }
      }

    }
  }
console.log('bytes ins use ---->: %s', (await chrome.storage.local.getBytesInUse() * 10**-6) );
}
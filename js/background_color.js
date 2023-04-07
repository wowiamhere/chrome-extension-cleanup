let extension_user_stylesheet = new CSSStyleSheet();

let extension_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet ];

let bg_color = 'rgb(171,171,171)';
handle_links('kill');
document.body.addEventListener("click", body_listener, {once:false} );


chrome.runtime.onMessage.addListener(
  
  async (message, sender, sendResponse) =>{    

    if(message.close){
      handle_links('open');
      document.body.removeEventListener('click', body_listener);
    }
    if(message.stat == 'ARE_YOU_INJECTED'){
      bg_color = 'rgb(171,171,171)';
      handle_links('kill');
      document.body.addEventListener("click", body_listener, {once:false} );
    }
    if(message.color){
      bg_color = message.color;
    }
    if(message.back){
      delete_last_rule();
    }

  }

);

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
extension_stylesheet = new CSSStyleSheet();
window.extension_user_stylesheet ? window.extension_user_stylesheet : extension_user_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet ];

el_name = 'div';
el_id = 'backgroundColor_extension';
el = document.createElement( el_name );
el.setAttribute('id', el_id );
css_array = ['z-index:999999', 'width:10%', 'position:fixed', 'left:88%', 'top:6vw', 'height:5vw', 'border:0.5vw solid red', 'border-radius:2vw'];

extension_stylesheet.insertRule( el.tagName + '#' + el.id + ' {' + css_array.join(';') + '}' );

col_el_name = 'input';
col_el_type = 'color';
col_el_value = '#ababab';
col_el_id = 'color';
col_el = document.createElement( col_el_name );
col_el.setAttribute('type', col_el_type );
col_el.setAttribute('value', col_el_value );
col_el.setAttribute('id', col_el_id );
css_array = ['position:relative', 'display:block', 'width:80%', 'border-radius:0.5vw', 'margin:auto', 'top:0.1vw', 'height:2vw'];
extension_stylesheet.insertRule( col_el.tagName + '#' + col_el.id + ' {' + css_array.join(';') + '}' );
col_el.addEventListener('input', get_color, {once:false});
el.appendChild( col_el );

bg_color = 'rgb(171,171,171)';

close_btn_name = 'div';
close_btn_id = 'to_close';
close_btn = document.createElement( close_btn_name );
close_btn.setAttribute('id', close_btn_id );
css_array = ['width:29%', 'position:relative', 'display:block', 'margin:auto', 'margin-top:0.4vw', 'background-color:red', 'text-align:center'];
extension_stylesheet.insertRule( close_btn.tagName + '#' + close_btn.id + ' {' + css_array.join(';') + '}' );
close_btn.appendChild( document.createTextNode('DONE') );
close_btn.addEventListener('click', close_extension, {once:true});

el.appendChild( close_btn );

document.body.appendChild( el );

handle_links('kill');

document.body.addEventListener("click", body_listener, {once:false} );

for_id = 0;
for_clss = 0;

function get_color(ev){
  if(ev){
    bg_color = ev.target.value;
  }else
    return undefined
}

function body_listener(ev){

  let index;
  let selector;
  let rule;
  
  if(ev)
    if(ev.target != document.getElementById('backgroundColor_extension') ){
      if(ev.target != document.getElementById('backgroundColor_extension').children[0]){

        selector = get_selector( document.querySelectorAll(':hover') );

        rule =  selector + '{background-color:' + bg_color + ' !important;}';
          
        index = check_sheet( selector );

        if( index != undefined ){
            
            extension_user_stylesheet.deleteRule( index );
            extension_user_stylesheet.insertRule( rule );
            
          }else{
            
            extension_user_stylesheet.insertRule( rule );
            
          }
      }
    }else
    return undefined;
}

function close_extension(){
  handle_links('open_links');
}

function handle_links(to_do){
  if(to_do == 'kill')
    extension_stylesheet.insertRule('a{pointer-events:none !important;}');
  else{
    document.adoptedStyleSheets.shift();
    document.body.removeEventListener('click', body_listener);
    document.getElementById('backgroundColor_extension').remove();
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

function check_sheet(slctr){
  
  let rules = extension_user_stylesheet.cssRules;
  
    for (let i=0; i < rules.length; ++i){
      if ( slctr == rules[i].selectorText)
        return i;
    }
  return undefined;

}

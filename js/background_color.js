extension_color_stylesheet = new CSSStyleSheet();
document.adoptedStyleSheets = [ extension_color_stylesheet ];

el_name = 'div';
el_id = 'backgroundColor_extension';
el = document.createElement( el_name );
el.setAttribute('id', el_id );
css_array = ['z-index:999999', 'width:10%', 'position:fixed', 'float:right', 'left:88%', 'height:5vw', 'border:0.5vw solid red', 'border-radius:2vw'];

extension_color_stylesheet.insertRule( el.tagName + '#' + el.id + ' {' + css_array.join(';') + '}' );

col_el_name = 'input';
col_el_type = 'color';
col_el_value = '#ababab';
col_el_id = 'color';
col_el = document.createElement( col_el_name );
col_el.setAttribute('type', col_el_type );
col_el.setAttribute('value', col_el_value );
col_el.setAttribute('id', col_el_id );
css_array = ['position:relative', 'display:block', 'width:80%', 'border-radius:0.5vw', 'margin:auto', 'top:0.1vw', 'height:2vw'];
extension_color_stylesheet.insertRule( col_el.tagName + '#' + col_el.id + ' {' + css_array.join(';') + '}' );
col_el.addEventListener('input', get_color, {once:false});
el.appendChild( col_el );

bg_color = 'background-color: rgb(171,171,171)';

close_btn_name = 'div';
close_btn_id = 'to_close';
close_btn = document.createElement( close_btn_name );
close_btn.setAttribute('id', close_btn_id );
css_array = ['width:29%', 'position:relative', 'display:block', 'margin:auto', 'margin-top:0.4vw', 'background-color:red', 'text-align:center'];
extension_color_stylesheet.insertRule( close_btn.tagName + '#' + close_btn.id + ' {' + css_array.join(';') + '}' );
close_btn.appendChild( document.createTextNode('DONE') );
close_btn.addEventListener('click', close_extension, {once:true});

el.appendChild( close_btn );
document.body.insertBefore(el, document.body.children[0] );

handle_links('kill');

document.body.addEventListener("click", body_listener, {once:false} );

function get_color(ev){
  if(ev){
    bg_color = 'background-color:' + ev.target.value + ';';
  }else
    return undefined
}

function filter_tags(el){
  if (el.tagName.toLowerCase() == 'script')
    return false;
  else if (el.tagName.toLowerCase() == 'noscript')
    return false;
  else if (el.tagName.toLowerCase() == 'a')
    return false;
  else
    return true;
}

function handle_links(to_do){
  if(to_do == 'kill')
    extension_color_stylesheet.insertRule('a{pointer-events:none !important;}');
  else{
    extension_color_stylesheet.removeRule(0);
    document.body.removeEventListener('click', body_listener);
    document.getElementById('backgroundColor_extension').remove();
  }
}

function body_listener(ev){
  if(ev)
    if(ev.target != document.getElementById('backgroundColor_extension') )
      if(ev.target != document.getElementById('backgroundColor_extension').children[0]){
        let style = ev.target.style.cssText;
        style = style + bg_color;
        ev.target.setAttribute('style', style );
      }
  else
    return undefined;
}

function close_extension(){
  handle_links('open_links');
}

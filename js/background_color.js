window.extension_stylesheet ? window.extension_stylesheet : extension_stylesheet = new CSSStyleSheet();
window.extension_user_stylesheet ? window.extension_user_stylesheet : extension_user_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet, extension_user_stylesheet ];

el_name = 'div';
el_id = 'backgroundColor_extension';
el = document.createElement( el_name );
el.setAttribute('id', el_id );
css_array = ['z-index:999999', 'width:10%', 'position:fixed', 'float:right', 'left:88%', 'height:5vw', 'border:0.5vw solid red', 'border-radius:2vw'];

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
document.body.insertBefore(el, document.body.children[0] );

handle_links('kill');

document.body.addEventListener('click', body_listener, {once:false} );

ext_id_counter = 0;
ext_attr = 'ext_id';
ext_attr_val = 'ext_id_'

function get_color(ev){
  if(ev){
    bg_color = ev.target.value;
  }else
    return undefined
}

function handle_links(to_do){
  if(to_do == 'kill')
    extension_stylesheet.insertRule('a{pointer-events:none !important;}');
  else{
    document.body.removeEventListener('click', body_listener);
    document.getElementById('backgroundColor_extension').remove();
  }
}

function body_listener(ev){

  let index;
  let attr;
  let rule;

  if(ev)
    if(ev.target != document.getElementById('backgroundColor_extension') ){
      if(ev.target != document.getElementById('backgroundColor_extension').children[0]){

        attr = ev.target.attributes.ext_id ? ev.target.attributes.ext_id.value : set_att( ev.target );
        index = check_sheet( attr );
        rule = '[' + ext_attr + '=' + attr + '] { background-color: ' + bg_color + ' !important;}';
          
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

function set_att(el){

  el.setAttribute( ext_attr, ext_attr_val + ext_id_counter );
  ++ext_id_counter;
  
  return el.attributes.ext_id.value;

}

function check_sheet(attr_val){
  let rules = extension_user_stylesheet.cssRules;
  let src = '[' + ext_attr + '="' + attr_val + '"]'
    for (let i=0; i < rules.length; ++i){
      if (src == rules[i].selectorText)
        return i;
    }
  return undefined;

}
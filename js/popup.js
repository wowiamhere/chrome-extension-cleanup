let extension_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet ];

let css_array = [];

css_array = ['display:block', 'width:90%', 'width:88vw', 'height:70vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'backgroundColor_extension' + ' {' + css_array.join(';') + '}' );

css_array = ['display:block', 'margin:auto', 'height:31vw', 'width:76vw'];
extension_stylesheet.insertRule( 'input' + '#' + 'color' + ' {' + css_array.join(';') + '}' );
document.getElementById( 'color' ).addEventListener('input', set_color, { once: false });

css_array = ['display:block', 'position:relative', 'width:30vw', 'top:27vw', 'left:1vw', 'background-color:red', 'text-align:center'];
extension_stylesheet.insertRule( 'div' + '#' + 'to_close' + ' {' + css_array.join(';') + '}' );
document.getElementById( 'to_close' ).addEventListener('click', close_extension, { once: true });

css_array = ['display:block', 'position:relative', 'width:27vw', 'top:-2vw', 'left:59vw', 'height:27vw', 'background-color:lightblue', 'text-align:center'];
extension_stylesheet.insertRule( 'div' + '#' + 'screenshot_id' + '{' + css_array.join(';') + '}' );
document.getElementById( 'screenshot_id' ).addEventListener('click', get_screenshot, { once: false });

let tab = await chrome.tabs.query({ active: true });
await chrome.runtime.sendMessage( { tab_id: tab[0].id, site: tab[0].url  } );

async function set_color(ev){
  chrome.tabs.sendMessage( tab[0].id, { color: ev.target.value } );
}

function close_extension(){
  chrome.tabs.sendMessage( tab[0].id, { close: true } );
}

function get_screenshot(){
  //chrome.runtime.sendMessage({ screenshot: 'yes' });
}

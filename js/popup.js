let extension_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet ];

let css_array = [];

css_array = ['display:block', 'width:90%', 'width:88vw', 'height:70vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'backgroundColor_extension' + ' {' + css_array.join(';') + '}' );

css_array = ['display:block', 'margin:auto', 'height:31vw', 'width:76vw'];
extension_stylesheet.insertRule( 'input' + '#' + 'color' + ' {' + css_array.join(';') + '}' );
document.getElementById('color').addEventListener('input', set_color, { once: false });

css_array = ['display:block', 'position:relative', 'width:30vw', 'top:27vw', 'left:1vw', 'background-color:red', 'text-align:center'];
extension_stylesheet.insertRule( 'div' + '#' + 'to_close' + ' {' + css_array.join(';') + '}' );
document.getElementById('to_close').addEventListener('click', close_extension, { once: true });

css_array = ['display:block', 'position:relative', 'width:27vw', 'top:-2vw', 'left:59vw', 'height:27vw', 'background-color:lightblue', 'text-align:center'];
extension_stylesheet.insertRule( 'div' + '#' + 'screenshot_id' + '{' + css_array.join(';') + '}' );
document.getElementById('screenshot_id').addEventListener('click', get_screenshot, { once: false });

css_array = [];
//extension_stylesheet.insertRule( 'div' + '#' + 'go_back' + '{' + css_array.join(';') + '}' );
document.getElementById('go_back').addEventListener('click', undo_last, { once: false } );

let tab = await chrome.tabs.query({ active: true });
await chrome.runtime.sendMessage( { type: 'initial', tab_id: tab[0].id, site: tab[0].url  } );

async function set_color(ev){
  chrome.tabs.sendMessage( tab[0].id, { color: ev.target.value } );
}

function close_extension(){
  chrome.tabs.sendMessage( tab[0].id, { close: true } );
}

async function get_screenshot(){
  let tm = new Date();
  let u = await chrome.tabs.captureVisibleTab( { format: 'png' } );
  let el = document.createElement('a');
  el.href = u;
  el.download = 'screenshot-' + tm.getHours() + '-' + tm.getMinutes() + '-' + tm.getSeconds();
  el.click();
}

function undo_last(){
  chrome.tabs.sendMessage( tab[0].id, { back: true });
}
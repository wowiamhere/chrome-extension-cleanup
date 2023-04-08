let extension_stylesheet = new CSSStyleSheet();

document.adoptedStyleSheets = [ extension_stylesheet ];

let css_array = [];

css_array = ['display:block', 'width:90vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'backgroundColor_extension' + ' {' + css_array.join(';') + '}' );

css_array = ['display:inline-block', 
  'position:relative', 
  'background-color:red', 
  'text-align:center', 
  'font-weight:900', 
  'height:10vw', 
  'width:23vw', 
  'border:1px solid black', 
  'border-radius:4vw'];
 extension_stylesheet.insertRule( 'div' + '#' + 'restore' + ' {' + css_array.join(';') + '}' );
 document.getElementById('restore').addEventListener('click', restore_last, { once: true });

css_array = ['float:right', 
  'background-color:lightblue',
  'text-align:center', 
  'font-weight:900', 
  'height:10vw', 
  'width:23vw', 
  'border:1px solid black', 
  'border-radius:4vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'go_back' + '{' + css_array.join(';') + '}' );
document.getElementById('go_back').addEventListener('click', undo_last, { once: false } );

css_array = ['display:block', 
  'margin:auto', 
  'width:44vw', 
  'height:40vw', 
  'background:transparent', 
  'border:none'];
extension_stylesheet.insertRule( 'input' + '#' + 'color' + ' {' + css_array.join(';') + '}' );
document.getElementById('color').addEventListener('input', set_color, { once: false });

css_array = ['display:inline-block',
  'position:relative', 
  'background-color:red', 
  'text-align:center', 
  'font-weight:900', 
  'height:10vw', 
  'width:23vw', 
  'border:1px solid black', 
  'border-radius:4vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'screenshot_id' + '{' + css_array.join(';') + '}' );
document.getElementById('screenshot_id').addEventListener('click', get_screenshot, { once: false });

css_array = ['float:right',
  'background-color:lightblue',
  'text-align:center', 
  'font-weight:900', 
  'height:10vw', 
  'width:23vw', 
  'border:1px solid black', 
  'border-radius:4vw'];
extension_stylesheet.insertRule( 'div' + '#' + 'save_id' + '{' + css_array.join(';') + '}' );
document.getElementById('save_id').addEventListener('click', persist_css, { once: false });

css_array = ['display: block',
  'position: relative',
  'width: 100%',
  'background-color: RED',
  'height: 22vw',
  'margin-top: 7vw',
  'text-align: center',
  'font-size: 17vw',
  'font-weight:600'];
extension_stylesheet.insertRule( 'div' + '#' + 'to_close' + ' {' + css_array.join(';') + '}' );
document.getElementById('to_close').addEventListener('click', close_extension, { once: true });


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

function persist_css(){
  chrome.tabs.sendMessage( tab[0].id, { save: true });
}

function restore_last(){
  chrome.tabs.sendMessage( tab[0].id, { restore: true });
}
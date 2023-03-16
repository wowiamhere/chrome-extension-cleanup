bg_color = 'background-color: rgb(171,171,171)';

handle_links('kill');

document.body.addEventListener("click", body_listener, {once:false} );

el = document.createElement('div');
el.appendChild( document.createTextNode('CLOSE EXTENSION') );
el.setAttribute('id', 'backgroundColor_extension');
el.setAttribute('style', 'background-color: red;z-index:999999;display:block;position:sticky;top:0px;text-align:center;font-size:1.6vw;font-weight:bold');
el.addEventListener('click', close_extension, {once:true});

document.body.insertBefore(el, document.body.children[0] );

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
	let links = document.links;

	if(to_do == 'kill'){
		for(let i=0; i<links.length; i++){                                   	
			let style;
			style = links[i].style.cssText ? links[i].style.cssText : '';
			style = style + ';pointer-events:none';
			links[i].setAttribute('style', style);
		}
	}else{
		for(let i=0; i<links.length; i++){                                   	
                	let style;
	              	style = links[i].style.cssText ? links[i].style.cssText : '';
                	style = style.replace('pointer-events:none', '');
                	style = style.replace('pointer-events: none', '');
			links[i].setAttribute('style', style);
		}
		document.body.removeEventListener('click', body_listener);
		document.getElementById('backgroundColor_extension').remove();
	}
}

function body_listener(ev){
	if(ev)
		ev.target.setAttribute('style', 'background-color: rgb(171,171,171)');
	else
		return undefined;
}

function close_extension(){
	handle_links('open_links');
}

// JS/BACKGROUND_COLOR.JS
// Displays a clickable to change background color.
// Takes body, each child of body and each first child of each first child of body
//    and creates a clickable button to set its backgroudn color to custom


function all_document(){
// Displays a table with clikable buttons. 
// 1 for each child of body.
// 1 for each first child of each child of body.
// Upon clicking, background color of element set to custom

	document.getElementById('site-url').appendChild( document.createTextNode( document.location.href ) );

	const body = document.getElementsByTagName('body')[0];
	const html_colec_body_children = body.children;
	const arr_body_children = Array.from(html_colec_body_children).filter(filter_tags);

	const body_ul = document.createElement('ul').setAttribute('id', 'body_ul');

	for(el of arr_body_children){
		let id = el.className;
		let temp_el = document.createElement('li').setAttribute('id', id);
		body_ul.appendChild(temp_el);
		body_ul.appendChild(document.createElement('ul').setAttribute('id', 'first-child-of-'+id));
		id = el.firstChild.className;
		temp_el = document.createElement('li').setAttribute('id', id);
		body_ul.appendChild(temp_el);
	}
		
	document.getElementById('change-bg-color').appendChild(body_ul);

}

function kill_links(){
// Deactivates all links but Events still work for mouse clicks on <a>.
	for(let i=0; i < document.links.length; i++){
		document.links[i].setAttribute('style', 'pointer-events:none');
	}
}

function filter_tags(el){
// Filter for an array of elements to filter out non rendering elements.
	if el.localName == 'script'
		return false;
	else if el.localName == 'noscript'
		return false;
	else
		return true;
}

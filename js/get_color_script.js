//	SCRIPT FOR PICKING THE COLOR TO USE FOR WEB PAGE BACKGROUND COLOR MANIPULATION
//		UPON MESSAGE, SCRIPT CHECKS IF MESSAGE IS FOR THIS SCRIPT, IF TRUE THEN 
//		CHECKS MESSAGE FOR FUNCTIONALITY REQUEST (PRESENT USER WITH COLOR PICKER AND RETURN SELECTION)
//		IF MESSAGE NOT FOR THIS SCRIPT, IT HITS LAST ELSE IN onMessage.addListener CALLBACK AND REQUEST CONTINUES UNTIL SOMEONE ANSWERS

chrome.runtime.onMessage.addListener(
	async (message, sender, sendResponse) => { 

console.log('----GET_COLOR_SCRIPT.JS---->', message );		

		if(message.msg == 'GET_COLOR_INJECTED?')
			sendResponse( { msg: 'GET_COLOR_HERE' } );

		else if( message.msg == 'GET_COLOR' ){
			select_color();
		} 
		else{
			return;
		}
	}
);



function select_color(){

//			SUSPENDS THE document body ELEMENT EventListener TO PREVENT ACCIDNTAL CLICKING AND COLORING OF WEB PAGE DURING COLOR SELECTION PROCESS.
	document.body.removeEventListener('click', body_listener);
	let pos = window.pageYOffset;
	let lft = 0;

//			CREATES A div TO DISPLAY COLOR CHOOSER.
//			CREATES CSS AND ID ATTRIBUTES FOR ALL ELEMENTS OF COLOR CHOOSER.	
	let color_element_div = document.createElement('div');
	color_element_div.id = 'color_element_div';
	let color_element_div_css_obj = {
		position: 'absolute',
		top: pos + 'px',
		left: lft + 'px',
		background: 'black'
	};

//			get_css TAKES AN OBJECT WITH KEY, VALUE AND CREATES A CSS STRING FOR ELEMENT.STYLE 
	color_element_div.style = get_css( color_element_div_css_obj );

//			ADDS EventListener TO document TO CHECK FOR scroll ACTIVITY TO GET USERS CURRENT SCREEN LOCATION AND UPDATE COLOR CHOOSER div TO ALWAYS FOLLOW SCROLL	
	document.addEventListener('scroll', get_pos, {once:false});

//			CREATES AN input COLOR CHOOSER FOR USER TO SELECT COLOR TO WORK WITH.
	let color_element = document.createElement('input');
	color_element.id = 'color_choose';
	color_element.type = 'color';
	color_element.value = '#ababab';
	let color_element_css_obj = {
		width: '30vw',
		height: '10vw',
		display: 'block',
		overflow: 'hidden',
		appearance: 'none',
		background: 'none',
		border: 'none',
		cursor: 'copy',
		padding: '0'
	};
	color_element.style = get_css( color_element_css_obj );

//			ADDS EventListener TO input ELEMENT TO UPDATE USERS CHOICE OF COLOR.
	color_element.addEventListener( 'click', (ev) => { 
		ev.stopPropagation();
		color_button.value = ev.srcElement.value;
	});

//			ADDS button ELEMENT TO USE COLOR SELECTED
	let color_button = document.createElement('button');
	color_button.id = 'color_button';
	color_button.type = 'button';
	color_button.name = 'color_choose_button';
	color_button.value = 'rgb(171,171,171)';
	color_button.innerText = 'CHOOSE COLOR';
	let color_button_css_obj = {
		position: 'relative',
		display: 'block',
		margin: 'auto',
		'border-radius': '5vw',
		overflow: 'hidden',
		width: '35%',
		height: '4vh' 
	};
	color_button.style = get_css( color_button_css_obj );

//			ADDS EventListener TO button TO CALL FUNCTION TO CLOSE COLOR SELECTION WINDOW, RESTORE body EventLISTENER AND EXIT COLOR CHOOSER
	color_button.addEventListener( 'click' , color_button_click, {once:false});

	children = document.body.children;
	opacity_children('20%');

	color_element_div.append( color_element );
	color_element_div.append( color_button );
	document.body.append( color_element_div );

//			eventListener ON WINDOW TO MONITOR AND UPDATE COLOR CHOOSER LOCATION TO REMAIN IN THE MIDDLE OF SCREEN
	window.addEventListener('resize', window_scroll, {once:false} );

	window_scroll();
}

//			SCROLLS 1 UNIT FORTH AND BACK TO UPDATE COLOR CHOOSER PLACE IN WINDOW
function window_scroll(){
	window.scroll(window.pageXOffset, window.pageYOffset+1);
	window.scroll(window.pageXOffset, window.pageYOffset-1);
}

//		TAKES A CSS OBJECT (keys, val) AND RETURNS A STRING FOR ELEMENT.STYLE
function get_css(css_obj){
	let css_arr = [];
	for(const [ key, val ] of Object.entries( css_obj ) ){
		css_arr.push( key + ':' + val + '; ');
	}
	return css_arr.join('')
}


//			GETS THE VERTICAL POSITION OF THE WINDOW AND UPDATES THE POSITION OF THE COLOR CHOOSER SO IT ALWAYS APPEARS VISIBLE
async function get_pos(ev){
	pos =  window.pageYOffset;
	lft = (window.innerWidth/2)-(document.querySelector('#color_element_div').offsetWidth/2);
	color_element_div_css = 'position:absolute; top:' + pos + 'px; left:' + lft + 'px;' + ' background-color:black;';
	color_element_div.style = color_element_div_css;
}

//			WHEN USER SELECTS COLOR AND CLICKS BUTTON, SETS NEW VALUE OF COLOR TO USE, REMOVES THE COLOR CHOOSER, RESTORES OPACITY AND eventListeners TO ALL PAGE
function color_button_click(ev){
	ev.stopPropagation();
	bg_color = document.querySelector('#color_choose').value;
	color_element_div.remove();
	opacity_children('100%');
	window.removeEventListener('scroll', window_scroll);
	document.removeEventListener('scroll', get_pos);
	document.body.addEventListener('click', body_listener);		
};

function opacity_children(op){
  let children = document.body.children;
  for(let i=0;i<children.length;++i){
    children[i].style.opacity = op;
  } 
}
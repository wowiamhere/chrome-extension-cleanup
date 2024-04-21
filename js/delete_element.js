chrome.runtime.onMessage.addListener( 
  async (message, sender, sendResponse) => {

    console.log("-----------HERE", message);
    sendResponse( { msg: "DELETING HERE" } );

    if( message.msg == 'OFF' ){
      stop_deleting();
      console.log('----DONE @@@@@@@@@@@@');
    }
    else if( message.msg == 'THERE?'){
      console.log('----DELETING!!!---START!!!!!!!!');
      start_deleting();
    }

});

  console.log('----IN #############3');
  let extension_stylesheet_delete_element = new CSSStyleSheet();
  document.adoptedStyleSheets = [ extension_stylesheet_delete_element ];

  let sel = null;
  start_deleting();


  function start_deleting(){
    handle_links('kill');
    document.body.addEventListener("mouseover", highlight_el, {once:false} );
    document.body.addEventListener("mouseout", remove_highlight, {once:false} );
    document.body.addEventListener("click", delete_el, {once:false});
  }
  function stop_deleting(){
    remove_highlight();
    document.body.removeEventListener("mouseover", highlight_el);
    document.body.removeEventListener("mouseout", remove_highlight);
    document.body.removeEventListener("click", delete_el);
    handle_links('open');
  }

  function highlight_el(){
    try{
      sel = get_selector( document.querySelectorAll(':hover') );

      document.querySelector( sel ).style.border = "1px solid red";
      document.querySelector( sel + ' :first-child').style.border = "1px solid green";

      all_children('show');
    }
    catch{}
  }

  function remove_highlight(){
    try{
      document.querySelector( sel ).style.border = "";
      document.querySelector( sel + ' :first-child').style.border = "";
      all_children('hide');
      sel = null;
    }
    catch{

    }
  }

  function delete_el(){
    try{
      sel = get_selector( document.querySelectorAll(':hover') );
      document. querySelector( sel ).remove();
      sel = null;
    }
    catch{}
  }

  function all_children(to_do){
    children = document.querySelector( sel ).children;
    for(let i=1;i < children.length;i++){
      if(to_do == 'show')
        children[i].style.border="1px solid black";
      else
        children[i].style.border="";
    }
  }

  function handle_links(to_do){
    if(to_do == 'kill'){
      if(!extension_stylesheet_delete_element.cssRules[0])
        extension_stylesheet_delete_element.insertRule('a{pointer-events:none !important;}');
    }
    else{
      if(extension_stylesheet_delete_element.cssRules.length > 0)
        extension_stylesheet_delete_element.deleteRule(0);
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

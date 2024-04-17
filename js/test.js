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

// FOR DELETING ELEMENT

let sel = null;

document.body.addEventListener("mouseover", highlight_el, {once:false} );
document.body.addEventListener("mouseout", remove_highlight, {once:false} );
document.body.addEventListener("click", delete_el, {once:false});

// ev from event listener. this is a callback f()
function highlight_el(ev){
  sel = get_selector( document.querySelectorAll(':hover') );
console.log('############>', sel);

  document.querySelector( sel ).style.border = "1px solid red";
  document.querySelector( sel + ' :first-child').style.border = "1px solid green";

  all_children('show');
}

function remove_highlight(){
console.log('---------->',sel);
  document.querySelector( sel ).style.border = "";
  document.querySelector( sel + ' :first-child').style.border = "";
  all_children('hide');
  sel = null;
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

function delete_el(){
  sel = get_selector( document.querySelectorAll(':hover') );
  document. querySelector( sel ).remove();
  sel = null;
}

# Chrome Extension  
  
Inject Css and Javascript modifying web page background to any desired color to lessen impact one eyes.  
  
**Upon activation**  
Adds a ```<div>``` with an EventListener to the top of the page with an event clicker to close extension.  
Deactivates all links.  
Adds EventListener to ```document.body```  
Waits for user to click on the screen.  
**USER can click anywhere on the page, including links, to change backgroud color.**  
  
**Upon deactivation**  
Upon clicking button to 'CLOSE EXTENSION',  
All links are re-activated,  
```<div>``` on top of page is removed  
```document.body``` EventListener is removed.  


## Adds Right Click Manu Items

**Delete**  
Highlights :hovered elements and their children to select which to delete from the DOM.   

**Search Website**   
With mouse selected text search pre-programmed website.   

**fileName**  
With mouse selected text return a hyphen separeted string optimal for file name saving.   

**camelCase**   
With mouse selected text return a string in camel case format.   

**underscore**   
With mouse Selected text return a string separated by underscores.   

**src**   
Hover over any DOM element with a 'src' attribute and returns the Source Link.   

_


## Chrome Extension Development   
**[chrome.scripting](https://developer.chrome.com/docs/extensions/reference/scripting/)**   

**[chrome.action](https://developer.chrome.com/docs/extensions/reference/action/)**   

**[chrome.tabs](https://developer.chrome.com/docs/extensions/reference/api/tabs)**   

**[chrome.runtime](https://developer.chrome.com/docs/extensions/reference/api/runtime)**   

**[chrome.contextMenus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)**    
 

## DOM / Javascript  

**document.querySelector**   
**document.appendChild**  
**document.setAttribute**  
**document.addEventListener**  
**document.removeEventListener**  
**document.remove**  
**document.adoptedStyleSheets**   
**String**   
**Array**   
  


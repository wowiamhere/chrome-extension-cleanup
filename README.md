# Chrome Extension   
  
> All capabilities from Right Click Menu in Chrome Browser.   

#### Web Page Background Color   
Hover over any part of a Web Page and change it's background color.   
Injects Css and Javascript modifying web page background to any desired color to lessen impact on eyes.   

#### Web Page Text Manipulation   
Takes selected text from any web page and either searches youtube, google or amazon, manipulates selected text or returs the ***src=*** attribute of an DOM element.   

#### Web Page Element Deletion   
Hover over any element and it's border highlithes ***RED***, it's *First Child* ***GREEN*** and all it's children ***BLACK***.   
Click on the ***PARENT*** (GREEN) to delete it and it's children from the DOM.



***Upon activation***  
Adds EventListeners to Web page.
Deactivates all links. 
**USER can click anywhere on the page, including links.**  
  
***Upon deactivation***  
All links are re-activated,  
EventListeners are removed.  


## Adds Right Click Manu Items
***COLOR ON/OFF***   
- *START*   
- *STOP*   
- *BACK*   
- *SAVE*   
- *REMOVE_CSS*   
- *RESTORE_CSS*   
- *CLEAR_STORAGE*
- *CLEAR_WEBSITE*       


***DELTE/Stop***  
Highlights :hovered elements and their children to select which to delete from the DOM.   

***Search Website***   
With mouse selected text search pre-programmed website.   

***fileName***  
With mouse selected text return a hyphen separeted string optimal for file name saving.   

***camelCase***   
With mouse selected text return a string in camel case format.   

***underscore***   
With mouse Selected text return a string separated by underscores.   

***src***   
Hover over any DOM element with a 'src' attribute and returns the Source Link.   

_


## Chrome Extension Development   
```
chrome.scripting   
chrome.action   
chrome.tabs   
chrome.runtime   
chrome.contextMenus   
```
 
## DOM / Javascript  
```
document.querySelector   
document.appendChild  
document.setAttribute  
document.addEventListener  
document.removeEventListener  
document.remove  
document.adoptedStyleSheets   
String   
Array   
```
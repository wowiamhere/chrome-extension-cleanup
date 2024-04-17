# Chrome Extension  
  
Inject Css and Javascript modifying web page background color (from white to rgb(171,171,171) to lessen impact one eyes.  
  
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

  
## chrome Extensions
**[chrome.scripting](https://developer.chrome.com/docs/extensions/reference/scripting/)**   
chrome.scripting.executeScript   
chrome.scripting.insertCSS   

**[chrome.action](https://developer.chrome.com/docs/extensions/reference/action/)**   
  
## Javascript  
  
**Element.appendChild**  
**Element.setAttribute**  
**Element.addEventListener**  
**Element.removeEventListener**  
**Element.remove**  
  


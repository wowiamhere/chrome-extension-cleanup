const mainPageSelector = 'section';
const mainPage = document.getElementsByTagName( mainPageSelector );

for (let i = 0; i < mainPage.length; i++){
	mainPage[i].setAttribute('style', 'background-color:rgb(171,171,171)');
}


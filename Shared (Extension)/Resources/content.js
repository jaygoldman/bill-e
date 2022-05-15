browser.runtime.sendMessage({ greeting: "hello" }).then((response) => {
    console.log("Received response: ", response);
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received request: ", request);
});

/*let color = '#FA96A7';
const changeColor = () => {
    document.querySelector("body").style.background = color;
    document.querySelector("#content").style.background = color;
    document.querySelector("table.infobox").style.background = color;
}
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.color){
        color = request.color;
        changeColor();
    }
});
changeColor();
*/



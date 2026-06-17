const targetNode = document.body;
const config = {CharacterData: true, childList: true, subtree: true};

const callback = (mutationList, observer) => {
    for ( const mutation of mutationList) {
        if (mutation.type === 'childList') {
            for ( const node of mutation.addedNodes){
                const information = node.querySelector('[data-property = "instructor"]');
                if ( information != null){
                    const text = information.textContent;
                    const split = text.split(',')
                    const dataId = information.getAttribute("data-id")
                    const message = chrome.runtime.sendMessage({instructorName : split[0], id : dataId});
                } 
                
            }

        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);
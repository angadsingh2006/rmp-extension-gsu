const targetNode = document.body;
const config = {CharacterData: true, childList: true, subtree: true};

const callback = (mutationList, observer) => {
    for ( const mutation of mutationList) {
        if (mutation.type === 'childList') {
            for ( const node of mutation.addedNodes){
                const text = node.querySelector('[data-property = "instructor"]')?.textContent;
                split = text.split(',')
                const message = chrome.runtime.sendMessage({instructorName : split[0]});
            }

        }
    }
};

const observer = new MutationObserver(callback);
observer.observe(targetNode, config);
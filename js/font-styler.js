document.addEventListener('DOMContentLoaded', function () {
    function stylizeVowelsInTextNode(textNode) {
        const originalText = textNode.nodeValue;
        const vowelRegex = /([aeiouyAEIOUY])/g;
        
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        originalText.replace(vowelRegex, (match, vowel, offset) => {
            if (offset > lastIndex) {
                fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, offset)));
            }
            const span = document.createElement('span');
            span.className = 'vowel-serif-italic';
            span.textContent = vowel;
            fragment.appendChild(span);
            
            lastIndex = offset + match.length;
        });

        if (lastIndex < originalText.length) {
            fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
        }
        
        return fragment;
    }

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const styledFragment = stylizeVowelsInTextNode(node);
            if (styledFragment.childNodes.length > 0) {
                 node.parentNode.replaceChild(styledFragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                Array.from(node.childNodes).forEach(processNode);
            }
        }
    }
    const headingsToStylize = document.querySelectorAll('.js-stylize-vowels:not(.dish-title)');
    headingsToStylize.forEach(heading => {
        processNode(heading);
    });
});

// js/font-styler.js
// Скрипт для стилизации гласных букв в заголовках

document.addEventListener('DOMContentLoaded', function () {
    // Функция для стилизации гласных в текстовом узле
    function stylizeVowelsInTextNode(textNode) {
        const originalText = textNode.nodeValue;
        // Регулярное выражение для поиска русских и английских гласных (заглавных и строчных)
        // Русские: а, е, ё, и, о, у, ы, э, ю, я
        // Английские: a, e, i, o, u, y (y иногда считается гласной)
        const vowelRegex = /([аеёиоуыэюяaeiouyАЕЁИОУЫЭЮЯAEIOUY])/g;
        
        // Создаем DocumentFragment для безопасного добавления HTML
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        originalText.replace(vowelRegex, (match, vowel, offset) => {
            // Добавляем текст перед гласной (если есть)
            if (offset > lastIndex) {
                fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, offset)));
            }
            // Создаем span для гласной
            const span = document.createElement('span');
            span.className = 'vowel-serif-italic';
            span.textContent = vowel;
            fragment.appendChild(span);
            
            lastIndex = offset + match.length;
        });
        
        // Добавляем оставшийся текст после последней гласной (если есть)
        if (lastIndex < originalText.length) {
            fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
        }
        
        return fragment;
    }

    // Функция для обхода дочерних узлов элемента и стилизации текстовых узлов
    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Если это текстовый узел, стилизуем его
            const styledFragment = stylizeVowelsInTextNode(node);
            // Заменяем старый текстовый узел на новый фрагмент со стилизованными гласными
            if (styledFragment.childNodes.length > 0) {
                 node.parentNode.replaceChild(styledFragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Если это элемент, рекурсивно обрабатываем его дочерние узлы
            // Пропускаем теги SCRIPT и STYLE
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                // Преобразуем HTMLCollection в массив для безопасного обхода,
                // так как DOM может измениться во время итерации
                Array.from(node.childNodes).forEach(processNode);
            }
        }
    }

    // Выбираем все заголовки, которые нужно стилизовать, ИСКЛЮЧАЯ те, что имеют класс .dish-title
    const headingsToStylize = document.querySelectorAll('.js-stylize-vowels:not(.dish-title)');

    headingsToStylize.forEach(heading => {
        // Обрабатываем каждый заголовок
        processNode(heading);
    });
});

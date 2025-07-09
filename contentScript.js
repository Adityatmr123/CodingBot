async function timeout(miliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, miliseconds)
    })
}

function parseCode(code) {

  if (code.indexOf('[PYTHON]') > -1) {
    const start = code.indexOf('[PYTHON]') + '[PYTHON]'.length

    let end = null;
    if (code.indexOf("[/PYTHON]") > -1) {
        end = code.indexOf("[/PYTHON]")
    }

    return (end) ? code.slice(start, end) : code.slice(start);
  } else {
    const codeblock = /```\s*([^]+?.*?[^]+?[^]+?)```/g;
    const match =  codeblock.exec(code)
    if (match) {
    return match[1]
    } else {
    return code
    }
  }
}

/**
 * Extracts LeetCode problem info from the DOM and sends it to the background script.
 */
function extractAndSendLeetCodeProblem() {
    try {
        // Problem title
        const titleEl = document.querySelector('div[data-cy="question-title"]');
        const titleText = titleEl ? titleEl.innerText : "Unknown Problem";

        // Language
        const languageEl = document.querySelector('.ant-select-selection-selected-value, .ant-select-selection-item');
        let languageText = "Unknown Language";
        if (languageEl) {
            languageText = languageEl.innerText || languageEl.textContent;
        }

        // Problem Description
        const descriptionEl = document.querySelector('.question-content__JfgR, .content__u3I1.question-content__JfgR, div[class^="content-"]');
        let problemText = "No problem statement found.";
        if (descriptionEl) {
            problemText = descriptionEl.innerText;
        } else {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) problemText = metaDesc.content;
        }

        // Source Code
        let sourceCodeText = "No source code found.";
        if (window.monaco && window.monaco.editor && window.monaco.editor.getModels().length > 0) {
            sourceCodeText = window.monaco.editor.getModels()[0].getValue();
        } else {
            const codeEl = document.querySelector('.monaco-editor .view-lines');
            if (codeEl) {
                sourceCodeText = codeEl.innerText;
            }
        }

        // Only send if we have at least the problem description
        if (problemText !== "No problem statement found.") {
            chrome.runtime.sendMessage({
                type: "set-problem-info",
                data: {
                    titleText,
                    languageText,
                    problemText,
                    sourceCodeText
                }
            });
        }
    } catch (e) {
        // Fail silently
    }
}

// Try to extract problem info on page load and when URL changes
function setupLeetCodeProblemDetection() {
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(extractAndSendLeetCodeProblem, 1000);
        }
    }, 1000);

    // Initial extraction
    setTimeout(extractAndSendLeetCodeProblem, 1500);
}
setupLeetCodeProblemDetection();

window.addEventListener("sendChromeData", async function(evt){
    console.log(evt)

    const { sourceCode, type } = evt.detail;
    console.log("Auto Paste!")

    let parsedSourceCode = parseCode(sourceCode)
    console.log()
    if (type === "autoPaste") {
        window.monaco.editor.getModels()[0].setValue(parsedSourceCode)
    } else if (type === "autoType") {
        let addedChars = ''
        const codeCharSplit = parsedSourceCode.split("")
        while (codeCharSplit.length > 0) {
            let _char = codeCharSplit.shift()
            addedChars += _char

            // randomness to typing
            await timeout(100 + Math.round(Math.random() * 150))
            window.monaco.editor.getModels()[0].setValue(addedChars)
        }

    }
    
    
});

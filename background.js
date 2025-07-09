let currentProblemState = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "set-problem-info") {
		currentProblemState = message.data;
	} else if (message.type === "get-current-problem") {
		sendResponse(currentProblemState);
	}
	return true;
});

// When the extension is installed, set up the side panel
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

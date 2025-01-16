chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "buttonClick") {
    console.log("LALALLALLAL")
    chrome.tabs.reload(sender.tab.id);
    sendResponse({message: 'handle button click'});
  } else if (request.message === "what is my windowId?") {
    chrome.windows.getAll(windows => {
      sendResponse({
        windowId: sender.tab.windowId,
      });
    });
  }
  return true;
});

chrome.storage.sync.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`
    );
  }
});
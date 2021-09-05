(() => {
  // build/util.js
  function cleanDomain(urls, exact = false) {
    if (urls[0] === void 0) {
      return "";
    } else {
      const activeURL = urls[0].match(exact ? /^[\w]+:\/{2}([^#?]+)/ : /^[\w]+:\/{2}([\w\.:-]+)/);
      if (activeURL == null) {
        return "";
      } else {
        return activeURL[1].replace("www.", "");
      }
    }
  }

  // build/storage.js
  function getStorage() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(null, (storage2) => {
        if (chrome.runtime.lastError !== void 0) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(storage2);
        }
      });
    });
  }

  // build/popup.js
  document.addEventListener("DOMContentLoaded", () => {
    const toggleSwitch = document.querySelector("#reflect-toggle");
    toggleSwitch.addEventListener("change", toggleState, false);
    getStorage().then((storage2) => {
      toggleSwitch.checked = storage2.isEnabled;
      setupBlockListener(storage2.blockedSites);
    });
  });
  function toggleState(e) {
    const port = chrome.runtime.connect({
      name: "toggleState"
    });
    port.postMessage({state: e.target.checked});
    port.disconnect();
  }
  function getButtonText(url, blockedSites) {
    return blockedSites.includes(url) ? "unblock page." : "block page.";
  }
  function setupBlockListener(blockedSites) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const urls = tabs.map((x) => x.url);
      const domain = cleanDomain(urls);
      if (domain === "") {
        document.getElementById("curDomain").textContent = "none.";
        return;
      }
      document.getElementById("curDomain").textContent = domain;
      document.getElementById("block").innerHTML = getButtonText(domain, blockedSites);
      document.getElementById("block").addEventListener("click", () => {
        const port = chrome.runtime.connect({
          name: "blockFromPopup"
        });
        const buttonText = document.getElementById("block").innerHTML;
        if (buttonText == "block page.") {
          port.postMessage({unblock: false, siteURL: domain});
          document.getElementById("block").innerHTML = "unblock page.";
        } else {
          port.postMessage({unblock: true, siteURL: domain});
          document.getElementById("block").innerHTML = "block page.";
        }
        port.disconnect();
      });
      document.getElementById("blockPath").addEventListener("click", () => {
        const port = chrome.runtime.connect({
          name: "blockFromPopup"
        });
        const buttonText = document.getElementById("block").innerHTML;
        if (buttonText == "block page.") {
          port.postMessage({unblock: false, siteURL: cleanDomain(urls, true)});
          document.getElementById("block").innerHTML = "unblock page.";
        } else {
          port.postMessage({unblock: true, siteURL: cleanDomain(urls, true)});
          document.getElementById("block").innerHTML = "block page.";
        }
        port.disconnect();
      });
    });
  }
})();
//# sourceMappingURL=popup.js.map

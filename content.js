// Hotels.com, Agoda.com, Booking.com, onetravel.com, expedia.com, kayak.com, viagogo.com, cheapoair.com, onetravel.com
var rules = []
const rulesUrl = "https://gist.githubusercontent.com/nebojsabogosavljevic/7e5cafe4b735babbf0abd7da2105e3fa/raw/rules";
async function fetchRules() {
  try {
    const response = await fetch(rulesUrl);
    if (!response.ok) throw new Error(`Failed to fetch rules: ${response.statusText}`);
    let rulesString = await response.text();

    rules = rulesString.split("\n").map(rule => rule.split(",").map(ruleEl => ruleEl.trim()));
    rules.shift();
    rules.pop();
    console.log("Rules successfully loaded:", rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
  }
}

// // Hotels.com, Agoda.com, Booking.com, onetravel.com, expedia.com, kayak.com, viagogo.com, cheapoair.com, onetravel.com
let windowId;
const storagePrefixKey = 'Hide-Custom-Element-';
const ruleActiveState = "1";
const defaultState = "0";
const buttonId = "HCE-switchButton";

let ruleActiveButtonImg = chrome.runtime.getURL("media/on.png");
let defaultButtonImg = chrome.runtime.getURL("media/off.png");

function getButtonImgByState(state) {
  return state === defaultState ? defaultButtonImg : ruleActiveButtonImg;
}

let schemes = ['https', 'http', 'www'];
function checkIfUrlStartsWithScheme(url) {
  let flag = false;
  schemes.forEach(scheme => {
    if (url.indexOf(scheme) === 0)
      flag = true;
  });
  return flag;
}

function isUrlBlocked(url) {
  for (let i = 0; i < rules.length; i++) {
    let temp = rules[i][0];
    if (!checkIfUrlStartsWithScheme(temp))
      temp = '.' + temp;
    if (url.includes(temp))
      return true;
  }
  return false;
}

// Recursively disable a node
function disable(node, visibility) {
  if (visibility === 'hidden') {
    node.initialStyle = node.style.display;
    node.style.visibility = 'hidden';
  } else {
    node.style.visibility = node.initialStyle || 'visible';
  }
  for (let i = 0; i < node.children.length; i++) {
    disable(node.children[i], visibility);
  }
}

function setDisplayByCLassName(className, visibility) {
  let elements = document.getElementsByClassName(className.substr(1));
  for(let i = 0; i < elements.length;i ++)
    // exact match
    if (elements[i].classList.length === className.substr(1).split(' ').length)
      disable(elements[i], visibility);
}

function setDisplayById(idName, visibility) {
  let element = document.getElementById(idName.substr(1));
  if (element)
    element.style.visibility = visibility;
}

function hideElement() {
  let url = document.URL;
  let filterRule = rules.filter(rule => url.includes(rule[0]));
  filterRule.forEach(rule => {
    if (isClassName(rule))
      setDisplayByCLassName(rule[1], "hidden");
    else if (isIdName(rule))
      setDisplayById(rule[1], "hidden");
  });
}

function showElement() {
  let url = document.URL;
  let filterRule = rules.filter(rule => url.includes(rule[0]));
  filterRule.forEach(rule => {
    if (isClassName(rule))
      setDisplayByCLassName(rule[1], "visible");
    else if (isIdName(rule))
      setDisplayById(rule[1], "visible");
  });
}

function isClassName(rule) {
  return rule[1].startsWith(".")
}

function isIdName(rule) {
  return rule[1].startsWith("#")
}

function genStorageKey() {
  return `${storagePrefixKey}${windowId}`;
}

function genStorageKeyV2() {
  let arr = window.location.hostname.split('.');
  let rootURL = arr.slice(arr.length - 2).join('.');
  return `${storagePrefixKey}${rootURL}${windowId}`;
}

function getURLState() {
  return localStorage.getItem(genStorageKey());
}

function persistURLState(state) {
  localStorage.setItem(genStorageKey(), state);
}

function getOppositeState(currentState) {
  return currentState === ruleActiveState ? defaultState : ruleActiveState;
}

function changeButtonAndDomState(state) {
  setButtonImageAndClassByState(state);

  if (state === ruleActiveState)
    hideElement();
  else
    showElement();
}

function setButtonImageAndClassByState(state) {
  let button = document.getElementById(buttonId);
  button.className = state;
  button.src = `${getButtonImgByState(state)}`;
}

function addButton() {
  let button = document.getElementById(buttonId);

  if (button)
    return;

  button = document.createElement("img");
  button.id = buttonId;

  let style = {
    position: "fixed",
    bottom: "20px",
    left: '20px',
    backgroundSize: 'cover',
    width: '100px',
    height: '100px',
    cursor: 'pointer'
  };

  Object.keys(style).forEach(attr => {
    button.style[attr] = style[attr];
  });

  button.onclick = async function() {
    if (typeof chrome.runtime.id === "undefined")
      return;
    // When click, the state of the button changed to opposite
    let newState = getOppositeState(button.className);
    // The state of current host also update
    let storageKey = genStorageKeyV2();
    let result = {};
    result[storageKey] = newState;
    
    try {
      await chrome.storage.sync.set(result);
      // Action trigger when button is clicked
      // When extension switch from Active (ON) to Inactive(Off),
      // There is no reload
      if (newState !== defaultState && typeof chrome.runtime.id !== "undefined") {
        const response = await chrome.runtime.sendMessage({message: "buttonClick"});
        console.log(response);
      }
      changeButtonAndDomState(newState);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  document.body.appendChild(button);
}

async function handleButtonStateChange() {
  if (typeof chrome.runtime.id === "undefined")
    return;
  let storageKey = genStorageKeyV2();
  try {
    const result = await chrome.storage.sync.get([storageKey]);
    let currentState = result[storageKey];
    console.log(result);
    if (!currentState)
      currentState = defaultState;
    changeButtonAndDomState(currentState);
  } catch (error) {
    console.error('Error:', error);
  }
}

function clearLocalStorageOfClosedWindow(allWindowsId) {
  let allWindowsKey = allWindowsId.map(windowId => storagePrefixKey + windowId);

  let counter = 0;
  do {
    let key = localStorage.key(counter);
    if (!key)
      break;
    // if there doesnot exist such a window
    if (key.includes(storagePrefixKey) && allWindowsKey.indexOf(key) === -1) {
      console.log(key);
      localStorage.removeItem(key);
    } else {
      counter += 1;
    }
  } while (counter < localStorage.length)
}

async function solve() {
  if (typeof chrome.runtime.id === "undefined")
    return;

  await fetchRules();
  
  try {
    const response = await chrome.runtime.sendMessage({ message: "what is my windowId?" });
    windowId = response.windowId;
    console.log(windowId);
    
    if (isUrlBlocked(document.URL)) {
      addButton();
      handleButtonStateChange();
      setInterval(function() {
        console.log("Periodically running with extension Id is: ");
        handleButtonStateChange();
      }, 1000);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

solve();
console.log("Service.js loaded");

function createAlarm(name) {
  chrome.alarms.create(name, { periodInMinutes: 1 / 60 });
}

function clearAlarm(name) {
  chrome.alarms.clear(name, (wasCleared) => {
    if (wasCleared) {
      console.log("Alarm cleared", name);
    } else {
      console.log("Alarm not cleared, or did not exist.", name);
    }
  });
}

let seconds = 10;
let timerisrunning = false;
const alarmName = "Samay_Extension";

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === alarmName) {
    console.log("Alarm fired");
    seconds--;

    const minutes_left = Math.floor(seconds / 60) + "M";
    chrome.action.setBadgeText({ text: minutes_left });

    if (seconds <= 0) {
      clearAlarm(alarmName);
      createNotification("Time's up! Take a break");
      console.log("Time's up!");
      chrome.contextMenus.update("start-timer", { title: "Start Timer" });
      chrome.action.setBadgeText({ text: "-" });
      chrome.action.setBadgeBackgroundColor({ color: "yellow" });
      timerisrunning = false;
    }
  }
});

function createContextMenus() {
  chrome.contextMenus.create({
    id: "start-timer",
    title: "Start Timer",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: "reset-timer",
    title: "Reset Timer",
    contexts: ["all"],
  });
}

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  switch (info.menuItemId) {
    case "start-timer":
      if (timerisrunning) {
        clearAlarm(alarmName);
        chrome.action.setBadgeText({ text: "S" });
        chrome.action.setBadgeBackgroundColor({ color: "blue" });
        chrome.contextMenus.update("start-timer", { title: "Start Timer" });
        timerisrunning = false;
        createNotification("Timer has stopped");
      } else {
        timerisrunning = true;
        createAlarm(alarmName);
        createNotification("Timer has started");
        chrome.contextMenus.update("start-timer", { title: "Stop Timer" });
      }
      break;

    case "reset-timer":
      seconds = 25 * 60; // Reset to initial time
      clearAlarm(alarmName);
      timerisrunning = false;
      chrome.contextMenus.update("start-timer", { title: "Start Timer" });
      createNotification("Timer has been reset");
      chrome.action.setBadgeText({ text: null }); // Clear badge
      chrome.action.setBadgeBackgroundColor({ color: "red" });
      break;

    default:
      break;
  }
});

function createNotification(message) {
  const options = {
    type: "basic",
    iconUrl: "icons/sandglass-48.png",
    title: "Samay Extension",
    message: message,
  };

  chrome.notifications.create("", options, (notificationId) => {
    console.log(`Notification created with ID: ${notificationId}`);
  });
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install" || details.reason === "update") {
    createContextMenus();
    chrome.action.setBadgeBackgroundColor({ color: "red" });
  }
});

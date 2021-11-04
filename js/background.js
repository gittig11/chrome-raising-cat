/*
  chrome-raising-cat
  author: gittig11
  repository: https://github.com/gittig11/chrome-raising-cat
*/

class Background {
  constructor() {
  }
  onInit() {
    chrome.storage.local.set({
      is_active: true,
      is_mouse_active: true
    });
  }
  initListener() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
      if (message.method == 'callbg') {
      }
      sendResponse('get background')
    }.bind(this));
    chrome.runtime.onInstalled.addListener(function (details) {
      if (details.reason == "install") {
        this.onInit()
      } else if (details.reason == "update") {
        this.onInit()
      }
    }.bind(this))
  }
}
$(function () {
  let bg = new Background();
  bg.initListener();
});

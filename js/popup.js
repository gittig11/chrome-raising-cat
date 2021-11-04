/*
  chrome-raising-cat
  author: gittig11
  repository: https://github.com/gittig11/chrome-raising-cat
*/

class Popup {
  constructor() {
  }
  onInit() {
    chrome.storage.local.get(null, function (items) {
      this.configuration = items;
      this.initBtns();
    }.bind(this));
  }
  initBtns() {
    // 根据configuration配置设置按钮状态
    if (this.configuration.is_active == false) {
      $('#catBox1').removeAttr("checked");
    } else {
      $('#catBox1').attr("checked", "checked");
    }
    if (this.configuration.is_mouse_active == false) {
      $('#catBox2').removeAttr("checked");
    } else {
      $('#catBox2').attr("checked", "checked");
    }
    // 添加按钮事件
    $("#catBox1").on('click', function() {
      this.check()
    }.bind(this));
    $("#catBox2").on('click', function() {
      this.checkMouse()
    }.bind(this));
  }
  checkMouse() {
    if (this.configuration.is_mouse_active == true) {
      this.tabSendMessage('hideCat', 'mouse', false)
    } else {
      this.tabSendMessage('initCat', 'mouse', true)
    }
  }
  check() {
    if (this.configuration.is_active == true) {
      this.tabSendMessage('hide', 'nav', false)
    } else {
      this.tabSendMessage('init', 'nav', true)
    }
  }
  tabSendMessage(status, type, value) {
    if (type === 'mouse') {
      this.configuration.is_mouse_active = value
      chrome.storage.local.set({is_mouse_active: value});
    } else {
      this.configuration.is_active = value
      chrome.storage.local.set({is_active: value});
    }
    // 触发 message
    // chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    //   chrome.tabs.sendMessage(tabs[0].id, {status: status}, function (response) {
    //   }.bind(this));
    // }.bind(this));
  }
}
$(function () {
  let pop = new Popup();
  pop.onInit();
});

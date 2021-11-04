/*
  chrome-raising-cat
  author: gittig11
  repository: https://github.com/gittig11/chrome-raising-cat
*/

class Content {
  constructor() {
    this.timer = null
  }

  onInit() {
    // storage变化时，判断是否显示按钮
    chrome.storage.onChanged.addListener((changes, namespace) => {
      // console.log(changes);
      if (changes.hasOwnProperty('is_mouse_active')) {
        let a = changes['is_mouse_active'].newValue
        if (a) {
          this.onInitCat()
        } else {
          $("#dearCat").remove();
        }
      }
      if (changes.hasOwnProperty('is_active')) {
        let a = changes['is_active'].newValue
        if (a) {
          this.onInitNav()
        } else {
          $("#staticCat").remove();
        }
      }
    });
    // 根据is_active 和 is_mouse_active，判断是否显示按钮
    chrome.storage.local.get(
      null,
      function (items) {
        if (items.is_active == true) {
          this.onInitNav();
        }
        if (items.is_mouse_active == true) {
          this.onInitCat();
        }
      }.bind(this)
    );
    // 监听 message
    // chrome.runtime.onMessage.addListener(
    //   function (request, sender, sendResponse) {
    //     if (request.status == "init") {
    //       this.onInitNav()
    //     } else if (request.status == "hide") {
    //       $("#staticCat").remove();
    //     } else if (request.status == "initCat") {
    //       this.onInitCat()
    //     } else if (request.status == "hideCat") {
    //       $("#dearCat").remove();
    //     }
    //     sendResponse('我收到你的消息了：' + JSON.stringify("request"));
    //   }.bind(this)
    // );

  }

  // 防抖
  _debounce(fn, wait = 500) {
    return function() {
      if(this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(fn, wait);
    }.bind(this)
  }

  onInitNav() {
    chrome.storage.local.set({is_active: true});
    let dom = document.createElement("div");
    dom.setAttribute('id', 'staticCat');
    dom.setAttribute('title', '喵~');
    document.body.appendChild(dom);
    let $staticCat = $('#staticCat')
    $staticCat.css({
      'background': `url(${chrome.extension.getURL("assets/images/1.png")}) center / cover no-repeat`
    })
    $staticCat.hover(function () {
        $staticCat.css({
          'background': `url(${chrome.extension.getURL("assets/images/2.png")}) center / cover no-repeat`
        })
      }, function () {
        $staticCat.css({
          'background': `url(${chrome.extension.getURL("assets/images/1.png")}) center / cover no-repeat`
        })
      })
    $staticCat.on('click', function(){
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    })
  }

  onInitCat() {
    chrome.storage.local.set({is_mouse_active: true});
    let newCat = {
      itemLeft: chrome.extension.getURL("assets/images/cat/cat3.gif"),
      itemLeftMove: chrome.extension.getURL("assets/images/cat/cat3_move.gif"),
      itemRight: chrome.extension.getURL("assets/images/cat/cat3_r.gif"),
      itemRightMove: chrome.extension.getURL("assets/images/cat/cat3_move_r.gif")
    }
    this.createCat('dearCat', newCat);
    $(document).mousemove(function (e) {
      this._debounce(this.initMouse.bind(this, e))()
    }.bind(this))
  }

  createCat(id, item) {
    this.itemLeft = item.itemLeft;
    this.itemLeftMove = item.itemLeftMove;
    this.itemRight = item.itemRight;
    this.itemRightMove = item.itemRightMove;
    this.mousePositionX = 0;
    this.mousePositionY = 0;
    this.movespeed = 2000;
    this.lookRight = false;
    this.lookLeft = false;
    this.freeview = true;
    this.goRight = true;
    let img = document.createElement("img");
    img.setAttribute('src', this.itemRightMove);
    img.setAttribute('id', id);
    img.style.width = '10%';
    img.style.position = 'absolute';
    img.style.display = 'block';
    img.style.top = $(document).scrollTop() + $(window).height() / 2 - $(img).height() / 2 + 'px';
    img.style.left = '0';
    img.style.zIndex = 1000;
    document.body.appendChild(img);
    $('#dearCat').attr({
      "itemLeft": this.itemLeft,
      "itemLeftMove": this.itemLeftMove,
      "itemRight": this.itemRight,
      "itemRightMove": this.itemRightMove,
      "data-lookRight": this.lookRight,
      "data-lookLeft": this.lookLeft,
      "data-freeview": this.freeview,
      "data-movespeed": this.movespeed,
      "data-goRight": this.goRight
    })
      .bind("contextmenu", function (e) {
        return false;
      });
  }

  initMouse(e) {
    if (Math.abs(this.mousePositionX - e.pageX) > 50 || Math.abs(this.mousePositionY - e.pageY) > 50) {
      this.mousePositionX = e.pageX;
      this.mousePositionY = e.pageY;
    } else {
      return;
    }
    let cat = '#dearCat';
    if ($(cat).length) {
      let DOM = $(cat)
      let imageLeft = DOM.offset().left;
      let imageRight = imageLeft + DOM.width();
      let imageTop = DOM.offset().top;
      let imageBottom = imageTop + DOM.height();
      if (DOM.data("freeview")) {
        if (e.pageX > imageRight) {
          if (!DOM.data('lookRight')) {
            DOM.attr('src', DOM.attr('itemRight'));
            DOM.attr('lookRight', true);
            DOM.attr('lookLeft', false);
          }
        } else if (e.pageX < imageLeft) {
          if (!DOM.data('lookLeft')) {
            DOM.attr('src', DOM.attr('itemLeft'));
            DOM.attr('lookRight', false);
            DOM.attr('lookLeft', true);
          }
        }
      }
      let difH = Number(e.pageX) - Number(imageLeft), difV = Number(e.pageY) - Number(imageBottom), speed;
      if (Math.abs(difH) > 200 || Math.abs(difV) > 200) {
        speed = DOM.data('movespeed');
        DOM.stop().animate({left: e.pageX, top: e.pageY}, {
          queue: false,
          duration: speed,
          easing: "swing",
          start: function () {
            DOM.data("freeview", false);
            if (e.pageX > imageLeft) {
              DOM.data('goRight', true)
              if (DOM.attr("src") != DOM.attr('itemRightMove')) {
                DOM.attr("src", DOM.attr('itemRightMove'));
                DOM.attr('lookRight', true);
                DOM.attr('lookLeft', false);
              }
            } else {
              DOM.data('goRight', false)
              if (DOM.attr("src") != DOM.attr('itemLeftMove')) {
                DOM.attr("src", DOM.attr('itemLeftMove'));
                DOM.attr('lookRight', false);
                DOM.attr('lookLeft', true);
              }
            }
          },
          complete: function () {
            DOM.data("freeview", true);
            if (DOM.data('goRight')) {
              DOM.attr('src', DOM.attr('itemRight'));
              DOM.attr('lookRight', true);
            } else {
              DOM.attr('src', DOM.attr('itemLeft'));
              DOM.attr('lookLeft', true);
            }
          }
        });
      }
    }
  }
}
$(function () {
  chrome.runtime.sendMessage({ method: "callbg" }, function (response) {});
  let c = new Content();
  c.onInit();
});

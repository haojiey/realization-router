function miniHashRouter() {
  // 存储hash值与对应回调函数
  this.routes = {};
  // 监听hashchange事件
  window.addEventListener("hashchange", hashChangeCallBack.bind(this));

  function hashChangeCallBack() {
    // 获取当前路由的hash值，上边说过 获取到的值为 '#/login',在这给#截取掉
    const hash = window.location.hash.slice(1) ?? "/";

    // 调用回调函数
    this.routes[hash]();
  }

  this.router = (hash, callback = function () {}) => {
    this.routes[hash] = callback;
  };
}

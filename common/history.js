function miniHistoryRouter() {
  // 存储path值与对应回调函数
  this.routes = {};
  // 监听hashchange事件
  window.addEventListener("popstate", historyChangeCallBack.bind(this));

  function historyChangeCallBack() {
    // 获取当前路由的path值
    const path = window.location.pathname ?? "/";

    // 调用回调函数
    this.routes[path]();
  }

  this.router = (path, callback = function () {}) => {
    this.routes[path] = callback;
  };

  this.replace = (path) => {
    window.history.replaceState(null, null, path);
    historyChangeCallBack.call(this);
  };

  this.push = (path) => {
    window.history.pushState(null, null, path);
    historyChangeCallBack.call(this);
  };
}

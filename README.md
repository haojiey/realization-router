# realization-router

## 前言

1.  什么是路由呢？
1.  前端路由有哪些，都有什么优缺点？
1.  hash路由如何实现？
1.  history路由如何实现？

## 什么是路由

简单来说，路由就是根据url的不同在浏览器窗口中展示相对应的内容。

路由是**后端提出的概念**。那么看看是怎么工作的

1.  浏览器发送不同的url请求
1.  服务器接收到请求后，解析url找到相应的内容
1.  再将内容结果返回给浏览器进行渲染

那么后端控制的路由会造成什么问题呢

1.  在Http请求较多时，那么服务器对文件的读取操作就会变多，便会给服务器造成较大的压力
1.  在切换路由后都需要重新渲染页面，会造成用户体验感不好

这些问题为后续**前端路由**的发展做了铺垫

## 前端路由有哪些，都有什么特性以及优缺点

在当下单页面应用（SPA）非常成熟的环境下，组件的变化与更新不需要再根据url做出变化了，只需要维护组件状态与url之间的对应关系就可以。

### 路由有哪些

-   hash路由
-   history路由

### hash路由

hash路由的形式

```
http://localhost:3000/#/login
```

通过`window.location.hash`可以拿到`#/login`

#### 特性

-   通过`hashchange`可以监听hash值的变化
-   hash值的变化不会引起浏览器向服务端发送请求，所以可以通过监听hash变化给视图渲染不同内容

#### 优点

-   兼容性较好，支持低版本浏览器达到，并兼容到ie8
-   不需要在服务端做任何配置
-   不会发起页面请求

#### 缺点

-   `#` 限制了原本的锚点功能
-   服务端无法准确获取路由信息
-   对搜索引擎不是很友好

### history路由

history路由的形式

```
http://localhost:3000/login
```

#### 特性

-   通过全局事件`popState`监听url变化

history路由基于HTML5引入的一个history API，来看下该API有哪些方法

-   History.length：返回当前可遍历导航项的总体会话历史条目数
-   history.scrollRestoration：返回活动会话历史条目的滚动恢复模式
-   history.state：返回活动会话历史条目的序列化状态，反序列化为JavaScript值
-   history.go ()：在当前可遍历导航项的整体会话历史条目列表中返回或前进指定的步数
-   history.back ()：在当前可遍历导航项的整个会话历史条目列表中返回一步
-   history.forward ()：在当前可遍历导航项的整个会话历史条目列表中向前移动一步。
-   history.pushState(data, "", url)：将一个新条目添加到会话历史中，将其序列化状态设置为数据的序列化，并将其URL设置为URL，第二个参数由于历史原因存在，不能省略可以传递空字符串
-   history.replaceState(data, "", url)：将活动会话历史记录项的序列化状态更新为最新条目，并将其URL更新为URL。

#### 优点

-   服务端可以获取完整url信息
-   写法较为常规符合规范
-   对搜索引擎较为友好

#### 缺点

-   url改变后浏览器会发起请求
-   兼容性达到ie10
-   部署后需要服务端配合解决刷新后404问题

## 实现hash路由

先梳理下hash路由的规范

-   路由形式以`#`为标识
-   通过`hashChange`监听hash值变化
-   hash值变化页面不会发生跳转，可以实现局部更新，会在浏览器历史栈添加一个记录

**test.js**

```
function miniHashRouter() {
  // 存储hash值与对应回调函数
  this.routes = {};
  // 监听hashchange事件
  window.addEventListener("hashchange", hashChangeCallBack.bind(this));
​
  function hashChangeCallBack() {
    
    // 获取当前路由的hash值，上边说过 获取到的值为 '#/login',在这给#截取掉
    const hash = window.location.hash.slice(1) ?? "/";
​
    // 调用回调函数
    this.routes[hash]();
  }
​
  this.router = (hash, callback = function () {}) => {
    this.routes[hash] = callback;
  };
}
```

**html**

```
<body>
    <div style="text-align: center;">
        <a href="#/home">主页</a>
        <a href="#/about">关于我们</a>
​
        <p id="intro">我是主页</p>
    </div>
</body>
​
</html>
<script src="./test.js"></script>
<script>
    const Router = new miniHashRouter()
​
    function changeIntroText(text) {
        document.getElementById('intro').innerText = text;
    }
    
    //添加hash值对应的回调函数
    Router.router('/home', () => changeIntroText('我是主页'))
    Router.router('/about', () => changeIntroText('我是关于我们'))
</script>
```

**那来看看页面效果**


![hash.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2fa92fb7937742c2b3c21344a9f2b808~tplv-k3u1fbpfcp-watermark.image?)

## 实现history路由

梳理下history路由的规范

-   通过`popstate`监听url值变化，可以实现局部更新
-   但是`history.pushState()` 与 `history.replaceState()`不会被监听
-   基于`history API`的几个方法

**test.js**

```
function miniHistoryRouter() {
  // 存储path值与对应回调函数
  this.routes = {};
  // 监听hashchange事件
  window.addEventListener("popstate", historyChangeCallBack.bind(this));
​
  function historyChangeCallBack() {
    // 获取当前路由的path值
    const path = window.location.pathname ?? "/";
​
    // 调用回调函数
    this.routes[path]();
  }
​
  this.router = (path, callback = function () {}) => {
    this.routes[path] = callback;
  };
​
  this.replace = (path) => {
    window.history.replaceState(null, null, path);
    historyChangeCallBack.call(this);
  };
​
  this.push = (path) => {
    window.history.pushState(null, null, path);
    historyChangeCallBack.call(this);
  };
}
```

**html**

```
<body>
    <div style="text-align: center;">
        <div id="box">
            <span style="border-bottom: 1px solid blue;color: blue;" data-url="/home">主页</span>
            <span style="border-bottom: 1px solid blue;color: blue;" data-url="/about">关于我们</span>
        </div>
​
        <p id="intro">我是主页</p>
    </div>
</body>
​
</html>
<script src="./test.js"></script>
<script>
    const Router = new miniHistoryRouter()
​
    document.getElementById('box').addEventListener('click', evt => {
        Router.push(evt.target.dataset.url)
    })
​
    function changeIntroText(text) {
        document.getElementById('intro').innerText = text;
    }
​
    Router.router('/home', () => changeIntroText('我是主页'))
    Router.router('/about', () => changeIntroText('我是关于我们'))
</script>
```

**实现效果**

![history.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ffd39dcc63e847e1bbbb1f8ce8d182aa~tplv-k3u1fbpfcp-watermark.image?)

#host-admin

###快速开始
hosts:
```bash
127.0.01 local.host.com #comment
```

```js
var HostAdmin = require('host-admin');
```
打开hosts文件
```js
//系统hosts文件
var host = HostAdmin();
```
or
```js
//指定文件
var path = '/myHostPath/hosts'
var host = HostAdmin(path);
```
添加一个配置
```js
host.add({
    ip : '127.0.0.1',
    domain : 'local.host.com',
    comment : 'comment'
});
```
写入hosts文件
```js
//系统hosts文件
host.writeFile();
```
or
```js
//指定文件
var path = '/myHostPath/hosts'
host.writeFile(path);
```
hosts:
```bash
127.0.01 local.host.com #comment
```




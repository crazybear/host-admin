hosts-admin
===========

##快速开始
```js
var HostAdmin = require('../host-admin.js');
var host = HostAdmin();
host.add({
    ip : '127.0.0.1',
    domain : 'local.host.com',
    comment : 'comment'
});
host.writeFile();
```
hostsFile
```
127.0.0.1 local.host.com #comment
```





```js
var host = HostAdmin().change({
    ip : '127.0.0.1',
    group : 'js server local',
    comment : 'old comment'
}, {
    ip : '999.999.999.999',
    enable : false,
    comment : 'new comment'
}).change({
    group : 'js server local'
}, {
    name : 'js server'
}).change({
    text : '# Host Database'
}, {
    text : '# Host Database 123'
}).add({
    group : 'js server'
}).add({
    group : 'js server new'
}).writeFile();
```

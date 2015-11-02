host-admin
===========

###快速开始
```js
var HostAdmin = require('host-admin');
var host = HostAdmin();
host.add({
    ip : '127.0.0.1',
    domain : 'local.host.com',
    comment : 'comment'
});
host.writeFile();
```
*hostsFile*
```
127.0.0.1 local.host.com #comment
```


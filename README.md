# Host-admin  


[![NPM Version](http://img.shields.io/npm/v/host-admin.svg?style=flat)](https://www.npmjs.org/package/host-admin)

##快速开始
```js
var HostAdmin = require('host-admin');
var host = HostAdmin();
```

*hosts:*  

```
127.0.0.1 www.admin.com
```  

**打开hosts文件**  

```js
//系统hosts文件
host.readFile();
//or
//指定文件
host.readFile('/myHostPath/hosts');
```  

**添加一个配置**  

```js
host.add({
    ip : '127.0.0.1',
    domain : 'local.host.com',
    comment : 'comment'
});
```  

**写入hosts文件**  

```js
//系统hosts文件
host.writeFile();
//指定文件
var path = '/myHostPath/hosts'
host.writeFile(path);
```  

*hosts:*    

```
127.0.0.1 local.host.com #comment
```


##HostAdmin.OS_HOST 
**系统hosts路径**  

##.readFile([path])
**path default:** *HostAdmin.OS_HOST*  

##.writeFile([path])
**path default:** *HostAdmin.OS_HOST*  

##.add(setOption)  
####添加注释行  
```js
host.add({
	text : '#comment line'
});
```  
*hosts:*    
```
 #comment line
```  
####添加ip  
```js
host.add({
    ip : '127.0.0.1',
    domain : 'local.host.com',
    comment : 'comment'
    enable : false
});
```
*hosts:*    
```
 #127.0.0.1 local.host.com #comment
```  
####添加分组  
```js
host.add({
	group : 'new group'
});
```  
*hosts:*    
```
 #==== new group  
 #====
```   
####组内添加  
*如果分组不存在会自动添加分组*
```js
host.add({
	group : 'new group',
    ip : '127.0.0.1',
    domain : 'local.host.com'
});
```
*hosts:*    
```
 #==== new group  
 127.0.0.1 local.host.com
 #====
```  

##.remove(filter)  
####删除注释行 
*hosts:*    
```
 #comment
 #comment line
```  
 
```js
host.remove({
	text : '#comment line'
});
```  
*hosts:*    
```
 #comment
```  
####删除ip  
*不会删除组内ip*  
*hosts:*  
```
 127.0.0.1 local.host.com
 #==== group
 127.0.0.1 local.host.com
 #====
```  
 
```js
host.remove({
    ip : '127.0.0.1',
    domain : 'local.host.com'
});
```
*hosts:*    
```
 #==== group
 127.0.0.1 local.host.com
 #====
```  
####删除分组  
```js
host.add({
	group : 'new group'
});
```  
####组内删除  
*hosts:*    
```
 127.0.0.1 local.host.com
 #==== group
 127.0.0.1 local.host.com
 #====
```  
```js
host.remove({
	group : 'new group',
    ip : '127.0.0.1',
    domain : 'local.host.com'
});
```  
*hosts:*    
```
 127.0.0.1 local.host.com
 #==== group
 #====
```  
##.change(filter, setOption)
####修改 
*不会改变组内*  
*hosts:*    
```
 127.0.0.1 local.host.com
 #==== group
 127.0.0.1 local.host.com
 #====
```   
*code*
```js
host.change({
    ip : '127.0.0.1',
    domain : 'local.host.com'
}, {
    ip : '8.8.8.8'
})
```
*hosts:*    
```
 8.8.8.8 local.host.com
 #==== group
 127.0.0.1 local.host.com
 #====
```    
####修改组内  
*可以直接设置组名* 
*hosts:*    
```
 127.0.0.1 local.host.com
 #==== group
 127.0.0.1 local.host.com
 #====
```   
*code*
```js
host.change({
    group : 'group',
    ip : '127.0.0.1',
    domain : 'local.host.com'
}, {
    name : 'change name',
    ip : '8.8.8.8'
})
```
*hosts:*    
```
 127.0.0.1 local.host.com
 #==== change name
 8.8.8.8 local.host.com
 #====
```    

## License
MIT license



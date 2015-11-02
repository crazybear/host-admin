var HostAdmin = require('../host-admin.js');

const _HOSTS_DIR = __dirname + '/hosts';
const _HOSTS_DIR_OUT = __dirname + '/hosts-out';
var host = HostAdmin(_HOSTS_DIR).change({
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
    group : 'js server',
    ip : '127.0.0.1',
    domain : 'js.server.new.com',
    comment : '我是js server分组的'
}).add({
    group : 'js server new',
    ip : '127.0.0.1',
    domain : 'js.server.new.com',
    comment : '我是js server new分组并且不可用',
    enable : false
}).add({
    group : 'js server new',
    text : '新加一个js server new分组的注释'
}).remove({
    text : '#新加一个js server new分组的注释'
}).writeFile(_HOSTS_DIR_OUT);


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
    group : 'js server'
}).add({
    group : 'js server new'
}).writeFile(_HOSTS_DIR_OUT);


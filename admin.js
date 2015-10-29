var fs = require('fs');
var os = require('os');
var util = require('util');

const _HOSTS_DIR = __dirname + '/test/hosts';
const _GROUP_FLAG = '#====';
const _BLANK_REG = /\s+/g;
const _IP_REG = /^(#*)((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/;


const HostAdmin = {
    readFile : function(dir){
        return this._formatFile(dir);
    },
    writeFile : function(data, dir){
        var str = this._stringifyData(data);
        fs.writeFileSync(dir, str, 'utf-8');
    },
    _formatFile : function(dir){
        var file = fs.readFileSync(dir, 'utf-8');
        var fileArray = file.split(os.EOL);
        fileArray = this._formatFileArray(fileArray);
        fileArray = this._groupFormatData(fileArray);
        return fileArray;
    },
    _formatFileArray : function(fileArray){
        var _this = this;
        var res = [];
        fileArray.forEach(function(line){
            line = _this._formatLine(line);
            if(util.isArray(line)){
                res = res.concat(line);
            }else{
                res.push(line);
            }
        });
        return res;
    },
    _formatLine : function(line){
        var res;
        line = line.trim();
        line = line.replace(_BLANK_REG,' ');
        line = line.split(' ');
        if(line[0] == _GROUP_FLAG){
            res = {};
            res.type = 'group-flag';
            res.value = line.slice(1).join(' ');
        }else if(_IP_REG.test(line[0])){
            var value = line.shift(),
                enable = (value.indexOf('#') === -1),
                comment = [];
            if(line.length == 0){
                //处理这种情况 #127.0.0.1
                res = {};
                res.type = 'text';
                res.value = value;
            }else{
                res = [];
                if(!enable){
                    value = value.replace(/#*/, '');
                }
                //ip & domain 1 对 1
                line.forEach(function(item){
                    if(/^[^#]/.test(item)){
                        res.push({
                            type : 'ip',
                            value : value,
                            domain : item,
                            enable : enable,
                            comment : comment
                        });
                    }else{
                        comment.push(item.replace(/#/mg, ''));
                    }
                });
            }
        }else{
            res = {};
            res.type = 'text';
            res.value = line.join(' ');
        }
        return res;
    },
    _groupFormatData : function(data){
        var res = [], group = null;
        data.forEach(function(d){
            if(d.type == 'text'){
                res.push(d);
            }else if(d.type == 'group-flag'){
                if(group){
                    res.push(group);
                    group = null;
                }else if(d.value){
                    group = {
                        type : 'group',
                        name : d.value,
                        value : []
                    }
                }
            }else if(group){
                //组内
                group.value.push(d);
            }else{
                //组外
                res.push(d);
            }
        });
        group = null;
        return res;
    },
    _stringifyData : function(data){
        var res = [], _this = this;
        data.forEach(function(d){
            var str = '';
            if(d.type == 'text'){
                res.push(d.value);
            }else if(d.type == 'group'){
                res.push(_GROUP_FLAG + ' ' + d.name);
                res.push(_this._stringifyData(d.value));
                res.push(_GROUP_FLAG);
            }else if(d.type = 'ip'){
                if(!d.enable){
                    str += '#';
                }
                str += d.value;
                str += ' ';
                str += d.domain;
                if(d.comment.length > 0){
                    str += ' #';
                }
                d.comment.forEach(function(comment, e){
                    str += comment;
                    if(e != d.comment.length){
                        str += ' ';
                    }
                });
                res.push(str);
            }
        });
        return res.join(os.EOL);
    }
}


var hostData = HostAdmin.readFile(_HOSTS_DIR);
HostAdmin.writeFile(hostData, _HOSTS_DIR + '-out');

module.exports = HostAdmin;


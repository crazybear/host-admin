var fs = require('fs');
var os = require('os');

const _HOSTS_DIR = __dirname + '/test/hosts';
const _GROUP_FLAG = '#====';
const _BLANK_REG = /\s+/g;
const _IP_REG = /^(#*)((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/;

function HostAdmin(){
    this.fileArray = [];
}

HostAdmin.prototype = {
    constructor : HostAdmin,
    loadFile : function(dir){
        this.fileArray = this._formatFile(dir);
        return this;
    },
    _formatFile : function(dir){
        var _this = this;
        var file = fs.readFileSync(dir, 'utf-8');
        var fileArray = file.split(os.EOL);
        fileArray.forEach(function(line, e){
            fileArray[e] = _this._formatLine(line);
        });
        return fileArray;
    },
    _formatLine : function(line){
        var res = {};
        line = line.trim();
        line = line.replace(_BLANK_REG,' ');
        line = line.split(' ');
        if(line[0] == _GROUP_FLAG){
            res.type = 'group';
            res.value = line.slice(1).join(' ');
        }else if(_IP_REG.test(line[0])){
            res.type = 'ip';
            res.value = line[0].replace(/#/mg, '');
            res.enable = (line[0].indexOf('#') === -1);
            res.domain = [];
            res.comment = [];
            line.shift();
            line.forEach(function(item){
                if(/^[^#]/.test(item)){
                    res.domain.push(item);
                }else{
                    res.comment.push(item.replace(/#/mg, ''));
                }
            });
        }else{
            res.type = 'text';
            res.value = line.join(' ');
        }
        console.log(res);
        return res;
    }
}

var hostAdmin = new HostAdmin();

hostAdmin.loadFile(_HOSTS_DIR);

module.exports = HostAdmin;


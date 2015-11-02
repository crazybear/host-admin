const fs = require('fs');
const os = require('os');
const clone = require('clone');
const _BLANK_REG = /\s+/g;
const _GROUP_FLAG = '#====';
const _IP_REG = /^(#*)((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))$/;
const _IP_REPLACE_REG = /^#(\s)((1?\d?\d|(2([0-4]\d|5[0-5])))\.){3}(1?\d?\d|(2([0-4]\d|5[0-5])))/;
const _OS_HOSTS_DIR = os.platform() == 'win32' ? 'C:/Windows/System32/drivers/etc/hosts': '/etc/hosts';

var HostAdmin = function(o){
    this._dataCache = [];
    return this.readFile(o);
};
HostAdmin.prototype = {
    constructor : HostAdmin,
    /**
     * 格式化一个文件
     * @param dir {String} host文件地址
     * @return {HostAdmin}
     * */
    readFile : function(dir){
        dir = dir || _OS_HOSTS_DIR;
        var file = fs.readFileSync(dir, 'utf-8');
        this.formatFile(file);
        return this;
    },
    /**
     * 写文件
     * @param dir {String} host文件地址
     * @return {HostAdmin}
     * */
    writeFile : function(dir){
        dir = dir || _HOSTS_DIR;
        var str = this._stringifyData(this._dataCache);
        fs.writeFileSync(dir, str, 'utf-8');
        return this;
    },
    /**
     * 格式化文件转为json
     * @param file {String} host文件内容
     * @return {HostAdmin}
     * */
    formatFile : function(file){
        file = file.split(os.EOL);
        file = this._formatFileArray(file);
        file = this._groupFormatData(file);
        this._dataCache = file;
        return this;
    },
    /**
     * 添加
     * @param setOption {Object} 配置
     * @return {HostAdmin}
     * */
    add : function(setOption){
        var addData = {}, hasGroup = [];
        if(setOption.ip != undefined){
            addData = {
                type : 'ip',
                ip : setOption.ip,
                domain : setOption.domain,
                comment : setOption.comment,
                enable : (setOption.enable != undefined) ? setOption.enable : true,
                parent : 'root'
            }
        }else if(setOption.text != undefined){
            addData = {
                type : 'text',
                text  : /^#/.test(setOption.text) ? setOption.text : '#' + setOption.text,
                parent : 'root'
            }
        }
        if(setOption.group != undefined){
            //add a group
            hasGroup = this._groupFilter(setOption);
            //if it hasn't the group
            if(hasGroup.length == 0){
                this._dataCache.push({
                    type : 'group',
                    name : setOption.group,
                    value : [],
                    parent : 'root'
                });
            }
            hasGroup = this._groupFilter(setOption);
            addData.parent = setOption.group
        }
        if(hasGroup.length > 0){
            hasGroup.forEach(function(item){
                item.value.push(addData);
            });
        }else{
            this._dataCache.push(addData);
        }
        return this;
    },
    /**
     * 删除
     * @param setOption {Object} 配置
     * @return {HostAdmin}
     * */
    remove : function(filter){
        var filterKeys = Object.keys(filter), removeData = [], groupData = [], _this = this;
        if(filterKeys.length == 0){
            //clear all
            this._dataCache.length = 0;
        }else if(filterKeys.length == 1 && filterKeys[0] == 'group'){
            //remove group
            removeData = this._groupFilter(filter);
            removeData.forEach(function(item){
                var index = _this._dataCache.indexOf(item);
                _this._dataCache.splice(index, 1);
            });
        }else{
            if(filter.group == undefined){
                filter.group = 'root';
            }
            if(filter.ip !== undefined){
                filter.type = 'ip'
            }else if(filter.text !== undefined){
                filter.type = 'text'
            }
            removeData =  this._filter(filter);
            if(filter.group != 'root'){
                groupData = this._groupFilter(filter);
            }else{
                groupData.push({value : this._dataCache});
            }
            groupData.forEach(function(group){
                removeData.forEach(function(item){
                    var index = group.value.indexOf(item);
                    if(index != -1){
                        group.value.splice(index, 1);
                    }
                });
            });
        }

        return this;
    },
    /**
     * 修改
     * @param filter {Object} 过滤器
     * @param setOption {Object} 配置
     * @return {HostAdmin}
     * */
    change : function(filter, setOption){
        if(filter.group && setOption.name){
            //change group name
            this._groupFilter(filter, function(){
                setOption.name && (this.name = setOption.name);
            });
        }
        this._filter(filter, function(){
            if(this.type == 'ip'){
                setOption.ip && (this.ip = setOption.ip);
                setOption.domain && (this.domain = setOption.domain);
                setOption.comment && (this.comment = setOption.comment);
                (setOption.enable != undefined) && (this.enable = setOption.enable);
            }else{
                setOption.text && (this.text = setOption.text);
            }
        });
        return this;
    },
    /**
     * 遍历每一个节点
     * @param callback {Function}
     * @return {HostAdmin}
     * */
    each : function(callback, data){
        data = data || this._dataCache;
        var _this = this, i = 0, flag = true;
        for(i; i < data.length; i++){
            if(data[i].type == 'group'){
                flag = _this.each(callback, data[i].value);
            }else{
                flag = callback.call(data[i], data[i]);
            }
            if(flag == false){
                break;
            }
        }
        return flag;
    },
    /**
     * 遍历每一个组
     * @param callback {Function}
     * @return {HostAdmin}
     * */
    eachGroup : function(callback, data){
        var i = 0, data = data || this._dataCache, flag = true;
        for(i; i < data.length; i++){
            if(data[i].type == 'group'){
                flag = callback.call(data[i], data[i]);
                if(flag == false){
                    break;
                }
            }
        }
        return this;
    },
    /**
     * 过滤器
     * @param rule {Object} 过滤规则
     * @param callback {Function}
     * @return {Array}
     * */
    _filter : function(rule, callback){
        var res = [];
        callback = callback || function(){};
        this.each(function(item){
            var pass = true;
            if(pass && rule.group != undefined){
                pass = rule.group == item.parent;
            }
            if(pass && rule.type != undefined){
                pass = rule.type == item.type;
            }
            if(item.type == 'ip'){
                if(pass && rule.ip != undefined){
                    pass = rule.ip == item.ip;
                }
                if(pass && rule.domain != undefined){
                    pass = rule.domain == item.domain;
                }
                if(pass && rule.enable != undefined){
                    pass = rule.enable == item.enable;
                }
                if(pass && rule.comment != undefined){
                    pass = rule.comment == item.comment;
                }
            }else if(item.type == 'text'){
                if(pass && rule.text != undefined){
                    pass = rule.text == item.text;
                }
            }
            if(pass){
                callback.call(item, item);
                res.push(item);
            }
        });
        return res;
    },
    /**
     * 组过滤器
     * @param rule {Object} 过滤规则
     * @param callback {Function}
     * @return {Array}
     * */
    _groupFilter : function(rule, callback){
        var res = [];
        callback = callback || function(){};
        this.eachGroup(function(item){
            if(rule.group == item.name){
                callback.call(item, item);
                res.push(item);
            }
        });
        return res;
    },
    /**
     * 复制
     * @param callback {Function}
     * @return {Array}
     * */
    clone : function(callback){
        callback = callback || function(){};
        var res = [], _this = this, obj = null, callbackReturn;
        this._dataCache.forEach(function(item){
            if(item.type == 'group'){
                res.push({
                    type : item.type,
                    value : _this._map(item.value, callback),
                    parent : item.parent,
                    name : item.name
                });
            }else{
                obj = clone(item);
                callbackReturn = callback.call(obj, obj, item);
                if(callbackReturn != false){
                    res.push(obj);
                }
                obj = null;
            }
        });
        res = new HostAdmin()._loadJSON(res);
        return res;
    },
    _formatFileArray : function(fileArray){
        var _this = this;
        var res = [];
        fileArray.forEach(function(line){
            line = _this._formatLine(line);
            if(Array.isArray(line)){
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
        //#  10.10.69.62 domain => #10.10.69.62 domain
        line = line.replace(_IP_REPLACE_REG, function(e){
            return e.replace(_BLANK_REG, '');
        });
        line = line.split(' ');
        if(line[0] == _GROUP_FLAG){
            res = {parent : 'root'};
            res.type = 'group-flag';
            res.value = line.slice(1).join(' ');
        }else if(_IP_REG.test(line[0])){
            var value = line.shift(),
                enable = (value.indexOf('#') === -1),
                comment = [],
                commentStart = false;
            if(line.length == 0){
                //处理这种情况 #127.0.0.1
                res = {parent : 'root'};
                res.type = 'text';
                res.text = value;
            }else{
                res = [];
                if(!enable){
                    value = value.replace(/#*/, '');
                }
                //ip & domain 1 对 1
                line.forEach(function(item){
                    if(/^[^#]/.test(item) && !commentStart){
                        res.push({
                            type : 'ip',
                            ip : value,
                            domain : item,
                            enable : enable,
                            parent : 'root'
                        });
                    }else{
                        commentStart = true;
                        comment.push(item.replace(/^#/, ''));
                    }
                });
                if(comment.length > 0){
                    res.forEach(function(item){
                        item.comment = comment.join(' ');
                    });
                }
            }
        }else{
            res = {parent : 'root'};
            res.type = 'text';
            res.text = line.join(' ');
        }
        return res;
    },
    _groupFormatData : function(data){
        var res = [], group = null, _this = this;
        data.forEach(function(d){
            if(d.type == 'text'){
                if(group){
                    d.parent = group.name;
                    group.value.push(d);
                }else{
                    res.push(d);
                }
            }else if(d.type == 'group-flag'){
                if(group){
                    res.push(group);
                    group = null;
                }else if(d.value){
                    group = {
                        type : 'group',
                        name : d.value,
                        value : [],
                        parent : d.parent
                    }
                }
            }else if(group){
                //组内
                d.parent = group.name;
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
                res.push(d.text);
            }else if(d.type == 'group'){
                res.push(_GROUP_FLAG + ' ' + d.name);
                res.push(_this._stringifyData(d.value));
                res.push(_GROUP_FLAG);
            }else if(d.type = 'ip'){
                if(!d.enable){
                    str += '#';
                }
                str += d.ip;
                str += ' ';
                str += d.domain;
                if(d.comment){
                    str += ' #' + d.comment;
                }
                res.push(str);
            }
        });
        return res.join(os.EOL);
    }
};
const API = module.exports = function(o){
    return new HostAdmin(o);
};
API.OS_HOST = _OS_HOSTS_DIR;
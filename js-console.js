import FileSaver from 'file-saver';

const logs = [];

const win = window || {};

function store(args, type) {
    
    JSConsole.enable && console[type](...args);
    let time = new Date().getTime();
    args.forEach(item=>{
        try {
            item && logs.push({type, item, time});
        } catch (error) {
            console.warn('Unable to store the logs %s', type, error, ...args);
            console.warn('removing the first item %O in the logs to make room for new log!', logs.shift());
            item && logs.push({type, item, time});
        }
    });
}

win.printP3Logs = () => {
    logs.forEach(log=>{
        console[log.type]('['+log.type+']['+log.time+']', log.item);
    });
}

export class JSConsole {
    static enable = true;

    static trace(...args) {
        store(args, 'trace');
    }

    static log(...args) {
        store(args, 'log');
    }

    static error(...args) {
        store(args, 'error');
    }

    static info(...args) {
        store(args, 'info');
    }

    static warn(...args) {
        store(args, 'warn');
    }

    static group(...args) {
        JSConsole.enable && console.group && console.group(...args);
    }

    static groupEnd() {
        JSConsole.enable && console.groupEnd();
    }

    static exportLog() {
        function parseLogItem(item) {
            if(typeof(item) === "string") {
                return item;
            } else {
                item = JSON.stringify(item);
                return item;
            }
        }
        function sizeCol(str, size) {
            if(str.length < size) {
                str += " ".repeat(size - str.length);
            }
            return str;
        }
        let data = 'Type \tTime Stamp     \tLog Infomation';
        
        logs.forEach(log=>{
            if(log.item) {
                data += '\n' + sizeCol(log.type, 5)+'\t'+log.time+'\t'+parseLogItem(log.item);
            }
        });
        let blob = new Blob([data], {type: "text/plain;charset=utf-8"});
        let fileName = 'p3-plugin-ui-web-console-logs-' + (new Date().getTime() / 1000) + '.log';
        FileSaver.saveAs(blob, fileName);
    }
}

export default JSConsole;
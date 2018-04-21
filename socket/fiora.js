const IO = require('socket.io-client');

class Fiora {
    constructor() {
        this.name = 'fiora';
        this.listers = {};
        this.socket = new IO('https://fiora.suisuijiang.com', {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        'origin': 'https://fiora.suisuijiang.com',
                        'host': 'fiora.suisuijiang.com',
                        'referer': 'https://fiora.suisuijiang.com/'
                    }
                }
            }
        });

        this.log('开始监听事件');
        this.socket.on('connect', socket => {
            this.log('connect');
            this.login('robot10', '421we2fgv34897');
        });
        this.socket.on('disconnect', () => {
            this.log('disconnect');
        });
        this.socket.on('message', (message) => {
            if (this.listers[message.to]) {
                this.listers[message.to](message);
            }
        });
    }
    log(...args) {
        console.log(this.name, ...args);
    }
    login(username, password) {
        return new Promise((resolve, reject) => {
            this.socket.emit(
                'login',
                {
                    username,
                    password
                },
                (res) => {
                    if (typeof res === 'string') {
                        this.log('error', res);
                        reject(res);
                        return;
                    }
                    this.log('登录成功')
                    resolve(res);
                }
            );
        });
    }
    send(to, type, content) {
        return new Promise((resolve, reject) => {
            const types = ['text', 'image', 'code', 'url'];
            if (types.indexOf(type) === -1) {
                return reject('不支持的消息类型');
            }
            if (type === 'image' && !/width=[0-9]+&height=[0-9]+/.test(content)) {
                return reject('图片消息需要在链接中带上高度和宽度');
            }
            this.socket.emit(
                'sendMessage',
                {
                    to,
                    type,
                    content,
                },
                res => {
                    if (typeof res === 'string') {
                        this.log('error', res);
                        reject(res);
                        return;
                    }
                    this.log('发送消息成功')
                    resolve(res);
                }
            );
        });
    }
    listen(linkmanId, cb) {
        this.listers[linkmanId] = cb;
        return this;
    }
}
module.exports = Fiora;

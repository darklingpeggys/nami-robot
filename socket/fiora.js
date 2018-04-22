const IO = require('socket.io-client');

const groups = {
    nami: '5adb43c154063970de326fcd'
    fiora: '5adacdcfa109ce59da3e83d3'
}

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
        this.socket.on('connect', async socket => {
            this.log('connect');
            // 连接后就可以开始登陆, 将在该连接中一直保持登陆态
            await this.login('robot10', '421we2fgv34897');

            // await this.send(groups.nami, 'code', JSON.stringify({
            //     avatar: 'https://cdn.suisuijiang.com/fiora/avatar/13.jpg',
            //     username: 'nami - 测试联系人',
            //     type: 'text',
            //     content: '测试消息'
            // }));
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
    /**
     * 日志
     */
    log(...args) {
        console.log(this.name, ...args);
    }
    /**
     * 登录
     * @param {String} username 用户名
     * @param {String} password 密码
     */
    login(username, password) {
        return new Promise((resolve, reject) => {
            this.socket.emit(
                'login',
                {
                    username,
                    password,
                },
                (res) => {
                    if (typeof res === 'string') {
                        this.log('登录失败', res);
                        reject(res);
                        return;
                    }
                    this.log('登录成功')
                    resolve(res);
                }
            );
        });
    }
    /**
     * 发送消息
     * @param {String} to 群组id
     * @param {String} type 消息类型 ['text', 'image', 'code', 'url']
     * @param {String} content 消息内容, image消息需要链接上有width和height, code消息需要再开头用"@[编程语言]@"标明语言
     */
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
                        this.log('发送消息失败', res);
                        reject(res);
                        return;
                    }
                    this.log('发送消息成功')
                    resolve(res);
                }
            );
        });
    }
    /**
     * 
     * @param {String} groupName 群组名
     * @param {Function} cb 回调
     */
    listen(groupName, cb) {
        const groupId = groups[groupName);]
        this.listers[groupId] = cb;
        return this;
    }
}
module.exports = Fiora;

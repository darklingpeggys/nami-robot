const io = require('socket.io-client');
const Observable = require('../utils/Observable');

class NAMI {
    constructor() {
        Observable(this);
        this.user = {};
        this.room = {
            nami: '593292a601d3b75ae98a7541'
        };
        this.init();
    }
    init() {
        let disconnectCount = 0;
        this.socket = io('http://mdzzapp.com:3002');
        this.socket.on('newMessage', message => {
            console.log('new message(nami): ', message.content);
            this.emit('newMessage', message);
        });
        this.socket.on('privateMessage', message => {
            console.log('new private message(nami): ', message.content);
        });
        this.socket.on('disconnect', () => {
            console.log('disconnect(nami)');
            this.emit('disconnect');
        });
        this.socket.on('reconnecting', () => {
            disconnectCount++;
            console.log('reconnect count(nami): ', disconnectCount);
        });
        this.socket.on('reconnect', () => {
            console.log('reconnect success(nami)');
            disconnectCount = 0;
            this.login(this.user.email, this.user.password);
        });
    }
    getToken(email, password) {
        this.user.email = email;
        this.user.password = password;
        return new Promise((resolve, reject) => {
            this.socket.emit('login', { email, password }, ret => {
                this.user.token = ret.token;
                resolve(ret);
            });
        });
    }
    getUserInfo() {
        return new Promise(resolve => {
            this.socket.emit('getUserInfo', { token: this.user.token }, ret => {
                Object.assign(this.user, ret);
                resolve(ret);
            });
        });
    }
    getRoomList() {
        return new Promise((resolve, reject) => {
            this.socket.emit('initRoomList', { token: this.user.token }, ret => {
                resolve(ret);
            });
        });
    }
    login(email = 'robot', password = 'robot') {
        return this.getToken(email, password)
            .then(() => this.getUserInfo())
            .then(() => this.getRoomList());
    }
    // http://nami.mdzzapp.com/invite/
    join(inviteLink = 'eY6Zs-GfecZkIL5r5PYc') {
        return new Promise((resolve, reject) => {
            this.socket.emit(
                'joinRoom',
                {
                    inviteLink,
                    user: this.user._id
                },
                ret => {
                    console.log('join room(nami): ', ret);
                    resolve(ret);
                }
            );
        });
    }
    listen(room, cb) {
        this.on('newMessage', message => {
            if (message.room === room) {
                typeof cb === 'function' && cb(message);
            }
        });
    }
    sendMessage(room, type, content) {
        return new Promise((resolve, reject) => {
            this.socket.emit(
                'message',
                {
                    content,
                    type,
                    room,
                    token: this.user.token
                },
                ret => {
                    resolve(ret);
                }
            );
        });
    }
}
module.exports = NAMI;

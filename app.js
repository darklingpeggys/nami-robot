// socket
const requestImageSize = require('request-image-size');
const Fiora = require('./socket/fiora.js');
const NAMI = require('./socket/nami.js');
const fiora = new Fiora();
const nami = new NAMI();

async function getFioraContent(message) {
    if (message.type === 'file') {
        console.log(message);
        throw Error('不需要处理的消息');
    }
    if (message.type === 'image') {
        const size = await requestImageSize(message.content);
        message.content = `${message.content}?width=${size.width}&height=${size.height}`;
    }
    return JSON.stringify({
        source: 'nami',
        avatar: message.owner.avatar,
        username: message.owner.nickname,
        type: message.type,
        content: message.content,
    });
}

function getNamiContent(message) {
    if (message.from.avatar.startsWith('//')) {
        message.from.avatar = 'https:' + message.from.avatar;
    }
    return JSON.stringify({
        source: 'nami',
        content: message.content,
        avatar: message.from.avatar,
        name: message.from.username
    });
}

nami.login('robot10', '421we2fgv34897').then(ret => {
    console.log('success(nami)');
    nami.join();
    nami.listen('593292a601d3b75ae98a7541', async message => {
        console.log('收到nami聊天室的nami群消息: ');
        const fioraMessage = await getFioraContent(message);
        fiora.send('nami', 'code', fioraMessage);
    });
    nami.listen('59db460c4528507d9baf6485', async message => {
        console.log('收到nami聊天室的fiora群消息: ');
        const fioraMessage = await getFioraContent(message);
        fiora.send('fiora', 'code', fioraMessage);
    });
});

fiora.listen('nami', message => { // nami
    console.log('收到fiora聊天室的nami群消息: ');
    if (message.type === 'code') {
        console.log('不需要处理的消息');
        return;
    }
    if (message.type === 'url') {
        message.type = 'text';
    }
    nami.sendMessage('593292a601d3b75ae98a7541', message.type, getNamiContent(message));
}).listen('fiora', message => { // fiora
    console.log('收到fiora聊天室的fiora群消息: ');
    if (message.type === 'code') {
        console.log('不需要处理的消息');
        return;
    }
    if (message.type === 'url') {
        message.type = 'text';
    }
    nami.sendMessage('59db460c4528507d9baf6485', message.type, getNamiContent(message));
});

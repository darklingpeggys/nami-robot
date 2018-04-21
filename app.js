// socket
const Fiora = require('./socket/fiora.js');
const NAMI = require('./socket/nami.js');
const fiora = new Fiora();
const nami = new NAMI();

function getFioraContent(message) {
    return JSON.stringify({
        source: 'nami',
        content: message.content,
        avatar: message.owner.avatar,
        name: message.owner.nickname
    });
}

function getNamiContent(message) {
    return JSON.stringify({
        source: 'nami',
        content: message.content,
        avatar: message.avatar,
        name: message.name
    });
}

nami.login('robot10', '421we2fgv34897').then(ret => {
    console.log('success(nami)');
    nami.join();
    nami.listen('593292a601d3b75ae98a7541', message => {
        console.log('nami 的 nami 消息: ', message);
        // fiora.send('cr', message.type, getFioraContent(message));
    });
    nami.listen('59db460c4528507d9baf6485', message => {
        console.log('nami 的 fiora 消息: ', message);
        // fiora.send('fiora', message.type, getFioraContent(message));
    });
});

fiora.listen('5adb43c154063970de326fcd', message => { // nami
    console.log('fiora 的 nami 消息');
}).listen('5adacdcfa109ce59da3e83d3', message => { // fiora
    console.log('fiora 的 fiora 消息');
});

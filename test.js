const requestImageSize = require('request-image-size');
 
requestImageSize('http://oj7h98lzb.bkt.clouddn.com/upload_599d58b8fd7707218dd7082bd32f1182.png?imageView2/1/w/250/h/169/interlace/1/q/100&width=250&height=169')
.then(size => console.log(size))
.catch(err => console.error(err));
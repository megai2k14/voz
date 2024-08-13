// ==UserScript==
// @name         Fix ảnh lỗi
// @namespace    idmresettrial
// @version      2024.08.13.01
// @description  như tên
// @author       You
// @match        https://voz.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

const CACHE_SIZE = 1000;
const CACHE_TIME = 3600000;

const AVATARS = [
    'background-image: linear-gradient(to right bottom, #264653, #3f557c, #835a91, #c6597f, #e76f51); color: #f1faee;',
    'background-image: url(https://cdn.save.moe/e/WP3q8B.jpeg); background-size: cover; color: #0000;',
    'background-image: url(https://cdn.save.moe/e/WP22oQ.jpeg); background-size: cover; color: #0000;',
    'background-image: url(https://cdn.save.moe/c/B4ark.md.jpeg); background-size: cover; color: #0000;',
    'background-image: url(https://cdn.save.moe/e/WPxFIv.md.jpeg); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/FTmMQRf.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/I93utGv.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/AkFC8my.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/TnWWxTz.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/7fuutlQ.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/XbE83wP.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/zh2F4du.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/sTlMHE6.png); background-size: cover; color: #0000;',
    'background-image: url(https://i.imgur.com/Lkrrrbj.png); background-size: cover; color: #0000;',
].map((element, index) => `.avatar.avatar--broken-${index} {${element}}`);
GM_addStyle(AVATARS.join(' '));

GM_addStyle('.unproxied-image {border-radius: 10px;}');

function getImgClass(img) {
    const supportedClasses = ['smilie', 'reaction-image', 'avatar'];
    const imgClass = [...img.classList].find(c => supportedClasses.includes(c))
                  || [...img.parentElement.classList].find(c => supportedClasses.includes(c));

    if (img.tagName == 'IMG' && supportedClasses.includes(imgClass)) {
        return imgClass;
    }
    return undefined;
}

function replaceBrokenAvatar(img) {
    const styleClass = 'avatar--broken-' + (img.parentElement.dataset.userId % AVATARS.length);
    const parent = img.parentElement;
    parent.classList.add('avatar--default', 'avatar--default--dynamic', styleClass);

    const newAvatar = document.createElement('span');
    Object.assign(newAvatar, {
        'className': img.className,
        'role': 'img',
        'ariaLabel': img.alt,
        'innerHTML': img.getAttribute('alt').substring(0,1)
    });
    img.replaceWith(newAvatar);
}

function imgErrorHandler(event) {
    let img = event.target;
    const imgClass = getImgClass(img);

    if (imgClass == 'avatar') {
        const userId = img.parentElement.dataset.userId;
        const currentSize = img.currentSrc.match(/\/avatars\/(.+?)\//)?.[1];
        if (!currentSize) {
            replaceBrokenAvatar(img);
            return;
        }

        let brokenSrcs = cachedData.getBrokenSrcs(userId) || [];
        if (!brokenSrcs.includes(currentSize)) {
            brokenSrcs.push(currentSize);
        }
        cachedData.setBrokenSrcs(userId, brokenSrcs);
        let srcSet = ['s', 'm', 'l', 'h', 'o'];
        // sort to get the best quality
        const currentSizeIndex = srcSet.indexOf(currentSize);
        if (currentSizeIndex > 0) {
            srcSet = [...srcSet.slice(currentSizeIndex, srcSet.length), ...srcSet.slice(0, currentSizeIndex).reverse()];
        }

        const newSize = srcSet.find(size => !brokenSrcs.includes(size)) || 'null';
        if (srcSet.includes(newSize)) {
            img.src = img.src.replaceAll(`/avatars/${currentSize}/`, `/avatars/${newSize}/`);
            img.srcset = img.srcset.replaceAll(`/avatars/${currentSize}/`, `/avatars/${newSize}/`);
        } else {
            replaceBrokenAvatar(img);
        }
    } else if (imgClass == 'smilie' || imgClass == 'reaction-image') {
        for (const attr of ['src', 'srcset']) {
            const newValue = img[attr].replaceAll('statics.voz.tech','voz.vn')
            .replaceAll('https://data.voz.vn/', 'https://web.archive.org/web/20240101120919if_/https://data.voz.vn/');
            if (newValue != img[attr]) {
                img[attr] = newValue;
            }
        }
    }
}

let cachedData = {
    data: (function() {
        const data = GM_getValue('cachedData', []);
        return Array.isArray(data)? data : [];
    })(),
    getBrokenSrcs: function(userId) {
        const index = this.data.findIndex(record => record.userId == userId);
        if (index > -1 && this.data[index].expires > Date.now()) {
            return this.data[index].brokenSrcs;
        } else if (index > -1 && this.data[index].expires <= Date.now()) {
            this.data.slice(index);
        }
        return undefined;
    },
    setBrokenSrcs: function(userId, brokenSrcs) {
        const index = this.data.findIndex(record => record.userId == userId);
        const currentBrokenSrcs = index > -1 ? this.data.splice(index, 1)[0].brokenSrcs : [];
        const newBrokenSrcs = [...new Set([...brokenSrcs, ...currentBrokenSrcs])];
        this.data.push({'userId': userId, 'brokenSrcs': newBrokenSrcs, 'expires': Date.now() + CACHE_TIME});
    },
    save: function() {
        if (!Array.isArray(this.data)) {
            this.data = [];
        }
        GM_setValue('cachedData', this.data.slice(-CACHE_SIZE));
    },
    flush: function() {
        if (Date.now() - GM_getValue('lastFlush', 0) > 86400000) {
            let expires = [];
            for (let i = 0; i < Math.min(this.data.length, 100); i++) {
                if (Date.now() > this.data[i].expires) {
                    expires.unshift(i);
                }
            }
            expires.forEach(i => this.data.splice(i, 1));
            GM_setValue('lastFlush', Date.now());
        }
    }
};

// save cached data
window.addEventListener("beforeunload", function() {
    cachedData.flush();
    cachedData.save();
});

window.addEventListener('error', imgErrorHandler, true);
// broken proxy
document.addEventListener('load', function(event) {
    const img = event.target;
    if (img.tagName != 'IMG' || img.classList.contains('unproxied-image') || img.src.indexOf('https://voz.vn/proxy.php') == -1 || img.naturalWidth > 200) {
        return;
    }
    img.parentElement.dataset.src = img.dataset.url;
    Object.assign(img, {
        'src': img.dataset.url,
        'className': img.className + ' unproxied-image'
    });
}, true);

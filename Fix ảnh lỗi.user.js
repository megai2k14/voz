// ==UserScript==
// @name         Fix ảnh lỗi
// @namespace    idmresettrial
// @version      2024.06.18.01
// @description  như tên
// @author       You
// @match        https://voz.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

const CACHE_SIZE = 100;
const CACHE_TIME = 43200;

GM_addStyle(`
  .avatar.avatar--broken {
      background-image: linear-gradient(to right bottom, #264653, #3f557c, #835a91, #c6597f, #e76f51); color: #f1faee;
  }
`);

function getImgClass(img) {
    const supportedClasses = ['smilie', 'reaction-image', 'avatar'];
    const imgClass = [...img.classList].find(c => supportedClasses.includes(c))
                  || [...img.parentElement.classList].find(c => supportedClasses.includes(c));

    if (img.tagName == 'IMG' && supportedClasses.includes(imgClass)) {
        return imgClass;
    }
    return undefined;
}

function replaceBrokenAvatar(el) {
    let parent = el.parentElement;
    parent.classList.add('avatar--default', 'avatar--default--dynamic', 'avatar--broken');

    let newAvatar = document.createElement('span');
    newAvatar.class = el.getAttribute('class');
    newAvatar.role = 'img';
    newAvatar['aria-label'] = el.alt;
    newAvatar.innerHTML = el.getAttribute('alt').substring(0,1);
    el.replaceWith(newAvatar);
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
    }
};

// save cached data
window.addEventListener("beforeunload", function() {
    cachedData.save();
});

window.addEventListener('error', imgErrorHandler, true);

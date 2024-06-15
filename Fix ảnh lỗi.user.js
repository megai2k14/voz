// ==UserScript==
// @name         Fix ảnh lỗi
// @namespace    idmresettrial
// @version      2024.06.15.02
// @description  như tên
// @author       You
// @match        https://voz.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function replaceBrokenAvatar(el) {
        let parent = el.parentElement;
        parent.classList.add('avatar--default', 'avatar--default--dynamic');
        parent.setAttribute('style', 'background-image: linear-gradient(to right bottom, #264653, #3f557c, #835a91, #c6597f, #e76f51); color: #f1faee');
        parent.innerHTML = `<span class="${el.getAttribute('class')}" role="img" aria-label="${el.getAttribute('alt')}">${el.getAttribute('alt').substring(0,1)}</span>`;
    }

    function imgErrorHandler(event) {
        let img = event.target;
        const supportedClasses = ['smilie', 'reaction-image', 'avatar'];
        const imgClass = [...img.classList].find(c => supportedClasses.includes(c))
                      || [...img.classList].find(c => supportedClasses.includes(c))
                      || [...img.parentElement.classList].find(c => supportedClasses.includes(c));

        if (img.tagName != 'IMG' || !supportedClasses.includes(imgClass)) {
            return;
        }

        if (imgClass == 'avatar') {
            const userId = img.parentElement.dataset.userId;
            const currentSize = img.currentSrc.match(/\/avatars\/(.+?)\//)?.[1];
            if (!currentSize) {
                replaceBrokenAvatar(img);
                return;
            }

            let brokenSrcs = img.dataset.brokenSrcs?.split(';') || cachedData.getBrokenSrcs(userId) || [];
            if (!brokenSrcs.includes(currentSize)) {
                brokenSrcs.push(currentSize);
            }
            img.dataset.brokenSrcs = brokenSrcs.join(';');
            // cache in 1 hour
            cachedData.setBrokenSrcs(userId, brokenSrcs, 3600*1000);
            let srcSet = ['s', 'm', 'l', 'o'];
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
                img[attr] = img[attr].replaceAll('statics.voz.tech','voz.vn')
                    .replaceAll('https://data.voz.vn/', 'https://web.archive.org/web/20240101120919if_/https://data.voz.vn/');
            }
        }
    }

    let cachedData = {
        data: GM_getValue('cachedData', {}),
        getBrokenSrcs: function(userId) {
            if (userId && this.data[userId]?.expires > Date.now()) {
                return this.data[userId].brokenSrcs;
            } else if (userId && this.data[userId]?.expires <= Date.now()) {
                delete this.data[userId];
            }
            return undefined;
        },
        setBrokenSrcs: function(userId, brokenSrcs, miliseconds) {
            if (userId) {
                this.data[userId] = {'brokenSrcs': brokenSrcs, 'expires': Date.now() + miliseconds};
            }
        },
        save: function() {
            GM_setValue('cachedData', this.data);
        },
        flush: function() {
            if (Date.now() - GM_getValue('lastFlush', 0) > 86400*1000) {
                let count = 0;
                for (const userId of Object.keys(this.data)) {
                    if (Date.now() > this.data[userId].expires) {
                        delete this.data[userId];
                        count++;
                    }
                    if (count == 10) {
                        break;
                    }
                }
                GM_setValue('lastFlush', Date.now());
            }
        }
    };
    window.addEventListener("beforeunload", function() {
        cachedData.flush();
        cachedData.save();
    });

    // broken imgs
    document.addEventListener('error', imgErrorHandler, true);
    // reload cached imgs to get events
    let imgs = document.querySelectorAll('.avatar img, img.smilie, img.reaction-image');
    imgs.forEach(img => {
        if (img.complete && img.naturalWidth == 0) {
            img.src = img.src;
            img.srcset = img.srcset;
        }
    });
});

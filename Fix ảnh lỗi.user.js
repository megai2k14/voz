// ==UserScript==
// @name         Fix ảnh lỗi
// @namespace    idmresettrial
// @version      2024.06.15.01
// @description  như tên
// @author       You
// @match        https://voz.vn/*
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js
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

            let brokenSrcs = img.dataset.brokenSrcs?.split(';') || Cookies.get(`${userId}-brokenSrcs`)?.split(';') || [];
            if (!brokenSrcs.includes(currentSize)) {
                brokenSrcs.push(currentSize);
            }
            img.dataset.brokenSrcs = brokenSrcs.join(';');
            // cache in 1 hour
            Cookies.set(`${userId}-brokenSrcs`, img.dataset.brokenSrcs, {expires: 1/24});

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

    let Cookies = window.Cookies;
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

// ==UserScript==
// @name         Cảnh báo thớt cũ
// @namespace    idmresettrial
// @version      2024.10.01.01
// @description  như tên
// @author       You
// @match        https://voz.vn/t/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', async function () {
    'use strict';

    GM_addStyle(`
        form.js-quickReply button[type="submit"].button.button--old-thread {
            background: #c0392b;
            border-color: #c0392b;
        }
        form.js-quickReply button[type="submit"].button.button--old-thread:hover {
            background: #f39c12;
            border-color: #f39c12;
        }
    `);

    const OLD_THRESHOLD = 90*86400000;

    async function getThreadLastTime(url) {
        // const response = await fetch(url);
        // if (response.ok) {
        //     const html = await response.text();
        //     const parser = new DOMParser();
        //     const doc = parser.parseFromString(html, 'text/html');
        //     const lastTime = doc.querySelectorAll('article.message--post:last-of-type time')[0]?.dataset.time;
        //     return lastTime;
        // }
        const lastTime = document.querySelectorAll('input[name="last_known_date"]')[0]?.value * 1000 || Date.now();
        return lastTime;
    }

    const threadLastTime = await getThreadLastTime(`${window.location.href}/latest`);
    const isOldThread = Date.now() - threadLastTime > OLD_THRESHOLD;
    const currentBox = document.querySelector(".p-breadcrumbs li:last-child a").href.match(/\d+/)[0];

    const btnSubmit = document.querySelectorAll('form.js-quickReply button[type="submit"]')[0];
    if (currentBox == '33' && isOldThread && btnSubmit) {
        btnSubmit.classList.add("button--old-thread");
        btnSubmit.addEventListener('click', async event => {
            if (!confirm('Thớt này đã lâu không hoạt động, cố tình comment sẽ bị KIA?')) {
                event.preventDefault();
            }
        });
    }
});

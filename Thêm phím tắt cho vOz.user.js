// ==UserScript==
// @name         Thêm phím tắt cho vOz
// @namespace    idmresettrial
// @version      2024.10.11.01
// @description  ... dùng phím tắt đôi khi tiện hơn dùng chuột
// @author       You
// @match        https://voz.vn/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const nav = document.querySelector(".p-navSticky");
    const navButtons = nav.querySelector("ul.p-nav-list");


    // Hiện link tới box đang xem
    // phím tắt: 3
    if (window.location.pathname.match(/^\/[tf]\//)) {
        const currentBox = document.querySelector(".p-breadcrumbs li:last-child a");

        let newBtn = document.createElement("li");
        newBtn.innerHTML = `<div class="p-navEl"><a href="${currentBox.href}" class="p-navEl-link" data-xf-key="3"
        data-nav-id="voz_currentBox">${currentBox.innerText}</a></div>`;

        navButtons.appendChild(newBtn);
    }

    // Đi đến khung reply
    // phím tắt: 4
    if (!window.location.pathname.match(/^\/find-threads\/contributed/)) {
        let newBtn = document.createElement("li");
        newBtn.innerHTML = `<div class="p-navEl"><a href="/find-threads/contributed" class="p-navEl-link" data-xf-key="4" data-nav-id="voz_contributedThreads">Thớt đã comment</a></div>`;
        navButtons.appendChild(newBtn);
    }

    // Trang trước, trang sau
    // phím tắt: b, n
    if (document.querySelector(".pageNav")) {
        let pages = {
            prev: { el: document.querySelector(".pageNav-jump.pageNav-jump--prev"), key: "b" },
            next: { el: document.querySelector(".pageNav-jump.pageNav-jump--next"), key: "n" }
        };
        for (const button in pages) {
            let link = pages[button];
            if (link.el) {
                link.el.setAttribute("data-xf-key", link.key);
            }
        }
    }

    // cuộn lên đầu trang khi click nav
    const navY = nav.getBoundingClientRect().y;
    let currentY = false;

    let disabled = false;
    nav.addEventListener("click", function(e) {
        if (disabled || e.target.tagName !== "DIV" || window.scrollY < navY) {
            return;
        }

        disabled = true;

        if (window.scrollY - navY > 0) {
            currentY = window.scrollY;
            window.scrollTo({top: navY, behavior: "smooth"});
        } else {
            window.scrollTo({top: currentY, behavior: "smooth"});
        }

        setTimeout(function() { disabled = false; }, 1000);
    });

    let style = document.createElement('style');
    style.innerHTML = "#navReply:hover {background-color: #295590;}";
    document.head.appendChild(style);

});

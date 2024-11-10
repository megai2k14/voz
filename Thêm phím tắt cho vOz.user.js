// ==UserScript==
// @name         Thêm phím tắt cho vOz
// @namespace    idmresettrial
// @version      2024.11.10.01
// @description  ... dùng phím tắt đôi khi tiện hơn dùng chuột
// @author       You
// @match        https://voz.vn/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    document.head.insertAdjacentHTML('beforeend', `
        <style type="text/css">
            @media (max-width: 727px) {
                .p-navgroup-link.p-navgroup-link--currentBox i:after,
                .p-navgroup-link.p-navgroup-link--contributed i:after {
                    width: 1.28571429em;
                    display: inline-block;
                    text-align: center;
                }
                .p-navgroup-link.p-navgroup-link--currentBox i:after {
                    content: "\\f104";
                }
                .p-navgroup-link.p-navgroup-link--contributed i:after {
                    content: "\\f1da";
                }
            }
        </style>
    `);


    const nav = document.querySelector(".p-navSticky");
    const navButtons = nav.querySelector("ul.p-nav-list");
    const navOpposite = document.querySelector('.p-nav-opposite');


    // Hiện link tới box đang xem
    // phím tắt: 3
    if (window.location.pathname.match(/^\/[tf]\//)) {
        const currentBox = document.querySelector(".p-breadcrumbs li:last-child a");

        navButtons.insertAdjacentHTML('beforeend',`
            <li><div class="p-navEl"><a href="${currentBox.href}" class="p-navEl-link" data-xf-key="3"
            data-nav-id="voz_currentBox">${currentBox.innerText}</a></div></li>
        `);

        navOpposite.insertAdjacentHTML('beforeend', `
            <div class="p-navgroup">
            <a class="p-navgroup-link p-navgroup-link--iconic p-navgroup-link--currentBox"
            href="${currentBox.href}" data-xf-key="3" data-nav-id="voz_currentBox"><i aria-hidden="true"></i></a>
        `);
    }

    // Hiện link tới những thread đã comment
    // phím tắt: 4
    if (!window.location.pathname.match(/^\/find-threads\/contributed/)) {
        navButtons.insertAdjacentHTML('beforeend', `
            <li><div class="p-navEl">
            <a href="/find-threads/contributed" class="p-navEl-link" data-xf-key="4"
            data-nav-id="voz_contributedThreads">Thớt đã comment</a>
            </div></li>
        `);

        navOpposite.insertAdjacentHTML('beforeend', `
            <div class="p-navgroup"><a class="p-navgroup-link p-navgroup-link--iconic p-navgroup-link--contributed"
            href="/find-threads/contributed" data-xf-key="4" data-nav-id="voz_contributedThreads"><i aria-hidden="true"></i></a></div>
        `);
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

});

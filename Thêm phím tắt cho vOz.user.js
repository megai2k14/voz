// ==UserScript==
// @name         Thêm phím tắt cho vOz
// @namespace    idmresettrial
// @version      2024.11.27.01
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
            .p-navgroup.p-mini {
                display: none;
            }
            #stickyPageNavWrapper {
                display: none;
            }
            #stickyPageNavWrapper.is-sticky {
                display: block;
                position: fixed;
                bottom: 2px;
                padding-top: 2px;
                padding-right: 2px;
                background: #ededed;
            }

            @media (max-width: 727px) {
                .p-navgroup.p-mini {
                    display: unset
                }

                .p-navgroup-link.p-navgroup-link--currentBox i:after,
                .p-navgroup-link.p-navgroup-link--contributed i:after {
                     display: inline-block;
                     content: "";
                     height: 1em;
                     vertical-align: -0.125em;
                     background-color: currentColor;
                     width: 1.28571429em;
                 }
                .p-navgroup-link.p-navgroup-link--currentBox i:after {
                    mask: url('/styles/fa/regular/angle-left.svg?v=5.15.3') no-repeat center;
                    -webkit-mask: url('/styles/fa/regular/angle-left.svg?v=5.15.3') no-repeat center
                }
                .p-navgroup-link.p-navgroup-link--contributed i:after {
                    mask: url('/styles/fa/regular/history.svg?v=5.15.3') no-repeat center;
                    -webkit-mask: url('/styles/fa/regular/history.svg?v=5.15.3') no-repeat center

                }
            }
        </style>
    `);


    const nav = document.querySelector(".p-navSticky");
    const navButtons = nav.querySelector("ul.p-nav-list");
    const navOpposite = document.querySelector('.p-nav-opposite');


    // Hiện link tới box đang xem
    // phím tắt: 3
    const currentBox = document.querySelector(".p-breadcrumbs li:last-child a");
    if (currentBox) {

        navButtons.insertAdjacentHTML('beforeend',`
            <li><div class="p-navEl"><a href="${currentBox.href}" class="p-navEl-link" data-xf-key="3"
            data-nav-id="voz_currentBox">${currentBox.innerText}</a></div></li>
        `);

        navOpposite.insertAdjacentHTML('beforeend', `
            <div class="p-navgroup p-mini">
            <a class="p-navgroup-link p-navgroup-link--iconic p-navgroup-link--currentBox"
            href="${currentBox.href}" data-xf-key="3" data-nav-id="voz_currentBox"><i aria-hidden="true"></i></a>
        `);
    }

    // Hiện link tới những thread đã comment
    // phím tắt: 4
    {
        let isSelectedClass = window.location.href == 'https://voz.vn/find-threads/contributed' ? 'is-selected' : '';
        if (isSelectedClass) {
            document.querySelector('.p-navEl.is-selected').classList.remove('is-selected');
        }
        navButtons.insertAdjacentHTML('beforeend', `
            <li><div class="p-navEl ${isSelectedClass}">
            <a href="/find-threads/contributed" class="p-navEl-link" data-xf-key="4"
            data-nav-id="voz_contributedThreads">Thớt đã comment</a>
            </div></li>
        `);

        navOpposite.insertAdjacentHTML('beforeend', `
            <div class="p-navgroup p-mini"><a class="p-navgroup-link p-navgroup-link--iconic p-navgroup-link--contributed"
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

        // sticky nav
        const pageNavWrappers = [...document.querySelectorAll(".pageNavWrapper")];
        const stickyPageNavWrapper = pageNavWrappers[0].cloneNode(true);
        stickyPageNavWrapper.setAttribute("id", "stickyPageNavWrapper");
        pageNavWrappers[1].parentNode.appendChild(stickyPageNavWrapper);
        function isElementInViewport (el) {
            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
            );
        }
        document.addEventListener("scroll", (e) => {
            if (pageNavWrappers.every(el => !isElementInViewport(el)) && stickyPageNavWrapper) {
                stickyPageNavWrapper.classList.toggle("is-sticky", true)
            } else {
                stickyPageNavWrapper.classList.toggle("is-sticky", false)
            }
        });

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

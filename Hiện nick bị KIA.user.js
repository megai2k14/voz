// ==UserScript==
// @name         Hiện nick bị KIA
// @namespace    idmresettrial
// @version      2024.11.25.01
// @description  như tên
// @author       You
// @match        https://voz.vn/t/*
// @match        https://voz.vn/direct-messages/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    function findUser(id) {
        let token = ""; //document.getElementsByName("_xfToken")[0].value;
        let username = document.querySelector(`.message-userDetails a.username[data-user-id="${id}"]`).innerText;
        let requestUri = document.location.pathname;

        let queryUrl = `https://voz.vn/index.php?members/find&q=${encodeURIComponent(username)}&_xfRequestUri=${requestUri}&_xfWithData=1&_xfToken=${token}&_xfResponseType=json`;

        let httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
                let isKIA = !JSON.parse(httpRequest.responseText).results.some(function (r) { return r.id === username; });
                gotResult(id, isKIA);
            }
        }

        httpRequest.open("GET", queryUrl);
        httpRequest.send();
    }

    function gotResult(id, isKIA) {
        if (isKIA) {
            let els = document.querySelectorAll(`.message-userDetails a.username[data-user-id="${id}"]`);
            els.forEach(el => {
                el.parentElement.parentElement.querySelector(".userTitle").innerHTML = "Nơi đảo xa";
            });
        }
    }

    let handledIds = [];
    function inoHandler(entries, observer) {
        entries.forEach(entry => {
            let id = entry.target.getAttribute("data-user-id");
            if (handledIds.includes(id)) {
                observer.unobserve(entry.target);
            } else if (entry.isIntersecting) {
                findUser(id);
                handledIds.push(id);
            }
        });
    }
    let observer = new IntersectionObserver(inoHandler);

    let els = document.querySelectorAll(".message-userDetails a.username");
    els.forEach(el => observer.observe(el));


});

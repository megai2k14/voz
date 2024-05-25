// ==UserScript==
// @name         Oánh dấu chủ thớt
// @namespace    idmresettrial
// @version      2024.05.25.01
// @description  như tên
// @author       You
// @match        https://voz.vn/t/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var starterId = document.querySelector(".username.u-concealed");
    if (!starterId) {
        return;
    }

    var starters = document.querySelectorAll(".message-userDetails a.username[data-user-id='" + starterId.getAttribute("data-user-id") + "']");
    if (!starters) {
        return;
    }

    var style = document.createElement('style');
    //style.innerHTML = ".userBanner.userBanner--starter {background-color: #656d88aa; color: #fff; border-color: #656d88;}";
    style.innerHTML = ".userBanner.userBanner--starter {background-color: #eaeaea; color: #282828; border-color: #828282;}";
    document.head.appendChild(style);

    for (const starter of starters) {
        var starterFlair = document.createElement("div");
        starterFlair.setAttribute("class", "userBanner userBanner--starter message-userBanner");
        starterFlair.innerHTML = "<strong>Chủ thớt</strong>";
        starter.parentElement.parentElement.appendChild(starterFlair);
    }

});

// ==UserScript==
// @name         Fix Tiktok Live
// @namespace    idmresettrial
// @version      2024.09.03.01
// @description  fix timezone error
// @author       You
// @match        https://www.tiktok.com/live*
// @icon         https://www.tiktok.com/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function() {
        const options = originalResolvedOptions.call(this);
        if (options.timeZone === 'Asia/Saigon') {
            options.timeZone = 'Asia/Ho_Chi_Minh';
        }
        return options;
    };

})();
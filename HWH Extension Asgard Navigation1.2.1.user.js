// ==UserScript==
// @name            HWH Addon: Asgard Navigation (Custom Position)
// @namespace       HWH.Addons
// @version         1.2.1
// @description     Registers Asgard button AFTER a specific anchor button
// @author          HWH Extension Architect
// @match           https://www.hero-wars.com/*
// @match           https://apps-1701433570146040.apps.fbsbx.com/*
// @grant           unsafeWindow
// @run-at          document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION / КОНФИГУРАЦИЯ ---
    const CONFIG = {
        id: 'asgard_nav_btn',
        label: 'Asgard',
        tooltip: 'Go to Asgard / Перейти в Асгард',
        color: 'blue',
        target: 'ASGARD',
        // CHANGELOG: Set to 'doOthers' based on your console dump
        // Modifica questo valore con "getOutland" o "testTitanArena" se preferisci
        anchorId: 'doOthers'
    };

    function init() {
        // Safety check
        if (!unsafeWindow.HWHData || !unsafeWindow.HWHData.buttons) return;

        console.log(`[HWH-Addon] Injecting Asgard button after '${CONFIG.anchorId}'...`);

        const originalButtons = unsafeWindow.HWHData.buttons;
        const newButtonMap = {};
        let inserted = false;

        // Iterate keys to maintain order and inject at specific point
        // Итерация ключей для сохранения порядка и вставки в определенную точку
        for (const key in originalButtons) {
            // 1. Copy the current existing button
            newButtonMap[key] = originalButtons[key];

            // 2. Check if this is our anchor point
            if (key === CONFIG.anchorId) {
                // Inject our button immediately after the anchor
                newButtonMap[CONFIG.id] = {
                    get name() { return CONFIG.label; },
                    get title() { return CONFIG.tooltip; },
                    color: CONFIG.color,
                    onClick: function() {
                        const cheats = unsafeWindow.cheats;
                        // Robust navigation call handling
                        if (cheats && typeof cheats.goNavigtor === 'function') {
                            cheats.goNavigtor(CONFIG.target);
                        } else if (typeof unsafeWindow.goNavigtor === 'function') {
                            unsafeWindow.goNavigtor(CONFIG.target);
                        } else {
                            console.error('[HWH-Addon] Navigation function not found.');
                        }
                    }
                };
                inserted = true;
            }
        }

        // Fallback: If anchor ID doesn't exist, append to bottom
        if (!inserted) {
            console.warn(`[HWH-Addon] Anchor '${CONFIG.anchorId}' not found in HWHData. Appending to end.`);
            newButtonMap[CONFIG.id] = {
                get name() { return CONFIG.label; },
                get title() { return CONFIG.tooltip; },
                color: CONFIG.color,
                onClick: function() {
                    if (unsafeWindow.cheats?.goNavigtor) unsafeWindow.cheats.goNavigtor(CONFIG.target);
                }
            };
        }

        // Apply the new button structure
        unsafeWindow.HWHData.buttons = newButtonMap;
        console.log(`[HWH-Addon] Button placement complete.`);
    }

    /**
     * Dependency Check Loop
     */
    const loader = setInterval(() => {
        if (typeof unsafeWindow.HWHClasses !== 'undefined' && typeof unsafeWindow.HWHData !== 'undefined') {
            clearInterval(loader);
            // Delay slightly to ensure standard buttons are populated before we reorganize them
            setTimeout(init, 1000);
        }
    }, 500);

})();
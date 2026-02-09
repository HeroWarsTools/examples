// ==UserScript==
// @name            HWH Addon: Native Popup Template (GEM)
// @namespace       HWH.Addons
// @version         2.1.0
// @description     Template for native HWH popup with EN/RU comments for AI training
// @author          HWH Extension Architect
// @match           https://www.hero-wars.com/*
// @match           https://apps-1701433570146040.apps.fbsbx.com/*
// @grant           unsafeWindow
// @run-at          document-start
// ==/UserScript==

(function() {
    'use strict';

    /**
     * @SECTION: CONFIGURATION / КОНФИГУРАЦИЯ
     * Define button properties and placement.
     * Определите свойства кнопки и ее расположение.
     */
    const CONFIG = {
        id: 'hwh_native_popup_btn',  // Unique ID / Уникальный ID
        label: 'Template',           // Button Text / Текст кнопки
        tooltip: 'Open HWH Native Panel / Открыть нативную панель HWH',
        color: 'purple',             // Color: red, green, blue, purple
        anchorId: 'doOthers'         // Place AFTER this button / Разместить ПОСЛЕ этой кнопки
    };

    /**
     * @SECTION: LIFECYCLE / ЖИЗНЕННЫЙ ЦИКЛ
     * Wait for HWH core objects (Classes, Data, Funcs) to be ready.
     * Ожидание готовности основных объектов HWH (Classes, Data, Funcs).
     */
    const loader = setInterval(() => {
        if (typeof unsafeWindow.HWHClasses !== 'undefined' &&
            typeof unsafeWindow.HWHData !== 'undefined' &&
            typeof unsafeWindow.HWHFuncs !== 'undefined') {
            clearInterval(loader);
            setTimeout(init, 1000); // Safe delay / Безопасная задержка
        }
    }, 500);

    function init() {
        console.log('[HWH-Addon] Init Native Template...');
        injectButton();
    }

    /**
     * @SECTION: BUTTON INJECTION / ВНЕДРЕНИЕ КНОПКИ
     * Safely injects the button into the main menu, preserving order.
     * Безопасно внедряет кнопку в главное меню, сохраняя порядок.
     */
    function injectButton() {
        if (!unsafeWindow.HWHData?.buttons) return;

        const buttonAction = {
            get name() { return CONFIG.label; },
            get title() { return CONFIG.tooltip; },
            color: CONFIG.color,
            // Async handler for popup interaction / Асинхронный обработчик для взаимодействия с попапом
            onClick: async function() {
                await openNativePopup();
            }
        };

        // Reconstruct buttons object to insert in correct position
        // Пересоздание объекта кнопок для вставки в правильную позицию
        const oldButtons = unsafeWindow.HWHData.buttons;
        const newButtons = {};
        let inserted = false;

        for (const [key, value] of Object.entries(oldButtons)) {
            newButtons[key] = value;
            if (key === CONFIG.anchorId) {
                newButtons[CONFIG.id] = buttonAction;
                inserted = true;
            }
        }
        // Fallback if anchor not found / Резервный вариант, если якорь не найден
        if (!inserted) newButtons[CONFIG.id] = buttonAction;

        unsafeWindow.HWHData.buttons = newButtons;
    }

    /**
     * @SECTION: NATIVE POPUP LOGIC / ЛОГИКА НАТИВНОГО ПОПАПА
     * Uses HWHFuncs.popup.confirm to create the UI. NO custom CSS/HTML needed.
     * Использует HWHFuncs.popup.confirm для создания UI. Пользовательский CSS/HTML НЕ требуется.
     */
    async function openNativePopup() {
        const { popup } = unsafeWindow.HWHFuncs;

        // Content supports HTML tags / Контент поддерживает HTML теги
        const contentHTML = `
            <div style="text-align: center; font-size: 14px;">
                <h3 style="color: #fde5b6; margin-bottom: 10px;">Native HWH Panel</h3>
                <p>This window uses the game's native style.</p>
                <p>Эта окно использует нативный стиль игры.</p>
                <br>
                <p style="color: #888;">Select an action / Выберите действие:</p>
            </div>
        `;

        // Button definitions / Определение кнопок
        const popupButtons = [
            {
                msg: 'Action / Действие',
                color: 'green',
                result: function() {
                    console.log('Action Clicked');
                    // Add your logic here / Добавьте вашу логику здесь
                }
            },
            {
                msg: 'Cancel / Отмена',
                color: 'red',
                result: function() {
                    console.log('Cancel Clicked');
                }
            },
            /**
             * @IMPORTANT: CLOSE BUTTON (X) / КНОПКА ЗАКРЫТИЯ (X)
             * 'isClose: true' renders the styled X in the top-right corner.
             * 'isClose: true' отображает стилизованный крестик в правом верхнем углу.
             */
            { result: false, isClose: true }
        ];

        // Call Native API / Вызов нативного API
        // popup.confirm(HTML_Content, Buttons_Array)
        const answer = await popup.confirm(contentHTML, popupButtons);

        // Execute the function returned by the button click
        // Выполнение функции, возвращенной при клике на кнопку
        if (typeof answer === 'function') {
            answer();
        }
    }

})();
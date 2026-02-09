// ==UserScript==
// @name         HwH Ext Campaign Automator
// @namespace    MyHeroWarsExtensions
// @version      1.26.1
// @description  UI update: Unified data management popup and real-time mission name display.
// @author       HW Tools & Gemini
// @match        https://www.hero-wars.com/*
// @match        https://apps-1701433570146040.apps.fbsbx.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function initializeExtension() {
        console.log("Campaign Automator Extension: Initializing (v1.26).");

        // State variables
        let autoStartIntervalId = null;
        let isAutomationRunning = false;
        let lastAutoCheckTimestamp = 0;
        let lastQuestFarmTimestamp = 0;
        const CHECK_INTERVAL = 10 * 60 * 1000;
        const QUEST_FARM_COOLDOWN = 10 * 60 * 1000;
        const NUM_PROFILES = 6;
		
		// --- API PER SCRIPT ESTERNI (v1.1) ---
const api = {
    /**
     * Allows external scripts to change the Campaign Automator settings.
     * @param {object} options - An object containing the settings to change.
     * @param {boolean} [options.autoStart] - true or false to check/uncheck Auto Start.
     * @param {boolean} [options.autoSync] - true or false to check/uncheck Auto Sync.
     * @param {number|string} [options.reps] - The number of repetitions.
     * @param {string} [options.method] - The method ('skip_battle', 'sequence', etc.).
     * @param {number|string} [options.energyThreshold] - The energy threshold value.
     * @param {string} [options.missionId] - The mission ID or sequence string.
     */
    setSettings: (options) => {
        const panel = document.querySelector('#hwh_profiles_container')?.closest('.scriptMenu_Details > div');
        if (!panel || !options) {
            console.error("Campaign Automator panel not ready or no options provided.");
            return;
        }

        console.log("Campaign Automator API: Receiving new settings:", options);

        if (options.autoStart !== undefined) {
            panel.querySelector('#hwh_auto_start_toggle').checked = options.autoStart;
        }
        if (options.autoSync !== undefined) {
            panel.querySelector('#hwh_auto_sync_toggle').checked = options.autoSync;
        }
        if (options.reps !== undefined) {
            panel.querySelector('#hwh_repetitions').value = options.reps;
        }
        if (options.method !== undefined) {
            panel.querySelector('#hwh_method').value = options.method;
        }
        if (options.energyThreshold !== undefined) {
            panel.querySelector('#hwh_energy_threshold').value = options.energyThreshold;
        }
        // --- RIGA AGGIUNTA ---
        if (options.missionId !== undefined) {
            panel.querySelector('#hwh_mission_id_single').value = options.missionId;
            panel.querySelector('#hwh_mission_id_sequence').value = options.missionId;
        }
        
        saveSettings();
        toggleUIMode();
        applyVip5Rules();
        updateMissionNameDisplay();

        console.log("Campaign Automator API: Settings applied successfully.");
    }
};

window.HWH_CampaignAutomator_API = api;
// --- FINE BLOCCO API ---

        class HWHExtensionDB {
            constructor(dbName, storeName) { this.dbName = dbName; this.storeName = storeName; this.db = null; }
            async open() { return new Promise((resolve, reject) => { const request = indexedDB.open(this.dbName); request.onerror = () => reject(new Error(`Failed to open DB`)); request.onsuccess = () => { this.db = request.result; resolve(); }; request.onupgradeneeded = (event) => { const db = event.target.result; if (!db.objectStoreNames.contains(this.storeName)) { db.createObjectStore(this.storeName); } }; }); }
            async get(key, def) { return new Promise((resolve) => { try { if (!this.db) { resolve(def); return; } const transaction = this.db.transaction([this.storeName], 'readonly'); const store = transaction.objectStore(this.storeName); const request = store.get(key); request.onerror = () => resolve(def); request.onsuccess = () => resolve(request.result === undefined ? def : request.result); } catch (e) { resolve(def); } }); }
            async set(key, value) { return new Promise(async (resolve, reject) => { try { if (!this.db) { await this.open(); } const transaction = this.db.transaction([this.storeName], 'readwrite'); const store = transaction.objectStore(this.storeName); const request = store.put(value, key); request.onerror = () => reject(new Error(`Failed to save`)); request.onsuccess = () => resolve(); } catch (e) { reject(e); } }); }
        }

        const menu = HWHClasses.ScriptMenu.getInst();

        menu.on('afterInit', () => {
            HWHFuncs.addExtentionName(GM_info.script.name, GM_info.script.version, GM_info.script.author);

            const campaignGroup = menu.addDetails('⚙️ Camp.Automat.', 'campaignAutomator');
            const panel = document.createElement('div');
            panel.style.cssText = 'padding: 10px; max-width: 180px; margin: auto;';

            // --- HELPER FUNCTIONS ---

            async function saveSettings(settingsToSave = null) {
                const userInfo = HWHFuncs.getUserInfo();
                if (!userInfo || !userInfo.id) { return; }

                if (!settingsToSave) {
                    const method = panel.querySelector('#hwh_method').value;
                    const missionIdValue = (method === 'sequence')
                        ? panel.querySelector('#hwh_mission_id_sequence').value
                        : panel.querySelector('#hwh_mission_id_single').value;
                    settingsToSave = {
                        missionId: missionIdValue,
                        reps: panel.querySelector('#hwh_repetitions').value,
                        method: method,
                        autoStartEnabled: panel.querySelector('#hwh_auto_start_toggle').checked,
                        autoSyncEnabled: panel.querySelector('#hwh_auto_sync_toggle').checked,
                        energyThreshold: panel.querySelector('#hwh_energy_threshold').value,
                    };
                }

                const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                await db.open();
                const allSettings = await db.get(userInfo.id, {});

                const existingProfiles = allSettings.campaignAutomator?.profiles || {};
                const existingFavorites = allSettings.campaignAutomator?.favorites || [];

                allSettings.campaignAutomator = {
                    ...settingsToSave,
                    profiles: existingProfiles,
                    favorites: existingFavorites
                };

                await db.set(userInfo.id, allSettings);
            }

            async function saveProfile(profileNumber) {
                const userInfo = HWHFuncs.getUserInfo();
                if (!userInfo || !userInfo.id) { return; }

                const method = panel.querySelector('#hwh_method').value;
                const missionIdValue = (method === 'sequence')
                    ? panel.querySelector('#hwh_mission_id_sequence').value
                    : panel.querySelector('#hwh_mission_id_single').value;

                const profileData = {
                    missionId: missionIdValue,
                    reps: panel.querySelector('#hwh_repetitions').value,
                    method: method,
                    autoStartEnabled: panel.querySelector('#hwh_auto_start_toggle').checked,
                    autoSyncEnabled: panel.querySelector('#hwh_auto_sync_toggle').checked,
                    energyThreshold: panel.querySelector('#hwh_energy_threshold').value,
                };

                const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                await db.open();
                const allSettings = await db.get(userInfo.id, {});
                if (!allSettings.campaignAutomator) allSettings.campaignAutomator = {};
                if (!allSettings.campaignAutomator.profiles) allSettings.campaignAutomator.profiles = {};

                allSettings.campaignAutomator.profiles[profileNumber] = profileData;
                await db.set(userInfo.id, allSettings);
                HWHFuncs.setProgress(`Profile ${profileNumber} saved!`, true);
                HWHFuncs.popup.hide();
            }

            async function loadProfile(profileNumber) {
                const userInfo = HWHFuncs.getUserInfo();
                if (!userInfo || !userInfo.id) { return; }

                const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                await db.open();
                const allSettings = await db.get(userInfo.id, {});
                const profileData = allSettings.campaignAutomator?.profiles?.[profileNumber];

                if (!profileData) {
                    HWHFuncs.setProgress(`Profile ${profileNumber} is empty.`, true);
                    return;
                }

                panel.querySelector('#hwh_mission_id_single').value = profileData.missionId || '';
                panel.querySelector('#hwh_mission_id_sequence').value = profileData.missionId || '';
                panel.querySelector('#hwh_repetitions').value = profileData.reps || '1';
                panel.querySelector('#hwh_method').value = profileData.method || 'sequence';
                panel.querySelector('#hwh_auto_start_toggle').checked = profileData.autoStartEnabled || false;
                panel.querySelector('#hwh_auto_sync_toggle').checked = profileData.autoSyncEnabled || false;
                panel.querySelector('#hwh_energy_threshold').value = profileData.energyThreshold || '120';

                toggleUIMode();
                applyVip5Rules();
                updateMissionNameDisplay(); // NEW: Update name on profile load
                await saveSettings();
                HWHFuncs.setProgress(`Profile ${profileNumber} loaded!`, true);
            }

            // --- MODIFIED: Replaced handleSaveClick with a more comprehensive manager ---
            function handleManageDataClick() {
                const popupContent = document.createElement('div');
                popupContent.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';

                popupContent.innerHTML = `
                    <h3 style="text-align: center; margin-top: 0; margin-bottom: 5px;">Profiles & Data</h3>
                    <div id="hwh_popup_close_x" style="position: absolute; top: 15px; right: 15px; font-size: 24px; cursor: pointer; color: #ce9767; line-height: 1;">&times;</div>

                    <div>
                        <h4 style="margin: 0 0 5px 0; text-align: center;">Save Current Settings to:</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
                            ${Array.from({length: NUM_PROFILES}, (_, i) => `
                                <div id="hwh_popup_save_${i+1}" class="scriptMenu_button scriptMenu_beigeButton">
                                    <div class="scriptMenu_buttonText">P${i+1}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="border-top: 1px solid #555; padding-top: 15px;">
                         <h4 style="margin: 0 0 5px 0; text-align: center;">Import / Export</h4>
                         <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                            <div id="hwh_popup_import" class="scriptMenu_button scriptMenu_beigeButton"><div class="scriptMenu_buttonText">Import...</div></div>
                            <div id="hwh_popup_export" class="scriptMenu_button scriptMenu_beigeButton"><div class="scriptMenu_buttonText">Export...</div></div>
                        </div>
                    </div>
                `;

                function handleEscKey(event) { if (event.key === 'Escape') { HWHFuncs.popup.hide(); document.removeEventListener('keydown', handleEscKey); } }

                HWHFuncs.popup.customPopup(() => {
                    HWHFuncs.popup.custom.appendChild(popupContent);
                    HWHFuncs.popup.show();
                    document.addEventListener('keydown', handleEscKey);
                });

                popupContent.querySelector('#hwh_popup_close_x').addEventListener('click', () => { HWHFuncs.popup.hide(); document.removeEventListener('keydown', handleEscKey); });
                for (let i = 1; i <= NUM_PROFILES; i++) {
                    popupContent.querySelector(`#hwh_popup_save_${i}`).addEventListener('click', () => saveProfile(i));
                }
                popupContent.querySelector('#hwh_popup_import').addEventListener('click', handleImportData);
                popupContent.querySelector('#hwh_popup_export').addEventListener('click', handleExportData);
            }

            async function handleExportData() {
                const userInfo = HWHFuncs.getUserInfo();
                if (!userInfo || !userInfo.id) return;

                const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                await db.open();
                const allSettings = await db.get(userInfo.id, {});

                const dataToExport = {
                    profiles: allSettings.campaignAutomator?.profiles || {},
                    favorites: allSettings.campaignAutomator?.favorites || []
                };

                const jsonData = JSON.stringify(dataToExport, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'hwh-campaign-automator-profiles.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                HWHFuncs.setProgress('Settings exported!', true);
            }

            function handleImportData() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json,application/json';
                input.onchange = e => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = async readerEvent => {
                        try {
                            const importedData = JSON.parse(readerEvent.target.result);
                            if (typeof importedData.profiles !== 'object' || !Array.isArray(importedData.favorites)) {
                                throw new Error('Invalid file format.');
                            }

                            const userInfo = HWHFuncs.getUserInfo();
                            if (!userInfo || !userInfo.id) return;

                            const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                            await db.open();
                            const allSettings = await db.get(userInfo.id, {});
                            if (!allSettings.campaignAutomator) allSettings.campaignAutomator = {};

                            allSettings.campaignAutomator.profiles = importedData.profiles;
                            allSettings.campaignAutomator.favorites = importedData.favorites;

                            await db.set(userInfo.id, allSettings);
                            HWHFuncs.setProgress('Settings imported successfully!', true);
                            HWHFuncs.popup.hide();

                        } catch (err) {
                            HWHFuncs.setProgress(`Error importing file: ${err.message}`, true);
                            console.error(err);
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            }

            async function startAutomation() {
                if (isAutomationRunning) { return; }
                isAutomationRunning = true;

                await saveSettings();
                const method = panel.querySelector('#hwh_method').value;
                const missionIdInput = (method === 'sequence')
                    ? panel.querySelector('#hwh_mission_id_sequence').value
                    : panel.querySelector('#hwh_mission_id_single').value;
                const repetitions = parseInt(panel.querySelector('#hwh_repetitions').value);
                const button = panel.querySelector('#hwh_start_automation .scriptMenu_buttonText');

                if (!missionIdInput) {
                    HWHFuncs.setProgress("Please enter a Mission ID or sequence.", true);
                    isAutomationRunning = false;
                    return;
                }

                if (button) {
                    button.parentElement.style.pointerEvents = 'none';
                    button.textContent = "Running...";
                }

                try {
                    const teamData = await Send('{"calls":[{"name":"teamGetAll","args":{},"ident":"teamGetAll"},{"name":"teamGetFavor","args":{},"ident":"teamGetFavor"}]}');
                    const teamGetAll = teamData.results[0].result.response;
                    const teamGetFavor = teamData.results[1].result.response;

                    if (method === 'raid_single' || method === 'raid_multi') {
                        const missionId = parseInt(missionIdInput);
                        if (isNaN(missionId) || missionIdInput.includes(',') || missionIdInput.includes('-')) throw new Error(`Invalid Mission ID for ${method} mode.`);
                        if (isNaN(repetitions) || repetitions < 1) throw new Error("Invalid number of Reps.");

                        if (method === "raid_multi") {
                            HWHFuncs.setProgress(`Starting Raid x${repetitions} for mission ${missionId}...`);
                            await Send({ calls: [{ name: "missionRaid", args: { id: missionId, times: repetitions }, ident: "body" }] });
                        } else if (method === "raid_single") {
                            for (let i = 1; i <= repetitions; i++) {
                                HWHFuncs.setProgress(`Executing Single Raid ${i}/${repetitions} for mission ${missionId}...`);
                                const response = await Send({ calls: [{ name: "missionRaid", args: { id: missionId, times: 1 }, ident: "body" }] });
                                if (response.error || (response.results && response.results[0]?.result.error)) throw new Error("Raid failed. Not enough energy or attempts.");
                                await new Promise(resolve => setTimeout(resolve, 250));
                            }
                        }
                    } else if (method === 'skip_battle') {
                        const missionId = parseInt(missionIdInput);
                        if (isNaN(missionId) || missionIdInput.includes(',') || missionIdInput.includes('-')) throw new Error(`Invalid Mission ID for ${method} mode.`);
                        if (isNaN(repetitions) || repetitions < 1) throw new Error("Invalid number of Reps.");

                        HWHFuncs.setProgress(`Starting Skip Battle x${repetitions} for mission ${missionId}...`);
                        const missionArgs = { id: missionId, heroes: teamGetAll.mission.filter(id => id < 6000), pet: teamGetAll.mission.filter(id => id >= 6000).pop(), favor: teamGetFavor.mission };
                        for (let i = 1; i <= repetitions; i++) {
                            HWHFuncs.setProgress(`Executing Skip Battle ${i}/${repetitions} on mission ${missionId}...`);
                            const startResponse = await Send({ calls: [{ name: "missionStart", args: missionArgs, ident: "body" }] });
                            const battleData = startResponse?.results?.[0]?.result?.response;
                            if (!battleData) throw new Error(`Mission ${missionId} start failed. Not enough energy.`);
                            const battleResult = await Calc(battleData);
                            await HWHFuncs.countdownTimer(HWHFuncs.getTimer(battleResult.battleTime));
                            await Send({ calls: [{ name: "missionEnd", args: { id: missionId, result: battleResult.result, progress: battleResult.progress }, ident: "body" }] });
                            await new Promise(resolve => setTimeout(resolve, 250));
                        }
                    } else if (method === 'sequence') {
                        const missionSequence = missionIdInput.replace(/ /g, '').replace(/(\d+)-(\d+)/g, (match, start, end) => Array.from({ length: end - start + 1 }, (_, i) => parseInt(start) + i).join(',')).split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id) && id > 0);
                        if (missionSequence.length === 0) throw new Error("Invalid mission sequence.");

                        HWHFuncs.setProgress(`Starting Skip Battle sequence of ${missionSequence.length} missions...`);
                        let count = 0;
                        for (const missionId of missionSequence) {
                            count++;
                            HWHFuncs.setProgress(`Executing mission ${missionId} (${count}/${missionSequence.length})...`);
                            const missionArgs = { id: missionId, heroes: teamGetAll.mission.filter(id => id < 6000), pet: teamGetAll.mission.filter(id => id >= 6000).pop(), favor: teamGetFavor.mission };
                            const startResponse = await Send({ calls: [{ name: "missionStart", args: missionArgs, ident: "body" }] });
                            const battleData = startResponse?.results?.[0]?.result?.response;
                            if (!battleData) {
                                HWHFuncs.setProgress(`Skipping mission ${missionId}: Not enough energy.`, true);
                                await new Promise(resolve => setTimeout(resolve, 500));
                                continue;
                            }
                            const battleResult = await Calc(battleData);
                            await HWHFuncs.countdownTimer(HWHFuncs.getTimer(battleResult.battleTime));
                            await Send({ calls: [{ name: "missionEnd", args: { id: missionId, result: battleResult.result, progress: battleResult.progress }, ident: "body" }] });
                            await new Promise(resolve => setTimeout(resolve, 250));
                        }
                    }
                    HWHFuncs.setProgress(`Automation complete!`, true);
                } catch (e) {
                    console.error("Error during campaign automation:", e);
                    HWHFuncs.setProgress(`Error: ${e.message}`, true);
                } finally {
                    if (button) {
                        button.parentElement.style.pointerEvents = 'auto';
                        button.textContent = "Start";
                    }
                    isAutomationRunning = false;
                    console.log("Campaign Automator: Run finished. Scheduling quest farm in 500ms and energy check in 2 seconds.");
                    setTimeout(runQuestFarmWithCooldown, 500);
                    setTimeout(() => checkEnergyAndAutoStart(true, true), 2000);
                }
            }
            async function getCampaignEnergy() {
                try {
                    const response = await Send({ calls: [{ name: "userGetInfo", args: {}, ident: "body" }] });
                    const energyInfo = response?.results?.[0]?.result?.response?.refillable.find(item => item.id == 1);
                    return energyInfo ? energyInfo.amount : null;
                } catch (error) {
                    console.error("Campaign Automator: Failed to get campaign energy.", error);
                    return null;
                }
            }

            async function checkEnergyAndAutoStart(forceCheck = false, isPostRunCheck = false) {
                const autoStartEnabled = panel.querySelector('#hwh_auto_start_toggle').checked;
                const energyThreshold = parseInt(panel.querySelector('#hwh_energy_threshold').value);

                if (!autoStartEnabled || isNaN(energyThreshold) || isAutomationRunning) return;

                const now = Date.now();
                if (!forceCheck && (now - lastAutoCheckTimestamp < CHECK_INTERVAL)) return;

                console.log(`Campaign Automator: Performing energy check (Forced: ${forceCheck}, PostRun: ${isPostRunCheck}).`);
                if (!forceCheck) { lastAutoCheckTimestamp = now; }

                const currentEnergy = await getCampaignEnergy();
                if (currentEnergy === null) return;

                console.log(`Campaign Automator: Current Energy: ${currentEnergy}, Threshold: ${energyThreshold}`);
                if (currentEnergy >= energyThreshold) {
                    console.log("Campaign Automator: Energy is high. Re-running automation.");
                    startAutomation();
                } else {
                    const autoSyncEnabled = panel.querySelector('#hwh_auto_sync_toggle').checked;
                    if (isPostRunCheck && autoSyncEnabled) {
                        console.log("Campaign Automator: Energy below threshold after run. Triggering Auto Sync.");
                        HWHFuncs.setProgress("Energy low, auto-syncing...", true);
                        if (typeof cheats !== 'undefined' && typeof cheats.refreshGame === 'function') {
                            cheats.refreshGame();
                        }
                    } else {
                        console.log("Campaign Automator: Energy is below the threshold.");
                    }
                }
            }

            async function collectQuestRewards() {
                try {
                    const data = await Send({ calls: [{ name: "questGetAll", args: {}, ident: "body" }] });
                    const questGetAll = data.results[0].result.response;
                    const questAllFarmCall = { calls: [] };
                    let number = 0;
                    for (let quest of questGetAll) {
                        if (quest.id < 1e6 && quest.state == 2) {
                            questAllFarmCall.calls.push({
                                name: "questFarm",
                                args: { questId: quest.id },
                                ident: `group_${number}_body`
                            });
                            number++;
                        }
                    }
                    if (questAllFarmCall.calls.length > 0) {
                        console.log(`Campaign Automator: Found ${number} quest rewards to collect.`);
                        await Send(questAllFarmCall);
                        HWHFuncs.setProgress(`Collected ${number} quest rewards.`, true);
                    }
                } catch (e) {
                    console.error("Campaign Automator: Error collecting quest rewards.", e);
                }
            }

            async function runQuestFarmWithCooldown() {
                const now = Date.now();
                if (now - lastQuestFarmTimestamp < QUEST_FARM_COOLDOWN) {
                    console.log("Campaign Automator: Skipping quest farm, still in cooldown.");
                    return;
                }
                await collectQuestRewards();
                lastQuestFarmTimestamp = Date.now();
            }

            function applyVip5Rules() {
                const method = panel.querySelector('#hwh_method').value;
                if (method !== 'raid_multi') {
                    panel.querySelector('#hwh_energy_threshold').min = '1';
                    return;
                }

                const missionIdInput = panel.querySelector('#hwh_mission_id_single');
                const repsInput = panel.querySelector('#hwh_repetitions');
                const thresholdInput = panel.querySelector('#hwh_energy_threshold');
                const missionId = parseInt(missionIdInput.value);

                if (isNaN(missionId)) return;

                let maxReps = 10;
                try {
                    const missionData = lib.data.mission[missionId];
                    if (missionData && missionData.isHeroic === 1) {
                        maxReps = 3;
                        console.log(`Heroic Mission detected. Reps automatically set to 3.`);
                    }
                } catch (e) {
                    console.error("Could not check mission type, defaulting reps to 10.", e);
                }
                repsInput.value = maxReps;

                let newThreshold = 0;
                if (missionId <= 84) newThreshold = 60;
                else if (missionId >= 87 && missionId <= 144) newThreshold = 80;
                else if (missionId >= 147) newThreshold = 100;

                if (newThreshold > 0) {
                    thresholdInput.min = newThreshold;
                    if (parseInt(thresholdInput.value) < newThreshold) {
                        thresholdInput.value = newThreshold;
                    }
                    console.log(`VIP5 Mode: Mission ${missionId}. Minimum threshold is ${newThreshold}.`);
                } else {
                    thresholdInput.min = '1';
                }
                saveSettings();
            }

            async function openCustomMenu() {
                const popupContent = document.createElement('div');
                popupContent.innerHTML = `
                    <h3 style="text-align: center; margin-top: 0;">Select Mission</h3>
                    <div id="hwh_popup_close_x" style="position: absolute; top: 15px; right: 15px; font-size: 24px; cursor: pointer; color: #ce9767; line-height: 1;">&times;</div>
                    <input type="text" id="mission_search_input" placeholder="Search by name or ID..." style="width: 100%; box-sizing: border-box; margin-bottom: 10px; background: #302018; color: #fce1ac; border: 1px solid #ce9767; padding: 5px;">
                    <div id="mission_list_container" style="max-height: 30vh; overflow-y: auto; border: 1px solid #555; padding: 5px;"></div>
                    <h4 style="text-align: center; margin: 10px 0 5px 0; border-top: 1px solid #555; padding-top: 10px;">Favorites</h4>
                    <div id="mission_favorites_container" style="max-height: 15vh; overflow-y: auto; border: 1px solid #555; padding: 5px;"></div>
                `;
                function handleEscKey(event) { if (event.key === 'Escape') { HWHFuncs.popup.hide(); document.removeEventListener('keydown', handleEscKey); } }
                HWHFuncs.popup.customPopup(() => {
                    HWHFuncs.popup.custom.appendChild(popupContent);
                    HWHFuncs.popup.show();
                    document.addEventListener('keydown', handleEscKey);
                });
                popupContent.querySelector('#hwh_popup_close_x').addEventListener('click', () => { HWHFuncs.popup.hide(); document.removeEventListener('keydown', handleEscKey); });

                const missionListContainer = popupContent.querySelector('#mission_list_container');
                const missionSearchInput = popupContent.querySelector('#mission_search_input');
                const favoritesContainer = popupContent.querySelector('#mission_favorites_container');
                let allMissions = [], favoriteMissions = [];

                async function loadFavorites() {
                    const userInfo = HWHFuncs.getUserInfo();
                    if (!userInfo || !userInfo.id) return [];
                    const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                    await db.open();
                    const allSettings = await db.get(userInfo.id, {});
                    return allSettings.campaignAutomator?.favorites || [];
                }
                async function saveFavorites(favs) {
                    const userInfo = HWHFuncs.getUserInfo();
                    if (!userInfo || !userInfo.id) return;
                    const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                    await db.open();
                    const allSettings = await db.get(userInfo.id, {});
                    if (!allSettings.campaignAutomator) allSettings.campaignAutomator = {};
                    allSettings.campaignAutomator.favorites = favs;
                    await db.set(userInfo.id, allSettings);
                }
                function renderMissionList(missionsToRender) {
                    missionListContainer.innerHTML = '';
                    missionsToRender.forEach(mission => {
                        const isFavorite = favoriteMissions.includes(mission.id);
                        const item = document.createElement('div');
                        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px; cursor: pointer; border-bottom: 1px solid #444;';
                        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#554433');
                        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
                        const nameSpan = document.createElement('span');
                        nameSpan.textContent = `${mission.id}: ${mission.name}`;
                        nameSpan.style.flexGrow = '1';
                        nameSpan.addEventListener('click', () => selectMission(mission.id));
                        const starSpan = document.createElement('span');
                        starSpan.textContent = isFavorite ? '★' : '☆';
                        starSpan.style.color = isFavorite ? 'gold' : 'grey';
                        starSpan.addEventListener('click', () => toggleFavorite(mission.id));
                        item.appendChild(nameSpan);
                        item.appendChild(starSpan);
                        missionListContainer.appendChild(item);
                    });
                }
                function renderFavoritesList() {
                    favoritesContainer.innerHTML = '';
                    if (favoriteMissions.length === 0) { favoritesContainer.textContent = 'No favorites yet.'; return; }
                    favoriteMissions.forEach(favId => {
                        const mission = allMissions.find(m => m.id === favId);
                        if (!mission) return;
                        const item = document.createElement('div');
                        item.textContent = `${mission.id}: ${mission.name}`;
                        item.style.cssText = 'padding: 8px; cursor: pointer; border-bottom: 1px solid #444;';
                        item.addEventListener('mouseenter', () => item.style.backgroundColor = '#554433');
                        item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
                        item.addEventListener('click', () => selectMission(mission.id));
                        favoritesContainer.appendChild(item);
                    });
                }
                function selectMission(missionId) {
                    panel.querySelector('#hwh_mission_id_single').value = missionId;
                    panel.querySelector('#hwh_mission_id_sequence').value = missionId;
                    HWHFuncs.popup.hide();
                    document.removeEventListener('keydown', handleEscKey);
                    saveSettings();
                }
                async function toggleFavorite(missionId) {
                    const index = favoriteMissions.indexOf(missionId);
                    if (index > -1) { favoriteMissions.splice(index, 1); } else { favoriteMissions.push(missionId); }
                    favoriteMissions.sort((a, b) => a - b);
                    await saveFavorites(favoriteMissions);
                    const searchTerm = missionSearchInput.value.toLowerCase();
                    const filteredMissions = allMissions.filter(m => searchTerm === '' || m.name.toLowerCase().includes(searchTerm) || String(m.id).includes(searchTerm));
                    renderMissionList(filteredMissions);
                    renderFavoritesList();
                }

                try {
                    favoriteMissions = await loadFavorites();
                    allMissions = Object.values(lib.data.mission).map(mission => ({
                        id: mission.id,
                        name: cheats.translate("LIB_MISSION_NAME_" + mission.id)
                    })).filter(mission => mission.id < 1000);

                    renderMissionList(allMissions);
                    renderFavoritesList();

                    missionSearchInput.addEventListener('input', () => {
                        const searchTerm = missionSearchInput.value.toLowerCase();
                        const filteredMissions = allMissions.filter(m => m.name.toLowerCase().includes(searchTerm) || String(m.id).includes(searchTerm));
                        renderMissionList(filteredMissions);
                    });
                } catch(e) {
                    missionListContainer.textContent = "Error loading internal mission data.";
                    console.error("Campaign Automator Error:", e);
                }
            }

            async function checkVipStatus(userInfo) {
                try {
                    const inventory = await Send('{"calls":[{"name":"inventoryGet","args":{},"ident":"inventoryGet"}]}').then(d => d.results[0].result.response);
                    const hasGoldTicket = inventory.consumable && inventory.consumable[151] > 0;
                    const vipPoints = userInfo.vipPoints;
                    const vipLevels = lib.data.level.vip;
                    let currentVipLevel = 0;
                    for (const level of Object.values(vipLevels)) {
                        if (vipPoints >= level.vipPoints) { currentVipLevel = level.level; } else { break; }
                    }
                    const vip5Option = panel.querySelector('#hwh_method_vip5');
                    if (vip5Option) {
                        if (currentVipLevel >= 5 || hasGoldTicket) { vip5Option.style.display = 'block'; } else { vip5Option.style.display = 'none'; }
                    }
                } catch (e) { console.error("Campaign Automator: Failed to check VIP status.", e); }
            }

            function toggleUIMode() {
                const method = panel.querySelector('#hwh_method').value;
                const repsInput = panel.querySelector('#hwh_repetitions');
                const repsLabel = panel.querySelector('#hwh_reps_label');
                const missionInputSingle = panel.querySelector('#hwh_mission_id_single');
                const missionLabelSingle = panel.querySelector('#hwh_mission_id_single_label');
                const missionInputSequence = panel.querySelector('#hwh_mission_id_sequence');
                const missionLabelSequence = panel.querySelector('#hwh_mission_id_sequence_label');
                if (method === 'sequence') {
                    repsInput.style.display = 'none';
                    repsLabel.style.display = 'none';
                    missionInputSingle.style.display = 'none';
                    missionLabelSingle.style.display = 'none';
                    missionInputSequence.style.display = '';
                    missionLabelSequence.style.display = '';
                } else {
                    repsInput.style.display = '';
                    repsLabel.style.display = '';
                    missionInputSingle.style.display = '';
                    missionLabelSingle.style.display = '';
                    missionInputSequence.style.display = 'none';
                    missionLabelSequence.style.display = 'none';
                }
            }

            // --- NEW: Function to update the mission name display ---
            function updateMissionNameDisplay() {
                const display = panel.querySelector('#hwh_mission_name_display');
                const method = panel.querySelector('#hwh_method').value;
                const missionIdInput = (method === 'sequence')
                    ? panel.querySelector('#hwh_mission_id_sequence')
                    : panel.querySelector('#hwh_mission_id_single');

                // For sequences, we don't display a single name.
                if (method === 'sequence' || missionIdInput.value.includes(',') || missionIdInput.value.includes('-')) {
                    display.textContent = '';
                    return;
                }

                const missionId = parseInt(missionIdInput.value);
                if (isNaN(missionId)) {
                    display.textContent = '';
                    return;
                }
                try {
                    const mission = lib.data.mission[missionId];
                    if (mission) {
                        display.textContent = cheats.translate("LIB_MISSION_NAME_" + mission.id);
                    } else {
                        display.textContent = 'Invalid ID';
                    }
                } catch (e) {
                    display.textContent = '';
                }
            }

            // --- HTML CREATION & EVENT BINDING ---
            panel.innerHTML = `
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center; margin-bottom: 5px;">
                    <label id="hwh_mission_id_single_label">MissID:</label>
                    <input type="number" id="hwh_mission_id_single" placeholder="e.g. 25" max="9999" style="width: 100%; box-sizing: border-box; background: #302018; color: #fce1ac; border: 1px solid #ce9767;">
                    <label id="hwh_mission_id_sequence_label" style="display: none;">Sequence:</label>
                    <input type="text" id="hwh_mission_id_sequence" placeholder="e.g. 10,11-15" style="width: 100%; box-sizing: border-box; background: #302018; color: #fce1ac; border: 1px solid #ce9767; display: none;">

                    <div id="hwh_mission_name_display" style="grid-column: 1 / -1; text-align: center; min-height: 1.2em; color: #f0e68c; font-style: italic; font-size: 12px; padding: 2px 0;"></div>

                    <label id="hwh_reps_label">Reps:</label>
                    <input type="number" id="hwh_repetitions" value="1" max="9999" style="width: 100%; box-sizing: border-box; background: #302018; color: #fce1ac; border: 1px solid #ce9767;">
                    <label>Method:</label>
                    <select id="hwh_method" style="width: 100%; box-sizing: border-box; background: #302018; color: #fce1ac; border: 1px solid #ce9767;">
                        <option value="skip_battle">Skip Battle (All)</option>
                        <option value="sequence" selected>Sequence (Skip Battle)</option>
                        <option value="raid_single">VIP 1+ Raid</option>
                        <option value="raid_multi" id="hwh_method_vip5" style="display: none;">VIP 5+ Raid</option>
                    </select>
                </div>
                <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                    <div id="hwh_menu_button" class="scriptMenu_button scriptMenu_beigeButton" style="flex: 1;"><div class="scriptMenu_buttonText">Menu</div></div>
                    <div id="hwh_start_automation" class="scriptMenu_button scriptMenu_greenButton" style="flex: 2;"><div class="scriptMenu_buttonText">Start</div></div>
                </div>
                <div style="border-top: 1px solid #ce9767; padding-top: 10px; display: grid; grid-template-columns: auto 1fr; gap: 8px; align-items: center; margin-bottom: 10px;">
                    <label for="hwh_auto_start_toggle" title="Automatically start when energy is above the threshold.">Auto Start:</label>
                    <input type="checkbox" id="hwh_auto_start_toggle" style="justify-self: start;">
                    <label for="hwh_auto_sync_toggle" title="After a run, if energy is low, perform a Sync.">Auto Sync:</label>
                    <input type="checkbox" id="hwh_auto_sync_toggle" style="justify-self: start;">
                    <label for="hwh_energy_threshold">Energy &gt;:</label>
                    <input type="number" id="hwh_energy_threshold" value="120" min="1" max="9999" style="width: 100%; box-sizing: border-box; background: #302018; color: #fce1ac; border: 1px solid #ce9767;">
                </div>
                <div id="hwh_profiles_container" style="border-top: 1px solid #ce9767; padding-top: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; margin-bottom: 5px;">
                        <div id="hwh_load_profile_1" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 1"><div class="scriptMenu_buttonText">P1</div></div>
                        <div id="hwh_load_profile_2" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 2"><div class="scriptMenu_buttonText">P2</div></div>
                        <div id="hwh_load_profile_3" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 3"><div class="scriptMenu_buttonText">P3</div></div>
                        <div id="hwh_load_profile_4" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 4"><div class="scriptMenu_buttonText">P4</div></div>
                        <div id="hwh_load_profile_5" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 5"><div class="scriptMenu_buttonText">P5</div></div>
                        <div id="hwh_load_profile_6" class="scriptMenu_button scriptMenu_beigeButton" title="Load Profile 6"><div class="scriptMenu_buttonText">P6</div></div>
                    </div>
                     <div id="hwh_manage_data_button" class="scriptMenu_button scriptMenu_beigeButton"><div class="scriptMenu_buttonText">Profiles & Data</div></div>
                </div>
            `;
            campaignGroup.appendChild(panel);

            // --- Event Listeners ---
            panel.querySelector('#hwh_start_automation').addEventListener('click', startAutomation);
            panel.querySelector('#hwh_menu_button').addEventListener('click', openCustomMenu);
            panel.querySelector('#hwh_repetitions').addEventListener('change', saveSettings);
            panel.querySelector('#hwh_auto_sync_toggle').addEventListener('change', saveSettings);
            panel.querySelector('#hwh_manage_data_button').addEventListener('click', handleManageDataClick); // NEW

            panel.querySelector('#hwh_method').addEventListener('change', () => { saveSettings(); toggleUIMode(); applyVip5Rules(); updateMissionNameDisplay(); });

            const missionIdSingleInput = panel.querySelector('#hwh_mission_id_single');
            missionIdSingleInput.addEventListener('change', () => { saveSettings(); applyVip5Rules(); });
            missionIdSingleInput.addEventListener('input', updateMissionNameDisplay); // NEW

            const missionIdSequenceInput = panel.querySelector('#hwh_mission_id_sequence');
            missionIdSequenceInput.addEventListener('change', saveSettings);
            missionIdSequenceInput.addEventListener('input', updateMissionNameDisplay); // NEW

            const thresholdInput = panel.querySelector('#hwh_energy_threshold');
            thresholdInput.addEventListener('change', () => {
                const min = parseInt(thresholdInput.min) || 1;
                if (parseInt(thresholdInput.value) < min) { thresholdInput.value = min; }
                saveSettings();
            });

            panel.querySelector('#hwh_auto_start_toggle').addEventListener('change', (event) => {
                saveSettings();
                if (event.target.checked) { checkEnergyAndAutoStart(true); }
            });

            for (let i = 1; i <= NUM_PROFILES; i++) {
                panel.querySelector(`#hwh_load_profile_${i}`).addEventListener('click', () => loadProfile(i));
            }

            // --- Settings Loading ---
            const loadSettingsInterval = setInterval(async () => {
                const userInfo = HWHFuncs.getUserInfo();
                if (userInfo && userInfo.id) {
                    clearInterval(loadSettingsInterval);
                    const db = new HWHExtensionDB('HeroWarsHelper', 'settings');
                    await db.open();
                    const allSettings = await db.get(userInfo.id, {});
                    const savedData = allSettings.campaignAutomator || {};

                    panel.querySelector('#hwh_mission_id_single').value = savedData.missionId || '';
                    panel.querySelector('#hwh_mission_id_sequence').value = savedData.missionId || '2,3,4,5';
                    panel.querySelector('#hwh_repetitions').value = savedData.reps || 10;
                    panel.querySelector('#hwh_method').value = savedData.method || 'sequence';
                    panel.querySelector('#hwh_auto_start_toggle').checked = savedData.autoStartEnabled || false;
                    panel.querySelector('#hwh_auto_sync_toggle').checked = savedData.autoSyncEnabled || false;
                    panel.querySelector('#hwh_energy_threshold').value = savedData.energyThreshold || 120;

                    checkVipStatus(userInfo);
                    toggleUIMode();
                    applyVip5Rules();
                    updateMissionNameDisplay();

                    console.log("Campaign Automator: Settings loaded. Starting auto-check mechanism.");
                    setTimeout(() => checkEnergyAndAutoStart(true), 2000);
                    if (autoStartIntervalId) clearInterval(autoStartIntervalId);
                    autoStartIntervalId = setInterval(() => checkEnergyAndAutoStart(false), CHECK_INTERVAL);
                }
            }, 500);

            const observer = new MutationObserver(() => { const valuesGroup = menu.mainMenu.querySelector('details[data-name="values"]'); if (valuesGroup) { valuesGroup.insertAdjacentElement('afterend', campaignGroup); observer.disconnect(); } });
            observer.observe(menu.mainMenu, { childList: true });
        });
    }

    const checkInterval = setInterval(() => {
        if (typeof HWHClasses !== 'undefined' && typeof HWHFuncs !== 'undefined' && typeof Send !== 'undefined' && typeof Calc !== 'undefined' && typeof lib !== 'undefined') {
            clearInterval(checkInterval);
            initializeExtension();
        }
    }, 100);

})();

// ==UserScript==
// @name			Adventure
// @name:en			HWHAdventureExt
// @name:ru			HWHAdventureExt
// @namespace		HWHAdventureExt
// @version			0.0.1
// @description		Extension for HeroWarsHelper script
// @description:en	Extension for HeroWarsHelper script
// @description:ru	Р Р°СЃС€РёСЂРµРЅРёРµ РґР»СЏ СЃРєСЂРёРїС‚Р° HeroWarsHelper
// @author			ZingerY
// @license 		Copyright ZingerY
// @homepage		https://zingery.ru/scripts/HWHAdventureExt.user.js
// @icon			https://zingery.ru/scripts/VaultBoyIco16.ico
// @icon64			https://zingery.ru/scripts/VaultBoyIco64.png
// @match			https://www.hero-wars.com/*
// @match			https://apps-1701433570146040.apps.fbsbx.com/*
// @run-at			document-start
// ==/UserScript==

(function () {

	if (!this.HWHClasses) {
		console.log('%cObject for extension not found', 'color: red');
		return;
	}

	console.log('%cStart Extension ' + GM_info.script.name + ', v' + GM_info.script.version + ' by ' + GM_info.script.author, 'color: red');
	const { addExtentionName } = HWHFuncs;
	addExtentionName(GM_info.script.name, GM_info.script.version, GM_info.script.author);

	const {
		I18N,
		getSaveVal,
		setSaveVal,
		popup,
	} = HWHFuncs;

	const i18nLangDataRu = {
		START_ADVENTURE_1: '              РќР°С‡Р°С‚СЊ РїРѕ РїСѓС‚Рё в„–1!              ',
		START_ADVENTURE_2: '              РќР°С‡Р°С‚СЊ РїРѕ РїСѓС‚Рё в„–2!              ',
		START_ADVENTURE_3: '              РќР°С‡Р°С‚СЊ РїРѕ РїСѓС‚Рё в„–3!              ',

	}

	Object.assign(HWHData.i18nLangData['ru'], i18nLangDataRu);

	const { executeAdventure } = HWHClasses;

	class extExecuteAdventure extends executeAdventure {
		defaultWays = {
			//Р“Р°Р»Р°С…Р°Рґ, 1-СЏ
			"adv_strongford_2pl_easy": {
				first: '1,2,3,5,6',
				second: '1,2,4,7,6',
				third: '1,2,3,5,6'
			},
			//Р”Р¶РёРЅРґР¶РµСЂ, 2-СЏ
			"adv_valley_3pl_easy": {
				first: '1,2,5,8,9,11',
				second: '1,3,6,9,11',
				third: '1,4,7,10,9,11'
			},
			//РћСЂРёРѕРЅ, 3-СЏ
			"adv_ghirwil_3pl_easy": {
				first: '1,5,6,9,11',
				second: '1,4,12,13,11',
				third: '1,2,3,7,10,11'
			},
			//РўРµСЃР°Рє, 4-СЏ
			"adv_angels_3pl_easy_fire": {
				first: '1,2,4,7,18,8,12,19,22,23',
				second: '1,3,6,11,17,10,16,21,22,23',
				third: '1,5,24,25,9,14,15,20,22,23'
			},
			//Р“Р°Р»Р°С…Р°Рґ, 5-СЏ
			"adv_strongford_3pl_normal_2": {
				first: '1,2,7,8,12,16,23,26,25,21,24',
				second: '1,4,6,10,11,15,22,15,19,18,24',
				third: '1,5,9,10,14,17,20,27,25,21,24'
			},
			//Р”Р¶РёРЅРґР¶РµСЂ, 6-СЏ
			"adv_valley_3pl_normal": {
				first: '1,2,4,7,10,13,16,19,24,22,25',
				second: '1,3,6,9,12,15,18,21,26,23,25',
				third: '1,5,7,8,11,14,17,20,22,25'
			},
			//РћСЂРёРѕРЅ, 7-СЏ
			"adv_ghirwil_3pl_normal_2": {
				first: '1,11,10,11,12,15,12,11,21,25,27',
				second: '1,7,3,4,3,6,13,19,20,24,27',
				third: '1,8,5,9,16,23,22,26,27'
			},
			//РўРµСЃР°Рє, 8-СЏ
			"adv_angels_3pl_normal": {
				first: '1,3,4,8,7,9,10,13,17,16,20,22,23,31,32',
				second: '1,3,5,7,8,11,14,18,20,22,24,27,30,26,32',
				third: '1,3,2,6,7,9,11,15,19,20,22,21,28,29,25'
			},
			//Р“Р°Р»Р°С…Р°Рґ, 9-СЏ
			"adv_strongford_3pl_hard_2": {
				first: '1,2,6,10,15,7,16,17,23,22,27,32,35,37,40,45',
				second: '1,3,8,12,11,18,19,28,34,33,38,41,43,46,45',
				third: '1,2,5,9,14,20,26,21,30,36,39,42,44,45'
			},
			//Р”Р¶РёРЅРґР¶РµСЂ, 10-СЏ
			"adv_valley_3pl_hard": {
				first: '1,3,2,6,11,17,25,30,35,34,29,24,21,17,12,7',
				second: '1,4,8,13,18,22,26,31,36,40,45,44,43,38,33,28',
				third: '1,5,9,14,19,23,27,32,37,42,48,51,50,49,46,52'
			},
			//РћСЂРёРѕРЅ, 11-СЏ
			"adv_ghirwil_3pl_hard": {
				first: '1,2,3,6,8,12,11,15,21,27,36,34,33,35,37',
				second: '1,2,4,6,9,13,18,17,16,22,28,29,30,31,25,19',
				third: '1,2,5,6,10,13,14,20,26,32,38,41,40,39,37'
			},
			//РўРµСЃР°Рє, 12-СЏ
			"adv_angels_3pl_hard": {
				first: '1,2,8,11,7,4,7,16,23,32,33,25,34,29,35,36',
				second: '1,3,9,13,10,6,10,22,31,30,21,30,15,28,20,27',
				third: '1,5,12,14,24,17,24,25,26,18,19,20,27'
			},
			//РўРµСЃР°Рє, 13-СЏ
			"adv_angels_3pl_hell": {
				first: '1,2,4,6,16,23,33,34,25,32,29,28,20,27',
				second: '1,7,11,17,24,14,26,18,19,20,27,20,12,8',
				third: '1,9,3,5,10,22,31,36,31,30,15,28,29,30,21,13'
			},
			//Р“Р°Р»Р°С…Р°Рґ, 13-СЏ
			"adv_strongford_3pl_hell": {
				first: '1,2,5,11,14,20,26,21,30,35,38,41,43,44',
				second: '1,2,6,12,15,7,16,17,23,22,27,42,34,36,39,44',
				third: '1,3,8,9,13,18,19,28,0,33,37,40,32,45,44'
			},
			//РћСЂРёРѕРЅ, 13-СЏ
			"adv_ghirwil_3pl_hell": {
				first: '1,2,3,6,8,12,11,15,21,27,36,34,33,35,37',
				second: '1,2,4,6,9,13,18,17,16,22,28,29,30,31,25,19',
				third: '1,2,5,6,10,13,14,20,26,32,38,41,40,39,37'
			},
			//Р”Р¶РёРЅРґР¶РµСЂ, 13-СЏ
			"adv_valley_3pl_hell": {
				first: '1,3,2,6,11,17,25,30,35,34,29,24,21,17,12,7',
				second: '1,4,8,13,18,22,26,31,36,40,45,44,43,38,33,28',
				third: '1,5,9,14,19,23,27,32,37,42,48,51,50,49,46,52'
			}
		}
		async getPath() {
			const oldVal = getSaveVal('adventurePath', '');
			const keyPath = `adventurePath:${this.mapIdent}`;
			const answer = await popup.confirm(I18N('ENTER_THE_PATH'), [
				{
					msg: I18N('START_ADVENTURE'),
					placeholder: '1,2,3,4,5,6',
					isInput: true,
					default: getSaveVal(keyPath, oldVal)
				},
				{
					msg: I18N('START_ADVENTURE_1'),
					isInput: true,
					default: this.defaultWays[this.mapIdent]?.first
				},
				{
					msg: I18N('START_ADVENTURE_2'),
					isInput: true,
					default: this.defaultWays[this.mapIdent]?.second
				},
				{
					msg: I18N('START_ADVENTURE_3'),
					isInput: true,
					default: this.defaultWays[this.mapIdent]?.third
				},
				{
					msg: I18N('BTN_CANCEL'),
					result: false,
					isCancel: true
				},
			]);
			if (!answer) {
				this.terminatРµReason = I18N('BTN_CANCELED');
				return false;
			}

			let path = answer.split(',');
			if (path.length < 2) {
				path = answer.split('-');
			}
			if (path.length < 2) {
				this.terminatРµReason = I18N('MUST_TWO_POINTS');
				return false;
			}

			for (let p in path) {
				path[p] = +path[p].trim()
				if (Number.isNaN(path[p])) {
					this.terminatРµReason = I18N('MUST_ONLY_NUMBERS');
					return false;
				}
			}

			if (!this.checkPath(path)) {
				return false;
			}

			setSaveVal(keyPath, answer);
			return path;
		}
	}

	this.HWHClasses.executeAdventure = extExecuteAdventure;

})()
// ==UserScript==
// @name			HWHBestDungeonExt
// @name:en			HWHBestDungeonExt
// @name:ru			HWHBestDungeonExt
// @namespace		HWHBestDungeonExt
// @version			0.1.5
// @description		Extension for HeroWarsHelper script
// @description:en	Extension for HeroWarsHelper script
// @description:ru	Расширение для скрипта HeroWarsHelper
// @author			ZingerY
// @license 		Copyright ZingerY
// @homepage		https://zingery.ru/scripts/HWHBestDungeonExt_ec4d1eb36b22d19728e9d1d23ca84d1c.user.js
// @downloadURL		https://zingery.ru/scripts/HWHBestDungeonExt_ec4d1eb36b22d19728e9d1d23ca84d1c.user.js
// @updateURL		https://zingery.ru/scripts/HWHBestDungeonExt_ec4d1eb36b22d19728e9d1d23ca84d1c.user.js
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

	const { getInput, setProgress, hideProgress, I18N, countdownTimer, getSaveVal, setSaveVal, popup, random } = HWHFuncs;

	const { DungeonFixBattle } = HWHClasses;

	class UpdateDungeonFixBattle extends DungeonFixBattle {
		getTimer() {
			if (this.count === 1) {
				this.isGetTimer = false;
				this.maxTimer = 100;
				return 168.8;
			}

			return this.randTimer();
		}

		setState() {
			this.lastState = DungeonUtils.getState(this.lastResult);
		}

		checkResult() {
			this.setState();
			if (DungeonUtils.compareScore(this.lastState, this.bestResult.value)) {
				this.bestResult = {
					count: this.count,
					timer: this.lastTimer,
					value: this.lastState,
					result: this.lastResult.result,
					progress: this.lastResult.progress,
				};
			}
		}
	}

	HWHClasses.DungeonFixBattle = UpdateDungeonFixBattle;

	const { i18nLangData } = HWHData;

	i18nLangData['en'] = Object.assign(i18nLangData['en'], {
		BEST_DUNGEON_FEEDBACK: 'Feedback',
		BEST_DUNGEON_FEEDBACK_TITLE: 'Go to Telegram group for feedback on the HWHBestDungeonExt script',
		BEST_DUNGEON_FEEDBACK_URL: 'https://t.me/+RHdutKsQQcFlODMy',
		BEST_DUNGEON_WINNING_FIGHT_NOT_FOUND: 'No winning fight found\n',
		BEST_DUNGEON_BEST_COMBINATION: 'Best combination:',
		BEST_DUNGEON_SET_USE_TITANS: 'Titans used in the dungeon:',
		BEST_DUNGEON_DUNGEON_SETTINGS_TITLE: 'Dungeon run Settings',
		BEST_DUNGEON_PER_HOUR: 'per hour',
		DUNGEON: 'Dgn',
	});

	i18nLangData['ru'] = Object.assign(i18nLangData['ru'], {
		BEST_DUNGEON_FEEDBACK: 'Обратная связь',
		BEST_DUNGEON_FEEDBACK_TITLE: 'Перейти в Telegram группу для обратной связи по скрипту HWHBestDungeonExt',
		BEST_DUNGEON_FEEDBACK_URL: 'https://t.me/+1RpKpBDs9OAyZDdi',
		BEST_DUNGEON_WINNING_FIGHT_NOT_FOUND: 'Не найден победный бой\n',
		BEST_DUNGEON_BEST_COMBINATION: 'Лучшее сочетание:',
		BEST_DUNGEON_SET_USE_TITANS: 'Титаны используемые в подземке:',
		BEST_DUNGEON_DUNGEON_SETTINGS_TITLE: 'Настройки для прохождения подздемелья',
		BEST_DUNGEON_PER_HOUR: 'в час',
		DUNGEON: 'Подземка',
	});

	const { buttons } = HWHData;

	buttons['HWHBestDungeonExt'] = {
		get name() { return I18N('BEST_DUNGEON_FEEDBACK'); },
		get title() { return I18N('BEST_DUNGEON_FEEDBACK_TITLE'); },
		color: 'blue',
		onClick: () => {
			window.open(I18N('BEST_DUNGEON_FEEDBACK_URL'), '_blank');
		},
	};

	if (buttons?.testDungeon && buttons.testDungeon?.combineList) {
		buttons.testDungeon.combineList.splice(1, 0, {
			name: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" style="width: 25px;height: 25px;"><path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"></path></svg>',
			onClick: async () => {
				const stateUseTitan = getSaveVal('stateUseTitan', {});
				const allowedTitanIds = getSaveVal('allowedTitanIds', []);
				const titanIds = Object.keys(await Caller.send('titanGetAll'));

				const answer = await popup.confirm(
					I18N('BEST_DUNGEON_SET_USE_TITANS'),
					[
						{ result: false, isClose: true },
						{ msg: 'Ok', result: true, color: 'green' },
					],
					titanIds.map((id) => ({
						name: id,
						label: cheats.translate('LIB_HERO_NAME_' + id) + ' (' + (stateUseTitan[id] ?? 0) + ')',
						checked: !allowedTitanIds.length || allowedTitanIds.includes(+id),
					}))
				);

				if (answer) {
					const checkboxes = popup.getCheckBoxes();
					const select = checkboxes.filter((e) => e.checked).map((e) => +e.name);
					setSaveVal('allowedTitanIds', select);
				}
			},
			get title() {
				return I18N('BEST_DUNGEON_DUNGEON_SETTINGS_TITLE');
			},
			color: 'blue',
		});
	}

	class Stat {
		constructor(obj) {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					this[key] = obj[key];
				}
			}
		}

		// Умножает все значения на указанное число
		multiply(multiplier) {
			for (const key in this) {
				if (this.hasOwnProperty(key)) {
					this[key] *= multiplier;
				}
			}
		}

		// Суммирует значения одинаковых ключей и добавляет новые ключи
		add(obj) {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (this.hasOwnProperty(key)) {
						this[key] += obj[key];
					} else {
						this[key] = obj[key];
					}
				}
			}
		}

		// Округляет все значения до второго знака после запятой
		round() {
			for (const key in this) {
				if (this.hasOwnProperty(key)) {
					this[key] = Math.round(this[key] * 100) / 100;
				}
			}
		}
	}

	class TitanStats {
		constructor(titans, spirits, states) {
			this.titans = titans;
			this.spirits = spirits;
			this.states = states;
			this.heroLib = lib.data.hero;
			this.titanLib = lib.data.titan;
			this.artsLib = lib.data.titanArtifact;
			this.skinsLib = lib.data.skin;
			this.ruleLib = lib.data.rule;
			this.spiritSkills = lib.data.titanSpirit.skills;
			this.baseStats = new Stat({});
		}

		// Расчет базовых статов
		calculateBaseStats() {
			const titan = this.titans[this.titanId];
			const heroLib = this.heroLib[this.titanId];
			const titanLib = this.titanLib[this.titanId];
			this.baseStats = new Stat(heroLib.baseStats);
			const addStat = new Stat(titanLib.stars[titan.star].battleStatData);
			const coef = Math.pow(titan.level, this.ruleLib.titanLevelPowerCoefficient);
			addStat.multiply(coef);
			this.baseStats.add(addStat);
			this.baseStats.round();
		}

		// Добавление статов скинов
		addSkinStats() {
			const titan = this.titans[this.titanId];
			const skins = Object.entries(titan.skins);
			for (const [id, lvl] of skins) {
				const bonus = this.skinsLib[id].statData.levels[lvl].statBonus;
				this.baseStats.add(bonus);
			}
		}

		// Добавление статов артефактов
		addArtifactStats() {
			const titan = this.titans[this.titanId];
			const titanLibArt = this.titanLib[this.titanId].artifacts;
			for (const index in titanLibArt) {
				const artId = titanLibArt[index];
				const { level, star } = titan.artifacts[index];
				if (!star) {
					continue;
				}
				const libArt = this.artsLib.id[artId];
				const battleEffects = libArt.battleEffect;
				const artStat = new Stat({});
				for (const effectId of battleEffects) {
					const effect = this.artsLib.battleEffect[effectId];
					const stat = effect.effect;
					artStat.add({
						[stat]: effect.levels[level],
					});
				}
				const multiplier = this.artsLib.type[libArt.type].evolution[star].battleEffectMultiplier;
				artStat.multiply(multiplier);
				artStat.round();
				this.baseStats.add(artStat);
			}
		}

		// Добавление статов тотема
		addTotemStats() {
			const titanLib = this.titanLib[this.titanId];
			const element = titanLib.element;
			const spirit = this.spirits[element];
			let spiritMultiplier = 0;
			const spiritStat = new Stat({});
			if (spirit.star) {
				const battleEffects = this.artsLib.id[spirit.id].battleEffect;
				for (const effectId of battleEffects) {
					const effect = this.artsLib.battleEffect[effectId];
					const stat = effect.effect;
					spiritStat.add({
						[stat]: effect.levels[spirit.level],
					});
				}

				spiritMultiplier = this.artsLib.type['spirit'].evolution[spirit.star].battleEffectMultiplier;
				spiritStat.multiply(spiritMultiplier);
			}
			const elementSpiritSkills = [];
			const skills = [];
			if (spirit.primalSkill) {
				skills.push(...Object.entries(spirit.primalSkill));
			}
			if (spirit.elementalSkill) {
				skills.push(...Object.entries(spirit.elementalSkill));
			}
			for (const [id, level] of skills) {
				const skillId = +id;
				const tierScale = this.spiritSkills[skillId].levelScale[level - 1];
				elementSpiritSkills.push({ skillId, level, tierScale });
			}
			const addSpirit = {
				element,
				elementSpiritLevel: spirit.level,
				elementSpiritStar: spirit.star,
				elementSpiritSkills,
				elementAffinityPower: spirit.level * spiritMultiplier,
			};
			spiritStat.add(addSpirit);
			this.baseStats.add(spiritStat);
		}

		// Получение статов титана по его ID
		getTitanStats(titanId) {
			this.titanId = titanId;
			this.calculateBaseStats();
			this.addSkinStats();
			this.addArtifactStats();
			this.addTotemStats();
			const state = this.states[titanId] ?? {
				hp: Math.floor(this.baseStats.hp),
				energy: 0,
				isDead: false,
			};
			return Object.assign(this.titans[this.titanId], this.baseStats, { state });
		}

		getAllowTitanIds(element = false, allowedIds = []) {
			return Object.values(this.titans)
				.map((e) => e.id)
				.filter(
					(id) =>
						!this.states[id]?.isDead &&
						(!element || element == this.titanLib[id]?.element) &&
						(!allowedIds.length || allowedIds.includes(id))
				);
		}
	}

	class GeneticAlgorithm {
		constructor({ values, combinationSize, populationSize, generations, mutationRate, eliteCount }) {
			this.values = values;
			this.combinationSize = combinationSize;
			this.populationSize = populationSize;
			this.generations = generations;
			this.mutationRate = mutationRate;
			this.eliteCount = eliteCount;
			this.evaluationCache = new Map();
			this.evaluationCalls = 0;
			this.bestScores = [];
		}

		/**
		 * Генерация исходной популяции комбинаций
		 * @returns {*[]}
		 */
		generateInitialPopulation() {
			const population = [];
			for (let i = 0; i < this.populationSize; i++) {
				const shuffledValues = [...this.values];
				for (let j = shuffledValues.length - 1; j > 0; j--) {
					const randomIndex = Math.floor(Math.random() * (j + 1));
					[shuffledValues[j], shuffledValues[randomIndex]] = [shuffledValues[randomIndex], shuffledValues[j]];
				}
				const combination = shuffledValues.slice(0, this.combinationSize).sort();
				population.push(combination);
			}
			return population;
		}

		/**
		 * Функция скрещивания комбинаций
		 * @param parent1
		 * @param parent2
		 * @returns {*[][]}
		 */
		crossover(parent1, parent2) {
			const crossoverPoint = Math.floor(Math.random() * parent1.length);
			const child1 = [...new Set([...parent1.slice(0, crossoverPoint), ...parent2])].slice(0, this.combinationSize);
			const child2 = [...new Set([...parent2.slice(0, crossoverPoint), ...parent1])].slice(0, this.combinationSize);
			return [child1.sort(), child2.sort()];
		}

		/**
		 * Функция мутации комбинации
		 * @param combination
		 * @returns {*}
		 */
		mutate(combination) {
			const dynamicRate = this.mutationRate * (1 - this.evaluationCalls / 300);
			const availableValues = this.values.filter((value) => !combination.includes(value));
			for (let i = 0; i < combination.length; i++) {
				if (Math.random() < dynamicRate && availableValues.length > 0) {
					const randomIndex = Math.floor(Math.random() * availableValues.length);
					combination[i] = availableValues[randomIndex];
					availableValues.splice(randomIndex, 1);
				}
			}
			return combination.sort();
		}

		/**
		 * Функция проверки качества комбинации
		 * @param combination
		 * @returns {any}
		 */
		async evaluateCombination(combination) {
			const key = combination.join(',');
			if (!this.evaluationCache.has(key)) {
				const value = await this.getEvaluate(combination);
				this.evaluationCache.set(key, value);
				this.evaluationCalls++;
			}
			return this.evaluationCache.get(key);
		}

		async getEvaluate(combination) {
			return combination.reduce((sum, value) => sum + value, 0);
		}

		customSort(a, b) {
			return b.v - a.v;
		}

		compareScore(bestScore, targetScore) {
			return bestScore >= targetScore;
		}

		setEvaluate(evaFunction) {
			this.getEvaluate = evaFunction;
		}

		setCustomSort(customSort) {
			this.customSort = customSort;
		}

		setCompereScore(compareScore) {
			this.compareScore = compareScore;
		}

		async sortPopulation(population) {
			const evaluatedValues = await Promise.all(
				population.map(async (item) => ({
					item,
					v: await this.evaluateCombination(item),
				}))
			);

			evaluatedValues.sort(this.customSort);

			return evaluatedValues.map(({ item }) => item);
		}

		async selectParent(population, tournamentSize = 3) {
			let best = population[Math.floor(Math.random() * population.length)];
			for (let i = 1; i < tournamentSize; i++) {
				const candidate = population[Math.floor(Math.random() * population.length)];
				if ((await this.evaluateCombination(candidate)) > (await this.evaluateCombination(best))) {
					best = candidate;
				}
			}
			return best;
		}

		/**
		 * Запуск генетического алгоритма
		 * @returns {*}
		 */
		async run() {
			let population = this.generateInitialPopulation();
			this.bestScores = [];

			for (let generation = 0; generation < this.generations; generation++) {
				population = await this.sortPopulation(population);

				const bestScore = await this.evaluateCombination(population[0]);
				this.bestScores.push(bestScore);

				const nextPopulation = population.slice(0, this.eliteCount);

				while (nextPopulation.length < this.populationSize) {
					const parent1 = await this.selectParent(population);
					const parent2 = await this.selectParent(population);

					const [child1, child2] = this.crossover(parent1, parent2);
					nextPopulation.push(this.mutate(child1));
					if (nextPopulation.length < this.populationSize) {
						nextPopulation.push(this.mutate(child2));
					}
				}

				population = nextPopulation;
			}

			population = await this.sortPopulation(population);
			return population[0];
		}

		/**
		 * Генератор параметров
		 * @returns {*[]}
		 */
		static generateParamSets(conf) {
			const paramSets = [];
			for (
				let populationSize = conf.populationSize.min;
				populationSize <= conf.populationSize.max;
				populationSize += conf.populationSize.step
			) {
				for (let generations = conf.generations.min; generations <= conf.generations.max; generations += conf.generations.step) {
					for (let mutationRate = conf.mutationRate.min; mutationRate <= conf.mutationRate.max; mutationRate += conf.mutationRate.step) {
						for (let eliteCount = conf.eliteCount.min; eliteCount <= conf.eliteCount.max; eliteCount += conf.eliteCount.step) {
							paramSets.push({ populationSize, generations, mutationRate, eliteCount });
						}
					}
				}
			}
			return paramSets;
		}

		static async testParams(values, combinationSize, params, countTest = 250) {
			const evaluationCalls = [];
			const scores = [];

			for (let i = 0; i < countTest; i++) {
				const ga = new GeneticAlgorithm({ values, combinationSize, ...params });
				const bestCombination = await ga.run();
				evaluationCalls.push(ga.evaluationCalls);
				const score = ((await ga.evaluateCombination(bestCombination)) - 20016) / 183;
				scores.push(score);
			}

			const avgScore = scores.reduce((a, b) => a + b) / scores.length;
			const avgEvaluationCalls = evaluationCalls.reduce((a, b) => a + b) / evaluationCalls.length;
			return {
				avgScore,
				avgEvaluationCalls,
			};
		}

		/**
		 * Поиск лучших параметров для генетического алгоритма
		 * @param values
		 * @param combinationSize
		 * @param targetScore
		 * @param optimizeConfig
		 * @returns {{generations: number, eliteCount: number, mutationRate: number, populationSize: number}}
		 */
		static async optimizeParameters(values, combinationSize, targetScore, optimizeConfig) {
			const paramSets = this.generateParamSets(optimizeConfig);
			let bestParams = { populationSize: 0, generations: 0, mutationRate: 0, eliteCount: 0 };
			let bestEfficiency = -Infinity;
			const bestData = {
				avgScore: 0,
				avgEvaluationCalls: 0,
			};
			let checkCount = 0;

			for (const params of paramSets) {
				const { avgScore, avgEvaluationCalls } = await this.testParams(values, combinationSize, params);
				const efficiency = (avgScore * avgScore) / avgEvaluationCalls;
				if (efficiency > bestEfficiency && avgScore >= targetScore) {
					bestEfficiency = efficiency;
					bestData.avgEvaluationCalls = avgEvaluationCalls;
					bestData.avgScore = avgScore;
					bestParams = params;
				}

				checkCount++;
				if (!(checkCount % 10)) {
					console.log(`${checkCount}/${paramSets.length}`, bestParams, bestData, process.uptime());
				}
			}
			console.log('Optimal Parameters:', checkCount, bestParams, bestData, process.uptime());
			return bestParams;
		}
	}

	class BestDungeon {
		constructor(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
			this.isFixedBattle = true;
			this.dungeonActivity = 0;
			this.maxDungeonActivity = 150;
			this.currentActivity = 0;
			this.primeElement = ''; // не используется
			this.titanGetAll = {};
			this.teams = { earth: [], fire: [], neutral: [], water: [], hero: {} };
			this.titansStates = {};
			this.talentMsg = '';
			this.talentMsgReward = '';
			this.isShowFixLog = false;
			this.timeoutFix = 15e3;
			this.countFix = 100;
			this.isStop = false;
			this.startTime = Date.now();
			this.colors = {
				water: 'color: #3498db;',
				fire: 'color: #e74c3c;',
				earth: 'color: #2ecc71;',
				light: 'color: #f1c40f;',
				dark: 'color: #9b59b6;',
				neutral: 'color: yellow;',
				green: 'color: #0b0;',
				none: 'color: none;',
				red: 'color: #d00;',
			};
			this.defPowers = {
				earth: 0,
				fire: 0,
				neutral: 0,
				water: 0,
				hero: 0,
			};
			this.maxPowers = {
				earth: 396125,
				fire: 396125,
				neutral: 670725,
				water: 396125,
				hero: 242750,
			};
			this.timers = [];
			this.buffHealing = 0;
		}

		async start() {
			let result = null;
			try {
				result = await Caller.send([
					'dungeonGetInfo',
					'teamGetAll',
					'teamGetFavor',
					'clanGetInfo',
					'titanGetAll',
					'inventoryGet',
					'titanSpirit_getAll',
				]);
			} catch (e) {
				this.endDungeon('Error', e);
			}
			this.startDungeon(result);
		}

		stop() {
			this.isStop = true;
		}

		getActivityPerHour() {
			const elapsedMs = Date.now() - this.startTime;
			const elapsedHours = elapsedMs / 36e5; // 1000 * 60 * 60

			return Math.floor(elapsedHours > 0 ? this.currentActivity / elapsedHours : 0);
		}

		async executeWithRetry(request, maxRetries = 10) {
			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					const result = await Caller.send(request);
					return result;
				} catch (error) {
					console.error(`Retry ${attempt} / ${maxRetries} error:`, error);
					const delayMs = Math.min(random(500, 1000) * Math.pow(2, attempt - 1), 10000);
					await new Promise((resolve) => setTimeout(resolve, delayMs));
				}
			}
			return false;
		}

		getStatMessage() {
			const activityPerHour = this.getActivityPerHour();
			return (
				`Dungeon: ${I18N('TITANIT')} ${this.dungeonActivity}/${this.maxDungeonActivity}
			${this.talentMsg}<br>
			${I18N('TITANIT')}: ${this.currentActivity}<br>
			${activityPerHour} ${I18N('BEST_DUNGEON_PER_HOUR')}<br>
			Cards: ${HWHData.countPredictionCard}<br>` +
				Object.entries(this.defPowers)
					.map(([type, power]) => `${type}: ${power} ${Math.floor((power / this.maxPowers[type]) * 100)}%`)
					.join('<br>') +
				'<br>' +
				(this.buffHealing ? 'Buff: ' + this.buffHealing + '<br>' : '')
			);
		}

		startDungeon(data) {
			const [dungeonGetInfo, teamGetAll, teamGetFavor, clanGetInfo, titanGetAll, inventoryGet, titanSpirits] = data;

			if (!dungeonGetInfo) {
				this.endDungeon('noDungeon');
				return;
			}

			this.dungeonGetInfo = dungeonGetInfo;
			this.teamGetAll = teamGetAll;
			this.teamGetFavor = teamGetFavor;
			this.dungeonActivity = clanGetInfo.stat.todayDungeonActivity;
			this.titanGetAll = titanGetAll;
			this.titans = Object.values(titanGetAll);
			HWHData.countPredictionCard = inventoryGet.consumable[81] || 0;
			this.titanSpirits = titanSpirits;
			this.stateUseTitanLocal = Object.fromEntries(Object.values(this.titans).map((e) => [e.id, 0]));
			this.stateUseTitanGlobal = getSaveVal('stateUseTitan', this.stateUseTitanLocal);

			this.teams.hero = {
				favor: teamGetFavor.dungeon_hero,
				heroes: teamGetAll.dungeon_hero.filter((id) => id < 6000),
				teamNum: 0,
			};

			const heroPet = teamGetAll.dungeon_hero.find((id) => id >= 6000);
			if (heroPet) this.teams.hero.pet = heroPet;

			['neutral', 'water', 'fire', 'earth'].forEach((type) => {
				this.teams[type] = {
					favor: {},
					heroes: DungeonUtils.getTitanTeam(this.titans, type),
					teamNum: 0,
				};
			});

			this.checkFloor(dungeonGetInfo);
		}

		showTitanStates() {
			const titanGetAll = this.titanGetAll;
			const titans = this.titansStates;
			const colWhidth = 17;

			const columns = [
				{ element: 'water', color: '#3498db', icon: '🌊' },
				{ element: 'fire', color: '#e74c3c', icon: '🔥' },
				{ element: 'earth', color: '#2ecc71', icon: '🌍' },
				{ element: 'light', color: '#f1c40f', icon: '☀️' },
				{ element: 'dark', color: '#9b59b6', icon: '🌑' },
			];

			const titansData = columns.reduce(
				(acc, col) => ({
					...acc,
					[col.element]: Object.keys(titanGetAll)
						.filter((id) => lib.data.titan[id].element === col.element)
						.map((id) => {
							const HP = titans[id]?.hp ? Math.floor((titans[id]?.hp / titans[id]?.maxHp) * 100) : 100;
							return {
								name: cheats.translate(`LIB_HERO_NAME_${id}`),
								status: titans[id]?.isDead ? '💀' : `❤️${HP}⚡${titans[id]?.energy || 0}`,
							};
						}),
				}),
				{}
			);

			const maxRows = Math.max(...columns.map((col) => titansData[col.element].length));
			const emptyCell = ''.padEnd(colWhidth);

			const buildLine = (items) => items.map((content) => `%c${content}\t`).join('');

			const header = buildLine(columns.map((col) => `${col.icon} ${col.element.toUpperCase()}`.padEnd(colWhidth)));

			const rows = Array.from({ length: maxRows }, (_, i) =>
				buildLine(
					columns.map((col) => {
						const titan = titansData[col.element][i];
						return titan ? `${titan.name}${titan.status}`.padEnd(colWhidth) : emptyCell;
					})
				)
			);

			console.log(
				[header, ...rows].join('\n'),
				...columns.map((col) => `font-weight: bold; color: ${col.color}`),
				...rows.flatMap(() => columns.map((col) => `color: ${col.color}`))
			);
		}

		async checkFloor(dungeonInfo) {
			if (this.isStop) {
				this.endDungeon('endDungeon', I18N('STOPPED'));
				return;
			}
			if (!dungeonInfo.floor || dungeonInfo.floor.state === 2) {
				await this.saveProgress();
				return;
			}

			const result = await this.checkTalent(dungeonInfo);
			if (!result) {
				this.endDungeon('ErrorReqests');
				return;
			}

			this.maxDungeonActivity = +getInput('countTitanit');
			if (this.dungeonActivity >= this.maxDungeonActivity) {
				this.endDungeon('endDungeon', `maxActive ${this.dungeonActivity}/${this.maxDungeonActivity}`);
				return;
			}

			const message = this.getStatMessage();
			setProgress(message, false, this.stop.bind(this));

			this.titansStates = dungeonInfo.states.titans;
			this.showTitanStates();
			const floorChoices = dungeonInfo.floor.userData;
			const floorType = dungeonInfo.floorType;
			this.primeElement = dungeonInfo.elements.prime;

			if (floorType === 'battle') {
				const battles = await this.prepareBattles(floorChoices);
				if (!battles) {
					this.endDungeon('ErrorReqests');
					return;
				}
				if (battles.length === 0) {
					this.endDungeon('endDungeon', 'All Dead');
					return;
				}
				this.testProcessingPromises(battles);
			}
		}

		async prepareBattles(floorChoices) {
			const { fixTitanTeam, getNeutralTeam } = DungeonUtils;
			const battles = [];
			for (const [teamNum, choice] of Object.entries(floorChoices)) {
				const { attackerType } = choice;
				let team = {
					favor: {},
					teamNum,
					heroes: [],
				};
				if (attackerType === 'hero') {
					team = this.teams[attackerType];
				} else {
					team.heroes = fixTitanTeam(this.teams[attackerType].heroes, this.titansStates);
				}

				if (attackerType === 'neutral') {
					team.heroes = getNeutralTeam(this.titans, this.titansStates);
				}
				if (team.heroes.length === 0) {
					continue;
				}

				const battleData = await this.executeWithRetry({ name: 'dungeonStartBattle', args: { ...team, teamNum } });
				if (!battleData) {
					return false;
				}

				battles.push({
					...battleData,
					progress: [{ attackers: { input: ['auto', 0, 0, 'auto', 0, 0] } }],
					teamNum,
					attackerType,
				});
			}
			return battles;
		}

		async checkTalent(dungeonInfo) {
			const { talent } = dungeonInfo;
			if (!talent) return true;

			const dungeonFloor = +dungeonInfo.floorNumber;
			const talentFloor = +talent.floorRandValue;
			let doorsAmount = 3 - talent.conditions.doorsAmount;

			if (dungeonFloor === talentFloor && (!doorsAmount || !talent.conditions?.farmedDoors[dungeonFloor])) {
				const results = await this.executeWithRetry([
					{ name: 'heroTalent_getReward', args: { talentType: 'tmntDungeonTalent', reroll: false } },
					{ name: 'heroTalent_farmReward', args: { talentType: 'tmntDungeonTalent' } },
				]);
				if (!results) {
					return false;
				}

				const [reward] = results;
				const type = Object.keys(reward).pop();
				if (reward[type]) {
					const itemId = Object.keys(reward[type]).pop();
					const count = reward[type][itemId];
					const itemName = cheats.translate(`LIB_${type.toUpperCase()}_NAME_${itemId}`);
					this.talentMsgReward += `<br> ${count} <span style="color:${itemId === 300 ? 'red' : 'inherit'}">${itemName}</span>`;
					doorsAmount++;
				}
			}

			this.talentMsg = `<br>TMNT Talent: ${doorsAmount}/3 ${this.talentMsgReward}<br>`;
			return true;
		}

		updatePower(battle) {
			const type = battle.attackerType;
			const def = Object.values(battle.defenders[0]);
			const power = def.reduce((a, e) => a + e.power, 0);
			this.defPowers[type] = power;

			const buff = battle?.effects?.defenders?.percentBuffAllEnemy_healing;
			if (buff) {
				this.buffHealing = buff;
			}
		}

		async testProcessingPromises(battles) {
			const { getState, compareScore } = DungeonUtils;
			let selectBattle = null;
			let bestRec = {
				hp: -Infinity,
				energy: -Infinity,
			};
			let bestPack = null;
			const allowedTitanIds = getSaveVal('allowedTitanIds', []);
			console.log('allowedTitanIds', allowedTitanIds);

			for (const battle of battles) {
				this.updatePower(battle);
				if (battle.attackerType === 'hero') {
					this.logBattleStats(battle);
					const resultHeroBattle = await Calc(battle);
					await this.endBattle(resultHeroBattle);
					return;
				}

				let attackers = null;
				const titanStats = new TitanStats(this.titanGetAll, this.titanSpirits, this.titansStates);
				if (battle.attackerType === 'neutral') {
					const evalute = new EvaluateAttackPack(titanStats, battle);
					attackers = await evalute.getAttackers(allowedTitanIds);
				} else {
					const evalute = new EnumAttackPack(titanStats, battle);
					attackers = await evalute.getAttackers();
				}

				const rec = await this.resultBattle({ ...battle, attackers }).then(getState);
				this.logBattleStats({ ...battle, attackers }, rec);

				if (compareScore(rec, bestRec)) {
					bestRec = { hp: rec.hp, energy: rec.energy };
					selectBattle = battle;
					bestPack = attackers;
				}
			}

			if (!selectBattle || bestRec.hp <= -Infinity) {
				this.endDungeon(I18N('BEST_DUNGEON_WINNING_FIGHT_NOT_FOUND'), battles);
				return;
			}

			const initialBattle = await this.startBattle(selectBattle.teamNum, selectBattle.attackerType, bestPack);
			this.logSelectPack({ ...initialBattle.battleData, attackerType: selectBattle.attackerType }, bestRec);
			await this.retryBattle(initialBattle, bestRec);
		}

		logBattleStats(battle, bestRec = null) {
			let colors = [];
			let text = '';
			if (bestRec) {
				colors = [this.colors.green, this.colors.none];
				text = ' %cbestStat: %c' + JSON.stringify(bestRec);
			}
			console.log(`%c${battle.attackerType}` + text, this.colors[battle.attackerType], ...colors);
			if (bestRec) {
				this.logPack(battle, battle.teamNum);
			}
		}

		logSelectPack(battle, recSelectBattle) {
			const attackerType = battle.attackerType;
			const pack = Object.values(battle.attackers).map((e) => e.id);
			this.recordStat(pack);
			console.log('Select: %c' + attackerType, this.colors[attackerType]);
			this.logPack(battle);
			console.log('%cbattleStat: %c' + JSON.stringify(recSelectBattle), this.colors.green, this.colors.none);
		}

		logPack(battle, teamNum = '') {
			const pack = Object.values(battle.attackers).map((e) => e.id);
			const list = pack.reduce(
				(a, e) => {
					a.names.push('%c' + cheats.translate('LIB_HERO_NAME_' + e));
					a.styles.push(this.colors[lib.data.titan[e].element]);
					return a;
				},
				{ names: [], styles: [] }
			);
			console.log(`%cPack ${teamNum}: ` + list.names.join(' '), this.colors[battle.attackerType], ...list.styles);
		}

		recordStat(pack) {
			for (const id of pack) {
				this.stateUseTitanGlobal[id] ??= 0;
				this.stateUseTitanGlobal[id]++;
				this.stateUseTitanLocal[id] ??= 0;
				this.stateUseTitanLocal[id]++;
			}
		}

		async sampleBattleStats(battle, samples) {
			const { getState, genBattleSeed, isRandomBattle } = DungeonUtils;
			const stats = [];

			if (!isRandomBattle(battle)) {
				samples = 1;
			}

			for (let i = 0; i < samples; i++) {
				const rec = await Calc({ ...battle, seed: genBattleSeed() }).then(getState);
				stats.push(rec);
			}

			console.log('isRandomBattle', isRandomBattle(battle), stats);

			return stats;
		}

		/**
		 * Функция для расчета порога изменений значений здоровья и энергии
		 * для выбора подходящего боя
		 * samples - задачет количество эмуляций боев
		 * q - выбор лучшего значения из диапазона результатов
		 * значение 0.85 значит что мы берем 15 по качеству результат для выборки из 100 результатов
		 * мы не выбираем самый лучший результат потому что
		 * для поиска лучшего результата в дальнейшем может понадобиться слишком много попыток
		 *
		 * Function for calculating the threshold of health and energy value changes
		 * to select an appropriate battle
		 * samples - specifies the number of battle simulations
		 * q - selects the best value from the range of results
		 * a value of 0.85 means we take the 15th best result for a sample of 100 results
		 * we don't choose the absolute best result because
		 * finding the optimal result in the future might require too many attempts
		 *
		 * #TryToDoBetter
		 */
		async calculateThreshold(battle) {
			const { compareScore } = DungeonUtils;
			const samples = 100; // +getInput('countTestBattle')
			const q = 0.85; // Best 85%

			const stats = await this.sampleBattleStats(battle, samples);
			stats.sort((a, b) => {
				if (compareScore(a, b)) return 1;
				if (compareScore(b, a)) return -1;
				return 0;
			});

			return stats[Math.floor(stats.length * q)];
		}

		async retryBattle(initialBattle, targetRec) {
			const { getState, compareScore } = DungeonUtils;
			const countAutoBattle = +getInput('countAutoBattle');

			let thresholdRec = await this.calculateThreshold(initialBattle.battleData);
			console.log(
				`%cThreshold stats: %chp=${thresholdRec.hp.toFixed(4)} energy=${thresholdRec.energy.toFixed(4)}`,
				this.colors.green,
				this.colors.none
			);
			console.log(
				`%cTarget stats: %chp=${targetRec.hp.toFixed(4)} energy=${targetRec.energy.toFixed(4)}`, 
				this.colors.green, 
				this.colors.none
			);
			const initialState = getState(initialBattle);
			if (compareScore(initialState, targetRec)) {
				console.log(
					`%cInitial battle is optimal: %chp=${initialState.hp.toFixed(4)} energy=${initialState.energy.toFixed(4)}`,
					this.colors.green,
					this.colors.none
				);
				await this.endBattle(initialBattle);
				return;
			}

			let result = initialBattle;
			for (let i = 0; i < countAutoBattle; i++) {
				if (this.isStop) return;

				result = await this.startBattle(initialBattle.teamNum, initialBattle.attackerType, initialBattle.battleData.attackers);
				if (!result) {
					this.endDungeon('ErrorReqests');
					return;
				}

				const rec = getState(result);
				console.log(
					`%cRetry ${i + 1}/${countAutoBattle}: %chp=${rec.hp.toFixed(4)} (≥${thresholdRec.hp.toFixed(4)}) ` +
						`%cenergy=${rec.energy.toFixed(4)} (≥${thresholdRec.energy.toFixed(4)})`,
					this.colors.green,
					this.colors.none,
					this.colors.green
				);

				if (compareScore(rec, thresholdRec)) {
					console.log(
						`%c✅ Acceptable fight found on attempt ${i + 1}: %chp=${rec.hp.toFixed(4)} energy=${rec.energy.toFixed(4)}`,
						this.colors.green,
						this.colors.none
					);
					await this.endBattle(result);
					return;
				}

				thresholdRec.hp -= 0.001 * i;
				thresholdRec.energy -= 0.01 * i;
			}

			// Итог: используем последний
			const finalRec = getState(result);
			console.log(
				`%c❌ No acceptable fight found. Using last: %chp=${finalRec.hp.toFixed(4)} energy=${finalRec.energy.toFixed(4)}`,
				this.colors.red,
				this.colors.none
			);
			await this.endBattle(result);
		}

		async startBattle(teamNum, attackerType, pack = null) {
			const { fixTitanTeam, getNeutralTeam } = DungeonUtils;
			let heroes = [];

			if (pack) {
				heroes = Object.values(pack).map((e) => e.id);
			} else {
				if (attackerType === 'hero') {
					heroes = this.teams.hero.heroes;
				} else if (attackerType === 'neutral') {
					heroes = getNeutralTeam(this.titans, this.titansStates);
				} else {
					heroes = fixTitanTeam(this.teams[attackerType].heroes, this.titansStates);
				}
			}

			const battleData = await this.executeWithRetry({
				name: 'dungeonStartBattle',
				args: {
					favor: {},
					teamNum,
					heroes,
				},
			});
			if (!battleData) {
				return false;
			}

			return this.resultBattle(battleData, { teamNum, attackerType });
		}

		async resultBattle(battleData, args = {}) {
			if (this.isFixedBattle) {
				const dfb = new UpdateDungeonFixBattle(battleData);
				dfb.isShowResult = this.isShowFixLog;
				const fixData = await dfb.start(Date.now() + this.timeoutFix, this.countFix);
				battleData.progress = [{ attackers: { input: ['auto', 0, 0, 'auto', 0, fixData.timer] } }];
			}
			const result = await Calc(battleData);
			return { ...result, ...args };
		}

		getThresholdTimer() {
			function median(arr) {
				const sorted = [...arr].sort((a, b) => a - b);
				const mid = Math.floor(sorted.length / 2);
				return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
			}

			function average(arr) {
				const sum = arr.reduce((total, num) => total + num);
				return sum / arr.length;
			}

			if (this.timers.length < 10) {
				return 30;
			}

			const thresholdAvg = average(this.timers);
			if (thresholdAvg > 30) {
				return thresholdAvg;
			}
			const thresholdMed = median(this.timers);
			if (thresholdMed > 30) {
				return thresholdMed;
			}
			return 30;
		}

		async endBattle(battleInfo) {
			if (battleInfo.battleData.attackerType !== 'hero') {
				this.logPack(battleInfo.battleData);
			}

			// Проверка на ничью
			const isAllDead = Object.values(battleInfo.progress[0].attackers.heroes).every((item) => item.isDead);
			if (!battleInfo.result.win && isAllDead) {
				this.endDungeon('dungeonEndBattle win: false\n', battleInfo);
				return;
			}
			const args = { result: battleInfo.result, progress: battleInfo.progress };

			this.timers.push(battleInfo.battleTimer);
			const thresholdTimer = this.getThresholdTimer();
			console.log('countCard', HWHData.countPredictionCard, 'battleTimer', battleInfo.battleTimer, 'thresholdTimer', thresholdTimer);
			if (HWHData.countPredictionCard && battleInfo.battleTimer > thresholdTimer) {
				args.isRaid = true;
			} else {
				const message = this.getStatMessage();
				const timerFinished = await countdownTimer(battleInfo.battleTimer, message, this.stop.bind(this), false);
				console.log('timerFinished', timerFinished);
				if (!timerFinished) {
					this.endDungeon('endDungeon', 'Остановлено');
					return;
				}
			}

			const resultEnd = await this.executeWithRetry({ name: 'dungeonEndBattle', args });
			if (!resultEnd) {
				this.endDungeon('ErrorReqests');
				return;
			}
			this.resultEndBattle(resultEnd);
		}

		resultEndBattle(battleResult) {
			if (battleResult.error) {
				this.endDungeon('Error', battleResult.error);
			}
			const dungeonGetInfo = battleResult.dungeon ?? battleResult;
			if (dungeonGetInfo.reward) {
				this.dungeonGetInfo = dungeonGetInfo;
			} else {
				// В случае ничьи обновляем только статы
				this.dungeonGetInfo.states = dungeonGetInfo.states;
			}
			const addActivity = battleResult.reward?.dungeonActivity ?? 0;
			this.dungeonActivity += addActivity;
			this.currentActivity += addActivity;

			Promise.resolve().then(() => {
				this.checkFloor(this.dungeonGetInfo);
			});
		}

		titanObjToArray(obj) {
			return Object.entries(obj).map(([id, data]) => ({ id, ...data }));
		}

		async saveProgress() {
			const result = await this.executeWithRetry('dungeonSaveProgress');
			if (!result) {
				this.endDungeon('ErrorReqests');
				return;
			}
			this.resultEndBattle(result);
		}

		showStat(type, stat) {
			const list = Object.entries(stat)
				.sort(([_i, a], [_j, b]) => b - a)
				.reduce(
					(a, [id, n]) => {
						a.names.push('%c' + cheats.translate('LIB_HERO_NAME_' + id) + ': ' + n + ', ');
						a.styles.push(this.colors[lib.data.titan[id].element]);
						return a;
					},
					{ names: [], styles: [] }
				);
			console.log(type + ' stat:\n' + list.names.join(' '), ...list.styles);
		}

		endDungeon(reason, info) {
			this.showStat('Current', this.stateUseTitanLocal);
			this.showStat('Global', this.stateUseTitanGlobal);
			console.log('timerStat', this.timers);
			setSaveVal('stateUseTitan', this.stateUseTitanGlobal);
			console.warn(reason, info);
			const message = this.getStatMessage() + '<br>Dungeon completed!' + (reason === 'endDungeon' ? `<br>${info}` : '');
			setProgress(message, false, hideProgress);
			this.resolve();
		}
	}

	this.HWHClasses.executeDungeon = BestDungeon;


	class SelectAttackPack {
		constructor(heroStats, battle) {
			this.heroStats = heroStats;
			this.battle = structuredClone(battle);
		}

		sortByHpAndEnergy(a, b) {
			if (a.v.hp !== b.v.hp) {
				return b.v.hp - a.v.hp;
			}
			return b.v.energy - a.v.energy;
		}

		getBattleWithPack(pack) {
			const cloneBattle = structuredClone(this.battle);
			cloneBattle.attackers = this.getAttackersStat(pack);
			return cloneBattle;
		}

		getAttackersStat(pack) {
			return Object.fromEntries(pack.map((id) => [id, this.heroStats.getTitanStats(id)]));
		}

		async evaluatePack(pack) {
			const cloneBattle = this.getBattleWithPack(pack);
			const { isRandomBattle, genBattleSeed, getState, compareScore } = DungeonUtils;

			const maxResult = {
				hp: -Infinity,
				energy: -Infinity,
				seed: null,
			};
			/**
			 * Значение countTest задает количество тестов для проверки пака
			 * Значительно влияет на скорость работы чем меньше значение тем быстрее
			 * Значительно влияет на качество оценки паков чем больше значение тем оценка более точная
			 * Не применяется к боям где нет рандома
			 *
			 * The countTest value specifies the number of tests to check for a pack.
			 * Significantly affects performance; the lower the value, the faster.
			 * Significantly affects the quality of pack evaluation; the higher the value, the more accurate the evaluation.
			 * Does not apply to battles without randomness.
			 *
			 * #TryToDoBetter
			 */
			let countTest = 3;
			const countTestBattle = isRandomBattle(cloneBattle) ? countTest : 1;
			for (let i = 0; i < countTestBattle; i++) {
				const seed = genBattleSeed();
				cloneBattle.seed = seed;
				const result = await Calc(cloneBattle).then(getState);

				if (compareScore(result, maxResult)) {
					maxResult.hp = result.hp;
					maxResult.energy = result.energy;
					maxResult.seed = seed;
				}
			}

			return maxResult;
		}
	}

	class EnumAttackPack extends SelectAttackPack {
		async getAttackers() {
			const { compareScore } = DungeonUtils;
			const values = this.heroStats.getAllowTitanIds(this.battle.attackerType);
			const combinations = this.getAllCombinations(values);

			let bestCombination = combinations[0];
			let bestScore = {
				hp: -Infinity,
				energy: -Infinity,
			};
			for (const combination of combinations) {
				const result = await this.evaluatePack(combination);
				if (compareScore(result, bestScore)) {
					bestScore.hp = result.hp;
					bestScore.energy = result.energy;
					bestCombination = combination;
				}
			}

			const attackers = this.getAttackersStat(bestCombination);

			return attackers;
		}

		getAllCombinations(arr) {
			const result = [];
			const n = arr.length;

			function combine(start, current) {
				if (current.length > 0) {
					result.push([...current]);
				}

				for (let i = start; i < n; i++) {
					current.push(arr[i]);
					combine(i + 1, current);
					current.pop();
				}
			}

			combine(0, []);
			return result.sort((a, b) => a.length - b.length);
		}
	}

	class EvaluateAttackPack extends SelectAttackPack {
		constructor(heroStats, battle) {
			super(heroStats, battle);

			/**
			 * Параметры работы генетического алгоритма
			 * populationSize - размер популяции
			 * generations - количество генераций
			 * mutationRate - шанс на мутацию
			 * eliteCount - сколько лучших выбирать из популяции
			 * Все параметры значительно влияют на скорость и качество работы
			 *
			 * Genetic algorithm parameters
			 * populationSize - population size
			 * generations - number of generations
			 * mutationRate - mutation chance
			 * eliteCount - how many elites to select from the population
			 * All parameters significantly affect the speed and quality of work.
			 *
			 * #TryToDoBetter
			 */
			this.bestParams = {
				populationSize: 9,
				generations: 30,
				mutationRate: 0.06,
				eliteCount: 2,
			};
		}

		async getAttackers(allowedIds = []) {
			const values = this.heroStats.getAllowTitanIds(false, allowedIds);
			const ga = new GeneticAlgorithm({
				values,
				combinationSize: 5,
				...this.bestParams,
			});
			ga.setEvaluate(this.evaluatePack.bind(this));
			ga.setCustomSort(this.sortByHpAndEnergy);
			ga.setCompereScore(DungeonUtils.compareScore);

			const bestCombination = await ga.run();
			this.statBestCombination = await ga.evaluateCombination(bestCombination);
			console.log(
				I18N('BEST_DUNGEON_BEST_COMBINATION'),
				bestCombination,
				bestCombination.map((e) => cheats.translate('LIB_HERO_NAME_' + e)),
				this.statBestCombination,
				ga.evaluationCalls
			);

			const attackers = this.getAttackersStat(bestCombination);

			return attackers;
		}

		getStatBestPack() {
			return this.statBestCombination;
		}
	}

	class DungeonUtils {
		static getState(result) {
			const isAllDead = Object.values(result.progress[0].attackers.heroes).every((item) => item.isDead);
			if (isAllDead) {
				return {
					hp: -1e300,
					energy: -1e300,
					losses: Object.keys(result.battleData.attackers),
				};
			}

			let initialHP = 0;
			let initialEnergy = 0;
			const beforeTitans = result.battleData.attackers;
			for (let titanId in beforeTitans) {
				const titan = beforeTitans[titanId];
				const state = titan.state;
				if (state) {
					initialHP += state.hp / titan.hp;
					initialEnergy += state.energy / 1e3;
				}
			}

			let afterHP = 0;
			let afterEnergy = 0;
			const afterTitans = result.progress[0].attackers.heroes;
			for (let titanId in afterTitans) {
				const titan = afterTitans[titanId];
				afterHP += titan.hp / beforeTitans[titanId].hp;
				afterEnergy += titan.energy / 1e3;
			}

			const beforeIds = Object.keys(beforeTitans);
			const afterIds = Object.keys(afterTitans);
			const losses = beforeIds.filter((key) => !afterIds.includes(key));

			const hp = afterHP - initialHP;
			const energy = afterEnergy - initialEnergy;

			if (!afterIds.length || (hp <= 0 && energy <= 0 && !result.result.win)) {
				return {
					hp: -1e300,
					energy: -1e300,
					losses,
				};
			}

			return {
				hp,
				energy,
				losses,
			};
		}
		static isRandomPack(pack) {
			const ids = Object.values(pack).map((e) => +e.id);
			return ids.includes(4023) || ids.includes(4021);
		}

		static isRandomBattle(battle) {
			return DungeonUtils.isRandomPack(battle.attackers) || DungeonUtils.isRandomPack(battle.defenders[0]);
		}

		/**
		 * Функция для сравнения результатов боев
		 * Используется
		 * 1) При отборе лучшей команды
		 * 2) При выборе лучшего боя команды
		 * 3) При улучшении лучшего боя команды
		 * Значительно влияет на отбор команды.
		 * Не влияет на скорость работы.
		 *
		 * Function for comparing battle results
		 * Used
		 * 1) When selecting the best team
		 * 2) When choosing the best team battle
		 * 3) When improving the best team battle
		 * Significantly affects team selection
		 * Does not affect work speed
		 *
		 * #TryToDoBetter
		 */
		static compareScore(newScore, lastScore) {
			// Допуск разницы значений между реузльтатами хп
			// Tolerance for the difference in values ​​between the results of HP
			const hpEps = 0.0005;
			if (newScore.hp > lastScore.hp + hpEps) {
				return true;
			}

			if (Math.abs(newScore.hp - lastScore.hp) <= hpEps) {
				return newScore.energy >= lastScore.energy;
			}

			return false;
		}

		static titanObjToArray(obj) {
			return Object.entries(obj).map(([id, data]) => ({ id, ...data }));
		}

		static getTitanTeam(titans, type) {
			if (type === 'neutral') {
				return DungeonUtils.getNeutralTeam(titans);
			}

			const indexMap = { water: '0', fire: '1', earth: '2' };
			const index = indexMap[type];
			return titans.filter((e) => e.id.toString().slice(2, 3) === index).map((e) => e.id);
		}

		static getNeutralTeam(titans, states = {}) {
			return DungeonUtils.fixTitanTeam(titans, states)
				.sort((a, b) => b.power - a.power)
				.slice(0, 5)
				.map((e) => e.id);
		}

		static fixTitanTeam(titans, states = {}) {
			return titans.filter((titan) => {
				const id = titan.id ?? titan;
				return !states[id]?.isDead;
			});
		}

		static genBattleSeed() {
			return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1e9);
		}
	}
})();

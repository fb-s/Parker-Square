const params = {
		psSize: 3, // Parker-Square size
		method: 0, // 0 = +, 1 - *
		stufe: 1, // errichten in stufe
		maxNum: 2, // Maximum number in a cell
	};
const process = {
		run: false, // Сейчас запущен процесс
		stop: false // Требуется остановить процесс
	};

/**
 * Подсчёт по методу
 * @param {ParkerSquare} ps
 * @param {[Number]} nums
 * @returns {Number}
 */
function result (ps, nums = []) {

	return nums
		.map(value => Math.pow(value, ps.params.stufe))
		.reduce((res, current) => ps.params.method === 0 ? res + current : res * current);

}

/**
 * Проверка квадрата на соответствие
 * Если квадрат соответствует то вернёт resolve
 * Если квадрат не соответствует то верёнт reject
 * @param {ParkerSquare} ps 
 * @returns {Promise}
 */
function check (ps) {

	return new Promise((resolve, reject) => setTimeout(() => {

		let arrForResult = [];
		let arrForResultLine1 = [];
		let arrForResultLine2 = [];

		/** Разобъём ряды, колонки, диагональ*/
		for (let index = 0; index < ps.params.psSize; index++) {
			
			/** Положим ряды */
			arrForResult.push(ps.square.slice(index * ps.params.psSize, (index + 1) * ps.params.psSize));
			/** Положим колонки */
			arrForResult.push(ps.square.filter((item, i) => i === index || (i && !(((i - index) / ps.params.psSize) % 1) )));
			/** Соберём левую диагональ */
			arrForResultLine1.push(ps.square.filter((item, i) => i === (ps.params.psSize * index + index) ));
			/** Соберём правую диагональ */
			arrForResultLine2.push(ps.square.filter((item, i) => i === ((ps.params.psSize * (index + 1)) - (index + 1)) ));
			
		}

		/** Положим диагонали */
		arrForResult.push([].concat(...arrForResultLine1));
		arrForResult.push([].concat(...arrForResultLine2));
		arrForResult = arrForResult.map(value => result(ps, value));

		ps.sum = arrForResult[0];

		return ps.sum && arrForResult.every(value => ps.sum === value)
			? resolve(ps)
			: reject(ps);

	}, 0));

}

/**
 * Выводит на экран найденый квадрат
 * @param {ParkerSquare} ps
 */
function showPositiveResult (ps) {

	let square = ps.square;
	square = square.map(item => '<td>'+item+'</td>');
	square.forEach((item, i, arr)=> {
		if (!((i+1)/ps.params.psSize % 1) && (i+1) !== arr.length) {
			arr[i] = item + '</tr><tr>';
		}
	})
	
	document.getElementById('result').innerHTML
		= document.getElementById('result').innerHTML
		+ '<div><table><tr>'
		+ square.join('')
		+ '</tr></table><p>Result: <strong>'
		+ ps.iteration
		+ '</strong></p><p>Sum: <strong>'
		+ ps.sum
		+ '</strong></p></div>';

}

/**
 * отобразить/скрыть загрузку
 * @param {Boolean} show
 */
function spinner (show = false) {

	document.getElementById('load').classList[show ? 'remove' : 'add']("hide");

}

/**
 * Остановить процесс перебора
 */
function stop () {

	process.stop = true;
	process.run = false;
	setTimeout(() => {
		spinner(false);
		document.getElementById('process').innerHTML = '';
		document.getElementById('counts').innerHTML = '';
		document.getElementById('btnStart').removeAttribute("disabled");
		document.getElementById('clear').innerHTML = "Clear";
	}, 100);

}

/**
 * Если поменялись параметры проверяем корректность
 * @param {String} name
 * @param {*} element
 */
function onChange (name, element) {

	params[name] = +element.value;

	if (!(params.psSize & 1)) {params.psSize--; document.getElementById('psSize').value = params.psSize;}
	if (params.psSize < 3) {params.psSize = 3; document.getElementById('psSize').value = params.psSize;}

	if (params.startNum < 1) {params.startNum = 1; document.getElementById('startNum').value = params.startNum;}
	if (params.maxNum < 1) {params.maxNum = 1; document.getElementById('maxNum').value = params.maxNum;}

	if (params.startNum > params.maxNum) {params.maxNum = params.startNum; document.getElementById('maxNum').value = params.startNum;}

}

/**
 * Создаст клон объекта
 * @param {Object} obj 
 * @returns {Object}
 */
function deepClone (obj = {}) {

	const cloneObj = {};

	for (const i in obj) {

		cloneObj[i] = typeof obj[i] === 'object' && !Array.isArray(obj[i])
			? deepClone(obj[i])
			: obj[i];

	}

	return cloneObj;
}

/**
 * Создаст клон Массива
 * @param {Array} arr 
 * @returns {Array}
 */
function deepCloneArr (arr = []) {

	const cloneArr = [];

	arr.forEach((value, name) => {
		cloneArr[name] = Array.isArray(value)
			? deepCloneArr(value)
			: value;
	});

	return cloneArr;
}

/**
 * Начало проверки по заданным параметрам
 */
function onStart () {

	spinner(true);
	process.stop = false;
	process.run = true;
	document.getElementById('clear').innerHTML = "Stop";
	document.getElementById('btnStart').setAttribute("disabled","disabled");
	
	enumeration(deepClone({
		params: {... params},
		iteration: 0,
		square: deepCloneArr('0'.repeat(Math.pow(params.psSize,2)).split('').map(value => +value))
	}));
	
}

/**
 * перебор
 * @param {ParkerSquare} ParkerSquare
 */
async function enumeration (ParkerSquare) {

	let ps = ParkerSquare;

	try {

		ps = await calculate(ps) // прибавим цифру
		ps = await iteration(ps) // посчитаем операции

		// не продолжать перебор
		if (process.stop) stop()
		// продолжить перебор
		else enumeration(
				deepClone({
					params: {... ps.params},
					iteration: ps.iteration,
					square: deepCloneArr([...ps.square])
				})
			);

		ps = await processSquare(ps) // Отобразим на экран текущий
		ps = await check(ps) // Вернёт положительный результат если прошёл проверку
		
		showPositiveResult(ps) // если прошёл проверку, то выведет результат

	} catch (error) {}

}

/**
 * отобразить количество сделаных операций
 * @param {ParkerSquare} ps
 * @returns {Promise {ParkerSquare}}
 */
function iteration (ps) {
	return new Promise(resolve => setTimeout(() =>{
		
		ps.iteration++;
		if (!(ps.iteration/100 % 1))
			document.getElementById('counts').innerHTML = ps.iteration;

		resolve(ps);
	},0))
}

/**
 * добавляет еденицу
 * @param {ParkerSquare} ps
 * @returns {Promise {ParkerSquare}}
 */
function calculate (ps) {
	return new Promise(resolve => setTimeout(() => {

		let numForSum = 1;

		for (let index = (Math.pow(params.psSize,2)-1); index >= 0; index--) {

			/** если есть ещё что добавлять и значение меньше максимальнго до добавим тут */
			if (numForSum && ps.square[index] < params.maxNum) {
				ps.square[index] = ps.square[index] + numForSum;
				numForSum--;
			} else if (numForSum) {
				ps.square[index] = 0;
			}
			
		}

		/** Остановить если достигнут лимит */
		if (numForSum) process.stop = true;

		resolve(ps)

	}, 0));
}

/**
 * Остановить или очистить результат
 */
function onClear () {

	if (process.run) stop()
	else document.getElementById('result').innerHTML = '';

}

/**
 * Выводит на экран найденый квадрат
 * @param {ParkerSquare} ps
 * @returns {Promise {ParkerSquare}}
 */
function processSquare (ps) {

	return new Promise(resolve => setTimeout(() => {

			let square = ps.square;
			square = square.map(item => '<td>'+item+'</td>');
			square.forEach((item, i, arr)=> {
				if (!((i+1)/ps.params.psSize % 1) && (i+1) !== arr.length) {
					arr[i] = item + '</tr><tr>';
				}
			})
			
			document.getElementById('process').innerHTML
				= '<div><table><tr>'
				+ square.join('')
				+ '</tr></table><p>Result: <strong>'
				+ ps.iteration
				+ '</strong></p></div>';

		return resolve(ps);

	}, 0)); 

}

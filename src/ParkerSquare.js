const params = {
		psSize: 3, // Parker-Square size
		method: 1, // 0 = +, 1 - *
		maxNum: 2, // Maximum number in a cell
	};
const process = {
		run: false, // Сейчас запущен процесс
		stop: false // Требуется остановить процесс
	};
const methods = ['summ', 'multiplication' ];

/** Тут подсчёт по методу */
function result (ps, nums = []) {

	return nums.reduce((res, current) => ps.params.method === 0 ? res + current : res * current);

}

/** Проверка квадрата на соответствие */
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

		ps.summ = arrForResult[0];

		return ps.summ && arrForResult.every(value => ps.summ === value)
			? resolve(ps)
			: reject(ps);

	}, 0));

}

/** Выводит на экран найденый квадрат */
function showPositiveResult (ps) {

	return new Promise(resolve => setTimeout(() => {

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
			+ '</strong></p><p>Summ: <strong>'
			+ ps.summ
			+ '</strong></p></div>';

		return resolve(ps);

	}, 0)); 

}

/** отобразить/скрыть загрузку */
function spinner (show = false) {

	document.getElementById('load').classList[show ? 'remove' : 'add']("hide");

}

/** Остановить процесс перебора */
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

/** Если поменялись параметры проверяем корректность */
function onChange (name) {

	params[name] = +document.getElementById(name).value;

	if (!(params.psSize & 1)) {params.psSize--; document.getElementById('psSize').value = params.psSize;}
	if (params.psSize < 3) {params.psSize = 3; document.getElementById('psSize').value = params.psSize;}

	if (params.startNum < 1) {params.startNum = 1; document.getElementById('startNum').value = params.startNum;}
	if (params.maxNum < 1) {params.maxNum = 1; document.getElementById('maxNum').value = params.maxNum;}

	if (params.startNum > params.maxNum) {params.maxNum = params.startNum; document.getElementById('maxNum').value = params.startNum;}

}

function deepClone (obj = {}) {

	const cloneObj = {};

	for (const i in obj) {

		cloneObj[i] = typeof obj[i] === 'object' && !Array.isArray(obj[i])
			? deepClone(obj[i])
			: obj[i];

	}

	return cloneObj;
}

function deepCloneArr (arr = []) {

	const cloneArr = [];

	arr.forEach((value, name) => {
		cloneArr[name] = Array.isArray(value)
			? deepCloneArr(value)
			: value;
	});

	return cloneArr;
}

/** Начало проверки по заданным параметрам */
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

/** перебор */
function enumeration (ParkerSquare) {

	new Promise(resolve => resolve(ParkerSquare))
		.then(ps => calculate(ps)) // прибавим цифру
		// .then(ps => new Promise(r => {console.log({...ps}); r(ps)})) // прибавим цифру
		.then(ps => iteration(ps)) // посчитаем операции
		.then(ps => { // если нажата кнопка стоп или дошли до максимального значения, то больше не запускам подсчёт
			if (process.stop) stop()
			else enumeration(deepClone({
				params: {... ps.params},
				iteration: ps.iteration,
				square: deepCloneArr([...ps.square])
			}));
			return ps;
		})
		.then(ps => processSquare(ps)) // Отобразим на экран текущий
		.then(ps => check(ps)) // Вернёт положительный результат если прошёл проверку
		.then(ps => showPositiveResult(ps)) // если прошёл проверку, то выведет результат
		.catch(() => {})

}

/** отобразить количество сделаных операций */
function iteration (ps) {
	return new Promise(resolve => setTimeout(() =>{
		
		ps.iteration++;
		if (!(ps.iteration/100 % 1))
			document.getElementById('counts').innerHTML = ps.iteration;

		resolve(ps);
	},0))
}

/** добавляет еденицу */
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

/** Остановить или очистить результат */
function onClear () {

	if (process.run) stop()
	else document.getElementById('result').innerHTML = '';

}

/** Выводит на экран найденый квадрат */
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

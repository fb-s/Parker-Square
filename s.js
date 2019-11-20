var x = [],
	num	  = 1, // Start your search with
	count = 2, // Array size
	metod = 1, // 1 - summ, 2 - degree2, 3 - degree3 ...
	limit = 2; // Maximum number in a cell

function summ (x,y) {

	if (!x) x = 0;
	if (!y) return 0;

	return metod == 1 ? x + y : x + Math.pow(y, metod)

}

function check () {

	let rows = [],
		cols = [],
		diog1 = {
			col: 0,
			row: 0,
			data: 0
		},
		diog2 = {
			col: count,
			row: 0,
			data: 0
		};
	
	x.forEach((r, ri) => {
		
		r.forEach((c, ci) => {
			cols[ci] = summ(cols[ci], c); 
			rows[ri] = summ(rows[ri], c);
			if (diog1.col == ci && diog1.row == ri) {diog1.data = summ(diog1.data, c);}
			if (diog2.col == ci && diog2.row == ri) {diog2.data = summ(diog2.data, c);}
		})

		diog1.col += 1;
		diog1.row += 1;

		diog2.col -= 1;
		diog2.row += 1;
		
	});
	
	if (diog1.data == diog2.data && rows.filter(v => diog1.data != v).length == 0 && cols.filter(v => diog1.data != v).length == 0) {
		
		return diog1.data;
	
	} else {

		return false
	
	}

}

function plus (xri, xci) {
	
	if (typeof xri == 'undefined') {xri = count}
	if (typeof xci == 'undefined') {xci = count}

	x[xri][xci]++;

	if (x[xri][xci] > limit) {

		if (xri == 0 && xci == 0 ) { return }

		x[xri][xci] = 1;
		
		if (xci) {
			xci--;
		} else {
			xri--;
			xci = count;
		}
		
		plus (xri, xci);

	}
	
}

function show (n, x) {

	var tableArr=['<table>'];

	x.forEach(r => {
		tableArr.push('<tr>');
		r.forEach(c => {
			tableArr.push('<td>'+c+'</td>');
		})
		tableArr.push('</tr>');
	});

	tableArr.push('</table>');
	
	document.getElementById('result').innerHTML=document.getElementById('result').innerHTML+'<div>'+tableArr.join('\n')+ '<p>Result: <b>'+n+'</b></p></div>'
	  
}

function create () {
	
	x = [];

	function createCol () {
		let colvalue = [];

		for (let index = 0; index <= count; index++) {
			colvalue.push(num);
		}
		return colvalue;
	}

	for (let index = 0; index <= count; index++) {
		x.push(createCol());
	}

}

function btnStart () {

	document.getElementById('load').classList.remove("hide");

	setTimeout(() => {
		
		num = +document.getElementById('startNum').value ? +document.getElementById('startNum').value : 1;
		count = +document.getElementById('arraySize').value ? document.getElementById('arraySize').value - 1  : 2;
		metod = +document.getElementById('metod').value ? +document.getElementById('metod').value : 2;
		limit = +document.getElementById('maximumNum').value ? +document.getElementById('maximumNum').value : 2;
		length = +document.getElementById('numberOperations').value ? +document.getElementById('numberOperations').value : Math.pow(limit, 9);
		

		if (count & 1) {count--; document.getElementById('arraySize').value = count+1;}
		if (count < 2) {count = 2; document.getElementById('arraySize').value = count+1;}

		create();
		
		for (let i = 0; i < length; i++) {

			plus();
		
			if (check(i)) {
				show(check(), x);
			}

		}

		document.getElementById('load').classList.add("hide");

	}, 20);
	

}

function btnClear () {
	
	document.getElementById('result').innerHTML = '';

}
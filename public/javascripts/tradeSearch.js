document.addEventListener('DOMContentLoaded', async function (event) {
	const type = document.getElementById('typeId').value;
	const symbol = document.getElementById('symbolCodeId').value;
	const name = document.getElementById('symbolNameId').value;
	document.getElementById('typeStock').checked = type === 'stock';
	document.getElementById('typeCrypto').checked = !document.getElementById(
		'typeStock'
	).checked;
	if (type && symbol && name){
	    await drawAllCharts(type, symbol, name);
	}
});

document.getElementById('typeStock').addEventListener('click', (event) => {
	document.getElementById('typeId').value = 'stock';
});
document.getElementById('typeCrypto').addEventListener('click', (event) => {
	document.getElementById('typeId').value = 'crypto';
});

async function searchSymbol(_keywords) {
	const _type = document.getElementById('typeId').value;
	const apiUrl = `/app/trade/searchSymbol/${_type}/${_keywords}`;
	try {
		const responseFromAPI = await axios.get(apiUrl);
		return responseFromAPI.data;
	} catch (err) {
		console.log('Error while getting the data: ', err);
	}
}

async function getSymbolPrice(_symbol) {
	const _type = document.getElementById('typeId').value;
	const apiUrl = `/app/trade/getSymbolPrice/${_type}/${_symbol}`;
	let price = 1;
	try {
		const responseFromAPI = await axios.get(apiUrl);
		return responseFromAPI.data;
	} catch (err) {
		console.log('Error while getting the data: ', err);
		return price;
	}
}
function autocomplete(inp) {
	const _type = document.getElementById('typeId').value;
	var currentFocus;
	inp.addEventListener('input', async function (e) {
		var a,
			b,
			i,
			val = this.value;

		closeAllLists();
		if (!val || val.length < 4) {
			return false;
		}
		arr = await searchSymbol(val);
		currentFocus = -1;

		a = document.createElement('DIV');
		a.setAttribute('id', this.id + 'autocomplete-list');
		a.setAttribute('class', 'autocomplete-items');
		this.parentNode.appendChild(a);
		for (i = 0; i < arr.length; i++) {
			if (
				arr[i]['2. name'].substr(0, val.length).toUpperCase() ==
				val.toUpperCase()
			) {
				b = document.createElement('DIV');
				b.innerHTML +=
					'<strong>' + arr[i]['2. name'].substr(0, val.length) + '</strong>';
				b.innerHTML +=
					arr[i]['2. name'].substr(val.length) +
					'(' +
					arr[i]['1. symbol'] +
					')';
				b.innerHTML +=
					"<input type='hidden' value='" +
					arr[i]['2. name'] +
					'(' +
					arr[i]['1. symbol'] +
					")'>";
				b.innerHTML +=
					"<input type='hidden' value='" + arr[i]['1. symbol'] + "'>";
				b.innerHTML +=
					"<input type='hidden' value='" + arr[i]['2. name'] + "'>";
				b.addEventListener('click', async function (e) {
					inp.value = this.getElementsByTagName('input')[0].value;
					document.getElementById(
						'symbolCodeId'
					).value = this.getElementsByTagName('input')[1].value;
					document.getElementById(
						'symbolNameId'
					).value = this.getElementsByTagName('input')[2].value;
					document.getElementById('priceId').value = await getSymbolPrice(
						this.getElementsByTagName('input')[1].value
					);

					drawAllCharts(
						_type,
						this.getElementsByTagName('input')[1].value,
						this.getElementsByTagName('input')[2].value
					);
					closeAllLists();
				});
				a.appendChild(b);
			}
		}
	});

	inp.addEventListener('keydown', function (e) {
		var x = document.getElementById(this.id + 'autocomplete-list');
		if (x) x = x.getElementsByTagName('div');
		if (e.keyCode == 40) {
			currentFocus++;

			addActive(x);
		} else if (e.keyCode == 38) {
			currentFocus--;

			addActive(x);
		} else if (e.keyCode == 13) {
			e.preventDefault();
			if (currentFocus > -1) {
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		if (!x) return false;

		removeActive(x);
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = x.length - 1;

		x[currentFocus].classList.add('autocomplete-active');
	}
	function removeActive(x) {
		for (var i = 0; i < x.length; i++) {
			x[i].classList.remove('autocomplete-active');
		}
	}
	function closeAllLists(elmnt) {
		var x = document.getElementsByClassName('autocomplete-items');
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}

	document.addEventListener('click', function (e) {
		closeAllLists(e.target);
	});
}

let auto = document.getElementById('symbolId');
autocomplete(auto);

document.getElementById('unitsId').addEventListener('change', (elem) => {
	const price = document.getElementById('priceId').value;
	const wallet = document.getElementById('walletAmountId').value;
	if (elem.target.value * price <= wallet) {
		document.getElementById('totalId').value = elem.target.value * price;
	}
});

async function drawAllCharts(_type, _symbol, _name) {
	// Set new default font family and font color to mimic Bootstrap's default styling
	Chart.defaults.global.defaultFontFamily =
		'Nunito,-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
	Chart.defaults.global.defaultFontColor = '#858796';

	const apiUrl = `/app/trade/getEvolutionSymbol/${_type}/${_symbol}-${_name}`;

	try {
		document.getElementById('symbolGraph').innerText = `${_name} (${_symbol})`;

		const responseFromAPI = await axios.get(apiUrl);
		const chartLabels = responseFromAPI.data.labels;
		const chartDatasets = responseFromAPI.data.datasets;
		const helperDatasets = chartDatasets.map((dataChart) => {
			const colorDataset = getRandomGraphColor().background;
			try {
				return {
					label: dataChart.symbol,
					data: dataChart.dataset,
					lineTension: 0.3,
					fill: false,
					borderColor: colorDataset,
					pointRadius: 3,
					pointBackgroundColor: colorDataset,
					pointBorderColor: colorDataset,
					pointHoverRadius: 3,
					pointHoverBackgroundColor: colorDataset,
					pointHoverBorderColor: colorDataset,
					pointHitRadius: 10,
					pointBorderWidth: 2,
				};
			} catch (err) {}
		});
		const ctxEvo = document.getElementById('evolutionChart');
		const myEvoChart = new Chart(ctxEvo, {
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: helperDatasets,
			},
			options: {
				maintainAspectRatio: false,
				responsive: true,
				onResize: function (_chart, _newSize) {
					_chart.options.legend.display = _newSize.width < 350 ? false : true;
					_chart.update();
				},
				layout: {
					padding: {
						left: 10,
						right: 25,
						top: 25,
						bottom: 0,
					},
				},
				scales: {
					xAxes: [
						{
							time: {
								unit: 'date',
							},
							gridLines: {
								display: false,
								drawBorder: false,
							},
							ticks: {
								maxTicksLimit: 7,
							},
						},
					],
					yAxes: [
						{
							ticks: {
								maxTicksLimit: 5,
								padding: 10,
								// Include a EUR sign in the ticks
								callback: function (value, index, values) {
									return value.toFixed(2) + ' EUR';
								},
							},
							gridLines: {
								color: 'rgb(234, 236, 244)',
								zeroLineColor: 'rgb(234, 236, 244)',
								drawBorder: false,
								borderDash: [2],
								zeroLineBorderDash: [2],
							},
						},
					],
				},
				legend: {
					display: true,
					position: 'top',
				},
				tooltips: {
					backgroundColor: 'rgb(255,255,255)',
					bodyFontColor: '#858796',
					titleMarginBottom: 10,
					titleFontColor: '#6e707e',
					titleFontSize: 14,
					borderColor: '#dddfeb',
					borderWidth: 1,
					xPadding: 15,
					yPadding: 15,
					displayColors: false,
					intersect: false,
					mode: 'index',
					caretPadding: 10,
					callbacks: {
						label: function (tooltipItem, chart) {
							var datasetLabel =
								chart.datasets[tooltipItem.datasetIndex].label || '';
							return (
								datasetLabel + ': ' + tooltipItem.yLabel.toFixed(2) + ' EUR'
							);
						},
					},
				},
			},
		});
	} catch (err) {
		console.log('Error while getting the data: ', err);
	}
}

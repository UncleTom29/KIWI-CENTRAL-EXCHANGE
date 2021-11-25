const Stock = require('../models/stock.model');
const WalletController = require('./wallet.controller');
const TransactionController = require('./transaction.controller');
const LogController = require('./log.controller');
const UtilitiesController = require('./utilities.controllers');
const dayjs = require('dayjs');
const axios = require('axios');

const arrCrypto = [
	{ "1. symbol": "BTC", "2. name": "Bitcoin" },
	{ "1. symbol": "ETH", "2. name": "Etherum" },
	{ "1. symbol": "LTC", "2. name": "LiteCoin" },
	{ "1. symbol": "USDT", "2. name": "Tether" },
	{ "1. symbol": "XPR", "2. name": "Riple XRP" },
	{ "1. symbol": "BCH", "2. name": "Bitcoin Cash" },
	{ "1. symbol": "BSV", "2. name": "Bitcoin SV" },
	{ "1. symbol": "ADA", "2. name": "Cardano" },
	{ "1. symbol": "BNB", "2. name": "Binance Coin" },
	{ "1. symbol": "CRO", "2. name": "Crypto.com Coin" },
	{ "1. symbol": "EOS", "2. name": "EOS" },
	{ "1. symbol": "XTZ", "2. name": "Tezos" },
	{ "1. symbol": "XLM", "2. name": "Stellar" },
	{ "1. symbol": "XMR", "2. name": "Monero" },
	{ "1. symbol": "LEO", "2. name": "UNUS SED LEO" },
	{ "1. symbol": "USDC", "2. name": "USD Coin" },
	{ "1. symbol": "VET", "2. name": "Vechain" },
	{ "1. symbol": "HT", "2. name": "Houbi Token" },
	{ "1. symbol": "DASH", "2. name": "Dash" },
	{ "1. symbol": "DOGE", "2. name": "Dogecoin" },
];
class TradeController {
	static async get(_id) {
		const stock = await Stock.findById(_id);
		if (stock) {
			stock.populate('user');
			stock.populate('stock');
		}
		return stock;
	}
	static async getByUserSymbol(_user, _symbol) {
		const stock = await Stock.findOne({ user: _user, symbol: _symbol });
		if (stock) {
			stock.populate('user');
			stock.populate('stock');
		}
		return stock;
	}
	static async add(_stock) {
		const newStock = await Stock.create(_stock);
		if (newStock) {
			this.registerLog(newStock, 'New');
		}
		return newStock;
	}
	static async set(_stock) {
		const editStock = await Stock.findByIdAndUpdate(_stock._id, _stock, {
			new: true,
		});
		if (editStock) {
			this.registerLog(editStock, 'Editing');
		}
		return editStock;
	}
	static async buy(_user, _symbol, _name, _type, _units, _price) {
		try {
			const userWallet = await WalletController.getByUserId(_user);
			const buyStock = await this.getByUserSymbol(_user, _symbol);
			//let buyPrice = await this.getSymbolPrice(_symbol, _type);
			const buyAmount = parseFloat(_units) * parseFloat(_price);
			if (buyAmount <= userWallet.amount) {
				const newWallet = await WalletController.buy(userWallet._id, buyAmount);
				if (buyStock) {
					buyStock.units += parseInt(_units);
					await TransactionController.add({
						date: new Date(),
						user: userWallet.user,
						stock: buyStock._id,
						type: 'buy',
						units: parseInt(_units),
						price: parseFloat(_price),
					});
					await this.set(buyStock);
					await this.registerLog(buyStock, 'Buy');
					return { buyStock, newWallet };
				} else {
					const newStock = await Stock.create({
						user: _user,
						symbol: _symbol,
						name: _name,
						type: _type,
						units: parseInt(_units),
					});
					await TransactionController.add({
						date: new Date(),
						user: userWallet.user,
						stock: newStock._id,
						type: 'buy',
						units: parseInt(_units),
						price: parseFloat(_price),
					});
					await this.registerLog(newStock, 'Buy');
					return { newStock, newWallet };
				}
			} else {
				throw new Error(
					`You don't have sufficient amount in your wallet for this buy. Wallet: ${userWallet.amount}, Total Cost: ${buyAmount}`
				);
			}
		} catch (err) {
			throw err;
		}
	}
	static async sell(_user, _symbol, _units, _price) {
		try {
			const sellStock = await this.getByUserSymbol(_user, _symbol);
			console.log(sellStock);
			if (sellStock && sellStock.units >= parseInt(_units)) {
				const userWallet = await WalletController.findOne({ user: _user });
				// const sellPrice = await this.getSymbolPrice(
				// 	sellStock.symbol,
				// 	sellStock.type
				// );
				console.log(userWallet);
				const sellPrice = parseFloat(_price);
				const sellAmount = parseFloat(_units) * sellPrice;
				sellStock.units -= parseInt(_units);
				const editStock = await this.set(sellStock);
				await TransactionController.add({
					date: new Date(),
					user: _user,
					stock: sellStock._id,
					type: 'sell',
					units: parseInt(_units),
					price: sellPrice,
				});
				const newWallet = await WalletController.sell(
					userWallet._id,
					sellAmount
				);
				await this.registerLog(sellStock, 'Sell');
				return newWallet;
			} else {
				throw new Error(`You don't have sufficient units for this sell`);
			}
		} catch (err) {
			throw err;
		}
	}
	static async list() {
		return await Stock.find().populate('user').populate('stock');
	}
	static async listByUser(_user) {
		return await Stock.find({ user: _user }).populate('stock');
	}
	static async registerLog(_stock, _action) {
		await LogController.register(
			`${_action} stock ${_stock._id} of user ${_stock.user}`,
			_stock.user
		);
	}
	static async getSymbolPrice(_symbol, _type) {
		const key = process.env.API_KEY;
		const functionName =
			_type === 'crypto' ? 'CURRENCY_EXCHANGE_RATE' : 'GLOBAL_QUOTE';
		let apiUrl = `https://www.alphavantage.co/query?function=${functionName}&apikey=${key}`;
		switch (_type) {
			case 'crypto':
				apiUrl += `&from_currency=${_symbol}&to_currency=EUR`;
				break;
			default:
				apiUrl += `&symbol=${_symbol}`;
				break;
		}
		let price = Math.floor(Math.random() * 10000);
		try {
			const responseFromAPI = await axios.get(apiUrl);
			//console.log(responseFromAPI);
			switch (_type) {
				case 'crypto':
					price = parseFloat(
						responseFromAPI.data['Realtime Currency Exchange Rate'][
							'5. Exchange Rate'
						]
					);
					break;
				default:
					price = parseFloat(responseFromAPI.data['Global Quote']['05. price']);
					break;
			}
			return price;
		} catch (err) {
			console.log('Error while getting the data: ', err);
			return price;
		}
	}
	static async searchSymbol(_keywords, _type) {
		if (_type === 'crypto') {
			return arrCrypto;
		} else {
			const key = process.env.API_KEY;
			const functionName = 'SYMBOL_SEARCH';
			const apiUrl = `https://www.alphavantage.co/query?function=${functionName}&keywords=${_keywords}&apikey=${key}`;
			try {
				const responseFromAPI = await axios.get(apiUrl);
				return responseFromAPI.data['bestMatches'];
			} catch (err) {
				console.log('Error while getting the data: ', err);
			}
		}
	}
	static async getEvolutionSymbolsByUser(_id) {
		const key = process.env.API_KEY;
		const symbols = await this.listByUser(_id);
		const tmpLabels = await UtilitiesController.getLastNDays(30);
		const returnDatasets = await Promise.all(
			symbols.map(async function (sym, index) {
				const itemData = { symbol: `${sym.name} (${sym.symbol})`, dataset: [] };
				let dataArrayName =
					sym.type === 'crypto'
						? 'Time Series (Digital Currency Daily)'
						: 'Time Series (Daily)';
				let dataFieldName =
					sym.type === 'crypto' ? '4a. close (EUR)' : '4. close';
				let functionName =
					sym.type === 'crypto'
						? 'DIGITAL_CURRENCY_DAILY'
						: 'TIME_SERIES_DAILY';

				const apiUrl =
					`https://www.alphavantage.co/query?function=${functionName}&symbol=${sym.symbol}&apikey=${key}` +
					(sym.type === 'crypto' ? '&market=EUR' : '');
				try {
					const responseFromAPI = await axios.get(apiUrl);
					if (responseFromAPI && responseFromAPI.data[dataArrayName]) {
						const dataToProcess = responseFromAPI.data[dataArrayName];
						const dataKeys = Object.keys(dataToProcess);
						tmpLabels.forEach((date) => {
							if (
								dataKeys.find((d) => d === dayjs(date).format('YYYY-MM-DD'))
							) {
								itemData.dataset.push(
									parseFloat(
										dataToProcess[dayjs(date).format('YYYY-MM-DD')][
											dataFieldName
										]
									)
								);
							} else {
								itemData.dataset.push(0.0);
							}
						});
						if (itemData.dataset.length > 0) {
							itemData.dataset.reverse();
						}
					}
					return itemData;
				} catch (err) {
					console.log('Error while getting the data: ', err);
				}
			})
		);
		tmpLabels.reverse();
		const returnLabels = tmpLabels.map((d) => dayjs(d).format('DD/MM/YYYY'));
		return {
			labels: returnLabels,
			datasets: returnDatasets.filter((ds) => ds.dataset.length > 0),
		};
	}
	static async getEvolutionSymbol(_type, _symbol, _name) {
		const key = process.env.API_KEY;
		const symbols = [{ type: _type, symbol: _symbol, name: _name }];
		const tmpLabels = await UtilitiesController.getLastNDays(30);
		const returnDatasets = await Promise.all(
			symbols.map(async function (sym, index) {
				const itemData = {
					id: sym.symbol,
					symbol: `${sym.name} (${sym.symbol})`,
					dataset: [],
				};
				let dataArrayName =
					sym.type === 'crypto'
						? 'Time Series (Digital Currency Daily)'
						: 'Time Series (Daily)';
				let dataFieldName =
					sym.type === 'crypto' ? '4a. close (EUR)' : '4. close';
				let functionName =
					sym.type === 'crypto'
						? 'DIGITAL_CURRENCY_DAILY'
						: 'TIME_SERIES_DAILY';

				const apiUrl =
					`https://www.alphavantage.co/query?function=${functionName}&symbol=${sym.symbol}&apikey=${key}` +
					(sym.type === 'crypto' ? '&market=EUR' : '');
				try {
					const responseFromAPI = await axios.get(apiUrl);
					if (responseFromAPI && responseFromAPI.data[dataArrayName]) {
						const dataToProcess = responseFromAPI.data[dataArrayName];
						const dataKeys = Object.keys(dataToProcess);
						tmpLabels.forEach((date) => {
							if (
								dataKeys.find((d) => d === dayjs(date).format('YYYY-MM-DD'))
							) {
								itemData.dataset.push(
									parseFloat(
										dataToProcess[dayjs(date).format('YYYY-MM-DD')][
											dataFieldName
										]
									)
								);
							} else {
								itemData.dataset.push(0.0);
							}
						});
						if (itemData.dataset.length > 0) {
							itemData.dataset.reverse();
						}
					}
					return itemData;
				} catch (err) {
					console.log('Error while getting the data: ', err);
				}
			})
		);
		tmpLabels.reverse();
		const returnLabels = tmpLabels.map((d) => dayjs(d).format('DD/MM/YYYY'));
		return {
			labels: returnLabels,
			datasets: returnDatasets.filter((ds) => ds.dataset.length > 0),
		};
	}

	static async getSymbolsByUser(_id) {
		const trades = await this.listByUser(_id);
		const transactions = await TransactionController.listByUser(_id);
		const returnValues = await Promise.all(
			trades.map(async function (trade, index) {
				return {
					_id: { symbol: trade.symbol, name: trade.name },
					amount: transactions
						.filter((t) => t.stock.symbol === trade.symbol)
						.reduce(
							(total, trans) =>
								(total += trans.total * (trans.type === 'sell' ? -1 : 1)),
							0
						),
					units: trade.units,
					actualPrice: await TradeController.getSymbolPrice(
						trade.symbol,
						trade.type
					),
				};
			})
		);

		return returnValues;
	}
}
module.exports = TradeController;

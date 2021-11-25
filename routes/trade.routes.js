const express = require('express');
const tradeController = require('../controllers/trade.controller');
const transactionController = require('../controllers/transaction.controller');
const supportController = require('../controllers/support.controller');
const router = express.Router();

/* GET Trade */
router.get('/', async (req, res, next) => {
	const trades = await tradeController.listByUser(req.session.user._id);
	const support = await supportController.listByUser(req.session.user._id);
	const transactions = await transactionController.listByUser(
		req.session.user._id
	);
	let buyAmount = 0;
	let sellAmount = 0;
	let walletAmount = req.session.wallet.amount;
	if (trades) {
		if (transactions.length > 0) {
			buyAmount = transactions
				.filter((trans) => trans.type === 'buy')
				.reduce((total, trans) => (total += trans.total), 0);
			sellAmount = transactions
				.filter((trans) => trans.type === 'sell')
				.reduce((total, trans) => (total += trans.total), 0);
		}
	}

	res.render('app/trade/index', {
		layout: 'app/layout',
		user: req.session.user,
		walletAmount: walletAmount,
		buyAmount: buyAmount,
		sellAmount: sellAmount,
		trades: trades,
		transactions: transactions,
		supportCount: support.length,
		supports: support,
	});
});

router.get('/buy', async (req, res, next) => {
	const support = await supportController.listByUser(req.session.user._id);
	res.render('app/trade/trade', {
		layout: 'app/layout',
		user: req.session.user,
		supportCount: support.length,
		supports: support,
		title: 'Buy',
		action: 'buy',
		hasSymbol: false,
		walletAmount: req.session.wallet.amount,
		symbol: '',
		symbolCode: '',
		symbolName: '',
		type: 'stock',
		units: 0,
		price: 0,
	});
});

router.get('/buy/:type/:symbol-:name', async (req, res, next) => {
	const support = await supportController.listByUser(req.session.user._id);
	res.render('app/trade/trade', {
		layout: 'app/layout',
		user: req.session.user,
		supportCount: support.length,
		supports: support,
		title: 'Buy',
		action: 'buy',
		hasSymbol: true,
		walletAmount: req.session.wallet.amount,
		symbol: `${req.params.name} (${req.params.symbol})`,
		symbolCode: req.params.symbol,
		symbolName: req.params.name,
		type: req.params.type,
		units: 0,
		price: await tradeController.getSymbolPrice(
			req.params.symbol,
			req.params.type
		),
	});
});

router.get('/sell', async (req, res, next) => {
	const support = await supportController.listByUser(req.session.user._id);
	res.render('app/trade/trade', {
		layout: 'app/layout',
		user: req.session.user,
		title: 'Sell',
		action: 'sell',
		hasSymbol: false,
		trades: await tradeController.listByUser(req.session.user._id),
		supportCount: support.length,
		supports: support,
	});
});

router.get('/sell/:type/:units/:symbol-:name', async (req, res, next) => {
	const support = await supportController.listByUser(req.session.user._id);
	let priceSymbol = await tradeController.getSymbolPrice(
		req.params.symbol,
		req.params.type
	);
	res.render('app/trade/trade', {
		layout: 'app/layout',
		user: req.session.user,
		title: 'Sell',
		action: 'sell',
		hasSymbol: true,
		symbol: `${req.params.name} (${req.params.symbol})`,
		symbolCode: req.params.symbol,
		symbolName: req.params.name,
		units: req.params.units,
		type: req.params.type,
		isStock: req.params.type === 'stock',
		isCrypto: req.params.type === 'crypto',
		price: priceSymbol,
		walletAmount: priceSymbol * req.params.units,
		supportCount: support.length,
		supports: support,
	});
});

router.post('/buy', async (req, res, next) => {
	const { symbolCode, symbolName, type, units, price } = req.body;
	try {
		if (units * price <= req.session.wallet.amount) {
			const { newStock, newWallet } = await tradeController.buy(
				req.session.user._id,
				symbolCode,
				symbolName,
				type,
				units,
				price
			);
			req.session.wallet = newWallet;
			req.session.evolutionSymbols = await tradeController.getEvolutionSymbolsByUser(
				req.session.user._id
			);
			req.session.userSymbols = await tradeController.getSymbolsByUser(
				req.session.user._id
			);
			res.redirect('/app/trade/');
		} else {
			throw new Error(
				`You don't have sufficient amount in your wallet for this buy. Wallet: ${
					req.session.wallet.amount
				}, Total Cost: ${units * price}`
			);
		}
	} catch (err) {
		res.render('app/trade/trade', {
			layout: 'app/layout',
			user: req.session.user,
			title: 'Buy',
			action: 'buy',
			symbolCode,
			symbolName,
			type,
			units,
			price,
			errorMessage: err.message,
		});
	}
});

router.post('/sell', async (req, res, next) => {
	const { symbolCode, symbolName, type, units, price } = req.body;
	try {
		const newWallet = await tradeController.sell(
			req.session.user._id,
			symbolCode,
			units,
			price
		);
		req.session.wallet = newWallet;
		req.session.evolutionSymbols = await tradeController.getEvolutionSymbolsByUser(
			req.session.user._id
		);
		req.session.userSymbols = await tradeController.getSymbolsByUser(
			req.session.user._id
		);
		res.redirect('/app/trade/');
	} catch (err) {
		res.render('app/trade/trade', {
			layout: 'app/layout',
			user: req.session.user,
			title: 'Sell',
			action: 'sell',
			hasSymbol: true,
			symbol: `${symbolName} (${symbolCode})`,
			symbolCode: symbolCode,
			symbolName: symbolName,
			units: units,
			isStock: type === 'stock',
			isCrypto: type === 'crypto',
			price: price,
			walletAmount: price * req.params.units,
			errorMessage: err.message,
		});
	}
});

router.get('/getSymbolPrice/:type/:symbol', async (req, res, next) => {
	res.json(
		await tradeController.getSymbolPrice(req.params.symbol, req.params.type)
	);
});
router.get('/searchSymbol/:type/:keywords', async (req, res, next) => {
	res.json(
		await tradeController.searchSymbol(req.params.keywords, req.params.type)
	);
});
router.get(
	'/getEvolutionSymbol/:type/:symbol-:name',
	async (req, res, next) => {
		if (!req.session.evolutionSymbol) {
			req.session.evolutionSymbol = [];
		}
		if (
			req.session.evolutionSymbol.filter(
				(elem) => elem.id === `${req.params.symbol}`
			).length === 0
		) {
			console.log(req.params.type, req.params.symbol, req.params.name);
			req.session.evolutionSymbol.push({
				id: req.params.symbol,
				data: await tradeController.getEvolutionSymbol(
					req.params.type,
					req.params.symbol,
					req.params.name
				),
			});
		}
		res.json(
			req.session.evolutionSymbol.filter(
				(elem) => elem.id === `${req.params.symbol}`
			)[0].data
		);
	}
);
router.get('/getEvolutionSymbolsByUser', async (req, res, next) => {
	if (!req.session.evolutionSymbols) {
		req.session.evolutionSymbols = await tradeController.getEvolutionSymbolsByUser(
			req.session.user._id
		);
	}
	res.json(req.session.evolutionSymbols);
});
router.get('/getSymbolsByUser', async (req, res, next) => {
	if (!req.session.userSymbols) {
		req.session.userSymbols = await tradeController.getSymbolsByUser(
			req.session.user._id
		);
	}
	res.json(req.session.userSymbols);
});
module.exports = router;

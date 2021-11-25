const Wallet = require('../models/wallet.model');
const LogController = require('../controllers/log.controller');

class WalletController {
	static async getByUserId(_id) {
		const wallet = await Wallet.findOne({ user: _id });
		if (wallet) {
			wallet.populate('user');
		}
		return wallet;
	}
	static async get(_id) {
		const wallet = await Wallet.findById(_id);
		if (wallet) {
			wallet.populate('user');
		}
		return wallet;
	}
	static async set(_wallet) {
		const editWallet = await Wallet.findByIdAndUpdate(_wallet._id, _wallet, {
			new: true,
		});
		if (editWallet) {
			editWallet.populate('user');
			await this.registerLog(editWallet, 'Updated');
		}
		return editWallet;
	}
	static async add(_wallet) {
		let newWallet = await Wallet.create(_wallet);
		if (newWallet) {
			await this.deposit(newWallet._id, 10000);
			await this.registerLog(newWallet, 'New');
		}
		newWallet = this.get(newWallet._id);
		return newWallet;
	}
	static async sell(_id, _amount) {
		try {
			return await this.addMovement(_id, 'sell', _amount);
		} catch (err) {
			throw err;
		}
	}
	static async deposit(_id, _amount) {
		try {
			return await this.addMovement(_id, 'deposit', _amount);
		} catch (err) {
			throw err;
		}
	}
	static async buy(_id, _amount) {
		try {
			return await this.addMovement(_id, 'buy', _amount);
		} catch (err) {
			throw err;
		}
	}
	static async widthdraw(_id, _amount) {
		try {
			return await this.addMovement(_id, 'widthdraw', _amount);
		} catch (err) {
			throw err;
		}
	}
	static async addMovement(_id, _type, _amount) {
		const movWallet = await this.get(_id);
		if (movWallet) {
			if (_type === 'buy' || _type === 'widthdraw') {
				if (movWallet.amount - _amount < 0) {
					throw new Error(`You don't have sufficient amount for this ` + _type);
				} else {
					movWallet.amount -= _amount;
				}
			} else {
				movWallet.amount += _amount;
			}
			movWallet.movements.push({
				date: new Date(),
				type: _type,
				amount: _amount,
			});
			await this.registerLog(movWallet, 'New movement in');
			return await this.set(movWallet);
		}
		return movWallet;
	}
	static async delete(_id) {
		const delWallet = await Wallet.findByIdAndRemove(_id);
		if (delWallet) {
			await this.registerLog(delWallet, 'Deleting');
		}
		return delWallet;
	}
	static async list() {
		return await Wallet.find();
	}
	static async findOne(_filter) {
		return await Wallet.findOne(_filter);
	}
	static async registerLog(_wallet, _action) {
		await LogController.register(
			`${_action} wallet ${_wallet._id} of user ${_wallet.user}`,
			_wallet.user
		);
	}
}

module.exports = WalletController;

const User = require('../models/user.model');
const WalletController = require('../controllers/wallet.controller');
const LogController = require('../controllers/log.controller');
const SupportController = require('../controllers/support.controller');

class UserController {
	static async get(_id) {
		return await User.findById(_id);
	}
	static async set(_user) {
		try {
			const editUser = await User.findByIdAndUpdate(_user._id, _user, {
				new: true,
			});
			if (editUser) {
				await this.registerLog(editUser, 'Editing');
			}
			return editUser;
		} catch (err) {
			console.log(err);
		}
	}
	static async add(_user) {
		try {
			const newUser = await User.create(_user);
			const newWallet = await WalletController.add({
				user: newUser._id,
				amount: 0,
				movements: [],
			});
			const subject = 'Introducing Kiwi Exchange’s Global Privacy Policy';
			const message =
				'Hi there, protecting your data and your privacy are essential priorities for Kiwi Exchange. That’s why we make sure to keep you informed of how and why we collect and use your data. Sincerely, The Kiwi Exchange Team';
			const newTicket = await SupportController.add({
				user: newUser._id,
				name: newUser.name,
				email: newUser.email,
				subject: subject,
				message: message,
				status: 'success',
			});

			await this.registerLog(newUser, 'New');
			return { newUser, newWallet };
		} catch (err) {
			throw err;
		}
	}
	static async delete(_id) {
		const delUser = await User.findByIdAndRemove(_id);
		if (delUser) {
			await this.registerLog(delUser, 'Deleting');
		}
		return delUser;
	}
	static async list() {
		return await User.find();
	}
	static async findOne(_filter) {
		return await User.findOne(_filter);
	}
	static async registerLog(_user, _action) {
		await LogController.register(`${_action} user ${_user._id}`, _user._id);
	}
}

module.exports = UserController;

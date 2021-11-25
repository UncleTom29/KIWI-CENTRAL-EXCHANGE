const Transaction = require('../models/transaction.model');
const LogController = require('./log.controller');

class TransactionController {
	static async add(_transaction) {
		const newTransaction = await Transaction.create(_transaction);
		if (newTransaction) {
			await this.registerLog(newTransaction, 'New');
		}
		return newTransaction;
	}
	static async list() {
		return await Transaction.find().populate('stock');
	}
	static async listByUser(_user) {
		return await Transaction.find({ user: _user }).populate('stock');
	}
	static async findOne(_filter) {
		return await Transaction.findOne(_filter);
	}
	static async registerLog(_transaction, _action) {
		await LogController.register(
			`${_action} transaction ${_transaction._id} of user ${_transaction.user}`,
			_transaction.user
		);
	}
}
module.exports = TransactionController;

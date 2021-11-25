const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
	{
		date: { type: Date, required: true },
		user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
		stock: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'Stock',
			required: true,
		},
		type: { type: String, enum: ['buy', 'sell'], required: true },
		units: { type: Number, required: true },
		price: { type: Number, required: true },
	},
	{ timestamps: true }
);
transactionSchema.virtual('total').get(function () {
	return this.units * this.price;
});
transactionSchema.virtual('signedTotal').get(function () {
	return this.units * this.price * (this.type === 'buy' ? -1 : 1);
});
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

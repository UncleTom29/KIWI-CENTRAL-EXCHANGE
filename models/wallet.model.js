const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
	{
		user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
		amount: { type: Number, required: true },
		movements: [
			{
				date: { type: Date, required: true },
				type: {
					type: String,
					enum: ['deposit', 'widthdraw', 'buy', 'sell'],
					required: true,
				},
				amount: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;

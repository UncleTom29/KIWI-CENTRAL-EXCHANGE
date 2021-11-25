const dayjs = require('dayjs');
class UtilitiesController {
	static async getLastNDays(_daysLeft) {
		const arr = [];
		let startDate = new Date().now;
		let days = 0;
		while (days < 30) {
			arr.push(dayjs(startDate).subtract(days, 'day').format('YYYY-MM-DD'));
			days++;
		}

		return arr;
	}
}

module.exports = UtilitiesController;

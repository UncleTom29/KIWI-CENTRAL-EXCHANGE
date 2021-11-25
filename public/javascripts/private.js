function getRandomGraphColor() {
	const r = Math.floor(Math.random() * 255);
	const b = Math.floor(Math.random() * 255);
	const a = Math.floor(Math.random() * 255);

	return {
		background: 'rgba(' + r + ',' + b + ',' + a + ',0.7)',
		hover: 'rgba(' + r + ',' + b + ',' + a + ',1.5)',
	};
}

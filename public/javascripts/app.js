$(document).ready(async function () {
	await document.querySelectorAll('.nav-item').forEach((elem) => {
		elem.classList.remove('active');
	});
	if (window.location.pathname.includes('/app/trade')) {
		document.getElementById('mnuTrade').classList.add('active');
	} else if (window.location.pathname.includes('/app/wallet')) {
		document.getElementById('mnuWallet').classList.add('active');
	} else if (window.location.pathname.includes('/app/wallet')) {
		document.getElementById('mnuWallet').classList.add('active');
	} else if (window.location.pathname.includes('/app/market')) {
		document.getElementById('mnuMarket').classList.add('active');
	} else if (window.location.pathname.includes('/app/transactions')) {
		document.getElementById('mnuTrans').classList.add('active');
	} else if (window.location.pathname.includes('/app/user')) {
		document.getElementById('mnuUser').classList.add('active');
	} else if (window.location.pathname.includes('/app/support')) {
		document.getElementById('mnuSupport').classList.add('active');
	} else if (window.location.pathname.includes('/app/logs')) {
		document.getElementById('mnuLogs').classList.add('active');
	} else {
		document.getElementById('mnuHome').classList.add('active');
	}
});

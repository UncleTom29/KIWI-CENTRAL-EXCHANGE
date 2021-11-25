const express = require("express");
const transactionController = require("../controllers/transaction.controller");
const tradeController = require("../controllers/trade.controller");
const supportController = require("../controllers/support.controller");
const walletController = require("../controllers/wallet.controller");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const support = await supportController.listByUser(req.session.user._id);
  const wallet = await walletController.getByUserId(req.session.user._id);
  const trades = await tradeController.listByUser(req.session.user._id);
  const transactions = await transactionController.listByUser(
    req.session.user._id
  );
  const balanceInvest = await tradeController.getSymbolsByUser(
    req.session.user._id
  );

  console.log(balanceInvest);
  let supportCount = support.length;
  let benefits = 0;
  let percentBenefits = 0;
  let buyAmount = 0;
  let sellAmount = 0;
  let walletAmount = req.session.wallet.amount;
  if (trades) {
    if (transactions.length > 0) {
      buyAmount = transactions
        .filter((trans) => trans.type === "buy")
        .reduce((total, trans) => (total += trans.total), 0);
      sellAmount = transactions
        .filter((trans) => trans.type === "sell")
        .reduce((total, trans) => (total += trans.total), 0);
    }
  }
  percentBenefits = (walletAmount / 10000) * 100 - 100;
  benefits = (10000 * percentBenefits) / 100;
  // End Dashboard data
  res.render("app/transactions", {
    layout: "app/layout",
    user: req.session.user,
    walletAmount: walletAmount,
    buyAmount: buyAmount,
    sellAmount: sellAmount,
    trades: trades,
    transactions: transactions,
    balanceInvest: balanceInvest,
    benefits: benefits,
    percentBenefits: percentBenefits,
    supportCount: supportCount,
    supports: support,
    wallet: wallet,
  });
});

module.exports = router;

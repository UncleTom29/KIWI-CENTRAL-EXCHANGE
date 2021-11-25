const mongoose = require("mongoose");

const Transaction = require("../models/transaction.model");

const DB_TITLE = "tradexc";

mongoose.connect(`mongodb://localhost/${DB_TITLE}`, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

Transaction.collection.drop();

const transactions = [
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 10,
		price: 35,
   
  },
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 10,
		price: 35,
   
  },
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 10,
		price: 35,
   
  },
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 5,
		price: 30,
   
  },
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 15,
		price: 35,
   
  },
  {
    date:  new Date().getFullYear() ,
		user:  "5eede55c1d67d7037a94c473",
		stock: 1,
		type: "buy",
		units: 20,
		price: 45,
   
  },
  
];

Transaction.create(transactions)
  .then((transactions) => console.log("Transaction database created !"))
  .catch((err) => `An error occurred : ${err}`);


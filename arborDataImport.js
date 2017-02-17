// arborDataImport.js

var debug = require('debug');
var request = require('request');
var fs = require('fs');
var bookshelf = require('bookshelf')(knex);

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : 'admin',
    database : 'alex_data',
    charset  : 'utf8',
    dateStrings: 'date'
  }
});

var getAlexData = function(cb){
	var promises = [];
	    function callback(err, res, body){
     	if(err)
     		debug(err);
     	else{
     		let theObject = JSON.parse(body);
     		let propArray = theObject.AlexLoan;

     		propArray.forEach(property => {
     			property.Borrowers.BorrowerData.forEach(borrower => {
     				promises.push(writeToDB(property, borrower, borrower.PendingItems.Documents));
     			});
     		});
     	
     		Promise.all(promises).then(function() {
     			cb();
     		});
     	}
     };

     var options = {
     	url:'https://alex.arborloanexpress.com/api/LoanExpress/GetLoanInfoFull',
     	headers:{
     		"username": 'bneuwirth@easternuc.com',
       		"password": 'Eastern3950$'
     	}
     };

     request(options, callback);
}

function prepareProperty(property){
	return {
		loan_id_string: property._LoanNumber.trim(),
		property_name: property.PropertyName
	}
}

function prepareBorrower(borrower){
		return {
		borrower_id:borrower._BorrowerId,
		name:borrower.BorrowerName,
		email:borrower.BorrowerEmail
	}
}

function preparePropLoan(loan_id_string, borrower_id){
	return {
		loan_id_string:loan_id_string,
		borrower_id:borrower_id
	}
}

function prepareDocuments(loan_id_string, borrower_id, documents){
	let dbPropArray = [];
	if(documents){
		documents.forEach(document => {
			let dbProp = {
				loan_id_string:loan_id_string,
				borrower_id:borrower_id,
				document_id:document._DocumentId,
				name:document.DocumentName,
				status:document.Status,
				approval:document.DocumentApproval
			}
			dbPropArray.push(dbProp);
		});
	}
	return dbPropArray;
}


var writeToDB = function(property, borrower, documents){

	var myProp = prepareProperty(property);
	var myBorrower = prepareBorrower(borrower);
	var prop_loan = preparePropLoan(myProp.loan_id_string, myBorrower.borrower_id);
	var myDocuments = prepareDocuments(myProp.loan_id_string, myBorrower.borrower_id, documents);

	return knex.insert(myProp).into('loan').catch((e) => {
		if(e.message.indexOf('ER_DUP_ENTRY') == -1)
			console.log(e.message);
	}).then(knex.insert(myBorrower).into('borrower').catch((e) => {
		if(e.message.indexOf('ER_DUP_ENTRY') == -1)
			console.log(e.message);
	})).then(knex.insert(prop_loan).into('loan_borrower').catch((e) => {
		if(e.message.indexOf('ER_DUP_ENTRY') == -1)
			console.log(e.message);
	})).then(knex.insert(myDocuments).into('document').catch((e) => {
		if(e.message.indexOf('ER_DUP_ENTRY') == -1){
			console.log(e.message);
		}
	}));

}

getAlexData(function() {
	console.log('DONE!!!!!!!!!!!');
	process.exit();
});
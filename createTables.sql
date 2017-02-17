
create table loan(
loan_id_string varchar(45) NOT NULL,
property_name varchar(255),
primary key(loan_id_string)
);

create table borrower(
borrower_id INT NOT NULL,
name varchar(255),
email varchar(255),
primary key(borrower_id)
);


-- a loan can have more than one borrower and a borrower can exist on more than one loan
-- we bring them together here, mapping loans to borrowers, and visa versa.
create table loan_borrower(
 loan_id_string varchar(45) NOT NULL,
 borrower_id INT NOT NULL,
 primary key(loan_id_string, borrower_id)
);


-- a document exists in the context of a borrower inside of a loan, never by itself, nor to a borrower who is not inside a loan.
-- therefore we do not need another table to bring them together.
-- we use the loan_id and the borrowe_id
create table document(
document_id INT NOT NULL,
loan_id_string varchar(45) NOT NULL,
borrower_id INT NOT NULL,
name varchar(255),
status varchar(255),
approval varchar(255),
primary key(document_id, loan_id_string, borrower_id)
);


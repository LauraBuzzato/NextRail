-- Arquivo de apoio, caso você queira criar tabelas como as aqui criadas para a API funcionar.
-- Você precisa executar os comandos no banco de dados para criar as tabelas,
-- ter este arquivo aqui não significa que a tabela em seu BD estará como abaixo!

/*
comandos para mysql server
*/
CREATE DATABASE nextrail;

USE nextrail;

CREATE TABLE empresa (
	id INT PRIMARY KEY AUTO_INCREMENT,
	razao_social VARCHAR(50) unique not null,
	cnpj CHAR(14)unique not null,
	codigo_ativacao VARCHAR(50) unique not null 
);


create table cargo(
	id int primary key auto_increment,
	descricao varchar (50) unique not null,
	dashboard Boolean, 
	chamados Boolean, 
	administrador boolean, 
	alertas Boolean
);

CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50) not null,
	email VARCHAR(50) unique not null ,
	senha VARCHAR(50) not null,
    fk_cargo int not null,
	fk_empresa INT not null,
	foreign key (fk_empresa) references empresa(id),
    foreign key (fk_cargo) references cargo(id)
);


create table sistema_operacional(
	id int primary key auto_increment,
	descricao varchar (50) unique not null
);


create table servidor(
	id int primary key auto_increment,
	descricao varchar (45) not null,
	tipo varchar(30) not null,
	fk_so int,
	fk_empresa int not null,
	foreign key(fk_empresa) references empresa(id),
	foreign key (fk_so) references sistema_operacional(id)
);



create table captura(
	id bigint primary key auto_increment,
	fk_servidor int not null,
	cpu_uso decimal (5,2),
	cpu_temp decimal(5,2),
	ram_usada decimal(10,2),
	ram_livre decimal(10,2),
	disco_usado decimal(10,2),
	disco_livre decimal(10,2),
	disco_uso decimal(5,2),
	disco_temp decimal(5,2),
	dt_coleta datetime default current_timestamp not null,
	foreign key(fk_servidor) references servidor(id)
);

create table gravidade(
	id int primary key auto_increment, 
	descricao varchar(30) unique not null
);


create table status (
id int primary key auto_increment,
descricao varchar(30) unique not null
);



create table incidentes (
	id int primary key auto_increment,
	fk_servidor int not null,
	fk_captura int not null,
	gravidade int,
	chamado_status int default 1,
	abertura_chamado datetime default current_timestamp,
	tempo_de_chamado datetime,
	foreign key (gravidade) references gravidade(id),
	foreign key (chamado_status) references status(id)
);






insert into empresa (razao_social, codigo_ativacao) values ('CPTM', '1');



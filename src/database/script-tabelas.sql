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
	razao_social VARCHAR(50),
	cnpj CHAR(14),
	codigo_ativacao VARCHAR(50)
);

CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50) not null,
	email VARCHAR(50) unique not null ,
	senha VARCHAR(50) not null,
    cargo varchar(50) not null,
	fk_empresa INT,
	FOREIGN KEY (fk_empresa) REFERENCES empresa(id),
    constraint cargos check(cargo in("Operador","Suporte"))
);

create table servidor(
id int primary key auto_increment,
descricao varchar (45) not null,
tipo varchar(30) not null,
sistema_operacional varchar(50),
fk_empresa int not null,
foreign key(fk_empresa) references empresa(id),
constraint so check(sistema_operacional in("Windows","Linux","Red Hat","Windows Server","FreeBSD","Unix"))
);


create table captura(
id bigint primary key auto_increment,
fk_servidor int not null,
cpu_uso decimal (5,2),
cpu_temp decimal(5,2),
cpu_hotspot decimal(5,2),
ram_total decimal(10,2),
ram_usada decimal(10,2),
ram_livre decimal(10,2),
swap_total decimal(10,2),
swap_usada decimal(10,2),
disco_total decimal(10,2),
disco_usado decimal(10,2),
disco_livre decimal(10,2),
disco_uso decimal(5,2),
disco_temp decimal(5,2),
disco_hotspot decimal(5,2),
dt_coleta datetime default current_timestamp not null,
foreign key(fk_servidor) references servidor(id));


create table incidentes (
id int primary key auto_increment,
fk_servidor int not null,
fk_captura int not null,
gravidade varchar(20),
chamado_enviado boolean,
chamado_status varchar(30) default "Aberto",
abertura_chamado datetime default current_timestamp,
tempo_de_chamado datetime,
constraint grav check (gravidade in("Baixo","Médio","Alto","Grave")),
constraint chamdo_status_tpy check (chamado_status in("Aberto","Andamento","fechado"))
);         


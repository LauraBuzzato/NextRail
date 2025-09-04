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
    fk_cargo int not null default 2,
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

create table gravidade(
	id int primary key auto_increment, 
	descricao varchar(30) unique not null
);


create table status (
id int primary key auto_increment,
descricao varchar(30) unique not null
);



create table incidente (
	id int primary key auto_increment,
	fk_servidor int not null,
	gravidade int,
	chamado_status int default 2,
	abertura_chamado datetime default current_timestamp,
	tempo_de_chamado datetime,
	foreign key (gravidade) references gravidade(id),
	foreign key (chamado_status) references status(id),
    foreign key (fk_servidor) references servidor(id)
);

create table  componente (
id int primary key auto_increment,
descricao varchar(50) not null,
fk_servidor int not null,
foreign key (fk_servidor) references servidor(id));

create table metrica(
id int primary key auto_increment,
descricao varchar(50),
min decimal(4,2) not null,
max decimal(4,2) not null,
fk_componente int not null,
foreign key (fk_componente) references componente(id)
);



insert into empresa (razao_social,cnpj, codigo_ativacao) 
			values ('ViaMobilidade',42288184000187, '1');


insert into cargo (descricao,dashboard,chamados,alertas,administrador)
			values
				  ('Suporte',false,false,false,true),
                  ('Novo Usuario',false,false,false,false),
                  ('Diretor',True,False,True,true),
				  ('Analista',True,False,True,False),
				  ('Técnico',False,True,True,False);
                       
Insert into gravidade(descricao)
			values
					('Baixo'),
                    ('Médio'),
                    ('Alto'),
                    ('Grave');


Insert into status(descricao)
			values
				  ('Aberto'),
				  ('Andamento'),
				  ('Fechado');


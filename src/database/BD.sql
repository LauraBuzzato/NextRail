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
    email_de_contato VARCHAR(50) not null,
    telefone VARCHAR(50) not null,
	cnpj VARCHAR(14)unique not null
);


	create table cargo(
		id int primary key auto_increment,
		nome varchar (50) unique not null
	);



CREATE TABLE usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50) not null,
    cpf varchar(11) not null,
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
	nome varchar (45) not null,
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
	fk_gravidade int,
	fk_status int default 1,
	abertura_chamado datetime default current_timestamp,
	fechamento_chamado datetime,
	foreign key (fk_gravidade) references gravidade(id),
	foreign key (fk_status) references status(id),
    foreign key (fk_servidor) references servidor(id)
);

create table  componente (
id int primary key auto_increment,
nome varchar(50) not null,
fk_servidor int not null,
foreign key (fk_servidor) references servidor(id));

create table metrica(
id int primary key auto_increment,
nome varchar(50) not null,
min decimal(8,2) not null,
max decimal(8,2) not null,
fk_componente int not null,
foreign key (fk_componente) references componente(id)
);



insert into empresa (razao_social,email_de_contato, telefone, cnpj) 
			values ('ViaMobilidade', 'ouvidoria@viamobilidade.com.br', '0800 770 7106', '42288184000187');

insert into cargo (nome)
			values
				  ('Administrador'),
				  ('Analista de infraestrutura'),
                  ('Suporte técnico');
            
insert into usuario (nome, cpf, email, senha, fk_cargo, fk_empresa)
			values ('João Silva', '12345678901', 'joao@email.com', 'senha123', 1, 1);
			values ('Maria Cardoso', '12345678902', 'maria@email.com', 'senha123', 2, 1);
			values ('Pedro Silva', '12345678903', 'pedro@email.com', 'senha123', 3, 1);

                
                       
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


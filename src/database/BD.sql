
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

create table tipo(
	id int primary key auto_increment,
	nome varchar(45)
);

create table estado(
	id int primary key auto_increment,
	nome varchar(45),
	cidade varchar(45)
);

create table endereco(
	id int primary key auto_increment,
	logradouro varchar(100),
	cep varchar(8),
	numero varchar(10),
	complemento varchar(40),
	fk_estado int,
	foreign key (fk_estado) references estado(id)
);


create table servidor(
	id int primary key auto_increment,
	nome varchar (45) not null,
	fk_tipo int,
	fk_so int,
	fk_endereco int,
	fk_empresa int not null,
	foreign key(fk_empresa) references empresa(id),
	foreign key (fk_so) references sistema_operacional(id),
	foreign key (fk_tipo) references tipo(id),
	foreign key (fk_endereco) references endereco(id)
);


create table status (
id int primary key auto_increment,
descricao varchar(30) unique not null
);

create table  componente (
id int primary key auto_increment,
nome varchar(50) not null,
fk_servidor int not null,
foreign key (fk_servidor) references servidor(id));

create table incidente (
	id int auto_increment,
	fk_componente int,
	fk_status int default 1,
	abertura_chamado datetime default current_timestamp,
	fechamento_chamado datetime,
	foreign key (fk_status) references status(id),
    foreign key (fk_componente) references componente(id),
    primary key (id,fk_componente)
);

create table gravidade(
	id int primary key auto_increment,
	nome varchar(30)
);


create table metrica(
id int auto_increment,
fk_gravidade int,
nome varchar(50) not null,
valor decimal(8,2) not null,
fk_componente int not null,
foreign key (fk_componente) references componente(id),
foreign key (fk_gravidade) references gravidade(id),
primary key (id,fk_gravidade)
);



insert into empresa (razao_social,email_de_contato, telefone, cnpj) 
			values ('ViaMobilidade', 'ouvidoria@viamobilidade.com.br', '0800 770 7106', '42288184000187');

insert into cargo (nome)
			values
				  ('Administrador'),
				  ('Analista de infraestrutura'),
                  ('Suporte técnico');
            
insert into usuario (nome, cpf, email, senha, fk_cargo, fk_empresa)
			values ('João Silva', '12345678901', 'joao@email.com', 'senha123', 1, 1),
			 ('Maria Cardoso', '12345678902', 'maria@email.com', 'senha123', 2, 1),
			 ('Pedro Silva', '12345678903', 'pedro@email.com', 'senha123', 3, 1);


Insert into status(descricao)
			values
				  ('Aberto'),
				  ('Andamento'),
				  ('Fechado');


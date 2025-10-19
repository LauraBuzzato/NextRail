
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
	sigla char(2)
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
foreign key (fk_servidor) references servidor(id)
);

create table gravidade(
	id int primary key auto_increment,
	nome varchar(30)
);

create table alerta (
	id int auto_increment,
	fk_componente int,
	fk_status int default 1,
    fk_gravidade int,
	inicio datetime,
	fim datetime,
	foreign key (fk_status) references status(id),
    foreign key (fk_componente) references componente(id),
    foreign key (fk_gravidade) references gravidade(id),
    primary key (id,fk_componente)
);



create table metrica(
	id int auto_increment,
	fk_gravidade int,
	nome varchar(50) not null,
	valor int not null default 0,
	fk_componente int not null,
	foreign key (fk_componente) references componente(id),
	foreign key (fk_gravidade) references gravidade(id),
	primary key (id,fk_gravidade)
);

insert into estado (nome, sigla) 
			VALUES  
			('Acre', 'AC'),
			('Alagoas', 'AL'),
			('Amapá', 'AP'),
			('Amazonas', 'AM'),
			('Bahia', 'BA'),
			('Ceará', 'CE'),
			('Distrito Federal', 'DF'),
			('Espírito Santo', 'ES'),
			('Goiás', 'GO'),
			('Maranhão', 'MA'),
			('Mato Grosso', 'MT'),
			('Mato Grosso do Sul', 'MS'),
			('Minas Gerais', 'MG'),
			('Pará', 'PA'),
			('Paraíba', 'PB'),
			('Paraná', 'PR'),
			('Pernambuco', 'PE'),
			('Piauí', 'PI'),
			('Rio de Janeiro', 'RJ'),
			('Rio Grande do Norte', 'RN'),
			('Rio Grande do Sul', 'RS'),
			('Rondônia', 'RO'),
			('Roraima', 'RR'),
			('Santa Catarina', 'SC'),
			('São Paulo', 'SP'),
			('Sergipe', 'SE'),
			('Tocantins', 'TO'); 

insert into empresa (razao_social,email_de_contato, telefone, cnpj) 
			values 
					('ViaMobilidade', 'ouvidoria@viamobilidade.com.br', '0800 770 7106', '42288184000187');

insert into cargo (nome)
			values
				  ('Administrador'),
				  ('Analista de infraestrutura'),
                  ('Suporte técnico');
            
insert into usuario (nome, cpf, email, senha, fk_cargo, fk_empresa)
			values 
					('João Silva', '12345678901', 'joao@email.com', 'senha123', 1, 1),
					('Maria Cardoso', '12345678902', 'maria@email.com', 'senha123', 2, 1),
					('Pedro Silva', '12345678903', 'pedro@email.com', 'senha123', 3, 1);

insert into sistema_operacional (descricao) VALUES
('Ubuntu Server 22.04 LTS'),
('Debian 12'),
('CentOS Stream 9'),
('Rocky Linux 9'),
('Red Hat Enterprise Linux 9'),
('AlmaLinux 9'),
('SUSE Linux Enterprise Server 15'),
('Amazon Linux 2023'),
('Oracle Linux 9'),
('Windows Server 2019'),
('Windows Server 2022'),
('FreeBSD 13'),
('OpenBSD 7'),
('Fedora Server 40');

insert into tipo (nome) VALUES
('CTC'),
('Regulador');



Insert into status(descricao)
			values
				  ('Aberto'),
				  ('Andamento'),
				  ('Fechado');

-- ======================== SERVIDORES ========================
INSERT INTO servidor (nome, fk_tipo, fk_so, fk_endereco, fk_empresa)
VALUES
('Servidor01', 1, 1, NULL, 1),
('Servidor02', 2, 2, NULL, 1),
('Servidor03', 1, 3, NULL, 1);

-- ======================== COMPONENTES ========================
INSERT INTO componente (nome, fk_servidor)
VALUES
('CPU', 1),
('Memória RAM', 1),
('Disco Rígido', 1),
('CPU', 2),
('Memória RAM', 2),
('Disco Rígido', 2),
('CPU', 3),
('Memória RAM', 3),
('Disco Rígido', 3);

-- ======================== GRAVIDADES ========================
INSERT INTO gravidade (nome)
VALUES
('Baixo'),
('Médio'),
('Alto');

-- ======================== MÉTRICAS ========================
-- Servidor 1
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de CPU', 20, 1),
(2, 'Uso de CPU', 50, 1),
(3, 'Uso de CPU', 80, 1),
(1, 'Uso de Memória', 30, 2),
(2, 'Uso de Memória', 60, 2),
(3, 'Uso de Memória', 90, 2),
(1, 'Espaço em Disco', 40, 3),
(2, 'Espaço em Disco', 70, 3),
(3, 'Espaço em Disco', 95, 3);

-- Servidor 2
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de CPU', 15, 4),
(2, 'Uso de CPU', 45, 4),
(3, 'Uso de CPU', 85, 4),
(1, 'Uso de Memória', 25, 5),
(2, 'Uso de Memória', 55, 5),
(3, 'Uso de Memória', 90, 5),
(1, 'Espaço em Disco', 35, 6),
(2, 'Espaço em Disco', 65, 6),
(3, 'Espaço em Disco', 90, 6);

-- Servidor 3
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de CPU', 10, 7),
(2, 'Uso de CPU', 40, 7),
(3, 'Uso de CPU', 75, 7),
(1, 'Uso de Memória', 20, 8),
(2, 'Uso de Memória', 50, 8),
(3, 'Uso de Memória', 85, 8),
(1, 'Espaço em Disco', 30, 9),
(2, 'Espaço em Disco', 60, 9),
(3, 'Espaço em Disco', 90, 9);

-- ======================== MÉTRICAS DE MEMÓRIA RAM ========================
-- Servidor 1
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de Memória', 30, 2),  -- Baixo
(2, 'Uso de Memória', 60, 2),  -- Médio
(3, 'Uso de Memória', 90, 2);  -- Alto

-- Servidor 2
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de Memória', 25, 5),  -- Baixo
(2, 'Uso de Memória', 55, 5),  -- Médio
(3, 'Uso de Memória', 90, 5);  -- Alto

-- Servidor 3
INSERT INTO metrica (fk_gravidade, nome, valor, fk_componente)
VALUES
(1, 'Uso de Memória', 20, 8),  -- Baixo
(2, 'Uso de Memória', 50, 8),  -- Médio
(3, 'Uso de Memória', 85, 8);  -- Alto

select * from alerta;



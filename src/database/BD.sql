
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

create table leitura_script(
	id int primary key auto_increment,
    intervalo int default(10),
    leituras_consecutivas_para_alerta int default(3)
);


create table servidor(
	id int primary key auto_increment,
	nome varchar (45) not null,
	fk_tipo int,
	fk_so int,
	fk_endereco int,
	fk_empresa int not null,
    fk_leitura_script int,
	foreign key(fk_empresa) references empresa(id),
	foreign key (fk_so) references sistema_operacional(id),
	foreign key (fk_tipo) references tipo(id),
	foreign key (fk_endereco) references endereco(id),
    foreign key (fk_leitura_script) references leitura_script(id)
);

create table tipo_componente (
id int primary key auto_increment,
nome_tipo_componente varchar(25)
);


create table status (
id int primary key auto_increment,
descricao varchar(30) unique not null
);

create table componente_servidor (
fk_servidor int not null,
fk_tipo_componente int not null,
foreign key (fk_servidor) references servidor(id),
foreign key (fk_tipo_componente) references tipo_componente(id)
);

create table gravidade(
	id int primary key auto_increment,
	nome varchar(30)
);

create table alerta (
	id int primary key auto_increment,
	fk_componenteServidor_servidor int not null,
    fk_componenteServidor_tipoComponente int not null,
	fk_status int default 1,
    fk_gravidade int,
	inicio datetime,
	fim datetime,
	foreign key (fk_status) references status(id),
    foreign key (fk_componenteServidor_servidor) references componente_servidor(fk_servidor),
    foreign key (fk_componenteServidor_tipoComponente) references componente_servidor(fk_tipo_componente),
    foreign key (fk_gravidade) references gravidade(id)
);



create table metrica(
	id int auto_increment,
	fk_gravidade int not null,
	valor int not null,
	fk_componenteServidor_servidor int not null,
    fk_componenteServidor_tipoComponente int not null,
	foreign key (fk_componenteServidor_servidor) references componente_servidor(fk_servidor),
    foreign key (fk_componenteServidor_tipoComponente) references componente_servidor(fk_tipo_componente),
	foreign key (fk_gravidade) references gravidade(id),
	primary key (id, fk_componenteServidor_servidor, fk_componenteServidor_tipoComponente)
);


insert into tipo_componente (nome_tipo_componente)
values ('Cpu'),
       ('Ram'),
       ('Disco');
		

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
					('João Silva', '12345678901', 'joao@email.com', MD5('senha123'), 1, 1),
					('Maria Cardoso', '12345678902', 'maria@email.com', MD5('senha123'), 2, 1),
					('Pedro Silva', '12345678903', 'pedro@email.com', MD5('senha123'), 3, 1);

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
select * from estado;

INSERT INTO  endereco (logradouro, cep, numero, complemento, fk_estado) VALUES('Rua das Margaridas', '69309550', '500', 'Bloco C', 23),
('Rua Brisa do Amanhecer', '53404355', '105', NULL, 17),
('Avenida Cidade Jardim', '01454900', '280', NULL, 25);

INSERT INTO leitura_script (intervalo, leituras_consecutivas_para_alerta) VALUES (10, 3),
(5, 3),
(7, 2);


INSERT INTO servidor (nome, fk_tipo, fk_so, fk_endereco, fk_empresa, fk_leitura_script)
VALUES
('Servidor01', 2, 2, 3, 1, 1),
('Servidor02', 1, 1, 2, 1, 2),
('Servidor03', 1, 3, 1, 1, 3);


INSERT INTO gravidade (nome)
VALUES
('Baixo'),
('Médio'),
('Alto');

INSERT INTO componente_servidor (fk_servidor, fk_tipo_componente) 
VALUES
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(2,3),
(3,1),
(3,2),
(3,3);

INSERT INTO metrica (fk_gravidade, valor, fk_componenteServidor_servidor, fk_componenteServidor_tipoComponente) 
VALUES
(3, 95, 1, 2), 
(2, 85, 1, 2), 
(1, 75, 1, 2), 
(2, 70, 1, 1), 
(1, 80, 1, 1), 
(3, 90, 1, 1), 
(3, 80.0, 1, 3),
(2, 70.0, 1, 3),
(1, 60.0, 1, 3),
(1, 70, 2, 2), 
(2, 80, 2, 2), 
(3, 90, 2, 2), 
(2, 70, 2, 1), 
(1, 60, 2, 1), 
(3, 80, 2, 1), 
(1, 65, 2, 3),
(2, 75, 2, 3),
(3, 85, 2, 3),
(2, 80, 3, 2), 
(1, 75, 3, 2), 
(3, 85, 3, 2), 
(2, 90, 3, 1), 
(1, 85, 3, 1), 
(3, 95, 3, 1), 
(3, 100, 3, 3),
(2, 95, 3, 3),
(1, 90, 3, 3);

INSERT INTO alerta (fk_componenteServidor_servidor, fk_componenteServidor_tipoComponente, fk_status, fk_gravidade, inicio, fim) VALUES
(1,1, 3, 3, '2024-01-10 08:00:00', '2024-01-10 08:30:00'), 
(1,2, 3, 2, '2024-01-20 14:10:00', '2024-01-20 14:25:00'), 
(2,3, 3, 1, '2024-03-05 11:00:00', '2024-03-05 11:45:00'), 
(2,1, 3, 3, '2024-03-15 16:20:00', '2024-03-15 17:20:00'), 
(2,2, 3, 3, '2024-03-25 09:00:00', '2024-03-25 09:12:00'), 
(3,3, 3, 2, '2024-05-18 22:00:00', '2024-05-18 22:18:00'); 



SELECT 
    m.valor AS Valor_Inicial,
    tc.nome_tipo_componente AS Componente,
    g.nome AS Gravidade
FROM 
    metrica m
JOIN 
    tipo_componente tc ON m.fk_componenteServidor_tipoComponente = tc.id
JOIN 
    gravidade g ON m.fk_gravidade = g.id
WHERE 
    m.fk_componenteServidor_servidor = 4
ORDER BY 
    Componente, Gravidade;


INSERT INTO alerta (fk_componenteServidor_servidor, 
					fk_componenteServidor_tipoComponente, 
                    fk_status, 
                    fk_gravidade, 
                    inicio,
                    fim) VALUES
(2,1, 3, 3,'2024-05-10 06:00:00', '2024-05-10 06:20:00'),
(2,1, 2, 3,'2024-05-10 08:00:00', '2024-05-10 08:05:00'), 
(2,1, 2, 3,'2024-05-15 08:08:00', '2024-05-15 08:15:00'),
(2,2, 2, 2,'2024-05-21 07:00:00', '2024-05-21 07:20:00'),
(2,2, 1, 2,'2024-05-10 18:00:00', '2024-05-10 18:35:00'), 
(2,2, 2, 2,'2024-05-15 08:40:00', '2024-05-15 08:45:00'),
(3,3, 1, 1,'2024-06-10 16:00:00', '2024-06-10 16:45:00'), 
(3,3, 2, 1,'2024-06-15 15:00:00', '2024-06-15 15:15:00');


INSERT INTO alerta (fk_componenteServidor_servidor, 
					fk_componenteServidor_tipoComponente, 
                    fk_status, 
                    fk_gravidade, 
                    inicio,
                    fim) VALUES
(2,1, 3, 3,'2024-02-10 06:00:00', '2024-02-10 06:20:00'),
(2,2, 2, 3,'2024-02-10 08:00:00', '2024-02-10 08:05:00'), 
(2,2, 2, 3,'2024-04-15 08:08:00', '2024-04-15 08:15:00'),
(2,1, 2, 2,'2024-08-15 08:40:00', '2024-08-15 08:45:00'),
(2,1, 1, 2,'2024-08-10 16:00:00', '2024-08-10 16:45:00'), 
(2,1, 2, 1,'2024-09-15 15:00:00', '2024-09-15 15:15:00'),
(3,2, 3, 1,'2024-09-10 16:00:00', '2024-09-10 16:45:00'),
(3,1, 3, 1,'2024-10-10 16:00:00', '2024-10-10 16:45:00'),
(3,1, 3, 2,'2024-10-10 16:00:00', '2024-10-10 16:45:00'),
(3,2, 1, 2,'2024-10-10 16:00:00', '2024-10-10 16:45:00'),
(3,1, 2, 1,'2024-11-10 16:00:00', '2024-11-10 16:45:00'),
(3,2, 2, 1,'2024-11-10 16:00:00', '2024-11-10 16:45:00'),
(3,2, 1, 2,'2024-12-10 17:30:00', '2024-12-10 17:45:00'),
(3,2, 1, 2,'2024-12-10 16:00:00', '2024-12-10 16:45:00');



select * from alerta;
	
SELECT 
    alerta.inicio,
    alerta.fim,
    tipo_componente.nome_tipo_componente AS nome_componente,
    servidor.nome AS nome_servidor,
    alerta.fk_gravidade,
    gravidade.nome AS nome_gravidade,
    empresa.razao_social AS nome_empresa
FROM alerta
JOIN componente_servidor 
    ON alerta.fk_componenteServidor_servidor = componente_servidor.fk_servidor 
    AND alerta.fk_componenteServidor_tipoComponente = componente_servidor.fk_tipo_componente
JOIN tipo_componente 
    ON componente_servidor.fk_tipo_componente = tipo_componente.id
JOIN servidor 
    ON componente_servidor.fk_servidor = servidor.id
JOIN empresa 
    ON servidor.fk_empresa = empresa.id
LEFT JOIN gravidade 
    ON alerta.fk_gravidade = gravidade.id
WHERE YEAR(alerta.inicio) = 2024;




SELECT 
	emp.razao_social AS empresa,
	srv.nome AS servidor,
    tc.nome_tipo_componente AS componente,
    status.descricao AS status,
    gv.nome AS gravidade,
    inicio,
    fim
FROM
	alerta
JOIN
	status ON status.id = fk_status
JOIN
	gravidade gv ON gv.id = fk_gravidade
JOIN
	servidor srv ON srv.id = fk_componenteServidor_servidor
JOIN
	tipo_componente tc ON tc.id = fk_componenteServidor_tipoComponente
JOIN
	empresa emp ON emp.id = srv.fk_empresa
WHERE 
	emp.id = 1
ORDER BY
	srv.nome;



 SELECT emp.razao_social AS empresa,	srv.nome AS servidor, tc.nome_tipo_componente AS componente, 
               status.descricao AS status, gv.nome AS gravidade, inicio, fim
        FROM alerta
        JOIN status ON status.id = fk_status
        JOIN gravidade gv ON gv.id = fk_gravidade
        JOIN servidor srv ON srv.id = fk_componenteServidor_servidor
        JOIN tipo_componente tc ON tc.id = fk_componenteServidor_tipoComponente
        JOIN empresa emp ON emp.id = srv.fk_empresa
        WHERE emp.id = 1
        ORDER BY srv.nome;	





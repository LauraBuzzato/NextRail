captura <- read.csv("captura.csv", sep = ";", header = TRUE)

# Resumo dos dados
summary(captura)

# Histograma do uso da CPU
hist(captura$CPU.Uso,
     main = "Uso da CPU",
     xlab = "CPU (%)",
     ylab = "Qtd",
     col = "#ff4900",
     border = FALSE)



hist(captura$Disco.Temperature,
     main = "Temperatura do Disco",
     xlab = "Temperatura (°C)",
     ylab = "Qtd",
     col = "#ff7f50",
     border = FALSE)



# Histograma do uso da RAM
hist(captura$RAM.Uso,
     main = "Uso da RAM",
     xlab = "RAM (%)",
     ylab = "Qtd",
     col = "#ff4f08",
     border = FALSE)

# Qual usuário mais gastou CPU
captura[which.max(captura$CPU.Uso), ]

# Qual usuário mais gastou RAM
captura[which.max(captura$RAM.Uso), ]

# Qual usuário mais gastou Disco
captura[which.max(captura$`Disco.Porcentagem de Uso`), ]

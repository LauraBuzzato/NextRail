df_monitoramento <- read.csv("captura.csv", sep = ",", header = TRUE)

#ver os primeiros registros e a estrutura
head(df_monitoramento, 10)
str(df_monitoramento)

# renomeando as colunas pra ficar mais fácil de usar
colnames(df_monitoramento) <- c("usuario", "Data", "cpuUso", "CpuTemp", "RAM_Uso", "Disco_Uso", "Disco_Temp")

#resumo dos dados
summary(df_monitoramento)

# histograma do uso da CPU
hist(df_monitoramento$CPU_Uso,
     main = "Uso da CPU",
     xlab = "CPU (%)",
     ylab = "Qtd",
     col = "#FFF8DC",
     border = FALSE)

# histograma do uso da RAM
hist(df_monitoramento$RAM_Uso,
     main = "Uso da RAM",
     xlab = "RAM (%)",
     ylab = "Qtd",
     col = "#FFFACD",
     border = FALSE)

# histograma do uso do Disco
hist(df_monitoramento$Disco_Uso,
     main = "Uso do Disco",
     xlab = "Disco (%)",
     ylab = "Qtd",
     col = "#FFDAB9",
     border = FALSE)


#qual usuário mais gastou CPU
df_monitoramento[which.max(df_monitoramento$CPU_Uso),]

#qual usuário mais gastou RAM
df_monitoramento[which.max(df_monitoramento$RAM_Uso), ]

#qual usuário mais gastou Disco
df_monitoramento[which.max(df_monitoramento$Disco_Uso),]



const AWS = require('aws-sdk');
const Papa = require('papaparse'); 

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3();

/**
 * Função utilitária para transformar os dados brutos do CSV no formato esperado pelo Chart.js no front-end.
 * @param {Array<Object>}
 * @returns {Object}
 */
function transformarDadosParaDashboard(dadosBrutos) {
    console.log('Dados brutos recebidos para transformação:', dadosBrutos);
    
    const dadosVazios = { 
        labelsMemoria: [], 
        memoriaMB: [], 
        horarios: [], 
        processos24h: [],
        maximoProcessos: 0,
        mediaProcessos: 0,
        processoMaisFrequente: 'N/A'
    };

    if (!dadosBrutos || dadosBrutos.length === 0) {
        console.log('Nenhum dado bruto para transformar');
        return dadosVazios;
    }

    const primeiraLinha = dadosBrutos[0];
    console.log('Estrutura da primeira linha:', Object.keys(primeiraLinha));
    
    const colunasExistentes = Object.keys(primeiraLinha);
    const temNome = colunasExistentes.some(col => col.includes('NOME'));
    const temMemoria = colunasExistentes.some(col => col.includes('MEMORIA') || col.includes('USO'));
    const temTimestamp = colunasExistentes.some(col => col.includes('TIMESTAMP') || col.includes('DATA'));

    console.log(`Colunas detectadas: ${colunasExistentes.join(', ')}`);
    console.log(`tem nome: ${temNome}, Tem memória: ${temMemoria}, Tem timestamp: ${temTimestamp}`);

    if (!temNome || !temMemoria) {
        console.error('Estrutura de dados incompatível. Colunas necessárias não encontradas.');
        return dadosVazios;
    }

    const usoMemoriaPorProcesso = {};
    
    dadosBrutos.forEach((item, index) => {
        const nomeColuna = colunasExistentes.find(col => col.includes('NOME'));
        const memoriaColuna = colunasExistentes.find(col => col.includes('MEMORIA') || col.includes('USO'));
        
        const nome = item[nomeColuna] ? String(item[nomeColuna]).trim() : `Processo_${index}`;
        const usoMemoria = parseFloat(item[memoriaColuna]) || 0;

        console.log(`Processo ${index}: ${nome} - ${usoMemoria} MB`);

        if (!usoMemoriaPorProcesso[nome] || usoMemoria > usoMemoriaPorProcesso[nome]) {
            usoMemoriaPorProcesso[nome] = usoMemoria;
        }
    });

    // Pega somente os 5 maiores
    const processosOrdenados = Object.entries(usoMemoriaPorProcesso)
        .sort(([, usoA], [, usoB]) => usoB - usoA)
        .slice(0, 5);

    const labelsMemoria = processosOrdenados.map(([nome]) => nome);
    const memoriaMB = processosOrdenados.map(([, uso]) => uso);

    console.log(`Top processos por memória:`, processosOrdenados);

    const contagemPorHora = {};
    let totalProcessos = 0;

    if (temTimestamp) {
        const timestampColuna = colunasExistentes.find(col => col.includes('TIMESTAMP') || col.includes('DATA'));
        
        dadosBrutos.forEach(item => {
            const timestamp = item[timestampColuna];
            if (timestamp) {
                const hora = String(timestamp).split(':')[0] + ':00';
                contagemPorHora[hora] = (contagemPorHora[hora] || 0) + 1;
                totalProcessos++;
            }
        });
    }

    const horarios = Object.keys(contagemPorHora).sort();
    const processos24h = horarios.map(hora => contagemPorHora[hora]);

    const maximoProcessos = processos24h.length > 0 ? Math.max(...processos24h) : totalProcessos;
    const mediaProcessos = processos24h.length > 0 
        ? Math.round(processos24h.reduce((a, b) => a + b, 0) / processos24h.length)
        : totalProcessos;
    const processoMaisFrequente = labelsMemoria[0] || 'N/A';

    console.log('Dados transformados:', {
        labelsMemoria,
        memoriaMB,
        horarios,
        processos24h,
        maximoProcessos,
        mediaProcessos,
        processoMaisFrequente
    });

    return {
        labelsMemoria,
        memoriaMB,
        horarios,
        processos24h,
        maximoProcessos,
        mediaProcessos,
        processoMaisFrequente
    };
}

async function lerArquivo() {
  try {
    console.log('Iniciando leitura do S3...');
    
    const bucketName = process.env.S3_BUCKET;
    console.log('Bucket:', bucketName);

    const listParams = { Bucket: bucketName, MaxKeys: 100 };
    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        throw new Error('Nenhum arquivo encontrado no S3 Bucket.');
    }
    
    const sortedObjects = listedObjects.Contents.sort((a, b) => 
        new Date(b.LastModified) - new Date(a.LastModified)
    );
    
    const targetFile = sortedObjects.find(obj => !obj.Key.endsWith('/'));
    
    if (!targetFile) {
        throw new Error('Nenhum arquivo válido encontrado no S3 Bucket.');
    }
    
    const fileKey = targetFile.Key;
    console.log(`[S3 DEBUG] Arquivo encontrado: ${fileKey}`);

    const getParams = { Bucket: bucketName, Key: fileKey };
    const data = await s3.getObject(getParams).promise();
    const text = data.Body.toString('utf-8').trim();

    console.log('Conteúdo bruto do arquivo:');
    console.log(text.substring(0, 500));

    let dadosBrutos = [];
    
    try {
        const parsed = Papa.parse(text, {
            header: true,
            delimiter: ';', 
            skipEmptyLines: true,
            transformHeader: (header) => {
                return header.trim().toUpperCase();
            },
            transform: (value) => {
                return typeof value === 'string' ? value.trim() : value;
            }
        });

        console.log('Resultado do parsing:');
        console.log('Headers:', parsed.meta.fields);
        console.log('Número de linhas:', parsed.data.length);
        console.log('Primeiras 3 linhas:', parsed.data.slice(0, 3));

        dadosBrutos = parsed.data.filter(row => {
            return row && 
                   Object.values(row).some(val => val !== '' && val !== undefined) &&
                   row.NOME;
        });

        console.log(`${dadosBrutos.length} linhas válidas após filtro`);

        if (parsed.errors.length > 0) {
            console.warn('Erros no parse do CSV:', parsed.errors);
        }

    } catch (parseError) {
        console.error('Erro no parsing do CSV:', parseError);
        
        // Fallback: tentar ler como JSON
        try {
            console.log('Tentando fallback para JSON...');
            dadosBrutos = JSON.parse(text);
            console.log('Fallback JSON bem-sucedido');
        } catch (jsonError) {
            console.error('Fallback JSON também falhou:', jsonError);
            throw new Error('Formato de arquivo não suportado (nem CSV válido nem JSON)');
        }
    }

    if (!dadosBrutos || dadosBrutos.length === 0) {
        console.warn('AVISO: Nenhum dado válido encontrado no arquivo');
        console.log('Estrutura esperada:');
        console.log('id;servidor;timestamp;NOME;USO_MEMORIA (MB)');
    }

    const dadosTransformados = transformarDadosParaDashboard(dadosBrutos);
    console.log('Dados finais para front-end:', dadosTransformados);
    
    return dadosTransformados;

  } catch (err) {
    console.error('❌ Erro detalhado no S3:', err);
    throw err;
  }
}

module.exports = {
  lerArquivo
};
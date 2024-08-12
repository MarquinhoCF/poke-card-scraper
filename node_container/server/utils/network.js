const receivedChunks = {};


function processChunks(timestamp, data_chunk, chunk_index, total_chunks) {
    return new Promise((resolve, reject) => {
        try {
            // Verifica se já existe um array para o timestamp atual
            if (!receivedChunks[timestamp]) {
                receivedChunks[timestamp] = [];
            }
        
            // Armazena o chunk na posição correta
            receivedChunks[timestamp][chunk_index] = JSON.parse(data_chunk);
        
            // Verifica se todos os chunks foram recebidos
            const allChunksReceived = receivedChunks[timestamp].filter(Boolean).length === total_chunks;
        
            if (allChunksReceived) {
                const completeData = receivedChunks[timestamp].flat();
                delete receivedChunks[timestamp]; // Remove os chunks armazenados após o processamento
                resolve(completeData);
            } else {
                resolve('Chunk recebido com sucesso');
            }

        } catch (error) {
            reject(`Erro ao processar chunk: ${error.message}`);
        }
    });
};

module.exports = processChunks;
const { updateHistory, saveData, saveSubmission } = require('../utils/fileUtils');
const processChunks = require('../utils/network');

exports.storeData = (req, res) => {
  const { timestamp, data_chunk, chunk_index, total_chunks } = req.body;

  processChunks(timestamp, data_chunk, chunk_index, total_chunks)
    .then(
      (completeData) => {
        updateHistory(completeData, timestamp);
        saveData(completeData, timestamp);
        return res.status(200).json({ message: 'Dados recebidos com sucesso' })
      }
    )
    .catch(
      (err) => res.status(500).json({ error: err.message })
    );
};

exports.notify = (req, res) => {
  const formData = req.body;
  saveSubmission(formData)
    .then(
      (msg) => res.status(200).json({ message: msg })
    ).catch(
      (err) => res.status(500).json({ error: err.message })
    );
};

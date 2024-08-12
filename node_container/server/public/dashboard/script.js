document.addEventListener('DOMContentLoaded', () => {
const productSelect = document.getElementById('productSelect');
const marketPriceChart = document.getElementById('marketPriceChart').getContext('2d');

// Função para carregar a lista de produtos
function loadProducts() {
    fetch('/api/products')
    .then(response => response.json())
    .then(products => {
        products.forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
        });
    });
}

// Função para converter o timestamp no formato 'YYYY-MM-DD_HH-MM-SS' em um objeto Date
function parseTimestamp(timestamp) {
    const [datePart, timePart] = timestamp.split('_');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split('-').map(Number);
    
    // Formatar como 'dia/mês: HH:MM:SS'
    const formattedDate = `${day}/${month}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return `${formattedDate}: ${formattedTime}`;
}

// Função para atualizar o gráfico com os dados do produto selecionado
function updateChart(productKey) {
    if (productKey) {
    fetch(`/api/chartData/${encodeURIComponent(productKey)}`)
        .then(response => response.json())
        .then(chartData => {
        const labels = chartData.map(data => parseTimestamp(data.time));
        const prices = chartData.map(data => data.price);

        // Remove o gráfico existente, se houver
        if (marketPriceChart.chart) {
            marketPriceChart.chart.destroy();
        }

        // Criar um novo gráfico
        marketPriceChart.chart = new Chart(marketPriceChart, {
            type: 'line',
            data: {
            labels: labels,
            datasets: [{
                label: 'Market Price',
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            }]
            },
            options: {
            scales: {
                x: { 
                title: { display: true, text: 'Time' }
                },
                y: {
                title: { display: true, text: 'Price' }
                }
            }
            }
        });
        });
    }
}

// Carregar a lista de produtos TCG e configurar o evento de mudança
loadProducts();
productSelect.addEventListener('change', () => {
    const selectedProduct = productSelect.value;
    updateChart(selectedProduct);
});
});
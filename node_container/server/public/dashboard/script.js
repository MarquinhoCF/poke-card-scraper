document.getElementById('logo-link').addEventListener('click', function() {
    window.location.href = '/form';
});

document.getElementById('notification-link').addEventListener('click', function() {
    window.location.href = '/form';
});

document.getElementById('dashboard-link').addEventListener('click', function() {
    window.location.href = '/dashboard/';
});

document.addEventListener('DOMContentLoaded', () => {
    // Elemento do indicador de tempo de raspagem
    const scrapTimeIndicator = document.getElementById('scrapTimeIndicator');
    const scrapTimeText = document.getElementById('scrapTime');

    // Elemento do seletor de produtos
    const productSelect = document.getElementById('productSelect');

    // Elemento do gráfico de preços de mercado
    const marketPriceChart = document.getElementById('marketPriceChart').getContext('2d');

    // Elementos da seção de informações do produto
    const productInfo = document.getElementById('productInfo');
    const productDetails = document.getElementById('productDetails');
    const productTitle = document.getElementById('productTitle');
    const productSet = document.getElementById('productSet');
    const productRarity = document.getElementById('productRarity');
    const productNumber = document.getElementById('productNumber');
    const productPrice = document.getElementById('productPrice');
    const productLink = document.getElementById('productLink');
    const topListingTitle = document.getElementById('topListingTitle');
    const topListings = document.getElementById('topListings');

    // Função para carregar a lista de produtos
    function loadProductsAndTimestamp() {
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

        fetch('/api/data/lastTimestamp')
        .then(response => response.json())
        .then(data => {
            scrapTimeText.textContent = parseTimestamp2Indicator(data.timestamp);
        });
    }

    // Função para formatar o timestamp em partes de data e hora
    function formatDateTimeParts(timestamp) {
        const [datePart, timePart] = timestamp.split('_');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = timePart.split('-').map(Number);
    
        return { year, month, day, hours, minutes, seconds };
    }
    
    // Função para formatar o timestamp em uma string legível para o gráfico
    function parseTimestamp2Chart(timestamp) {
        const { day, month, hours, minutes } = formatDateTimeParts(timestamp);
        
        // Formatar como 'dia/mês: HH:MM:SS'
        const formattedDate = `${day}/${month}`;
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        return `${formattedDate}: ${formattedTime}`;
    }
    
    // Função para formatar o timestamp em uma string legível para o indicador de tempo
    function parseTimestamp2Indicator(timestamp) {
        const { year, month, day, hours, minutes } = formatDateTimeParts(timestamp);
        
        // Formatar como 'HH:MM de dia/mês/ano'
        return `${hours}:${minutes} de ${day}/${month}/${year}`;
    }

    // Função para atualizar o gráfico com os dados do produto selecionado
    function updateChart(productKey) {
        if (productKey) {
            fetch(`/api/chartData/${encodeURIComponent(productKey)}`)
            .then(response => response.json())
            .then(chartData => {
                const labels = chartData.map(data => parseTimestamp2Chart(data.time));
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
                            label: 'Preço de Mercado',
                            data: prices,
                            borderColor: 'rgba(20, 69, 107, 1)',
                            backgroundColor: 'rgba(20, 69, 107, 0.2)',
                            borderWidth: 2, // Espessura da linha
                        }]
                    },
                    options: {
                        scales: {
                            x: { 
                                title: {
                                    display: true, 
                                    text: 'Tempo',
                                    font: {
                                        size: 20, // Tamanho da fonte do título do eixo X
                                        family: 'Poppins, sans-serif', // Fonte
                                        weight: 'bold', // Peso da fonte
                                    },
                                    color: '#0A7090', // Cor do texto do eixo X
                                },
                                ticks: {
                                    font: {
                                        size: 16, // Tamanho da fonte dos rótulos do eixo X
                                    },
                                    color: '#000', // Cor dos rótulos do eixo X
                                },
                            },
                            y: {
                                title: {
                                    display: true, 
                                    text: 'Preço',
                                    font: {
                                        size: 20, // Tamanho da fonte do título do eixo Y
                                        family: 'Poppins, sans-serif', // Fonte
                                        weight: 'bold', // Peso da fonte
                                    },
                                    color: '#0A7090', // Cor do texto do eixo Y
                                },
                                ticks: {
                                    font: {
                                        size: 16, // Tamanho da fonte dos rótulos do eixo Y
                                    },
                                    color: '#000', // Cor dos rótulos do eixo Y
                                },
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 16, // Tamanho da fonte da legenda
                                    },
                                    color: '#14456B', // Cor da legenda
                                }
                            }
                        }
                    }
                });
            });
        }
    }

    // Função para atualizar os detalhes do produto
    function updateProductDetails(productKey) {
        if (productKey) {
            fetch(`/api/product/${encodeURIComponent(productKey)}`)
            .then(response => response.json())
            .then(product => {
                productTitle.textContent = product.title;
                productSet.innerHTML = `<strong>Coleção:</strong> ${product.set}`;

                let rarity = product.rarity;
                if (rarity)
                    productRarity.innerHTML = `<strong>Raridade:</strong> ${translateRarity(product.rarity)}`;
                else
                    productRarity.style.display = 'none';

                let number = product.number;
                if (number)
                    productNumber.innerHTML = `<strong>Número:</strong> ${product.number}`;
                else
                    productNumber.style.display = 'none';

                productPrice.innerHTML = `<strong>Preço de mercado:</strong> $${product.market_price}`;
                productLink.href = product.product_url;
                
                if (product.top_listings.length === 0) {
                    topListingTitle.textContent = 'Produto fora de estoque';
                    topListingTitle.className = 'out-of-stock';
                } else {
                    topListingTitle.textContent = 'Vendedores disponíveis:';
                    topListingTitle.className = 'available-sellers';
                }

                // Atualizar as listagens
                topListings.innerHTML = '';
                product.top_listings.forEach(listing => {
                    const listingDiv = document.createElement('div');
                    listingDiv.className = 'listing';
                    listingDiv.innerHTML = `
                        <h4>${listing.seller}</h4>
                        <p><strong>Condição:</strong> ${translateCondition(listing.condition)}</p>
                        <p><strong>Preço:</strong> $${listing.price}</p>
                        <p><strong>Frete (US):</strong> $${listing.shipping}</p>
                    `;
                    topListings.appendChild(listingDiv);
                });
    
                // Mostrar a seção de informações do produto
                productInfo.style.display = 'flex';
                productDetails.style.display = 'block';
            });
        } else {
            productInfo.style.display = 'none'; // Esconder a seção de informações do produto se nenhum produto estiver selecionado
        }
    }

    function translateRarity(rarity) {
        switch (rarity) {
            case 'Common':
                return 'Comum';
            case 'Uncommon':
                return 'Incomum';
            case 'Double Rare':
                return 'Duplo Raro';
            case 'Hyper Rare':
                return 'Hiper Raro';
            case 'Ultra Rare':
                return 'Ultra Raro';
            case 'Secret Rare':
                return 'Secreto Raro';
            case 'Holo Rare':
                return 'Holo Raro';
            case 'Illustration Rare':
                return 'Ilustração Rara';
            case 'Special Illustration Rare':
                return 'Ilustração Especial Rara';
            case 'Rare BREAK':
                return 'Raro BREAK';
            case 'Code Card':
                return 'Carta de Código';
            default:
                return rarity; // Retorna a raridade original se não for encontrada uma correspondência
        }
    }
    
    function translateCondition(condition) {
        switch (condition) {
            case 'Near Mint':
                return 'Quase Novo';
            case 'Near Mint Holofoil':
                return 'Holofoil Quase Novo';
            case 'Near Mint Reverse Holofoil':
                return 'Holofoil Reverso Quase Novo';
            case 'Lightly Played':
                return 'Levemente Usado';
            case 'Lightly Played Holofoil':
                return 'Holofoil Levemente Usado';
            case 'Lightly Played Reverse Holofoil':
                return 'Holofoil Reverso Levemente Usado';
            case 'Moderately Played':
                return 'Moderadamente Usado';
            case 'Moderately Played Holofoil':
                return 'Holofoil Moderadamente Usado';
            case 'Moderately Played Reverse Holofoil':
                return 'Holofoil Reverso Moderadamente Usado';
            case 'Heavily Played':
                return 'Bastante Usado';
            case 'Heavily Played Holofoil':
                return 'Holofoil Bastante Usado';
            case 'Heavily Played Reverse Holofoil':
                return 'Holofoil Reverso Bastante Usado';
            case 'Damaged':
                return 'Danificado';
            case 'Damaged Holofoil':
                return 'Holofoil Danificado';
            case 'Damaged Reverse Holofoil':
                return 'Holofoil Reverso Danificado';
            default:
                return condition; // Retorna a condição original se não for encontrada uma correspondência
        }
    }

    // Carregar a lista de produtos TCG, timestamp e configurar o evento de mudança
    loadProductsAndTimestamp();
    productSelect.addEventListener('change', () => {
        scrapTimeIndicator.style.display = 'none';
        const selectedProduct = productSelect.value;
        updateChart(selectedProduct);
        updateProductDetails(selectedProduct);
    });
});

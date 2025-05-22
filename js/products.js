/**
 * Products Page JavaScript
 * Gestisce il caricamento e la visualizzazione dei prodotti nella pagina products.html
 */

// Variabile per memorizzare l'ultimo timestamp di aggiornamento controllato
let lastCheckedUpdate = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza la pagina dei prodotti
    initProductsPage();
    
    // Aggiungi un listener per il localStorage per rilevare cambiamenti nei prodotti (funziona tra schede diverse)
    window.addEventListener('storage', function(e) {
        if (e.key === 'products' || e.key === 'productsUpdated') {
            // Ricarica i prodotti quando cambia il localStorage
            loadProductsFromStorage();
        }
    });
    
    // Controlla periodicamente se ci sono stati aggiornamenti ai prodotti (funziona nella stessa scheda)
    setInterval(checkForProductUpdates, 1000); // Controlla ogni secondo
});

/**
 * Inizializza la pagina dei prodotti
 */
function initProductsPage() {
    // Carica i prodotti dal localStorage
    loadProductsFromStorage();
    
    // Imposta i filtri e l'ordinamento
    setupFilters();
    
    // Memorizza il timestamp corrente come ultimo controllato
    lastCheckedUpdate = localStorage.getItem('productsUpdated') || 0;
}

/**
 * Controlla se ci sono stati aggiornamenti ai prodotti
 */
function checkForProductUpdates() {
    const currentUpdate = localStorage.getItem('productsUpdated') || 0;
    
    // Se il timestamp di aggiornamento è cambiato, ricarica i prodotti
    if (currentUpdate > lastCheckedUpdate) {
        loadProductsFromStorage();
        lastCheckedUpdate = currentUpdate;
        console.log('Prodotti aggiornati');
    }
}

/**
 * Carica i prodotti dal localStorage
 */
function loadProductsFromStorage() {
    // Ottieni i prodotti dal localStorage o usa i prodotti di default
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Ottieni il contenitore dei prodotti
    const productsGrid = document.querySelector('.grid');
    
    // Se non ci sono prodotti o non c'è il contenitore, esci
    if (!productsGrid || products.length === 0) {
        console.warn('Nessun prodotto trovato o contenitore non disponibile');
        return;
    }
    
    // Svuota il contenitore dei prodotti (rimuovi i prodotti statici)
    productsGrid.innerHTML = '';
    
    // Aggiungi i prodotti al contenitore
    products.forEach(product => {
        // Mostra solo i prodotti attivi
        if (product.status !== 'active') return;
        
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

/**
 * Crea una card per un prodotto
 * @param {Object} product - Oggetto prodotto
 * @returns {HTMLElement} - Elemento HTML della card
 */
function createProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card bg-black bg-opacity-70 rounded-lg overflow-hidden transition-all duration-300';
    
    // Determina se il prodotto è nuovo (aggiunto negli ultimi 7 giorni)
    const isNew = product.id > 2; // Per semplicità consideriamo nuovi i prodotti con ID > 2
    
    productCard.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            ${isNew ? `
                <div class="absolute top-0 right-0 m-2 bg-green-900 text-white px-2 py-1 text-xs rounded">
                    NEW
                </div>
            ` : ''}
            <div class="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button class="quick-view-btn bg-black bg-opacity-75 text-white px-3 py-2 rounded text-sm hover:bg-green-900 transition" 
                    data-id="${product.id}" 
                    data-name="${product.name}" 
                    data-price="${product.price}" 
                    data-img="${product.image}" 
                    data-desc="${product.description}">
                    <i class="fas fa-eye mr-1"></i> QUICK VIEW
                </button>
            </div>
        </div>
        <div class="p-4">
            <h3 class="font-bold text-lg mb-1">${product.name}</h3>
            <p class="text-gray-400 text-sm mb-3">${product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}</p>
            <div class="flex items-center justify-between">
                <div class="text-green-400 font-bold">${product.price} BTC</div>
                <div class="flex space-x-2">
                    <a href="product-detail.html?id=${product.id}" class="text-gray-400 hover:text-green-400 transition">
                        <i class="fas fa-info-circle"></i>
                    </a>
                    <button class="add-to-cart bg-green-900 hover:bg-green-800 text-white px-3 py-1 rounded text-sm transition" 
                        data-id="${product.id}" 
                        data-name="${product.name}" 
                        data-price="${product.price}" 
                        data-img="${product.image}">
                        <i class="fas fa-cart-plus mr-1"></i> ADD
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return productCard;
}

/**
 * Imposta i filtri e l'ordinamento
 */
function setupFilters() {
    const filterSelects = document.querySelectorAll('select');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            // In una versione più complessa, qui implementeremmo il filtro effettivo
            // Per ora ricarichiamo semplicemente tutti i prodotti
            loadProductsFromStorage();
        });
    });
}

/**
 * Ottieni i prodotti di default
 * @returns {Array} Array di prodotti di default
 */
function getDefaultProducts() {
    const defaultProducts = [
        {
            id: '1',
            name: 'Encrypted Comms Device',
            price: '0.05',
            image: 'https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+1',
            category: 'security',
            status: 'active',
            description: 'Military-grade encryption for secure communications.',
            featured: true,
            digital: false,
            requiresPgp: true
        },
        {
            id: '2',
            name: 'Anonymous VPN',
            price: '0.02',
            image: 'https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+2',
            category: 'software',
            status: 'active',
            description: 'No-log VPN with TOR integration. Masks your IP and encrypts all traffic with military-grade encryption.',
            featured: true,
            digital: true,
            requiresPgp: false
        }
    ];
    
    // Salva i prodotti di default nel localStorage se non esistono già
    if (!localStorage.getItem('products')) {
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
    
    return defaultProducts;
}

/**
 * Homepage JavaScript
 * Gestisce il caricamento e la visualizzazione dei prodotti in evidenza nella homepage
 */

// Variabile per memorizzare l'ultimo timestamp di aggiornamento controllato
let lastCheckedUpdate = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Inizializza la homepage
    initHomePage();
    
    // Aggiungi un listener per il localStorage per rilevare cambiamenti nei prodotti (funziona tra schede diverse)
    window.addEventListener('storage', function(e) {
        if (e.key === 'products' || e.key === 'productsUpdated') {
            // Ricarica i prodotti in evidenza quando cambia il localStorage
            loadFeaturedProducts();
        }
    });
    
    // Controlla periodicamente se ci sono stati aggiornamenti ai prodotti (funziona nella stessa scheda)
    setInterval(checkForProductUpdates, 1000); // Controlla ogni secondo
});

/**
 * Inizializza la homepage
 */
function initHomePage() {
    // Carica i prodotti in evidenza
    loadFeaturedProducts();
    
    // Gestisce i bottoni di navigazione per i prodotti in evidenza
    setupFeaturedNavigation();
    
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
        loadFeaturedProducts();
        lastCheckedUpdate = currentUpdate;
        console.log('Prodotti in evidenza aggiornati');
    }
}

/**
 * Carica i prodotti in evidenza dal localStorage
 */
function loadFeaturedProducts() {
    // Ottieni i prodotti dal localStorage o usa i prodotti di default
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Filtra solo i prodotti in evidenza e attivi
    const featuredProducts = products.filter(product => product.featured && product.status === 'active');
    
    // Ottieni il contenitore dei prodotti in evidenza
    const featuredContainer = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4.gap-6');
    
    // Se non ci sono prodotti o non c'è il contenitore, esci
    if (!featuredContainer) {
        console.warn('Contenitore prodotti in evidenza non trovato');
        return;
    }
    
    // Svuota il contenitore dei prodotti (rimuovi i prodotti statici)
    featuredContainer.innerHTML = '';
    
    // Se non ci sono prodotti in evidenza, mostra un messaggio
    if (featuredProducts.length === 0) {
        featuredContainer.innerHTML = `
            <div class="col-span-4 text-center py-8">
                <p class="text-gray-400">Nessun prodotto in evidenza disponibile</p>
            </div>
        `;
        return;
    }
    
    // Aggiungi i prodotti in evidenza al contenitore
    featuredProducts.forEach(product => {
        const productCard = createFeaturedProductCard(product);
        featuredContainer.appendChild(productCard);
    });
}

/**
 * Crea una card per un prodotto in evidenza
 * @param {Object} product - Oggetto prodotto
 * @returns {HTMLElement} - Elemento HTML della card
 */
function createFeaturedProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card bg-black bg-opacity-70 rounded-lg overflow-hidden transition-all duration-300';
    
    // Determina l'etichetta del prodotto (NEW, HOT, LIMITED)
    let badge = 'NEW';
    if (product.id === '2') badge = 'HOT';
    else if (product.id === '3') badge = 'LIMITED';
    
    productCard.innerHTML = `
        <div class="relative">
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="absolute top-2 right-2 bg-black bg-opacity-70 text-green-400 px-2 py-1 rounded text-sm">${badge}</div>
            <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300 quick-view">
                <button class="quick-view-btn bg-green-900 hover:bg-green-800 text-white px-3 py-2 rounded" 
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
            <div class="flex justify-between items-center">
                <span class="text-green-400 font-bold">${product.price} BTC</span>
                <div class="flex space-x-2">
                    <a href="pages/product-detail.html?id=${product.id}" class="text-gray-400 hover:text-green-400 transition">
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
 * Configura la navigazione per i prodotti in evidenza
 */
function setupFeaturedNavigation() {
    const prevButton = document.getElementById('prev-featured');
    const nextButton = document.getElementById('next-featured');
    
    if (!prevButton || !nextButton) return;
    
    let currentIndex = 0;
    const featuredProducts = document.querySelectorAll('.product-card');
    const visibleItems = window.innerWidth < 768 ? 1 : (window.innerWidth < 1024 ? 2 : 4);
    
    // Funzione per aggiornare la visibilità
    const updateVisibility = () => {
        featuredProducts.forEach((product, index) => {
            if (index >= currentIndex && index < currentIndex + visibleItems) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    };
    
    // Inizializza la visibilità
    if (featuredProducts.length > visibleItems) {
        updateVisibility();
        
        // Gestisci i click dei pulsanti
        prevButton.addEventListener('click', () => {
            currentIndex = Math.max(0, currentIndex - 1);
            updateVisibility();
        });
        
        nextButton.addEventListener('click', () => {
            currentIndex = Math.min(featuredProducts.length - visibleItems, currentIndex + 1);
            updateVisibility();
        });
    }
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

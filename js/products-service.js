/**
 * Products Service
 * Servizio centralizzato per la gestione dei prodotti
 */

class ProductsService {
    constructor() {
        this.apiUrl = '/api';
        this.products = [];
        this.featuredProducts = [];
        this.isLoading = false;
        this.lastLoadTime = 0;
        
        // Inizializza il servizio caricando i prodotti
        this.init();
    }
    
    /**
     * Inizializza il servizio prodotti
     */
    async init() {
        // Carica i prodotti all'avvio
        await this.loadProducts();
        
        // Imposta un refresh periodico dei prodotti ogni 5 minuti
        setInterval(() => this.loadProducts(), 5 * 60 * 1000);
    }
    
    /**
     * Carica i prodotti dal server o da dati statici
     * In futuro questa funzione potrà essere collegata a un endpoint API
     */
    async loadProducts() {
        // Evita caricamenti simultanei
        if (this.isLoading) return;
        
        // Evita caricamenti troppo frequenti (non più di una volta ogni 30 secondi)
        const now = Date.now();
        if (now - this.lastLoadTime < 30000 && this.products.length > 0) {
            return;
        }
        
        this.isLoading = true;
        this.lastLoadTime = now;
        
        try {
            // In futuro, questo potrà essere sostituito con una chiamata API reale
            // const response = await fetch(`${this.apiUrl}/products`);
            // this.products = await response.json();
            
            // Per ora usiamo dati statici
            this.products = [
                {
                    id: '1',
                    name: 'Encrypted Comms Device',
                    description: 'Military-grade encryption for secure communications. This device ensures your conversations remain private in any environment.',
                    price: 0.05,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+1',
                    category: 'Security',
                    vendor: 'CryptoSecure',
                    featured: true,
                    tag: 'NEW'
                },
                {
                    id: '2',
                    name: 'Anonymous VPN',
                    description: 'No-log VPN with TOR integration. Masks your IP and encrypts all traffic with military-grade encryption.',
                    price: 0.02,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+2',
                    category: 'Privacy',
                    vendor: 'BlackNet Systems',
                    featured: true,
                    tag: 'HOT'
                },
                {
                    id: '3',
                    name: 'Digital Identity Pack',
                    description: 'Complete set for new anonymous identity. Includes digital documents and authentication methods.',
                    price: 0.12,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+3',
                    category: 'Identity',
                    vendor: 'Phantom Digital',
                    featured: true,
                    tag: 'LIMITED'
                },
                {
                    id: '4',
                    name: 'Surveillance Kit',
                    description: 'Complete counter-surveillance package. Includes bug detectors, camera detectors, and signal jammers.',
                    price: 0.08,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+4',
                    category: 'Security',
                    vendor: 'ShadowTech',
                    featured: true,
                    tag: 'SALE'
                },
                {
                    id: '5',
                    name: 'Secure Messenger',
                    description: 'End-to-end encrypted messaging platform with self-destructing messages and anonymous login.',
                    price: 0.01,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+5',
                    category: 'Communication',
                    vendor: 'CryptoSecure',
                    featured: false,
                    tag: ''
                },
                {
                    id: '6',
                    name: 'Hardware Wallet',
                    description: 'Cold storage wallet for cryptocurrencies with military-grade encryption and physical authentication.',
                    price: 0.03,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+6',
                    category: 'Finance',
                    vendor: 'ShadowTech',
                    featured: false,
                    tag: ''
                },
                {
                    id: '7',
                    name: 'Stealth Laptop',
                    description: 'Custom laptop with hardware kill switches, no webcam, pre-installed privacy tools, and encrypted storage.',
                    price: 0.15,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+7',
                    category: 'Hardware',
                    vendor: 'BlackNet Systems',
                    featured: false,
                    tag: 'PREMIUM'
                },
                {
                    id: '8',
                    name: 'Anonymizer Tool',
                    description: 'Software that anonymizes all your digital activities, including browsing, emails, and file transfers.',
                    price: 0.04,
                    image: 'https://via.placeholder.com/400x300/111111/00ff00?text=PRODUCT+8',
                    category: 'Software',
                    vendor: 'Phantom Digital',
                    featured: false,
                    tag: ''
                }
            ];
            
            // Filtra i prodotti in evidenza
            this.featuredProducts = this.products.filter(product => product.featured);
            
            // Aggiorna l'interfaccia utente con i nuovi prodotti
            this.updateProductsUI();
            
            console.log('Prodotti caricati con successo:', this.products.length);
        } catch (error) {
            console.error('Errore durante il caricamento dei prodotti:', error);
        } finally {
            this.isLoading = false;
        }
    }
    
    /**
     * Ottiene tutti i prodotti
     */
    getAllProducts() {
        return [...this.products]; // Restituisce una copia dell'array per evitare modifiche esterne
    }
    
    /**
     * Ottiene i prodotti in evidenza
     */
    getFeaturedProducts() {
        return [...this.featuredProducts]; // Restituisce una copia dell'array per evitare modifiche esterne
    }
    
    /**
     * Ottiene un prodotto specifico tramite ID
     */
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }
    
    /**
     * Ottiene prodotti per categoria
     */
    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }
    
    /**
     * Aggiorna l'interfaccia utente con i prodotti
     */
    updateProductsUI() {
        // Aggiorna i prodotti in evidenza nella home page
        this.updateFeaturedProducts();
        
        // Aggiorna la pagina dei prodotti se siamo in quella pagina
        if (window.location.pathname.includes('products.html')) {
            this.updateProductsPage();
        }
    }
    
    /**
     * Aggiorna la sezione dei prodotti in evidenza nella home page
     */
    updateFeaturedProducts() {
        const featuredContainer = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
        if (!featuredContainer) return;
        
        // Rimuovi tutti i prodotti esistenti tranne i controlli di navigazione
        const navigationControls = featuredContainer.parentElement.querySelector('.flex.justify-between.items-center');
        
        // Pulisci il contenitore
        featuredContainer.innerHTML = '';
        
        // Aggiungi i prodotti in evidenza
        this.featuredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            featuredContainer.appendChild(productCard);
        });
    }
    
    /**
     * Aggiorna la pagina dei prodotti
     */
    updateProductsPage() {
        const productsContainer = document.querySelector('#products-grid');
        if (!productsContainer) return;
        
        // Pulisci il contenitore
        productsContainer.innerHTML = '';
        
        // Aggiungi tutti i prodotti
        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    }
    
    /**
     * Crea un elemento card per un prodotto
     */
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card bg-black bg-opacity-70 rounded-lg overflow-hidden transition-all duration-300';
        
        card.innerHTML = `
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                ${product.tag ? `<div class="absolute top-2 right-2 bg-black bg-opacity-70 text-green-400 px-2 py-1 rounded text-sm">${product.tag}</div>` : ''}
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
                <p class="text-gray-400 text-sm mb-3">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>
                <div class="flex justify-between items-center">
                    <span class="text-green-400 font-bold">${product.price.toFixed(2)} BTC</span>
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
        
        return card;
    }
}

// Inizializza il servizio prodotti come variabile globale
window.productsService = new ProductsService();

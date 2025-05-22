/**
 * Matrix Background Animation
 * Renders a Matrix-style background animation on a canvas element
 */
function initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const symbols = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    
    const alphabet = katakana + latin + nums + symbols;
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    const rainDrops = [];
    
    for (let x = 0; x < columns; x++) {
        rainDrops[x] = 1;
    }
    
    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    };
    
    setInterval(draw, 30);
    
    // Window resize handler for matrix background
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

/**
 * Loading Screen Animation
 * Displays a loading screen with percentage counter only for initial visits
 * and not when navigating between pages
 */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const app = document.getElementById('app');

    // Controlla se l'utente sta navigando internamente o se ha già visto la schermata in questa sessione
    const isInternalNavigation = document.referrer.includes(window.location.hostname);
    const hasSeenLoadingScreen = sessionStorage.getItem('hasVisitedBefore');
    
    // Se è una navigazione interna o l'utente ha già visto la schermata, nascondi il caricamento
    if (isInternalNavigation || hasSeenLoadingScreen) {
        loadingScreen.style.display = 'none';
        app.classList.remove('hidden');
        return; // Esci dalla funzione, non mostrare il caricamento
    }
    
    // Altrimenti mostra la schermata di caricamento (solo per la prima visita nella sessione)
    loadingScreen.style.display = 'flex';
    app.classList.add('hidden');
    
    // Imposta il flag per indicare che l'utente ha visto la schermata di caricamento
    sessionStorage.setItem('hasVisitedBefore', 'true');
    
    // Procedere con l'animazione del caricamento
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 1;
        document.getElementById('loading-percentage').textContent = progress;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                app.classList.remove('hidden');
            }, 500);
        }
    }, 50);
}

/**
 * Shopping Cart Class
 * Manages the shopping cart functionality including adding/removing items and updating the UI
 */
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
        
        // Create cart notification popup element
        this.createNotificationPopup();
    }
    
    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add to cart buttons - use event delegation for better performance
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = parseFloat(button.getAttribute('data-price'));
                const img = button.getAttribute('data-img');
                
                // Get quantity if it exists
                let quantity = 1;
                const quantityInput = document.querySelector('.quantity-input');
                if (quantityInput) {
                    quantity = parseInt(quantityInput.value) || 1;
                }
                
                // Check if item already in cart
                const existingItem = this.items.find(item => item.id === id);
                
                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    this.items.push({
                        id,
                        name,
                        price,
                        img,
                        quantity
                    });
                }
                
                try {
                    // Save to localStorage
                    this.saveCart();
                } catch (error) {
                    console.error('Error saving cart to localStorage:', error);
                }
                
                // Show user feedback
                this.showAddToCartFeedback(button);
                
                this.updateCartUI();
                
                // Show add to cart notification instead of opening the cart
                this.showAddedToCartNotification(name, price, quantity, img);
                
                // Animation feedback
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check mr-1"></i> ADDED';
                button.classList.remove('bg-green-900');
                button.classList.add('bg-green-700');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('bg-green-700');
                    button.classList.add('bg-green-900');
                }, 1000);
            }
        });
        
        // Cart toggle
        const cartBtn = document.getElementById('cart-btn');
        const cartSidebar = document.getElementById('cart-sidebar');
        const closeCart = document.getElementById('close-cart');
        const continueShopping = document.getElementById('continue-shopping');
        
        if (cartBtn && cartSidebar) {
            cartBtn.addEventListener('click', () => {
                cartSidebar.style.transform = 'translateX(0)';
            });
        }
        
        if (closeCart && cartSidebar) {
            closeCart.addEventListener('click', () => {
                cartSidebar.style.transform = 'translateX(100%)';
            });
        }
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                
                window.location.href = 'pages/checkout.html';
            });
        }
        
        // Continue shopping button
        if (continueShopping && cartSidebar) {
            continueShopping.addEventListener('click', () => {
                cartSidebar.style.transform = 'translateX(100%)';
            });
        }
        
        // Remove from cart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-item-remove') || e.target.closest('.cart-item-remove')) {
                const button = e.target.classList.contains('cart-item-remove') ? e.target : e.target.closest('.cart-item-remove');
                const id = button.getAttribute('data-id');
                
                this.items = this.items.filter(item => item.id !== id);
                this.saveCart();
                this.updateCartUI();
            }
        });
        
        // Quantity buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-up') || e.target.closest('.quantity-up')) {
                const button = e.target.classList.contains('quantity-up') ? e.target : e.target.closest('.quantity-up');
                const id = button.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
                
                if (item) {
                    item.quantity += 1;
                    this.saveCart();
                    this.updateCartUI();
                }
            }
            
            if (e.target.classList.contains('quantity-down') || e.target.closest('.quantity-down')) {
                const button = e.target.classList.contains('quantity-down') ? e.target : e.target.closest('.quantity-down');
                const id = button.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
                
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    this.saveCart();
                    this.updateCartUI();
                }
            }
        });
    }
    
    updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartCount = document.getElementById('cart-count');
        const cartSubtotal = document.getElementById('cart-subtotal');
        const cartShipping = document.getElementById('cart-shipping');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItemsContainer) return;
        
        // Update count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        
        // Update items list
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shopping-basket text-4xl mb-3"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = '';
            
            this.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item flex justify-between items-center border-b border-green-900 pb-4 mb-4';
                itemElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.img || 'https://via.placeholder.com/50x50/111111/00ff00'}" alt="${item.name}" class="w-12 h-12 object-cover rounded mr-3">
                        <div>
                            <h3 class="font-medium">${item.name}</h3>
                            <p class="text-sm text-gray-400">${item.price.toFixed(2)} BTC</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class="quantity-down px-2 text-gray-400 hover:text-green-400" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-up px-2 text-gray-400 hover:text-green-400" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="cart-item-remove ml-4 text-red-500 hover:text-red-400" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        
        // Update totals
        const subtotal = this.getTotalPrice();
        const shipping = subtotal > 0 ? 0.005 : 0; // Flat shipping fee
        const total = subtotal + shipping;
        
        if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2) + ' BTC';
        if (cartShipping) cartShipping.textContent = shipping.toFixed(2) + ' BTC';
        if (cartTotal) cartTotal.textContent = total.toFixed(2) + ' BTC';
    }
    
    /**
     * Save cart to localStorage
     */
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }
    
    /**
     * Show visual feedback when an item is added to cart
     * @param {HTMLElement} button - The button that was clicked
     */
    showAddToCartFeedback(button) {
        try {
            // Add a visual pulse animation to the cart icon
            const cartIcon = document.getElementById('cart-btn');
            if (cartIcon) {
                cartIcon.classList.add('pulse-animation');
                setTimeout(() => {
                    cartIcon.classList.remove('pulse-animation');
                }, 700);
            }
        } catch (error) {
            console.error('Error showing add to cart feedback:', error);
        }
    }

    /**
     * Create the notification popup element that will be shown when items are added to cart
     */
    createNotificationPopup() {
        // Check if notification element already exists
        if (document.getElementById('cart-notification-popup')) return;

        // Create popup element
        const popup = document.createElement('div');
        popup.id = 'cart-notification-popup';
        popup.className = 'fixed top-20 right-4 bg-black border border-green-900 rounded-lg shadow-lg p-4 z-50 transform transition-all duration-300 translate-x-full opacity-0';
        popup.style.maxWidth = '320px';

        // Add HTML structure
        popup.innerHTML = `
            <div class="flex items-start">
                <div id="cart-popup-img" class="w-16 h-16 bg-gray-900 rounded flex-shrink-0 mr-3 overflow-hidden">
                    <img id="popup-product-img" class="w-full h-full object-cover" src="" alt="Product">
                </div>
                <div class="flex-grow">
                    <h3 id="popup-product-name" class="font-bold text-green-400"></h3>
                    <div class="flex justify-between mt-1">
                        <p class="text-sm">Price: <span id="popup-product-price" class="text-green-400"></span></p>
                        <p class="text-sm">Qty: <span id="popup-product-qty" class="text-green-400"></span></p>
                    </div>
                    <p class="mt-2 text-green-400 font-bold">Added to cart!</p>
                </div>
            </div>
        `;

        // Add to document
        document.body.appendChild(popup);
    }

    /**
     * Show a notification when an item is added to the cart
     * @param {string} name - Product name
     * @param {number} price - Product price
     * @param {number} quantity - Quantity added
     * @param {string} img - Product image URL
     */
    showAddedToCartNotification(name, price, quantity, img) {
        const popup = document.getElementById('cart-notification-popup');
        if (!popup) return;

        // Update content
        document.getElementById('popup-product-name').textContent = name;
        document.getElementById('popup-product-price').textContent = `${price} BTC`;
        document.getElementById('popup-product-qty').textContent = quantity;

        // Update image if available
        const imgElement = document.getElementById('popup-product-img');
        if (imgElement && img) {
            imgElement.src = img;
        }

        // Show popup
        popup.classList.remove('translate-x-full', 'opacity-0');

        // Hide after 2 seconds
        setTimeout(() => {
            popup.classList.add('translate-x-full', 'opacity-0');
        }, 2000);
    }
    
    /**
     * Get the total price of all items in the cart
     * @returns {number} - Total price
     */
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getItems() {
        return this.items;
    }
    
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }
}

// Auth Modal Controllers
class AuthModals {
    constructor() {
        this.apiUrl = '/api'; // URL relativo per funzionare in produzione
        this.currentUser = null;
        
        // Verifica lo stato di login all'avvio (prima di init)
        this.checkLoginStatus();
        
        // Inizializza l'interfaccia utente dopo aver verificato lo stato di login
        this.init();
    }
    
    init() {
        // Get references to DOM elements
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const accountLink = document.getElementById('account-link');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginError = document.getElementById('login-error');
        const registerError = document.getElementById('register-error');
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        const closeModalButtons = document.querySelectorAll('.close-modal');
        
        // Carica gli utenti dal server all'avvio
        this.loadUsers();
        
        // Check if user is logged in and update UI accordingly
        this.updateAuthUI();

        // Event listeners for opening modals
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                loginModal.classList.remove('hidden');
            });
        }

        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', () => {
                registerModal.classList.remove('hidden');
            });
        }

        if (accountLink) {
            accountLink.addEventListener('click', () => {
                // Show account dropdown menu
                const accountDropdown = document.getElementById('account-dropdown');
                if (accountDropdown) {
                    accountDropdown.classList.toggle('hidden');
                }
            });
        }

        // Event listeners for closing modals
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Prepare error containers if they don't exist
        if (loginForm && !document.getElementById('login-error')) {
            const errorContainer = document.createElement('div');
            errorContainer.id = 'login-error';
            errorContainer.className = 'bg-red-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 hidden';
            loginForm.prepend(errorContainer);
        }
        
        if (registerForm && !document.getElementById('register-error')) {
            const errorContainer = document.createElement('div');
            errorContainer.id = 'register-error';
            errorContainer.className = 'bg-red-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 hidden';
            registerForm.prepend(errorContainer);
        }
        
        // Login button
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', () => {
                loginModal.classList.remove('hidden');
            });
        }
        
        // Close login modal
        if (closeLogin && loginModal) {
            closeLogin.addEventListener('click', () => {
                loginModal.classList.add('hidden');
            });
        }
        
        // Register button
        if (registerBtn && registerModal) {
            registerBtn.addEventListener('click', () => {
                registerModal.classList.remove('hidden');
            });
        }
        
        // Close register modal
        if (closeRegister && registerModal) {
            closeRegister.addEventListener('click', () => {
                registerModal.classList.add('hidden');
            });
        }
        
        // Switch to register from login
        if (switchToRegister && loginModal && registerModal) {
            switchToRegister.addEventListener('click', () => {
                loginModal.classList.add('hidden');
                registerModal.classList.remove('hidden');
            });
        }
        
        // Switch to login from register
        if (switchToLogin && registerModal && loginModal) {
            switchToLogin.addEventListener('click', () => {
                registerModal.classList.add('hidden');
                loginModal.classList.remove('hidden');
            });
        }
        
        // Login form submission
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }
        
        // Register form submission
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e);
            });
        }
    }
    
    // Carica gli utenti dal server
    async loadUsers() {
        try {
            const response = await fetch(`${this.apiUrl}/users`);
            if (!response.ok) {
                throw new Error('Errore nel caricamento degli utenti');
            }
            const users = await response.json();
            // Memorizza gli utenti in localStorage per accesso rapido
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            console.log('Utenti caricati dal server:', users.length);
            return users;
        } catch (error) {
            console.error('Errore nel caricamento degli utenti:', error);
            // In caso di errore, usa la cache locale se disponibile
            const cachedUsers = localStorage.getItem('registeredUsers');
            return cachedUsers ? JSON.parse(cachedUsers) : [];
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const usernameField = document.getElementById('login-username');
        const passwordField = document.getElementById('login-password');
        const loginModal = document.getElementById('login-modal');
        const errorContainer = document.getElementById('login-error');

        // Clear any previous error messages
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.classList.add('hidden');
        }

        if (!usernameField || !passwordField) return;

        const username = usernameField.value.trim();
        const password = passwordField.value.trim();

        if (!username || !password) {
            if (errorContainer) {
                errorContainer.textContent = 'Inserisci username e password';
                errorContainer.classList.remove('hidden');
            } else {
                alert('Inserisci username e password');
            }
            return;
        }

        try {
            // Chiamata API al server per la verifica dell'utente
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            // Converti la risposta in JSON
            const data = await response.json();
            
            // Se la risposta non è ok, mostra l'errore
            if (!response.ok) {
                this.showErrorMessage(errorContainer, data.error || 'Errore durante il login');
                return;
            }
            
            // Login riuscito, estrai i dati dell'utente
            const foundUser = data.user;
            
            // Check if this is the admin account
            const isAdmin = foundUser.email === 'giacomotronconi@icloud.com';

            // Aggiorna l'utente con informazioni di login
            foundUser.isLoggedIn = true;
            foundUser.isAdmin = isAdmin;
            foundUser.lastLogin = new Date().toLocaleDateString();
            foundUser.loginTime = new Date().toISOString();

            // Salva l'utente corrente sia nella classe che in localStorage
            this.currentUser = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(foundUser));

            // Show success message with admin notification if applicable
            const successMessage = document.createElement('div');
            successMessage.className = 'bg-green-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 text-center';

            if (isAdmin) {
                successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Benvenuto Amministratore!';
            } else {
                successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Login effettuato con successo!';
            }

            const formContainer = document.querySelector('#login-form');
            if (formContainer) {
                formContainer.prepend(successMessage);
            }

            // Update UI to show logged in state
            this.updateAuthUI();

            // Close modal after short delay
            setTimeout(() => {
                if (loginModal) loginModal.classList.add('hidden');
                // Remove success message
                if (successMessage) successMessage.remove();
                // Redirect to account page for admin users
                if (isAdmin) {
                    window.location.href = 'pages/account.html';
                } else {
                    // Refresh page for regular users
                    window.location.reload();
                }
            }, 1500);
        } catch (error) {
            console.error('Login error:', error);
            if (errorContainer) {
                errorContainer.textContent = 'Si è verificato un errore durante il login. Riprova.';
                errorContainer.classList.remove('hidden');
            } else {
                alert('Si è verificato un errore durante il login. Riprova.');
            }
        }
    }

    /**
     * Update the UI to reflect the current authentication state
     */
    /**
     * Verifica lo stato di login dell'utente all'avvio dell'applicazione
     * Questo garantisce che lo stato di login persista tra i ricaricamenti della pagina e tra sessioni diverse
     */
    checkLoginStatus() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
                
                // Verifica che l'utente sia effettivamente loggato
                if (this.currentUser && this.currentUser.isLoggedIn) {
                    console.log('Utente già loggato:', this.currentUser.username);
                    
                    // Verifica la data di login per la persistenza tra sessioni
                    const loginTime = new Date(this.currentUser.loginTime || 0);
                    const currentTime = new Date();
                    const daysPassed = (currentTime - loginTime) / (1000 * 60 * 60 * 24);
                    
                    // Imposta un periodo di validità del login (es. 30 giorni)
                    if (daysPassed > 30) {
                        console.log('Sessione scaduta, richiesto nuovo login');
                        localStorage.removeItem('currentUser');
                        this.currentUser = null;
                    } else {
                        // Aggiorna subito l'interfaccia
                        this.updateAuthUI();
                        
                        // Ricarica i dati freschi dal server per l'utente corrente (opzionale)
                        this.refreshUserData();
                    }
                } else {
                    console.log('Nessun utente loggato');
                    // Pulisci localStorage se c'è un utente non loggato
                    localStorage.removeItem('currentUser');
                    this.currentUser = null;
                }
            }
        } catch (error) {
            console.error('Errore nel controllo dello stato di login:', error);
            // In caso di errore, meglio ripulire
            localStorage.removeItem('currentUser');
            this.currentUser = null;
        }
    }
    
    /**
     * Aggiorna opzionalmente i dati dell'utente dal server
     * per assicurarsi che siano aggiornati
     */
    async refreshUserData() {
        // In una versione futura, potremmo aggiungere una chiamata al server
        // per verificare che l'utente sia ancora valido e aggiornare i suoi dati
    }
    
    updateAuthUI() {
        try {
            // Usa l'utente memorizzato nella classe se disponibile, altrimenti prendi da localStorage
            const user = this.currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            // Per il mobile menu
            const mobileLoginBtn = document.getElementById('mobile-login-btn');
            const mobileRegisterBtn = document.getElementById('mobile-register-btn');
            const mobileAccountLink = document.getElementById('mobile-account-link');
            
            // Per il menu desktop
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const accountLink = document.getElementById('account-link');
            const userMenuBtn = document.getElementById('user-menu-btn');
            
            if (user && user.isLoggedIn) {
                // User is logged in - nascondi login/register, mostra account
                if (loginBtn) loginBtn.classList.add('hidden');
                if (registerBtn) registerBtn.classList.add('hidden');
                if (accountLink) accountLink.classList.remove('hidden');
                if (userMenuBtn) userMenuBtn.classList.remove('hidden');
                
                // Gestisci anche i pulsanti mobile
                if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
                if (mobileRegisterBtn) mobileRegisterBtn.classList.add('hidden');
                if (mobileAccountLink) mobileAccountLink.classList.remove('hidden');
                
                // If there's a username display element, update it
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = user.username;
                }
                
                // Aggiorna il menu utente (se presente)
                this.updateUserMenu(user);
            } else {
                // User is not logged in - mostra login/register, nascondi account
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (registerBtn) registerBtn.classList.remove('hidden');
                if (accountLink) accountLink.classList.add('hidden');
                if (userMenuBtn) userMenuBtn.classList.add('hidden');
                
                // Gestisci anche i pulsanti mobile
                if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
                if (mobileRegisterBtn) mobileRegisterBtn.classList.remove('hidden');
                if (mobileAccountLink) mobileAccountLink.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error updating auth UI:', error);
        }
    }
    
    /**
     * Aggiorna il menu utente con le informazioni corrette
     * @param {Object} user - L'utente attualmente loggato
     */
    updateUserMenu(user) {
        if (!user) return;
        
        // Aggiorna il nome utente nel menu dropdown (se presente)
        const userMenuUsername = document.getElementById('user-menu-username');
        if (userMenuUsername) {
            userMenuUsername.textContent = user.username;
        }
        
        // Aggiorna il link all'account nel menu desktop
        const accountLink = document.getElementById('account-link');
        if (accountLink) {
            accountLink.href = 'pages/account.html';
            // Se siamo già nella cartella pages, aggiusta il percorso
            if (window.location.pathname.includes('/pages/')) {
                accountLink.href = 'account.html';
            }
        }
        
        // Aggiorna il link all'account nel menu mobile
        const mobileAccountLink = document.getElementById('mobile-account-link');
        if (mobileAccountLink) {
            mobileAccountLink.href = 'pages/account.html';
            // Se siamo già nella cartella pages, aggiusta il percorso
            if (window.location.pathname.includes('/pages/')) {
                mobileAccountLink.href = 'account.html';
            }
        }
    }
    
    // Funzione di login implementata sopra con il nuovo endpoint API
    
    async handleRegister(e) {
        e.preventDefault();
        const usernameField = document.getElementById('register-username');
        const emailField = document.getElementById('register-email');
        const passwordField = document.getElementById('register-password');
        const confirmPasswordField = document.getElementById('register-confirm-password');
        const termsCheckbox = document.getElementById('terms');
        const registerModal = document.getElementById('register-modal');
        const errorContainer = document.getElementById('register-error');
        
        // Clear any previous error messages
        if (errorContainer) {
            errorContainer.textContent = '';
            errorContainer.classList.add('hidden');
        }
        
        if (!usernameField || !emailField || !passwordField || !confirmPasswordField || !termsCheckbox) return;
        
        const username = usernameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();
        const termsAccepted = termsCheckbox.checked;
        
        // Basic validation
        if (!username) {
            this.showErrorMessage(errorContainer, 'Inserisci un nome utente');
            return;
        }
        
        if (!email || !this.isValidEmail(email)) {
            this.showErrorMessage(errorContainer, 'Inserisci un indirizzo email valido');
            return;
        }
        
        if (!password) {
            this.showErrorMessage(errorContainer, 'Inserisci una password');
            return;
        }
        
        if (password.length < 6) {
            this.showErrorMessage(errorContainer, 'La password deve essere di almeno 6 caratteri');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showErrorMessage(errorContainer, 'Le password non corrispondono');
            return;
        }
        
        if (!termsAccepted) {
            this.showErrorMessage(errorContainer, 'Devi accettare i termini e le condizioni');
            return;
        }
        
        try {
            // Create new user object
            const newUser = {
                username,
                email,
                password // In a real app, this would be hashed
            };
            
            // Invia i dati utente al server per la registrazione
            const response = await fetch(`${this.apiUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            
            // Verifica se ci sono errori nella risposta
            const data = await response.json();
            if (!response.ok) {
                this.showErrorMessage(errorContainer, data.error || 'Errore nella registrazione');
                return;
            }
            
            // Aggiunge proprietà per l'interfaccia utente
            newUser.isLoggedIn = true;
            newUser.isAdmin = email === 'giacomotronconi@icloud.com';
            newUser.lastLogin = new Date().toISOString();
            
            // Salva l'utente corrente sia nella classe che in localStorage
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Aggiorna la cache locale
            const registeredUsers = await this.loadUsers();
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            
            // Mostra messaggio di successo
            const successMessage = document.createElement('div');
            successMessage.className = 'bg-green-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 text-center';
            successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Registrazione completata con successo!';
            
            const formContainer = document.querySelector('#register-form');
            if (formContainer) {
                formContainer.prepend(successMessage);
            }
            
            // Aggiorna UI per mostrare lo stato di login
            this.updateAuthUI();
            
            // Chiudi modale dopo breve ritardo
            setTimeout(() => {
                if (registerModal) registerModal.classList.add('hidden');
                // Rimuovi messaggio di successo
                if (successMessage) successMessage.remove();
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            this.showErrorMessage(errorContainer, 'An error occurred during registration. Please try again.');
        }
    }
    
    showErrorMessage(container, message) {
        if (container) {
            container.textContent = message;
            container.classList.remove('hidden');
        } else {
            alert(message);
        }
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if email is valid
     */
    isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Search Functionality
class SearchOverlay {
    constructor() {
        this.init();
    }
    
    init() {
        const searchBtn = document.getElementById('search-btn');
        const searchOverlay = document.getElementById('search-overlay');
        const closeSearch = document.getElementById('close-search');
        const searchInput = document.getElementById('search-input');
        const searchForm = document.getElementById('search-form');
        
        if (searchBtn && searchOverlay) {
            searchBtn.addEventListener('click', () => {
                searchOverlay.classList.remove('hidden');
                if (searchInput) searchInput.focus();
            });
        }
        
        if (closeSearch && searchOverlay) {
            closeSearch.addEventListener('click', () => {
                searchOverlay.classList.add('hidden');
            });
        }
        
        if (searchOverlay) {
            searchOverlay.addEventListener('click', (e) => {
                if (e.target === searchOverlay) {
                    searchOverlay.classList.add('hidden');
                }
            });
        }
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchInput.value.trim();
                
                if (query) {
                    // Determine if we're on the homepage or in a subpage
                    const isHomePage = window.location.pathname === '/' || 
                                       window.location.pathname.endsWith('index.html');
                    
                    const productsUrl = isHomePage ? 'pages/products.html' : 'products.html';
                    window.location.href = `${productsUrl}?search=${encodeURIComponent(query)}`;
                }
            });
        }
        
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay && !searchOverlay.classList.contains('hidden')) {
                searchOverlay.classList.add('hidden');
            }
        });
    }
}

// Product Gallery
class ProductGallery {
    constructor(selector) {
        this.gallery = document.querySelector(selector);
        if (this.gallery) {
            this.images = this.gallery.querySelectorAll('.gallery-image');
            this.currentIndex = 0;
            this.init();
        }
    }
    
    init() {
        const prevBtn = this.gallery.querySelector('.gallery-nav.prev');
        const nextBtn = this.gallery.querySelector('.gallery-nav.next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevImage());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextImage());
        }
        
        // Show first image
        this.showImage(0);
        
        // URL parameter handling
        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const imageIndex = urlParams.get('image');
            if (imageIndex) {
                this.showImage(parseInt(imageIndex));
            }
        });
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }
    
    showImage(index) {
        this.images.forEach((img, i) => {
            img.classList.toggle('hidden', i !== index);
        });
        this.currentIndex = index;
    }
    
    nextImage() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.showImage(nextIndex);
    }
    
    prevImage() {
        const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.showImage(prevIndex);
    }
}

// Quick View Modal
class QuickViewModal {
    constructor() {
        this.modal = document.getElementById('quick-view-modal');
        if (this.modal) {
            this.init();
        }
    }

    init() {
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');
        const closeBtn = document.getElementById('close-quick-view');

        quickViewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const name = btn.getAttribute('data-name');
                const price = btn.getAttribute('data-price');
                const img = btn.getAttribute('data-img');
                const desc = btn.getAttribute('data-desc');

                this.openQuickView(id, name, price, img, desc);
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.modal.classList.add('hidden');
            });
        }

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.classList.add('hidden');
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.modal.classList.add('hidden');
            }
        });
    }
    
    openQuickView(id, name, price, img, desc) {
        const nameEl = this.modal.querySelector('#quick-view-name');
        const priceEl = this.modal.querySelector('#quick-view-price');
        const imgEl = this.modal.querySelector('#quick-view-img');
        const descEl = this.modal.querySelector('#quick-view-desc');
        const addToCartBtn = this.modal.querySelector('#quick-view-add-btn');
        const detailsLink = this.modal.querySelector('a[href="pages/product-detail.html"]');
        
        if (nameEl) nameEl.textContent = name;
        if (priceEl) priceEl.textContent = price + ' BTC';
        if (imgEl) imgEl.src = img;
        if (imgEl) imgEl.alt = name;
        if (descEl) descEl.textContent = desc;
        
        if (addToCartBtn) {
            // Remove any existing event listeners
            const newAddToCartBtn = addToCartBtn.cloneNode(true);
            if (addToCartBtn.parentNode) {
                addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
            }
            
            // Set data attributes
            newAddToCartBtn.setAttribute('data-id', id);
            newAddToCartBtn.setAttribute('data-name', name);
            newAddToCartBtn.setAttribute('data-price', price);
            newAddToCartBtn.setAttribute('data-img', img);
            
            // Add click event listener directly
            newAddToCartBtn.addEventListener('click', () => {
                const cart = new ShoppingCart();
                cart.items.push({
                    id,
                    name,
                    price: parseFloat(price),
                    img,
                    quantity: 1
                });
                
                cart.saveCart();
                cart.updateCartUI();
                this.showAddToCartFeedback(newAddToCartBtn);
            });
        }
        
        if (detailsLink) {
            detailsLink.href = 'pages/product-detail.html?id=' + id;
        }
        
        this.modal.classList.remove('hidden');
    }
    
    /**
     * Show visual feedback when an item is added to cart from the quick view modal
     * @param {HTMLElement} button - The button that was clicked
     */
    showAddToCartFeedback(button) {
        const originalText = button.innerHTML;
        const originalBg = button.style.backgroundColor;
        
        // Show success feedback
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.backgroundColor = '#10B981'; // Success green color
        
        // Restore original state after 1 second
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = originalBg;
        }, 1000);
    }
}

// Checkout Process
/**
 * Checkout Process Class
 * Manages the multi-step checkout process including validation and payment processing
 */
class CheckoutProcess {
    constructor() {
        this.currentStep = 1;
        this.init();
        this.formErrors = [];
    }
    
    /**
     * Initialize checkout process by setting up event listeners
     */
    init() {
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');
        
        nextButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Validate the current step before proceeding
                if (this.validateCurrentStep()) {
                    this.nextStep();
                } else {
                    this.showErrors();
                }
            });
        });
        
        prevButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevStep();
            });
        });
        
        // Initialize first step
        this.showStep(this.currentStep);
        
        // Handle payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        if (paymentMethods.length > 0) {
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    method.classList.add('selected');
                    
                    // Store selected payment method
                    const paymentMethodInput = document.getElementById('selected-payment-method');
                    if (paymentMethodInput) {
                        paymentMethodInput.value = method.getAttribute('data-method');
                    }
                });
            });
            
            // Select the first payment method by default
            if (paymentMethods[0] && !document.querySelector('.payment-method.selected')) {
                paymentMethods[0].click();
            }
        }
        
        // Set up input masking and validation
        this.setupFormValidation();
        
        // Complete order button
        const completeOrderBtn = document.getElementById('complete-order-btn');
        if (completeOrderBtn) {
            completeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Final validation before order completion
                if (this.validateCurrentStep()) {
                    // Show loading state
                    completeOrderBtn.disabled = true;
                    completeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    
                    // Simulate processing delay for realism
                    setTimeout(() => {
                        // Simulate order completion
                        this.showOrderConfirmation();
                        
                        // Clear cart
                        const cart = new ShoppingCart();
                        cart.clearCart();
                        
                        // Redirect to homepage
                        setTimeout(() => {
                            window.location.href = '../index.html';
                        }, 2000);
                    }, 1500);
                } else {
                    this.showErrors();
                }
            });
        }
    }
    
    /**
     * Display the specified step in the checkout process
     * @param {number} stepNumber - The step number to display
     */
    showStep(stepNumber) {
        // Clear any previous error messages
        this.clearErrors();
        
        // Update step indicators
        document.querySelectorAll('.checkout-step').forEach((step, index) => {
            if (index < stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Show appropriate content
        document.querySelectorAll('.checkout-content').forEach((content, index) => {
            content.classList.toggle('hidden', index + 1 !== stepNumber);
        });
        
        // Update current step
        this.currentStep = stepNumber;
        
        // Scroll to top of the step
        const activeContent = document.querySelector(`.checkout-content:not(.hidden)`);
        if (activeContent) {
            activeContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Move to the next step in the checkout process
     */
    nextStep() {
        if (this.currentStep < 4) {
            this.showStep(this.currentStep + 1);
        }
    }
    
    /**
     * Move to the previous step in the checkout process
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
    
    /**
     * Validate the current step's form inputs
     * @returns {boolean} - True if validation passes, false otherwise
     */
    validateCurrentStep() {
        this.formErrors = [];
        const stepContent = document.querySelector(`.checkout-content:not(.hidden)`);
        if (!stepContent) return true;
        
        // Different validation for each step
        switch(this.currentStep) {
            case 1: // Order Summary
                return true; // No validation needed for order summary
                
            case 2: // Shipping Information
                const requiredShippingFields = stepContent.querySelectorAll('input[required], select[required]');
                return this.validateRequiredFields(requiredShippingFields);
                
            case 3: // Payment
                const selectedMethod = document.querySelector('.payment-method.selected');
                if (!selectedMethod) {
                    this.formErrors.push('Please select a payment method');
                    return false;
                }
                return true;
                
            case 4: // Confirmation
                const termsCheckbox = document.getElementById('terms-checkbox');
                if (termsCheckbox && !termsCheckbox.checked) {
                    this.formErrors.push('You must agree to the terms and conditions');
                    return false;
                }
                return true;
                
            default:
                return true;
        }
    }
    
    /**
     * Setup form validation for inputs
     */
    setupFormValidation() {
        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (emailInput.value && !this.isValidEmail(emailInput.value)) {
                    emailInput.classList.add('border-red-500');
                    this.addErrorToField(emailInput, 'Please enter a valid email address');
                } else {
                    emailInput.classList.remove('border-red-500');
                    this.removeErrorFromField(emailInput);
                }
            });
        }
        
        // Zip code validation
        const zipInput = document.getElementById('zip');
        if (zipInput) {
            zipInput.addEventListener('input', () => {
                zipInput.value = zipInput.value.replace(/[^0-9]/g, '').substring(0, 5);
            });
        }
        
        // Handle encryption key validation
        const encryptionKeyInput = document.getElementById('encryption-key');
        if (encryptionKeyInput) {
            encryptionKeyInput.addEventListener('input', () => {
                const value = encryptionKeyInput.value;
                const isValid = value.length >= 16;
                const strengthIndicator = document.getElementById('key-strength');
                
                if (strengthIndicator) {
                    if (value.length === 0) {
                        strengthIndicator.textContent = 'No key provided';
                        strengthIndicator.className = 'text-gray-400 text-sm';
                    } else if (value.length < 12) {
                        strengthIndicator.textContent = 'Weak';
                        strengthIndicator.className = 'text-red-500 text-sm';
                    } else if (value.length < 16) {
                        strengthIndicator.textContent = 'Moderate';
                        strengthIndicator.className = 'text-yellow-500 text-sm';
                    } else {
                        strengthIndicator.textContent = 'Strong';
                        strengthIndicator.className = 'text-green-500 text-sm';
                    }
                }
            });
        }
    }
    
    /**
     * Validate required form fields
     * @param {NodeList} fields - List of required form fields
     * @returns {boolean} - True if all fields are valid
     */
    validateRequiredFields(fields) {
        let valid = true;
        
        fields.forEach(field => {
            if (!field.value.trim()) {
                valid = false;
                field.classList.add('border-red-500');
                
                // Get field label or placeholder for error message
                const fieldName = field.getAttribute('placeholder') || 
                                 field.getAttribute('name') || 
                                 'This field';
                                 
                this.formErrors.push(`${fieldName} is required`);
            } else {
                field.classList.remove('border-red-500');
                
                // Additional validation for email fields
                if (field.type === 'email' && !this.isValidEmail(field.value)) {
                    valid = false;
                    field.classList.add('border-red-500');
                    this.formErrors.push('Please enter a valid email address');
                }
            }
        });
        
        return valid;
    }
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - True if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Show validation errors on the page
     */
    showErrors() {
        if (this.formErrors.length === 0) return;
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'bg-red-900 bg-opacity-70 border border-red-500 text-white p-4 rounded mb-4 error-container';
        
        const errorHeading = document.createElement('h3');
        errorHeading.className = 'font-bold mb-2';
        errorHeading.textContent = 'Please correct the following:';        
        errorContainer.appendChild(errorHeading);
        
        const errorList = document.createElement('ul');
        errorList.className = 'list-disc ml-4';
        
        this.formErrors.forEach(error => {
            const errorItem = document.createElement('li');
            errorItem.textContent = error;
            errorList.appendChild(errorItem);
        });
        
        errorContainer.appendChild(errorList);
        
        // Remove any existing error containers
        this.clearErrors();
        
        // Add the error container to the current step
        const currentStepContent = document.querySelector(`.checkout-content:not(.hidden)`);
        if (currentStepContent) {
            currentStepContent.insertBefore(errorContainer, currentStepContent.firstChild);
        }
    }
    
    /**
     * Clear all validation errors
     */
    clearErrors() {
        document.querySelectorAll('.error-container').forEach(container => {
            container.remove();
        });
        this.formErrors = [];
    }
    
    /**
     * Add error message to a specific field
     * @param {HTMLElement} field - The field to add error to
     * @param {string} message - Error message
     */
    addErrorToField(field, message) {
        // Remove any existing error for this field
        this.removeErrorFromField(field);
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'text-red-500 text-sm mt-1 field-error';
        errorMessage.textContent = message;
        
        // Insert after the field
        field.parentNode.insertBefore(errorMessage, field.nextSibling);
    }
    
    /**
     * Remove error message from a specific field
     * @param {HTMLElement} field - The field to remove error from
     */
    removeErrorFromField(field) {
        const nextSibling = field.nextSibling;
        if (nextSibling && nextSibling.classList && nextSibling.classList.contains('field-error')) {
            nextSibling.remove();
        }
    }
    
    /**
     * Show order confirmation message
     */
    showOrderConfirmation() {
        // Create a unique order ID
        const orderId = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Create confirmation overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center';
        
        const content = document.createElement('div');
        content.className = 'bg-black border border-green-500 rounded-lg p-8 max-w-md w-full text-center';
        
        content.innerHTML = `
            <div class="w-20 h-20 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-check text-4xl text-green-400"></i>
            </div>
            <h2 class="text-2xl font-bold mb-4 text-green-400">Order Confirmed!</h2>
            <p class="mb-4">Your order has been successfully placed and is now being processed securely.</p>
            <div class="border border-green-900 rounded p-4 mb-6">
                <p class="text-sm text-gray-400 mb-1">Order ID:</p>
                <p class="font-mono font-bold text-green-400">${orderId}</p>
            </div>
            <p class="text-sm text-gray-400 mb-6">A confirmation has been encrypted and sent to your secure messaging system.</p>
        `;
        
        overlay.appendChild(content);
        document.body.appendChild(overlay);
    }
}

/**
 * Mobile Menu
 * Toggles the mobile menu when the button is clicked and handles outside clicks
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click handler from firing
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close the menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && 
                !mobileMenu.contains(e.target) && 
                e.target !== mobileMenuBtn && 
                !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

/**
 * Close modal when clicking outside of it
 * @param {string} modalId - The ID of the modal element
 */
function setupModalOutsideClick(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
}

/**
 * Close modal with escape key
 * @param {string} modalId - The ID of the modal element
 */
function setupModalEscapeKey(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });
    }
}

/**
 * Initialize all components when the DOM is loaded
 * This is the main entry point for the application
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    
    // Initialize Matrix background
    initMatrix();
    
    // Show loading screen for first visit
    initLoadingScreen();
    
    // Initialize authentication modals
    window.authModals = new AuthModals();
    
    // Initialize shopping cart
    new ShoppingCart();
    
    // Initialize search overlay
    new SearchOverlay();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize product tabs if we're on the product detail page
    if (document.querySelector('.product-tabs')) {
        initProductTabs();
    }
    
    // Initialize product gallery if available
    const productGallery = document.querySelector('.product-gallery');
    if (productGallery) {
        new ProductGallery('.product-gallery');
    }
    
    // Initialize Quick View modal
    new QuickViewModal();
    
    // Initialize checkout process if on checkout page
    if (document.getElementById('checkout-container')) {
        new CheckoutProcess();
    }
    
    // Process URL parameters for dynamic content
    handleURLParameters();
    
    // Aggiunge il listener per il logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Rimuovi l'utente da localStorage
            localStorage.removeItem('currentUser');
            // Reindirizza alla home
            window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
        });
    }
    
    console.log('Application initialized successfully!');
});

/**
 * Initialize product tab functionality
 */
function initProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                if (!tabName) return;
                
                // Update button styles
                tabButtons.forEach(btn => {
                    btn.classList.remove('border-b-2', 'border-green-400', 'text-green-400');
                    btn.classList.add('text-gray-400');
                });
                button.classList.remove('text-gray-400');
                button.classList.add('border-b-2', 'border-green-400', 'text-green-400');
                
                // Show corresponding tab content
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.add('hidden');
                });
                
                const tabContent = document.getElementById(`${tabName}-tab`);
                if (tabContent) {
                    tabContent.classList.remove('hidden');
                }
            });
        });
        
        // Show first tab by default
        if (tabButtons[0]) {
            tabButtons[0].click();
        }
    }
}

/**
 * Process URL parameters to dynamically update page content
 */
function handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        console.log(`Loading product with ID: ${productId}`);
        
        // Example product data - in a real app, this would come from an API
        const products = {
            "1": {
                name: "Encrypted Comms Device",
                price: "0.05",
                description: "Military-grade encryption for secure communications.",
                image: "https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+1"
            },
            "2": {
                name: "Anonymous VPN",
                price: "0.02",
                description: "No-log VPN with TOR integration. Masks your IP and encrypts all traffic with military-grade encryption.",
                image: "https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+2"
            },
            "3": {
                name: "Identity Package",
                price: "0.15",
                description: "Complete new identity with documentation. Includes digital and physical documents.",
                image: "https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+3"
            },
            "4": {
                name: "Surveillance Kit",
                price: "0.08",
                description: "Professional surveillance equipment for security monitoring and information gathering.",
                image: "https://via.placeholder.com/600x400/111111/00ff00?text=PRODUCT+4"
            }
        };
        
        const product = products[productId];
        if (product) {
            // Update product details on the page
            const productNameElements = document.querySelectorAll('#product-name, #product-title');
            productNameElements.forEach(el => {
                if (el) el.textContent = product.name;
            });
            
            const productPrice = document.getElementById('product-price');
            if (productPrice) productPrice.textContent = `${product.price} BTC`;
            
            const productDescription = document.getElementById('product-description');
            if (productDescription) productDescription.textContent = product.description;
            
            const galleryImages = document.querySelectorAll('.gallery-image');
            if (galleryImages.length > 0) {
                galleryImages[0].src = product.image;
                galleryImages[0].classList.remove('hidden');
                
                // Hide other images if they exist
                for (let i = 1; i < galleryImages.length; i++) {
                    galleryImages[i].classList.add('hidden');
                }
            }
        }
    }
}

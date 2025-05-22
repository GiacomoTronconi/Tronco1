// Matrix Background
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

// Loading Screen
function initLoadingScreen() {
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += 1;
        document.getElementById('loading-percentage').textContent = progress;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            document.getElementById('loading-screen').style.opacity = '0';
            document.getElementById('loading-screen').style.pointerEvents = 'none';
            
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('app').classList.remove('hidden');
            }, 500);
        }
    }, 50);
}

// Shopping Cart
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartUI();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add to cart buttons
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
                
                this.saveCart();
                this.updateCartUI();
                
                // Show cart sidebar
                document.getElementById('cart-sidebar').style.transform = 'translateX(0)';
                
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
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }
    
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
        this.init();
    }
    
    init() {
        // Get all necessary elements
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
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
    
    handleLogin(e) {
        e.preventDefault();
        const usernameField = document.getElementById('login-username');
        const passwordField = document.getElementById('login-password');
        const loginModal = document.getElementById('login-modal');
        
        if (!usernameField || !passwordField) return;
        
        const username = usernameField.value.trim();
        const password = passwordField.value.trim();
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }
        
        // In a real app, this would validate credentials
        // For demo purposes, accept any input
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            isLoggedIn: true
        }));
        
        alert('Login successful! (This is a demo)');
        
        if (loginModal) {
            loginModal.classList.add('hidden');
        }
        
        // Refresh page to update UI
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    handleRegister(e) {
        e.preventDefault();
        const usernameField = document.getElementById('register-username');
        const emailField = document.getElementById('register-email');
        const passwordField = document.getElementById('register-password');
        const confirmPasswordField = document.getElementById('register-confirm-password');
        const registerModal = document.getElementById('register-modal');
        
        if (!usernameField || !emailField || !passwordField || !confirmPasswordField) return;
        
        const username = usernameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value.trim();
        const confirmPassword = confirmPasswordField.value.trim();
        
        if (!username || !email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // In a real app, this would create user in database
        // For demo purposes, accept any input
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            email: email,
            isLoggedIn: true
        }));
        
        alert('Registration successful! (This is a demo)');
        
        if (registerModal) {
            registerModal.classList.add('hidden');
        }
        
        // Refresh page to update UI
        setTimeout(() => {
            window.location.reload();
        }, 500);
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
        // Setup quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = button.getAttribute('data-price');
                const img = button.getAttribute('data-img');
                const desc = button.getAttribute('data-desc');
                
                this.openQuickView(id, name, price, img, desc);
            });
        });
        
        // Close button
        const closeBtn = this.modal.querySelector('.close-modal');
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
        const addToCartBtn = this.modal.querySelector('.add-to-cart');
        const detailsLink = this.modal.querySelector('#quick-view-details-link');
        
        if (nameEl) nameEl.textContent = name;
        if (priceEl) priceEl.textContent = price + ' BTC';
        if (imgEl) imgEl.src = img;
        if (imgEl) imgEl.alt = name;
        if (descEl) descEl.textContent = desc;
        
        if (addToCartBtn) {
            addToCartBtn.setAttribute('data-id', id);
            addToCartBtn.setAttribute('data-name', name);
            addToCartBtn.setAttribute('data-price', price);
            addToCartBtn.setAttribute('data-img', img);
        }
        
        if (detailsLink) {
            detailsLink.href = 'pages/product-detail.html?id=' + id;
        }
        
        this.modal.classList.remove('hidden');
    }
}

// Checkout Process
class CheckoutProcess {
    constructor() {
        this.currentStep = 1;
        this.init();
    }
    
    init() {
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');
        
        nextButtons.forEach(button => {
            button.addEventListener('click', () => this.nextStep());
        });
        
        prevButtons.forEach(button => {
            button.addEventListener('click', () => this.prevStep());
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
                });
            });
        }
        
        // Complete order button
        const completeOrderBtn = document.getElementById('complete-order-btn');
        if (completeOrderBtn) {
            completeOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Simulate order completion
                alert('Order placed successfully! (This is a demo)');
                
                // Clear cart
                const cart = new ShoppingCart();
                cart.clearCart();
                
                // Redirect to homepage
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            });
        }
    }
    
    showStep(stepNumber) {
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
        
        this.currentStep = stepNumber;
    }
    
    nextStep() {
        if (this.currentStep < 4) {
            this.showStep(this.currentStep + 1);
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }
}

// Mobile Menu
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    initLoadingScreen();
    initMobileMenu();
    
    new ShoppingCart();
    new AuthModals();
    new SearchOverlay();
    new ProductGallery('.product-gallery');
    new QuickViewModal();
    
    // Initialize checkout process if on checkout page
    if (document.querySelector('.checkout-progress')) {
        new CheckoutProcess();
    }
    
    // Product tabs (if on product detail page)
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                
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
});

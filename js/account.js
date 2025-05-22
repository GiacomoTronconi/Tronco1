/**
 * Account Management JavaScript
 * Handles all account page functionality
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all account functionality
    initAccountPage();
});

/**
 * Initialize the account page
 */
function initAccountPage() {
    // Check if user is logged in
    const userData = getUserData();
    if (!userData || !userData.isLoggedIn) {
        // Redirect to login if not logged in
        window.location.href = '../index.html';
        return;
    }

    // Load user data into the UI
    loadUserData(userData);
    
    // Check if the user is an administrator
    checkAdminStatus(userData);
    
    // Setup navigation between sections
    setupSectionNavigation();
    
    // Setup profile form
    setupProfileForm();
    
    // Setup security settings
    setupSecuritySettings();
    
    // Setup orders section
    setupOrdersSection(userData.orders || []);
    
    // Setup address management
    setupAddressManagement(userData.addresses || []);
    
    // If admin, setup admin functionality
    if (userData.isAdmin) {
        setupAdminFunctionality();
    }
    
    // Setup logout functionality
    setupLogout();
}

/**
 * Check if the user is an administrator and show/hide admin features accordingly
 * @param {Object} userData - User data object
 */
function checkAdminStatus(userData) {
    const adminNavSection = document.getElementById('admin-nav-section');
    console.log('Checking admin status, isAdmin:', userData.isAdmin);
    
    // La email è giacomotronconi@icloud.com e la password è Giacomo2007
    // Controlla esplicitamente se l'utente è amministratore
    // Questo è un doppio controllo di sicurezza
    const isAdmin = (userData.isAdmin === true) || 
                    (userData.email === 'giacomotronconi@icloud.com');
    
    // Aggiorna il valore isAdmin se necessario
    if (isAdmin && !userData.isAdmin) {
        userData.isAdmin = true;
        // Salva i dati aggiornati nel localStorage
        localStorage.setItem('currentUser', JSON.stringify(userData));
    }
    
    if (isAdmin) {
        // Mostra messaggio di benvenuto all'amministratore
        if (!document.getElementById('admin-welcome-message')) {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.id = 'admin-welcome-message';
            welcomeMessage.className = 'bg-green-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 text-center';
            welcomeMessage.innerHTML = '<i class="fas fa-crown mr-2"></i> Benvenuto Amministratore!';
            
            // Inserisci il messaggio all'inizio dell'area contenuti
            const contentArea = document.querySelector('.lg\\:col-span-3 .bg-black');
            if (contentArea) {
                contentArea.prepend(welcomeMessage);
                
                // Nascondi il messaggio dopo 5 secondi
                setTimeout(() => {
                    welcomeMessage.style.opacity = '0';
                    welcomeMessage.style.transition = 'opacity 1s';
                    setTimeout(() => {
                        welcomeMessage.remove();
                    }, 1000);
                }, 5000);
            }
        }
        
        // Show admin navigation section
        if (adminNavSection) {
            adminNavSection.classList.remove('hidden');
        }
        
        // Add Admin badge to user profile
        const userTitleElement = document.querySelector('.username-display');
        if (userTitleElement) {
            // Add admin badge if not already present
            if (!document.querySelector('.admin-badge')) {
                const adminBadge = document.createElement('span');
                adminBadge.className = 'admin-badge ml-2 bg-red-900 text-white text-xs px-2 py-1 rounded-full';
                adminBadge.textContent = 'ADMIN';
                userTitleElement.appendChild(adminBadge);
            }
        }
    } else {
        // Hide admin navigation section
        if (adminNavSection) {
            adminNavSection.classList.add('hidden');
        }
        
        // Remove admin badge if present
        const adminBadge = document.querySelector('.admin-badge');
        if (adminBadge) {
            adminBadge.remove();
        }
    }
}

/**
 * Get user data from localStorage
 */
function getUserData() {
    try {
        return JSON.parse(localStorage.getItem('currentUser')) || {};
    } catch (error) {
        console.error('Error getting user data:', error);
        return {};
    }
}

/**
 * Save user data to localStorage
 */
function saveUserData(userData) {
    try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
    } catch (error) {
        console.error('Error saving user data:', error);
        return false;
    }
}

/**
 * Load user data into the UI
 */
function loadUserData(userData) {
    // Update sidebar
    const usernameDisplays = document.querySelectorAll('.username-display');
    usernameDisplays.forEach(el => {
        if (el) el.textContent = userData.username || 'User';
    });
    
    // Load profile image if available
    if (userData.profileImage) {
        const profileImageElements = document.querySelectorAll('#profile-image, #preview-image');
        const profileIconElements = document.querySelectorAll('#profile-icon, #preview-icon');
        
        profileImageElements.forEach(img => {
            if (img) {
                img.src = userData.profileImage;
                img.classList.remove('hidden');
            }
        });
        
        profileIconElements.forEach(icon => {
            if (icon) icon.classList.add('hidden');
        });
    }

    // Update overview tab
    if (document.getElementById('overview-username'))
        document.getElementById('overview-username').textContent = userData.username || 'User';
    if (document.getElementById('overview-email'))
        document.getElementById('overview-email').textContent = userData.email || 'user@encrypted.net';
    
    // Set joined date (if not available, use today's date)
    const joinedDate = userData.joined || formatDate(new Date());
    if (document.getElementById('overview-joined'))
        document.getElementById('overview-joined').textContent = joinedDate;
    
    // Set last login date
    const lastLogin = userData.lastLogin || formatDate(new Date());
    if (document.getElementById('overview-last-login'))
        document.getElementById('overview-last-login').textContent = lastLogin;
    
    // Set order count
    const orderCount = (userData.orders || []).length;
    if (document.getElementById('overview-orders'))
        document.getElementById('overview-orders').textContent = orderCount;
    
    // Set wishlist count
    const wishlistCount = (userData.wishlist || []).length;
    if (document.getElementById('overview-wishlist'))
        document.getElementById('overview-wishlist').textContent = wishlistCount;
    
    // Fill profile form fields
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        if (document.getElementById('profile-username'))
            document.getElementById('profile-username').value = userData.username || '';
        if (document.getElementById('profile-email'))
            document.getElementById('profile-email').value = userData.email || '';
        if (document.getElementById('profile-display-name'))
            document.getElementById('profile-display-name').value = userData.displayName || userData.username || '';
        if (document.getElementById('profile-bio'))
            document.getElementById('profile-bio').value = userData.bio || '';
        if (document.getElementById('profile-pgp-key'))
            document.getElementById('profile-pgp-key').value = userData.pgpKey || '';

        // Set user preferences checkboxes
        if (userData.preferences) {
            if (document.getElementById('pref-dark-mode'))
                document.getElementById('pref-dark-mode').checked = userData.preferences.darkMode || false;
            if (document.getElementById('pref-hide-balance'))
                document.getElementById('pref-hide-balance').checked = userData.preferences.hideBalance || false;
            if (document.getElementById('pref-notifications'))
                document.getElementById('pref-notifications').checked = userData.preferences.notifications || false;
        }
    }
}

/**
 * Format a date object into a readable string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

/**
 * Setup navigation between account sections
 */
function setupSectionNavigation() {
    const navItems = document.querySelectorAll('.account-nav-item');
    const sections = document.querySelectorAll('.account-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Get target section
            const targetSection = item.dataset.section;
            
            // Update active tab
            navItems.forEach(navItem => {
                navItem.classList.remove('active', 'bg-green-900', 'bg-opacity-20');
                if (navItem.dataset.section === targetSection) {
                    navItem.classList.add('active', 'bg-green-900', 'bg-opacity-20');
                }
            });
            
            // Show target section, hide others
            sections.forEach(section => {
                if (section.id === `${targetSection}-section`) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    
    // Handle section links within content
    document.querySelectorAll('[data-section]').forEach(link => {
        if (!link.classList.contains('account-nav-item')) {
            link.addEventListener('click', () => {
                const targetSection = link.dataset.section;
                document.querySelector(`.account-nav-item[data-section="${targetSection}"]`).click();
            });
        }
    });
}

/**
 * Setup profile form submission
 */
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;
    
    // Setup profile image upload
    setupProfileImageUpload();
    
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('profile-username').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const displayName = document.getElementById('profile-display-name').value.trim();
        const bio = document.getElementById('profile-bio').value.trim();
        const pgpKey = document.getElementById('profile-pgp-key').value.trim();
        const currentPassword = document.getElementById('profile-current-password').value;
        const newPassword = document.getElementById('profile-new-password').value;
        const confirmPassword = document.getElementById('profile-confirm-password').value;
        
        // Get preferences
        const darkMode = document.getElementById('pref-dark-mode').checked;
        const hideBalance = document.getElementById('pref-hide-balance').checked;
        const notifications = document.getElementById('pref-notifications').checked;
        
        // Basic validation
        if (!username || !email) {
            showNotification('Username and email are required', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Password validation (if changing)
        if (newPassword || confirmPassword) {
            if (!currentPassword) {
                showNotification('Current password is required to set a new password', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showNotification('Password must be at least 8 characters', 'error');
                return;
            }
        }
        
        // Update user data
        const userData = getUserData();
        userData.username = username;
        userData.email = email;
        userData.displayName = displayName;
        userData.bio = bio;
        userData.pgpKey = pgpKey;
        
        // Update preferences
        userData.preferences = {
            darkMode,
            hideBalance,
            notifications
        };
        
        // Update password if changing
        if (newPassword && currentPassword) {
            // In a real app, we would verify the current password on the server
            // For this demo, we'll just assume it's correct
            userData.password = newPassword;
        }
        
        // Save updated user data
        if (saveUserData(userData)) {
            showNotification('Profile updated successfully');
            
            // Update UI
            loadUserData(userData);
            
            // Clear password fields
            document.getElementById('profile-current-password').value = '';
            document.getElementById('profile-new-password').value = '';
            document.getElementById('profile-confirm-password').value = '';
        } else {
            showNotification('Failed to update profile', 'error');
        }
    });
}

/**
 * Setup profile image upload functionality
 */
function setupProfileImageUpload() {
    const fileInput = document.getElementById('profile-image-upload');
    const changeProfileImageBtn = document.getElementById('change-profile-image');
    const removeProfileImageBtn = document.getElementById('remove-profile-image');
    
    if (!fileInput) return;
    
    // When the change profile image button is clicked
    if (changeProfileImageBtn) {
        changeProfileImageBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPG, PNG, GIF)', 'error');
            return;
        }
        
        // Check file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            showNotification('Image size should be less than 2MB', 'error');
            return;
        }
        
        // Read the file and convert to data URL
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageDataUrl = event.target.result;
            
            // Update preview images
            updateProfileImage(imageDataUrl);
            
            // Update user data with new image
            const userData = getUserData();
            userData.profileImage = imageDataUrl;
            saveUserData(userData);
            
            showNotification('Profile image updated');
        };
        reader.readAsDataURL(file);
    });
    
    // Handle remove profile image
    if (removeProfileImageBtn) {
        removeProfileImageBtn.addEventListener('click', () => {
            // Reset images
            const profileImages = document.querySelectorAll('#profile-image, #preview-image');
            const profileIcons = document.querySelectorAll('#profile-icon, #preview-icon');
            
            profileImages.forEach(img => {
                img.classList.add('hidden');
                img.src = '';
            });
            
            profileIcons.forEach(icon => {
                icon.classList.remove('hidden');
            });
            
            // Update user data
            const userData = getUserData();
            delete userData.profileImage;
            saveUserData(userData);
            
            showNotification('Profile image removed');
        });
    }
}

/**
 * Update profile image in all places
 */
function updateProfileImage(imageUrl) {
    const profileImages = document.querySelectorAll('#profile-image, #preview-image');
    const profileIcons = document.querySelectorAll('#profile-icon, #preview-icon');
    
    profileImages.forEach(img => {
        img.src = imageUrl;
        img.classList.remove('hidden');
    });
    
    profileIcons.forEach(icon => {
        icon.classList.add('hidden');
    });
}

/**
 * Setup security settings functionality
 */
function setupSecuritySettings() {
    // Two-factor authentication toggle
    const twoFAToggle = document.getElementById('2fa-toggle');
    if (twoFAToggle) {
        twoFAToggle.addEventListener('change', () => {
            const setupSection = document.getElementById('2fa-setup');
            setupSection.classList.toggle('hidden', !twoFAToggle.checked);
        });
    }
    
    // Handle session revocation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.text-red-400')) {
            const button = e.target.closest('.text-red-400');
            if (button.textContent.includes('Revoke')) {
                // In a real app, this would make an API call to revoke the session
                const sessionElement = button.closest('.flex.justify-between');
                if (sessionElement) {
                    sessionElement.remove();
                    showNotification('Session revoked successfully');
                }
            } else if (button.textContent.includes('Log Out All')) {
                // In a real app, this would make an API call to log out all other sessions
                const sessions = document.querySelectorAll('.flex.justify-between');
                sessions.forEach(session => {
                    if (!session.querySelector('.bg-green-900')) {
                        session.remove();
                    }
                });
                showNotification('All other sessions logged out');
            } else if (button.textContent.includes('DELETE ACCOUNT')) {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // In a real app, this would make an API call to delete the account
                    localStorage.removeItem('currentUser');
                    showNotification('Account deleted successfully');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1500);
                }
            }
        }
    });
}

/**
 * Setup orders section
 */
function setupOrdersSection(orders) {
    const ordersContainer = document.getElementById('orders-container');
    const noOrdersMessage = document.getElementById('no-orders-message');
    
    if (!ordersContainer) return;
    
    // Sample order data (in a real app, this would come from an API)
    if (!orders || orders.length === 0) {
        // Create sample order for demo purposes
        orders = [
            {
                id: 'ORD-XYZ123',
                date: 'May 15, 2025',
                status: 'Completed',
                items: [
                    { name: 'Encrypted Comms Device', price: 0.05, quantity: 1 },
                    { name: 'Data Encryption Tool', price: 0.07, quantity: 1 }
                ],
                total: '0.12',
                shipping: 'Encrypted Drop'
            }
        ];
        
        // Save to user data
        const userData = getUserData();
        userData.orders = orders;
        saveUserData(userData);
    }
    
    // Display orders or no orders message
    if (orders.length === 0) {
        if (noOrdersMessage) noOrdersMessage.classList.remove('hidden');
        
        // Remove sample order if any
        const sampleOrder = ordersContainer.querySelector('.bg-gray-900');
        if (sampleOrder && sampleOrder !== noOrdersMessage) {
            sampleOrder.remove();
        }
    } else {
        if (noOrdersMessage) noOrdersMessage.classList.add('hidden');
        
        // Setup order detail view
        document.addEventListener('click', (e) => {
            if (e.target.closest('.view-order-details')) {
                const button = e.target.closest('.view-order-details');
                const orderId = button.dataset.order;
                
                // In a real app, this would load order details from an API
                alert(`Viewing details for order ${orderId}`);
            }
        });
    }
}

/**
 * Setup address management
 */
function setupAddressManagement(addresses) {
    const addAddressBtn = document.getElementById('add-address-btn');
    const addressFormContainer = document.getElementById('address-form-container');
    const addressesContainer = document.getElementById('addresses-container');
    const addressForm = document.getElementById('address-form');
    const noAddressesMessage = document.getElementById('no-addresses-message');
    
    if (!addAddressBtn || !addressFormContainer || !addressForm) return;
    
    // Add new address button
    addAddressBtn.addEventListener('click', () => {
        // Show form
        addressFormContainer.classList.remove('hidden');
        
        // Reset form
        addressForm.reset();
        document.getElementById('address-id').value = '';
        document.getElementById('address-form-title').textContent = 'Add New Address';
    });
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-address-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            addressFormContainer.classList.add('hidden');
        });
    }
    
    // Address form submission
    addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get user data
        const userData = getUserData();
        const userAddresses = userData.addresses || [];
        
        // Create address object
        const address = {
            id: document.getElementById('address-id').value || Date.now().toString(),
            name: document.getElementById('address-name').value,
            recipient: document.getElementById('address-recipient').value,
            line1: document.getElementById('address-line1').value,
            line2: document.getElementById('address-line2').value,
            city: document.getElementById('address-city').value,
            state: document.getElementById('address-state').value,
            zip: document.getElementById('address-zip').value,
            pgp: document.getElementById('address-pgp').value,
            isPrimary: document.getElementById('address-primary').checked
        };
        
        // If this address is primary, make sure others are not
        if (address.isPrimary) {
            userAddresses.forEach((addr) => {
                if (addr.id !== address.id) {
                    addr.isPrimary = false;
                }
            });
        }
        
        // Add or update address
        const existingIndex = userAddresses.findIndex(a => a.id === address.id);
        if (existingIndex >= 0) {
            userAddresses[existingIndex] = address;
        } else {
            userAddresses.push(address);
        }
        
        // Save user data
        userData.addresses = userAddresses;
        if (saveUserData(userData)) {
            // Hide form
            addressFormContainer.classList.add('hidden');
            
            // Update UI
            updateAddressList(userAddresses);
            
            // Show notification
            showNotification('Address saved successfully');
        } else {
            showNotification('Failed to save address', 'error');
        }
    });
    
    // Handle edit and delete
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-address')) {
            const button = e.target.closest('.edit-address');
            const addressId = button.dataset.addressId;
            
            // Get address data
            const userData = getUserData();
            const address = (userData.addresses || []).find(a => a.id === addressId);
            
            if (address) {
                // Populate form
                document.getElementById('address-id').value = address.id;
                document.getElementById('address-name').value = address.name || '';
                document.getElementById('address-recipient').value = address.recipient || '';
                document.getElementById('address-line1').value = address.line1 || '';
                document.getElementById('address-line2').value = address.line2 || '';
                document.getElementById('address-city').value = address.city || '';
                document.getElementById('address-state').value = address.state || '';
                document.getElementById('address-zip').value = address.zip || '';
                document.getElementById('address-pgp').value = address.pgp || '';
                document.getElementById('address-primary').checked = address.isPrimary || false;
                
                // Show form
                document.getElementById('address-form-title').textContent = 'Edit Address';
                addressFormContainer.classList.remove('hidden');
            }
        } else if (e.target.closest('.delete-address')) {
            const button = e.target.closest('.delete-address');
            const addressId = button.dataset.addressId;
            
            if (confirm('Are you sure you want to delete this address?')) {
                // Get user data
                const userData = getUserData();
                const userAddresses = userData.addresses || [];
                
                // Remove address
                userData.addresses = userAddresses.filter(a => a.id !== addressId);
                
                // Save user data
                if (saveUserData(userData)) {
                    // Update UI
                    updateAddressList(userData.addresses);
                    
                    // Show notification
                    showNotification('Address deleted successfully');
                } else {
                    showNotification('Failed to delete address', 'error');
                }
            }
        }
    });
    
    // Initialize address list
    updateAddressList(addresses);
    
    /**
     * Update the address list in the UI
     */
    function updateAddressList(addresses) {
        // Clear existing addresses (except the form container)
        const addressBoxes = addressesContainer.querySelectorAll('.bg-gray-900');
        addressBoxes.forEach(box => {
            if (!box.contains(addressFormContainer)) {
                box.remove();
            }
        });
        
        // Show no addresses message if empty
        if (!addresses || addresses.length === 0) {
            if (noAddressesMessage) noAddressesMessage.classList.remove('hidden');
            return;
        }
        
        // Hide no addresses message
        if (noAddressesMessage) noAddressesMessage.classList.add('hidden');
        
        // Add each address to the UI
        addresses.forEach(address => {
            const addressBox = document.createElement('div');
            addressBox.className = 'bg-gray-900 bg-opacity-50 rounded-lg p-4 border border-gray-800 relative';
            addressBox.innerHTML = `
                <div class="absolute top-3 right-3 flex space-x-2">
                    <button class="text-green-400 hover:text-green-200 transition edit-address" data-address-id="${address.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-400 hover:text-red-300 transition delete-address" data-address-id="${address.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                
                <h3 class="font-bold mb-2">${address.name} ${address.isPrimary ? '<span class="text-xs bg-green-900 text-white px-2 py-1 rounded ml-2">Primary</span>' : ''}</h3>
                <div class="text-gray-400">
                    <p>${address.recipient}</p>
                    <p>${address.line1}</p>
                    ${address.line2 ? `<p>${address.line2}</p>` : ''}
                    <p>${address.city}, ${address.state} ${address.zip}</p>
                    ${address.pgp ? `<p class="mt-2">PGP Encrypted Location: Available</p>` : ''}
                </div>
            `;
            
            // Insert before the form container if it exists
            if (addressFormContainer && addressFormContainer.parentNode === addressesContainer) {
                addressesContainer.insertBefore(addressBox, addressFormContainer);
            } else {
                addressesContainer.appendChild(addressBox);
            }
        });
    }
}

/**
 * Setup admin functionality for managing products, vendors, users, and orders
 */
function setupAdminFunctionality() {
    setupProductManagement();
    setupVendorManagement();
    setupUserManagement();
    setupOrderManagement();
}

/**
 * Setup product management functionality
 */
function setupProductManagement() {
    const addProductBtn = document.getElementById('add-new-product');
    const productForm = document.getElementById('product-form');
    const cancelProductBtn = document.getElementById('cancel-product-form');
    const productFormContainer = document.getElementById('product-form-container');
    const productList = document.getElementById('product-list');
    
    // Carica la lista dei prodotti
    loadProductList();
    
    // Show product form when Add New Product button is clicked
    if (addProductBtn && productFormContainer) {
        addProductBtn.addEventListener('click', () => {
            // Reset form for new product
            if (productForm) productForm.reset();
            document.getElementById('product-form-title').textContent = 'Add New Product';
            document.getElementById('product-id').value = '';
            
            // Default values per i nuovi prodotti
            document.getElementById('product-status').value = 'active';
            document.getElementById('product-image').value = 'https://via.placeholder.com/600x400/111111/00ff00?text=NEW+PRODUCT';
            
            // Show form
            productFormContainer.classList.remove('hidden');
        });
    }
    
    // Hide product form when Cancel button is clicked
    if (cancelProductBtn && productFormContainer) {
        cancelProductBtn.addEventListener('click', () => {
            productFormContainer.classList.add('hidden');
        });
    }
    
    // Handle product form submission
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProduct();
        });
    }
    
    // Handle edit product buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-product') || e.target.closest('.edit-product')) {
            const button = e.target.classList.contains('edit-product') ? e.target : e.target.closest('.edit-product');
            const productId = button.getAttribute('data-id');
            editProduct(productId);
        }
    });
    
    // Handle delete product buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-product') || e.target.closest('.delete-product')) {
            const button = e.target.classList.contains('delete-product') ? e.target : e.target.closest('.delete-product');
            const productId = button.getAttribute('data-id');
            deleteProduct(productId);
        }
    });
}

/**
 * Carica la lista dei prodotti nella tabella
 */
function loadProductList() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    
    // Ottieni i prodotti dal localStorage
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Svuota la lista
    productList.innerHTML = '';
    
    // Se non ci sono prodotti, mostra un messaggio
    if (products.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="7" class="p-3 text-center text-gray-400">
                Nessun prodotto disponibile. Aggiungine uno nuovo!
            </td>
        `;
        productList.appendChild(emptyRow);
        return;
    }
    
    // Aggiungi i prodotti alla tabella
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'border-b border-gray-800' : 'border-b border-gray-800 bg-black bg-opacity-40';
        
        const statusClass = product.status === 'active' ? 'text-green-400' : 'text-red-400';
        const statusLabel = product.status === 'active' ? 'Active' : 'Inactive';
        
        row.innerHTML = `
            <td class="p-3">${product.id}</td>
            <td class="p-3">
                <img src="${product.image}" class="w-10 h-10 object-cover rounded" alt="${product.name}">
            </td>
            <td class="p-3">${product.name}</td>
            <td class="p-3">${product.price} BTC</td>
            <td class="p-3">${product.category}</td>
            <td class="p-3"><span class="px-2 py-1 bg-${product.status === 'active' ? 'green' : 'red'}-900 bg-opacity-50 ${statusClass} rounded-full text-xs">${statusLabel}</span></td>
            <td class="p-3">
                <div class="flex space-x-2">
                    <button class="text-blue-400 hover:text-blue-300 transition edit-product" data-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-400 hover:text-red-300 transition delete-product" data-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        productList.appendChild(row);
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
    
    // Salva i prodotti di default nel localStorage
    localStorage.setItem('products', JSON.stringify(defaultProducts));
    
    return defaultProducts;
}

/**
 * Modifica un prodotto
 * @param {string} productId - ID del prodotto da modificare
 */
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Prodotto non trovato', 'error');
        return;
    }
    
    // Popola il form con i dati del prodotto
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-status').value = product.status;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-featured').checked = product.featured;
    document.getElementById('product-digital').checked = product.digital;
    document.getElementById('product-requires-pgp').checked = product.requiresPgp;
    
    // Cambia il titolo del form
    document.getElementById('product-form-title').textContent = 'Edit Product';
    
    // Mostra il form
    document.getElementById('product-form-container').classList.remove('hidden');
}

/**
 * Salva un prodotto (nuovo o modificato)
 */
function saveProduct() {
    // Ottieni i valori dal form
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const image = document.getElementById('product-image').value;
    const category = document.getElementById('product-category').value;
    const status = document.getElementById('product-status').value;
    const description = document.getElementById('product-description').value;
    const featured = document.getElementById('product-featured').checked;
    const digital = document.getElementById('product-digital').checked;
    const requiresPgp = document.getElementById('product-requires-pgp').checked;
    
    // Validazione di base
    if (!name || !price) {
        showNotification('Nome e prezzo del prodotto sono obbligatori', 'error');
        return;
    }
    
    // Ottieni la lista dei prodotti esistenti
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Controlla se stiamo modificando un prodotto esistente o creandone uno nuovo
    if (productId) {
        // Modifica prodotto esistente
        const productIndex = products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            showNotification('Prodotto non trovato', 'error');
            return;
        }
        
        // Aggiorna il prodotto
        products[productIndex] = {
            ...products[productIndex],
            name,
            price,
            image,
            category,
            status,
            description,
            featured,
            digital,
            requiresPgp
        };
        
        showNotification('Prodotto aggiornato con successo');
    } else {
        // Crea un nuovo prodotto
        const newId = generateProductId(products);
        
        const newProduct = {
            id: newId,
            name,
            price,
            image,
            category,
            status,
            description,
            featured,
            digital,
            requiresPgp
        };
        
        products.push(newProduct);
        showNotification('Nuovo prodotto aggiunto con successo');
    }
    
    // Salva i prodotti aggiornati
    localStorage.setItem('products', JSON.stringify(products));
    
    // Imposta una flag per indicare che i prodotti sono stati modificati
    localStorage.setItem('productsUpdated', new Date().getTime());
    
    // Nascondi il form
    document.getElementById('product-form-container').classList.add('hidden');
    
    // Ricarica la lista dei prodotti
    loadProductList();
}

/**
 * Genera un nuovo ID prodotto
 * @param {Array} products - Lista dei prodotti esistenti
 * @returns {string} Nuovo ID prodotto
 */
function generateProductId(products) {
    if (!products || products.length === 0) return '1';
    
    // Trova l'ID più alto e aggiungi 1
    const maxId = Math.max(...products.map(p => parseInt(p.id)));
    return (maxId + 1).toString();
}

/**
 * Elimina un prodotto
 * @param {string} productId - ID del prodotto da eliminare
 */
function deleteProduct(productId) {
    // Chiedi conferma
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) {
        return;
    }
    
    // Ottieni la lista dei prodotti
    const products = JSON.parse(localStorage.getItem('products')) || getDefaultProducts();
    
    // Trova il prodotto da eliminare
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        showNotification('Prodotto non trovato', 'error');
        return;
    }
    
    // Rimuovi il prodotto
    products.splice(productIndex, 1);
    
    // Salva i prodotti aggiornati
    localStorage.setItem('products', JSON.stringify(products));
    
    // Imposta una flag per indicare che i prodotti sono stati modificati
    localStorage.setItem('productsUpdated', new Date().getTime());
    
    // Mostra una notifica
    showNotification('Prodotto eliminato con successo');
    
    // Ricarica la lista dei prodotti
    loadProductList();
}

/**
 * Setup vendor management functionality
 */
function setupVendorManagement() {
    // Similar functionality as product management
    // For brevity, we'll leave the implementation simple
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-vendor') || e.target.closest('.edit-vendor')) {
            showNotification('Vendor edit functionality would be implemented here');
        }
        
        if (e.target.classList.contains('delete-vendor') || e.target.closest('.delete-vendor')) {
            showNotification('Vendor delete functionality would be implemented here');
        }
    });
}

/**
 * Setup user management functionality
 */
function setupUserManagement() {
    const usersSection = document.getElementById('admin-users-section');
    if (!usersSection) return;
    
    // Carica la lista degli utenti
    loadUsersList();
    
    // Gestisci i click sui pulsanti di azione
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-user') || e.target.closest('.edit-user')) {
            const button = e.target.classList.contains('edit-user') ? e.target : e.target.closest('.edit-user');
            const userId = button.getAttribute('data-id');
            openUserEditForm(userId);
        }
        
        if (e.target.classList.contains('block-user') || e.target.closest('.block-user')) {
            const button = e.target.classList.contains('block-user') ? e.target : e.target.closest('.block-user');
            const userId = button.getAttribute('data-id');
            toggleUserBlockStatus(userId);
        }
        
        if (e.target.classList.contains('delete-user') || e.target.closest('.delete-user')) {
            const button = e.target.classList.contains('delete-user') ? e.target : e.target.closest('.delete-user');
            const userId = button.getAttribute('data-id');
            deleteUser(userId);
        }
    });
    
    // Gestisci il form di modifica utente
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveUserData();
        });
    }
    
    // Gestisci il pulsante di annullamento della modifica
    const cancelUserFormBtn = document.getElementById('cancel-user-form');
    if (cancelUserFormBtn) {
        cancelUserFormBtn.addEventListener('click', () => {
            const userFormContainer = document.getElementById('user-form-container');
            if (userFormContainer) {
                userFormContainer.classList.add('hidden');
            }
        });
    }
}

/**
 * Carica la lista degli utenti registrati
 */
function loadUsersList() {
    const usersTableBody = document.querySelector('#admin-users-section .users-table-body');
    if (!usersTableBody) return;
    
    // Ottieni gli utenti registrati
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Pulisci la tabella
    usersTableBody.innerHTML = '';
    
    // Se non ci sono utenti, mostra un messaggio
    if (registeredUsers.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="py-4 text-center text-gray-400">
                Nessun utente registrato.
            </td>
        `;
        usersTableBody.appendChild(emptyRow);
        return;
    }
    
    // Aggiungi ogni utente alla tabella
    registeredUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-black bg-opacity-40' : '';
        
        const statusClass = user.isBlocked ? 'text-red-400' : 'text-green-400';
        const statusText = user.isBlocked ? 'Bloccato' : 'Attivo';
        
        // Formatta la data di registrazione
        const regDate = new Date(user.registrationDate);
        const formattedDate = regDate.toLocaleDateString();
        
        // Formatta l'ultima data di accesso
        const lastLoginDate = new Date(user.lastLogin);
        const formattedLastLogin = lastLoginDate.toLocaleDateString();
        
        row.innerHTML = `
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="mr-3 w-8 h-8 bg-green-900 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-green-400"></i>
                    </div>
                    <div>
                        <p class="font-medium">${user.username}</p>
                        <p class="text-sm text-gray-400">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4">${formattedDate}</td>
            <td class="py-3 px-4">${formattedLastLogin}</td>
            <td class="py-3 px-4">
                <span class="${statusClass} inline-flex items-center">
                    <i class="fas fa-circle text-xs mr-1"></i> ${statusText}
                </span>
            </td>
            <td class="py-3 px-4">
                ${user.isAdmin ? '<span class="bg-red-900 text-white text-xs px-2 py-1 rounded-full">ADMIN</span>' : ''}
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center space-x-2">
                    <button class="edit-user text-green-400 hover:text-green-200" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="block-user ${user.isBlocked ? 'text-green-400 hover:text-green-200' : 'text-red-400 hover:text-red-200'}" data-id="${user.id}">
                        <i class="fas ${user.isBlocked ? 'fa-unlock' : 'fa-ban'}"></i>
                    </button>
                    ${!user.isAdmin ? `
                    <button class="delete-user text-red-400 hover:text-red-200" data-id="${user.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>` : ''}
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(row);
    });
}

/**
 * Apre il form di modifica utente
 * @param {string} userId - ID dell'utente da modificare
 */
function openUserEditForm(userId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const user = registeredUsers.find(u => u.id === userId);
    
    if (!user) {
        showNotification('Utente non trovato', 'error');
        return;
    }
    
    const userFormContainer = document.getElementById('user-form-container');
    if (!userFormContainer) return;
    
    // Popola il form con i dati dell'utente
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-admin').checked = user.isAdmin;
    document.getElementById('user-blocked').checked = user.isBlocked || false;
    
    // Mostra il form
    document.getElementById('user-form-title').textContent = 'Modifica Utente';
    userFormContainer.classList.remove('hidden');
}

/**
 * Salva i dati dell'utente modificati
 */
function saveUserData() {
    const userId = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value;
    // Leggiamo l'email solo per validazione, ma non la modificheremo
    const email = document.getElementById('user-email').value;
    const isAdmin = document.getElementById('user-admin').checked;
    const isBlocked = document.getElementById('user-blocked').checked;
    
    if (!username || !email) {
        showNotification('Username e email sono obbligatori', 'error');
        return;
    }
    
    // Ottieni gli utenti registrati
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    
    // Trova l'utente da aggiornare
    const userIndex = registeredUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('Utente non trovato', 'error');
        return;
    }
    
    // Controlla se l'username è già in uso
    if (username !== registeredUsers[userIndex].username) {
        const existingUsername = registeredUsers.find(u => u.id !== userId && u.username === username);
        if (existingUsername) {
            showNotification('Username già in uso', 'error');
            return;
        }
    }
    
    // Aggiorna i dati dell'utente (ma NON l'email)
    registeredUsers[userIndex].username = username;
    // L'email resta invariata
    registeredUsers[userIndex].isAdmin = isAdmin;
    registeredUsers[userIndex].isBlocked = isBlocked;
    
    // Salva gli utenti aggiornati
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Aggiorna anche l'utente corrente se necessario
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === userId) {
        currentUser.username = username;
        // L'email resta invariata
        currentUser.isAdmin = isAdmin;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Nascondi il form
    const userFormContainer = document.getElementById('user-form-container');
    if (userFormContainer) {
        userFormContainer.classList.add('hidden');
    }
    
    // Aggiorna la lista degli utenti
    loadUsersList();
    
    showNotification('Utente aggiornato con successo');
}

/**
 * Attiva/disattiva lo stato di blocco di un utente
 * @param {string} userId - ID dell'utente da bloccare/sbloccare
 */
function toggleUserBlockStatus(userId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('Utente non trovato', 'error');
        return;
    }
    
    // Non permettere di bloccare un amministratore
    if (registeredUsers[userIndex].isAdmin) {
        showNotification('Non puoi bloccare un amministratore', 'error');
        return;
    }
    
    // Toggle lo stato di blocco
    registeredUsers[userIndex].isBlocked = !registeredUsers[userIndex].isBlocked;
    
    // Salva gli utenti aggiornati
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Aggiorna la lista degli utenti
    loadUsersList();
    
    const action = registeredUsers[userIndex].isBlocked ? 'bloccato' : 'sbloccato';
    showNotification(`Utente ${action} con successo`);
}

/**
 * Elimina un utente
 * @param {string} userId - ID dell'utente da eliminare
 */
function deleteUser(userId) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userIndex = registeredUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        showNotification('Utente non trovato', 'error');
        return;
    }
    
    // Non permettere di eliminare un amministratore
    if (registeredUsers[userIndex].isAdmin) {
        showNotification('Non puoi eliminare un amministratore', 'error');
        return;
    }
    
    // Chiedi conferma
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${registeredUsers[userIndex].username}?`)) {
        return;
    }
    
    // Rimuovi l'utente
    registeredUsers.splice(userIndex, 1);
    
    // Salva gli utenti aggiornati
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Aggiorna la lista degli utenti
    loadUsersList();
    
    showNotification('Utente eliminato con successo');
}

/**
 * Setup order management functionality
 */
function setupOrderManagement() {
    // For brevity, we'll leave the implementation simple
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-order') || e.target.closest('.view-order')) {
            showNotification('Order details view would be implemented here');
        }
        
        if (e.target.classList.contains('update-order-status') || e.target.closest('.update-order-status')) {
            showNotification('Order status update functionality would be implemented here');
        }
    });
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', () => {
        // Update user data to log out
        const userData = getUserData();
        userData.isLoggedIn = false;
        
        // Aggiorna anche l'array degli utenti registrati
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
        const userIndex = registeredUsers.findIndex(u => u.id === userData.id);
        
        if (userIndex !== -1) {
            registeredUsers[userIndex].isLoggedIn = false;
            registeredUsers[userIndex].lastLogout = new Date().toISOString();
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
        
        // Save current user data
        saveUserData(userData);
        
        // Pulisci le informazioni dell'utente corrente (questo è importante)
        localStorage.removeItem('currentUser');
        
        // Show notification
        showNotification('Logout in corso...');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    });
}

/**
 * Show a notification message
 */
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-900' : 'bg-red-900'
    }`;
    notification.innerHTML = `<p class="text-white">${message}</p>`;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Add CSS for toggle switch if not already in styles.css
document.head.insertAdjacentHTML('beforeend', `
<style>
/* Toggle Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #2b2b2b;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #059669;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* Active nav item */
.account-nav-item.active {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10B981;
}
</style>
`);

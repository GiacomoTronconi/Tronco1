/**
 * Auth Modal Controllers
 * Gestisce l'autenticazione degli utenti, le finestre modali di login/registrazione
 * e la persistenza della sessione
 */
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

        // Event listener per il menu dell'account
        const userMenuBtn = document.getElementById('user-menu-btn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => {
                // Show account dropdown menu
                const accountDropdown = document.getElementById('account-dropdown');
                if (accountDropdown) {
                    accountDropdown.classList.toggle('hidden');
                }
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
        
        // Close login modal
        if (closeLogin && loginModal) {
            closeLogin.addEventListener('click', () => {
                loginModal.classList.add('hidden');
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
        
        // Event listener per il logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // Aggiorna i pulsanti del menu mobile
        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileRegisterBtn = document.getElementById('mobile-register-btn');
        
        if (mobileLoginBtn && loginModal) {
            mobileLoginBtn.addEventListener('click', () => {
                loginModal.classList.remove('hidden');
            });
        }
        
        if (mobileRegisterBtn && registerModal) {
            mobileRegisterBtn.addEventListener('click', () => {
                registerModal.classList.remove('hidden');
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
    
    // Gestisce il logout dell'utente
    handleLogout() {
        // Rimuovi l'utente dal localStorage e dalla classe
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Aggiorna l'interfaccia utente
        this.updateAuthUI();
        
        // Reindirizza alla home page
        const isInPagesDirectory = window.location.pathname.includes('/pages/');
        window.location.href = isInPagesDirectory ? '../index.html' : 'index.html';
    }

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
        
        if (password !== confirmPassword) {
            this.showErrorMessage(errorContainer, 'Le password non corrispondono');
            return;
        }
        
        if (!termsAccepted) {
            this.showErrorMessage(errorContainer, 'Devi accettare i termini e le condizioni');
            return;
        }
        
        try {
            // Chiamata al server per la registrazione
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Se la risposta non è ok, mostra l'errore
                this.showErrorMessage(errorContainer, data.error || 'Errore durante la registrazione');
                return;
            }
            
            // Registrazione riuscita
            const successMessage = document.createElement('div');
            successMessage.className = 'bg-green-900 bg-opacity-70 text-white p-4 rounded-lg mb-4 text-center';
            successMessage.innerHTML = '<i class="fas fa-check-circle mr-2"></i> Registrazione completata con successo!';
            
            const formContainer = document.querySelector('#register-form');
            if (formContainer) {
                formContainer.prepend(successMessage);
            }
            
            // Auto-login dell'utente
            const newUser = data.user;
            newUser.isLoggedIn = true;
            newUser.lastLogin = new Date().toLocaleDateString();
            newUser.loginTime = new Date().toISOString();
            
            // Salva l'utente in localStorage
            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Aggiorna l'interfaccia utente
            this.updateAuthUI();
            
            // Chiudi il modal dopo un breve ritardo
            setTimeout(() => {
                if (registerModal) registerModal.classList.add('hidden');
                if (successMessage) successMessage.remove();
                window.location.reload(); // Ricarica la pagina
            }, 1500);
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            this.showErrorMessage(errorContainer, 'Si è verificato un errore durante la registrazione. Riprova.');
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
    
    // Validate email format
    // @param {string} email - Email to validate
    // @returns {boolean} - True if email is valid
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Esporta la classe AuthModals per l'utilizzo in altri file
if (typeof module !== 'undefined') {
    module.exports = AuthModals;
}

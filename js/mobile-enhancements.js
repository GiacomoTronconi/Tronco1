/**
 * Mobile Experience Enhancements
 * Migliora l'esperienza utente su dispositivi mobili
 */

document.addEventListener('DOMContentLoaded', function() {
    // Collega i pulsanti mobili per login/registrazione
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileLoginBtn && loginModal) {
        mobileLoginBtn.addEventListener('click', () => {
            // Chiudi menu mobile
            if (mobileMenu) mobileMenu.classList.add('hidden');
            // Apri modal login
            loginModal.classList.remove('hidden');
        });
    }
    
    if (mobileRegisterBtn && registerModal) {
        mobileRegisterBtn.addEventListener('click', () => {
            // Chiudi menu mobile
            if (mobileMenu) mobileMenu.classList.add('hidden');
            // Apri modal registrazione
            registerModal.classList.remove('hidden');
        });
    }
    
    // Aggiungi supporto swipe per chiudere il carrello
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        cartSidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        cartSidebar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            // Se lo swipe è da sinistra a destra (almeno 50px)
            if (touchEndX - touchStartX > 50) {
                // Chiudi il carrello
                cartSidebar.style.transform = 'translateX(100%)';
            }
        }
    }
    
    // Migliora l'interazione touch sui pulsanti
    const allButtons = document.querySelectorAll('button, .add-to-cart, a.border');
    allButtons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.97)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

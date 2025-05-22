/**
 * Users Manager
 * Gestisce l'esportazione e l'importazione degli utenti in/da file di testo
 */

class UsersManager {
    constructor() {
        this.init();
    }

    init() {
        // Inizializza i riferimenti ai pulsanti
        this.exportBtn = document.getElementById('export-users-btn');
        this.importFileInput = document.getElementById('import-users-file');

        // Aggiungi event listeners
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportUsers());
        }

        if (this.importFileInput) {
            this.importFileInput.addEventListener('change', (e) => this.importUsers(e));
        }
    }

    /**
     * Esporta tutti gli utenti registrati in un file di testo
     */
    exportUsers() {
        try {
            // Recupera gli utenti dal localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
            
            if (users.length === 0) {
                alert('Non ci sono utenti da esportare.');
                return;
            }

            // Converti gli utenti in formato JSON
            const usersJson = JSON.stringify(users, null, 2);
            
            // Crea un blob con il contenuto JSON
            const blob = new Blob([usersJson], { type: 'application/json' });
            
            // Crea un URL per il blob
            const url = URL.createObjectURL(blob);
            
            // Crea un elemento <a> per il download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users_' + new Date().toISOString().slice(0, 10) + '.txt';
            
            // Aggiungi l'elemento al DOM, esegui il click e rimuovilo
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Rilascia l'URL del blob
            URL.revokeObjectURL(url);
            
            console.log(`${users.length} utenti esportati con successo.`);
        } catch (error) {
            console.error('Errore durante l\'esportazione degli utenti:', error);
            alert('Si è verificato un errore durante l\'esportazione degli utenti.');
        }
    }

    /**
     * Importa utenti da un file di testo
     * @param {Event} event - Evento di input file
     */
    importUsers(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    // Leggi il contenuto del file
                    const content = e.target.result;
                    
                    // Prova a parsare il contenuto come JSON
                    const importedUsers = JSON.parse(content);
                    
                    if (!Array.isArray(importedUsers)) {
                        throw new Error('Il formato del file non è valido. Deve contenere un array di utenti.');
                    }
                    
                    // Recupera gli utenti esistenti
                    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
                    
                    // Mappa per tracciare gli utenti esistenti per username ed email
                    const existingUserMap = new Map();
                    existingUsers.forEach(user => {
                        existingUserMap.set(user.username, user);
                        existingUserMap.set(user.email, user);
                    });
                    
                    // Array per gli utenti da aggiungere e aggiornare
                    const usersToAdd = [];
                    const usersToUpdate = [];
                    
                    // Elabora ogni utente importato
                    importedUsers.forEach(importedUser => {
                        // Verifica se l'utente esiste già
                        const existingUserByUsername = existingUserMap.get(importedUser.username);
                        const existingUserByEmail = existingUserMap.get(importedUser.email);
                        
                        if (existingUserByUsername || existingUserByEmail) {
                            // L'utente esiste già, aggiorna i dati
                            const existingUser = existingUserByUsername || existingUserByEmail;
                            // Mantieni l'ID originale
                            importedUser.id = existingUser.id;
                            usersToUpdate.push(importedUser);
                        } else {
                            // Nuovo utente, assicurati che abbia un ID
                            if (!importedUser.id) {
                                importedUser.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
                            }
                            usersToAdd.push(importedUser);
                        }
                    });
                    
                    // Rimuovi gli utenti da aggiornare dall'array esistente
                    const updatedExistingUsers = existingUsers.filter(user => 
                        !usersToUpdate.some(u => u.id === user.id)
                    );
                    
                    // Crea il nuovo array di utenti
                    const updatedUsers = [
                        ...updatedExistingUsers,
                        ...usersToUpdate,
                        ...usersToAdd
                    ];
                    
                    // Salva gli utenti aggiornati nel localStorage
                    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                    
                    // Reset del campo di input file
                    event.target.value = '';
                    
                    alert(`Importazione completata. Aggiunti: ${usersToAdd.length}, Aggiornati: ${usersToUpdate.length}, Totale: ${updatedUsers.length}`);
                    
                    // Se siamo nella pagina di amministrazione utenti, aggiorna la tabella
                    if (typeof refreshUserTable === 'function') {
                        refreshUserTable();
                    }
                    
                    console.log('Utenti importati con successo:', { 
                        added: usersToAdd.length, 
                        updated: usersToUpdate.length, 
                        total: updatedUsers.length 
                    });
                } catch (parseError) {
                    console.error('Errore nel parsing del file:', parseError);
                    alert('Il file selezionato non contiene dati utente validi. Assicurati di selezionare un file JSON valido.');
                }
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error('Errore durante l\'importazione degli utenti:', error);
            alert('Si è verificato un errore durante l\'importazione degli utenti.');
        }
    }

    /**
     * Aggiorna la tabella degli utenti (deve essere implementata nella pagina account.js)
     */
    static refreshUserTable() {
        // Questa funzione sarà sovrascritta nel file account.js se necessario
        if (window.refreshUserTable && typeof window.refreshUserTable === 'function') {
            window.refreshUserTable();
        }
    }
}

// Inizializza il gestore utenti quando il DOM è caricato
document.addEventListener('DOMContentLoaded', () => {
    new UsersManager();
});

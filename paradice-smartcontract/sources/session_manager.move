module paradice_ludo::session_manager {
    use std::signer;
    use initia_std::timestamp;

    /// Error codes
    const E_SESSION_NOT_FOUND: u64 = 1;
    const E_SESSION_EXPIRED: u64 = 2;
    const E_INVALID_SESSION_KEY: u64 = 3;

    struct SessionKey has key {
        key: address,
        expiry: u64,
    }

    /// Register a session key for the user.
    /// This key will be authorized to make moves for a set duration.
    public entry fun register_session(account: &signer, session_key: address, duration_sec: u64) {
        let addr = signer::address_of(account);
        let expiry = timestamp::now_seconds() + duration_sec;
        
        if (exists<SessionKey>(addr)) {
            let session = borrow_global_mut<SessionKey>(addr);
            session.key = session_key;
            session.expiry = expiry;
        } else {
            move_to(account, SessionKey {
                key: session_key,
                expiry,
            });
        };
    }

    /// Check if the provided signer is the authorized session key for the user.
    public fun is_session_valid(user_addr: address, session_signer_addr: address): bool {
        if (!exists<SessionKey>(user_addr)) return false;
        let session = borrow_global<SessionKey>(user_addr);
        session.key == session_signer_addr && timestamp::now_seconds() < session.expiry
    }

    /// Entry fun for easy frontend check
    public fun check_session(user_addr: address, session_signer_addr: address) acquires SessionKey {
        assert!(exists<SessionKey>(user_addr), E_SESSION_NOT_FOUND);
        let session = borrow_global<SessionKey>(user_addr);
        assert!(session.key == session_signer_addr, E_INVALID_SESSION_KEY);
        assert!(timestamp::now_seconds() < session.expiry, E_SESSION_EXPIRED);
    }
}

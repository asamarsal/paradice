module paradice_ludo::staking_vault {
    use std::signer;
    use initia_std::coin::{Self, Coin};
    use initia_std::initia_coin::InitiaCoin;

    friend paradice_ludo::game_core;

    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;

    struct Vault has key {
        coin: Coin<InitiaCoin>,
        fee_bp: u64, // Basis points (500 = 5%)
        admin: address,
    }

    /// Initialize the vault by the admin.
    public entry fun initialize(admin: &signer, fee_bp: u64) {
        let admin_addr = signer::address_of(admin);
        move_to(admin, Vault {
            coin: coin::zero<InitiaCoin>(),
            fee_bp,
            admin: admin_addr,
        });
    }

    /// Deposit tokens into the vault pool for a game.
    public(friend) fun deposit(player: &signer, amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let deposit_coin = coin::withdraw<InitiaCoin>(player, amount);
        coin::merge(&mut vault.coin, deposit_coin);
    }

    /// Distribute the entire pool to the winner after deducting the platform fee.
    /// The fee remains in the vault or is sent to the admin.
    public(friend) fun distribute_winner(winner_addr: address) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let total_amount = coin::value(&vault.coin);
        
        let fee_amount = (total_amount * vault.fee_bp) / 10000;
        let winner_amount = total_amount - fee_amount;

        let winner_coin = coin::extract(&mut vault.coin, winner_amount);
        coin::deposit(winner_addr, winner_coin);
        
        // Fee remains in the vault for admin to collect later, 
        // or we can deposit it to admin immediately.
        let fee_coin = coin::extract_all(&mut vault.coin);
        coin::deposit(vault.admin, fee_coin);
    }

    /// Admin can collect accumulated fees (if any left in vault)
    public entry fun collect_fees(admin: &signer) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        assert!(signer::address_of(admin) == vault.admin, E_NOT_ADMIN);
        let fees = coin::extract_all(&mut vault.coin);
        coin::deposit(vault.admin, fees);
    }
}

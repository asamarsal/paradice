module paradice_ludo::staking_vault {
    use std::signer;
    use std::vector;
    use initia_std::coin::{Self, Coin};
    use initia_std::initia_coin::InitiaCoin;

    friend paradice_ludo::game_core;

    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INVALID_FEE_BP: u64 = 2;
    const E_ESCROW_NOT_FOUND: u64 = 3;
    const E_ESCROW_EXISTS: u64 = 4;
    const E_ESCROW_NOT_OPEN: u64 = 5;
    const E_ESCROW_EMPTY: u64 = 6;
    const E_INVALID_ESCROW_CONFIG: u64 = 7;

    /// Escrow status constants
    const ESCROW_OPEN: u8 = 0;
    const ESCROW_ACTIVE: u8 = 1;
    const ESCROW_SETTLED: u8 = 2;
    const ESCROW_CANCELLED: u8 = 3;

    /// 5% protocol fee (500 bps)
    const DEFAULT_FEE_BP: u64 = 500;

    struct Escrow has store {
        game_owner: address,
        pot: Coin<InitiaCoin>,
        stake_amount: u64,
        player_count: u8,
        max_players: u8,
        status: u8,
    }

    struct Vault has key {
        admin: address,
        fee_bp: u64,
        escrows: vector<Escrow>,
        accumulated_fees: Coin<InitiaCoin>,
    }

    /// Initialize vault admin and global fee config.
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        move_to(admin, Vault {
            admin: admin_addr,
            fee_bp: DEFAULT_FEE_BP,
            escrows: vector::empty<Escrow>(),
            accumulated_fees: coin::zero<InitiaCoin>(),
        });
    }

    /// Optional admin override for fee bps (bounded to 100%).
    public entry fun set_fee_bp(admin: &signer, fee_bp: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        assert!(signer::address_of(admin) == vault.admin, E_NOT_ADMIN);
        assert!(fee_bp <= 10000, E_INVALID_FEE_BP);
        vault.fee_bp = fee_bp;
    }

    fun find_escrow_index_opt(vault: &Vault, game_owner: address): (bool, u64) {
        let i = 0;
        let len = vector::length(&vault.escrows);
        while (i < len) {
            let escrow = vector::borrow(&vault.escrows, i);
            if (escrow.game_owner == game_owner) {
                return (true, i)
            };
            i = i + 1;
        };
        (false, 0)
    }

    fun borrow_escrow_mut(vault: &mut Vault, game_owner: address): &mut Escrow {
        let (found, idx) = find_escrow_index_opt(vault, game_owner);
        assert!(found, E_ESCROW_NOT_FOUND);
        vector::borrow_mut(&mut vault.escrows, idx)
    }

    fun borrow_escrow(vault: &Vault, game_owner: address): &Escrow {
        let (found, idx) = find_escrow_index_opt(vault, game_owner);
        assert!(found, E_ESCROW_NOT_FOUND);
        vector::borrow(&vault.escrows, idx)
    }

    /// Create or recycle an escrow bucket for one game owner.
    public(friend) fun create_escrow(game_owner: address, stake_amount: u64, max_players: u8) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);

        assert!(stake_amount > 0, E_INVALID_ESCROW_CONFIG);
        assert!(max_players == 2 || max_players == 4, E_INVALID_ESCROW_CONFIG);

        let (found, idx) = find_escrow_index_opt(vault, game_owner);
        if (found) {
            let escrow = vector::borrow_mut(&mut vault.escrows, idx);
            assert!(escrow.status == ESCROW_SETTLED || escrow.status == ESCROW_CANCELLED, E_ESCROW_EXISTS);
            assert!(coin::value(&escrow.pot) == 0, E_ESCROW_EXISTS);
            escrow.stake_amount = stake_amount;
            escrow.player_count = 0;
            escrow.max_players = max_players;
            escrow.status = ESCROW_OPEN;
        } else {
            vector::push_back(&mut vault.escrows, Escrow {
                game_owner,
                pot: coin::zero<InitiaCoin>(),
                stake_amount,
                player_count: 0,
                max_players,
                status: ESCROW_OPEN,
            });
        };
    }

    /// Deposit one player's stake into a specific game escrow.
    public(friend) fun deposit_join(player: &signer, game_owner: address, amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let escrow = borrow_escrow_mut(&mut vault, game_owner);

        assert!(escrow.status == ESCROW_OPEN || escrow.status == ESCROW_ACTIVE, E_ESCROW_NOT_OPEN);
        assert!(amount == escrow.stake_amount, E_INVALID_ESCROW_CONFIG);

        let deposit_coin = coin::withdraw<InitiaCoin>(player, amount);
        coin::merge(&mut escrow.pot, deposit_coin);
        escrow.player_count = escrow.player_count + 1;
    }

    /// Mark escrow as active when room is full.
    public(friend) fun activate_escrow(game_owner: address) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let escrow = borrow_escrow_mut(&mut vault, game_owner);

        assert!(escrow.status == ESCROW_OPEN, E_ESCROW_NOT_OPEN);
        assert!(escrow.player_count == escrow.max_players, E_INVALID_ESCROW_CONFIG);
        escrow.status = ESCROW_ACTIVE;
    }

    /// Cancel a waiting game and refund all joined players.
    public(friend) fun cancel_and_refund(game_owner: address, players: vector<address>) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let escrow = borrow_escrow_mut(&mut vault, game_owner);

        assert!(escrow.status == ESCROW_OPEN, E_ESCROW_NOT_OPEN);

        let i = 0;
        let len = vector::length(&players);
        while (i < len) {
            let player_addr = *vector::borrow(&players, i);
            let refund_coin = coin::extract(&mut escrow.pot, escrow.stake_amount);
            coin::deposit(player_addr, refund_coin);
            i = i + 1;
        };

        escrow.status = ESCROW_CANCELLED;
    }

    /// Settle winner payout and keep protocol fee in treasury.
    public(friend) fun settle_winner(game_owner: address, winner_addr: address) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        let fee_bp = vault.fee_bp;
        let escrow = borrow_escrow_mut(&mut vault, game_owner);

        assert!(escrow.status == ESCROW_ACTIVE, E_ESCROW_NOT_OPEN);

        let total_amount = coin::value(&escrow.pot);
        assert!(total_amount > 0, E_ESCROW_EMPTY);

        let fee_amount = (total_amount * fee_bp) / 10000;
        let winner_amount = total_amount - fee_amount;

        let winner_coin = coin::extract(&mut escrow.pot, winner_amount);
        coin::deposit(winner_addr, winner_coin);

        let fee_coin = coin::extract_all(&mut escrow.pot);
        coin::merge(&mut vault.accumulated_fees, fee_coin);

        escrow.status = ESCROW_SETTLED;
    }

    /// Read-only payout quote for UI.
    public fun quote_settlement(game_owner: address): (u64, u64, u64) acquires Vault {
        let vault = borrow_global<Vault>(@paradice_ludo);
        let escrow = borrow_escrow(&vault, game_owner);

        let total = coin::value(&escrow.pot);
        let fee = (total * vault.fee_bp) / 10000;
        let payout = total - fee;
        (total, fee, payout)
    }

    /// Number of players already funded in escrow.
    public fun player_count(game_owner: address): u8 acquires Vault {
        let vault = borrow_global<Vault>(@paradice_ludo);
        let escrow = borrow_escrow(&vault, game_owner);
        escrow.player_count
    }

    /// Current fee bps config.
    public fun fee_bp(): u64 acquires Vault {
        let vault = borrow_global<Vault>(@paradice_ludo);
        vault.fee_bp
    }

    /// Admin collects accumulated protocol fees.
    public entry fun collect_fees(admin: &signer) acquires Vault {
        let vault = borrow_global_mut<Vault>(@paradice_ludo);
        assert!(signer::address_of(admin) == vault.admin, E_NOT_ADMIN);

        let fees = coin::extract_all(&mut vault.accumulated_fees);
        coin::deposit(vault.admin, fees);
    }
}

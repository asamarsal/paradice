module paradice_ludo::game_core {
    use std::signer;
    use std::vector;
    use initia_std::timestamp;
    use paradice_ludo::session_manager;
    use paradice_ludo::staking_vault;

    /// Game status constants
    const STATUS_WAITING_PLAYERS: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_ENDED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    /// Error codes
    const E_GAME_NOT_FOUND: u64 = 1;
    const E_NOT_PLAYER_TURN: u64 = 2;
    const E_GAME_NOT_ACTIVE: u64 = 3;
    const E_GAME_FULL: u64 = 4;
    const E_INVALID_MOVE: u64 = 5;
    const E_SESSION_INVALID: u64 = 6;
    const E_NOT_CREATOR: u64 = 7;
    const E_INVALID_MAX_PLAYERS: u64 = 8;
    const E_ALREADY_JOINED: u64 = 9;
    const E_GAME_NOT_WAITING: u64 = 10;
    const E_CREATOR_HAS_ACTIVE_GAME: u64 = 11;

    struct Player has store, drop, copy {
        addr: address,
        color: u8,
        pawns: vector<u64>, // 0-57 position
        is_finished: bool,
    }

    struct Game has key {
        id: u64,
        creator: address,
        players: vector<Player>,
        status: u8,
        current_turn: u8,
        max_players: u8,
        stake_amount: u64,
        last_roll: u8,
        last_move_time: u64,
        winner: address,
    }

    /// Minimal registry for game id sequencing.
    struct GameRegistry has key {
        games: vector<u64>,
        counter: u64,
    }

    public entry fun initialize_registry(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @paradice_ludo, E_SESSION_INVALID);

        move_to(admin, GameRegistry {
            games: vector::empty<u64>(),
            counter: 0,
        });
    }

    fun build_new_player(addr: address, color: u8): Player {
        let pawns = vector::empty<u64>();
        let i = 0;
        while (i < 4) {
            vector::push_back(&mut pawns, 0);
            i = i + 1;
        };

        Player {
            addr,
            color,
            pawns,
            is_finished: false,
        }
    }

    fun contains_player(players: &vector<Player>, addr: address): bool {
        let i = 0;
        let len = vector::length(players);
        while (i < len) {
            let player = vector::borrow(players, i);
            if (player.addr == addr) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Create game room and fund creator escrow.
    /// `max_players` supports 2 or 4.
    public entry fun create_game(creator: &signer, stake: u64, max_players: u8) acquires GameRegistry, Game {
        assert!(max_players == 2 || max_players == 4, E_INVALID_MAX_PLAYERS);

        let registry = borrow_global_mut<GameRegistry>(@paradice_ludo);
        let game_id = registry.counter;
        registry.counter = game_id + 1;
        vector::push_back(&mut registry.games, game_id);

        let creator_addr = signer::address_of(creator);

        if (exists<Game>(creator_addr)) {
            let existing = borrow_global<Game>(creator_addr);
            assert!(existing.status != STATUS_WAITING_PLAYERS && existing.status != STATUS_ACTIVE, E_CREATOR_HAS_ACTIVE_GAME);

            let game = borrow_global_mut<Game>(creator_addr);
            game.id = game_id;
            game.creator = creator_addr;
            game.players = vector::empty<Player>();
            vector::push_back(&mut game.players, build_new_player(creator_addr, 0));
            game.status = STATUS_WAITING_PLAYERS;
            game.current_turn = 0;
            game.max_players = max_players;
            game.stake_amount = stake;
            game.last_roll = 0;
            game.last_move_time = timestamp::now_seconds();
            game.winner = @0x0;
        } else {
            let players = vector::empty<Player>();
            vector::push_back(&mut players, build_new_player(creator_addr, 0));

            move_to(creator, Game {
                id: game_id,
                creator: creator_addr,
                players,
                status: STATUS_WAITING_PLAYERS,
                current_turn: 0,
                max_players,
                stake_amount: stake,
                last_roll: 0,
                last_move_time: timestamp::now_seconds(),
                winner: @0x0,
            });
        };

        staking_vault::create_escrow(creator_addr, stake, max_players);
        staking_vault::deposit_join(creator, creator_addr, stake);
    }

    /// Join a waiting game and fund escrow.
    public entry fun join_game(player: &signer, game_creator_addr: address) acquires Game {
        let game = borrow_global_mut<Game>(game_creator_addr);
        assert!(game.status == STATUS_WAITING_PLAYERS, E_GAME_NOT_WAITING);
        assert!(vector::length(&game.players) < (game.max_players as u64), E_GAME_FULL);

        let player_addr = signer::address_of(player);
        assert!(!contains_player(&game.players, player_addr), E_ALREADY_JOINED);

        let color = vector::length(&game.players) as u8;
        vector::push_back(&mut game.players, build_new_player(player_addr, color));

        staking_vault::deposit_join(player, game_creator_addr, game.stake_amount);

        if (vector::length(&game.players) == (game.max_players as u64)) {
            game.status = STATUS_ACTIVE;
            staking_vault::activate_escrow(game_creator_addr);
        };
    }

    /// Creator can cancel before game starts, all funded players are refunded.
    public entry fun cancel_game(creator: &signer) acquires Game {
        let creator_addr = signer::address_of(creator);
        assert!(exists<Game>(creator_addr), E_GAME_NOT_FOUND);

        let game = borrow_global_mut<Game>(creator_addr);
        assert!(game.creator == creator_addr, E_NOT_CREATOR);
        assert!(game.status == STATUS_WAITING_PLAYERS, E_GAME_NOT_WAITING);

        let players_to_refund = vector::empty<address>();
        let i = 0;
        let len = vector::length(&game.players);
        while (i < len) {
            let player = vector::borrow(&game.players, i);
            vector::push_back(&mut players_to_refund, player.addr);
            i = i + 1;
        };

        staking_vault::cancel_and_refund(creator_addr, players_to_refund);

        game.status = STATUS_CANCELLED;
        game.last_roll = 0;
        game.current_turn = 0;
        game.last_move_time = timestamp::now_seconds();
        game.winner = @0x0;
    }

    /// Roll dice - triggered by user OR their valid session key.
    public entry fun roll_dice(account: &signer, game_owner: address) acquires Game {
        let game = borrow_global_mut<Game>(game_owner);
        assert!(game.status == STATUS_ACTIVE, E_GAME_NOT_ACTIVE);

        let caller = signer::address_of(account);
        let current_player = vector::borrow(&game.players, game.current_turn as u64);

        let is_auth = (caller == current_player.addr || session_manager::is_session_valid(current_player.addr, caller));
        assert!(is_auth, E_SESSION_INVALID);

        let roll = ((timestamp::now_microseconds() % 6) as u8) + 1;
        game.last_roll = roll;
        game.last_move_time = timestamp::now_seconds();
    }

    /// Execute one pawn movement.
    public entry fun move_pawn(account: &signer, game_owner: address, pawn_idx: u8) acquires Game {
        let game = borrow_global_mut<Game>(game_owner);
        assert!(game.status == STATUS_ACTIVE, E_GAME_NOT_ACTIVE);

        let caller = signer::address_of(account);
        let current_player_idx = game.current_turn as u64;
        let current_player = vector::borrow_mut(&mut game.players, current_player_idx);

        let is_auth = (caller == current_player.addr || session_manager::is_session_valid(current_player.addr, caller));
        assert!(is_auth, E_SESSION_INVALID);

        let roll = game.last_roll;
        assert!(roll > 0, E_INVALID_MOVE);

        let pawn_pos = vector::borrow_mut(&mut current_player.pawns, pawn_idx as u64);

        if (*pawn_pos == 0) {
            assert!(roll == 6, E_INVALID_MOVE);
            *pawn_pos = 1;
        } else {
            *pawn_pos = *pawn_pos + (roll as u64);
            if (*pawn_pos >= 57) {
                *pawn_pos = 57;
            }
        };

        game.last_roll = 0;

        if (roll != 6) {
            game.current_turn = (game.current_turn + 1) % (vector::length(&game.players) as u8);
        };

        let all_home = true;
        let j = 0;
        while (j < 4) {
            if (*vector::borrow(&current_player.pawns, j) < 57) {
                all_home = false;
                break
            };
            j = j + 1;
        };

        if (all_home) {
            current_player.is_finished = true;
            game.status = STATUS_ENDED;
            game.winner = current_player.addr;
            staking_vault::settle_winner(game_owner, current_player.addr);
        };
    }

    /// UI helper for settlement preview.
    public fun quote_settlement(game_owner: address): (u64, u64, u64) acquires Game {
        let game = borrow_global<Game>(game_owner);
        if (game.status == STATUS_WAITING_PLAYERS || game.status == STATUS_ACTIVE || game.status == STATUS_ENDED) {
            staking_vault::quote_settlement(game_owner)
        } else {
            (0, 0, 0)
        }
    }
}

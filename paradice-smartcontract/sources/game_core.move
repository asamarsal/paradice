module paradice_ludo::game_core {
    use std::signer;
    use std::vector;
    use initia_std::timestamp;
    use paradice_ludo::session_manager;
    use paradice_ludo::staking_vault;

    /// Game status constants
    const STATUS_WAITING: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_ENDED: u8 = 2;

    /// Error codes
    const E_GAME_NOT_FOUND: u64 = 1;
    const E_NOT_PLAYER_TURN: u64 = 2;
    const E_GAME_NOT_ACTIVE: u64 = 3;
    const E_GAME_FULL: u64 = 4;
    const E_INVALID_MOVE: u64 = 5;
    const E_SESSION_INVALID: u64 = 6;

    struct Player has store, drop, copy {
        addr: address,
        color: u8,
        pawns: vector<u64>, // 0-56 position
        is_finished: bool,
    }

    struct Game has key {
        id: u64,
        players: vector<Player>,
        status: u8,
        current_turn: u8,
        stake_amount: u64,
        last_roll: u8,
        last_move_time: u64,
    }

    /// Resource to hold all games (simplified for hackathon with a single Global Game for now or Table)
    struct GameRegistry has key {
        games: vector<u64>, // list of game IDs
        counter: u64,
    }

    /// Initialize the game registry (admin only)
    public entry fun initialize_registry(admin: &signer) {
        assert!(signer::address_of(admin) == @paradice_ludo, E_SESSION_INVALID); // Simple admin check
        move_to(admin, GameRegistry {
            games: vector::empty<u64>(),
            counter: 0,
        });
    }

    /// Create a new game with a specific stake amount
    public entry fun create_game(creator: &signer, stake: u64) acquires GameRegistry {
        let registry = borrow_global_mut<GameRegistry>(@paradice_ludo);
        let game_id = registry.counter;
        registry.counter = game_id + 1;
        vector::push_back(&mut registry.games, game_id);

        let creator_addr = signer::address_of(creator);
        let pawns = vector::empty<u64>();
        let i = 0;
        while (i < 4) {
            vector::push_back(&mut pawns, 0); // All pawns in base (position 0)
            i = i + 1;
        };

        let players = vector::empty<Player>();
        vector::push_back(&mut players, Player {
            addr: creator_addr,
            color: 0, // Blue
            pawns,
            is_finished: false,
        });

        staking_vault::deposit(creator, stake);

        move_to(creator, Game {
            id: game_id,
            players,
            status: STATUS_WAITING,
            current_turn: 0,
            stake_amount: stake,
            last_roll: 0,
            last_move_time: timestamp::now_seconds(),
        });
    }

    /// Join an existing game
    public entry fun join_game(player: &signer, game_creator_addr: address) acquires Game {
        let game = borrow_global_mut<Game>(game_creator_addr);
        assert!(game.status == STATUS_WAITING, E_GAME_NOT_ACTIVE);
        assert!(vector::length(&game.players) < 4, E_GAME_FULL);

        let player_addr = signer::address_of(player);
        let color = (vector::length(&game.players) as u8);
        
        let pawns = vector::empty<u64>();
        let i = 0;
        while (i < 4) {
            vector::push_back(&mut pawns, 0);
            i = i + 1;
        };

        vector::push_back(&mut game.players, Player {
            addr: player_addr,
            color,
            pawns,
            is_finished: false,
        });

        staking_vault::deposit(player, game.stake_amount);

        if (vector::length(&game.players) == 4) {
            game.status = STATUS_ACTIVE;
        };
    }

    /// Roll dice - triggered by user OR their session key
    public entry fun roll_dice(account: &signer, game_owner: address) acquires Game {
        let game = borrow_global_mut<Game>(game_owner);
        assert!(game.status == STATUS_ACTIVE, E_GAME_NOT_ACTIVE);
        
        let caller = signer::address_of(account);
        let current_player = vector::borrow(&game.players, (game.current_turn as u64));
        
        // Authorization: caller is either the player OR their valid session key
        let is_auth = (caller == current_player.addr || session_manager::is_session_valid(current_player.addr, caller));
        assert!(is_auth, E_SESSION_INVALID);

        // Simple pseudo-random for now - in production use Initia VRF
        let roll = ((timestamp::now_microseconds() % 6) as u8) + 1;
        game.last_roll = roll;
        game.last_move_time = timestamp::now_seconds();
    }

    /// Make a move for a pawn
    public entry fun move_pawn(account: &signer, game_owner: address, pawn_idx: u8) acquires Game {
        let game = borrow_global_mut<Game>(game_owner);
        assert!(game.status == STATUS_ACTIVE, E_GAME_NOT_ACTIVE);
        
        let caller = signer::address_of(account);
        let current_player_idx = (game.current_turn as u64);
        let current_player = vector::borrow_mut(&mut game.players, current_player_idx);
        
        let is_auth = (caller == current_player.addr || session_manager::is_session_valid(current_player.addr, caller));
        assert!(is_auth, E_SESSION_INVALID);

        let roll = game.last_roll;
        assert!(roll > 0, E_INVALID_MOVE);

        let pawn_pos = vector::borrow_mut(&mut current_player.pawns, (pawn_idx as u64));
        
        // Move logic
        if (*pawn_pos == 0) {
            assert!(roll == 6, E_INVALID_MOVE);
            *pawn_pos = 1; // Exit base
        } else {
            *pawn_pos = *pawn_pos + (roll as u64);
            if (*pawn_pos >= 57) {
                *pawn_pos = 57; // Finished
            }
        };

        // Reset roll
        game.last_roll = 0;

        // Turn switching (if not 6)
        if (roll != 6) {
            game.current_turn = (game.current_turn + 1) % (vector::length(&game.players) as u8);
        };

        // Check winner
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
            game.status = STATUS_ENDED;
            staking_vault::distribute_winner(current_player.addr);
        };
    }
}

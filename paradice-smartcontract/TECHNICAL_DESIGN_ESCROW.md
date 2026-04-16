# Paradice Escrow Contract Technical Design

## 1. Objective

Implement test-money staking with:
- per-game escrow (no global mixed pot),
- winner-take-all payout minus protocol tax,
- deterministic lifecycle for create/join/cancel/settle/refund.

For current scope, protocol tax is configured in basis points and defaults to `500` (5%).

## 2. Module Boundaries

### `paradice_ludo::game_core`

Owns gameplay state and lifecycle transitions:
- room creation and joins,
- game activation,
- turn/move flow,
- winner detection,
- cancellation (before start),
- settlement trigger.

### `paradice_ludo::staking_vault`

Owns escrow and treasury accounting:
- create per-game escrow bucket,
- accept stake deposits for each joined player,
- refund all on cancellation,
- settle winner and fee split,
- accumulate and collect protocol fees.

`game_core` is the only friend module allowed to mutate escrow.

## 3. Data Model

### `Game` (in `game_core`)

Stored as a resource under creator address (current design).

Core fields:
- `id: u64`
- `creator: address`
- `players: vector<Player>`
- `status: u8` (`WAITING_PLAYERS`, `ACTIVE`, `ENDED`, `CANCELLED`)
- `current_turn: u8`
- `max_players: u8` (2 or 4)
- `stake_amount: u64`
- `last_roll: u8`
- `last_move_time: u64`
- `winner: address`

### `Escrow` (in `staking_vault`)

Stored inside `Vault.escrows` keyed by `game_owner` (creator address).

Core fields:
- `game_owner: address`
- `pot: Coin<InitiaCoin>`
- `stake_amount: u64`
- `player_count: u8`
- `max_players: u8`
- `status: u8` (`OPEN`, `ACTIVE`, `SETTLED`, `CANCELLED`)

### `Vault` (in `staking_vault`)

Global protocol state:
- `admin: address`
- `fee_bp: u64`
- `escrows: vector<Escrow>`
- `accumulated_fees: Coin<InitiaCoin>`

## 4. State Machines

### Game state

1. `WAITING_PLAYERS`
2. `ACTIVE`
3. terminal: `ENDED` or `CANCELLED`

### Escrow state

1. `OPEN`
2. `ACTIVE`
3. terminal: `SETTLED` or `CANCELLED`

Mapping between modules:
- `Game.ACTIVE` must imply `Escrow.ACTIVE`.
- `Game.ENDED` must imply `Escrow.SETTLED`.
- `Game.CANCELLED` must imply `Escrow.CANCELLED`.

## 5. Transaction Flows

## 5.1 `create_game(creator, stake, max_players)`

1. Validate `max_players in {2,4}` and `stake > 0`.
2. Create/reset `Game` in `WAITING_PLAYERS`.
3. `staking_vault.create_escrow(creator_addr, stake, max_players)`.
4. `staking_vault.deposit_join(creator, creator_addr, stake)` as first seat funding.

Result:
- one funded seat in escrow,
- room visible for joins.

## 5.2 `join_game(player, game_creator_addr)`

1. Validate game is `WAITING_PLAYERS`.
2. Validate player not already joined.
3. Add `Player` entry with next color index.
4. `staking_vault.deposit_join(player, game_creator_addr, game.stake_amount)`.
5. If room is full (`players == max_players`):
   - set `Game.ACTIVE`,
   - call `staking_vault.activate_escrow(game_creator_addr)`.

## 5.3 `cancel_game(creator)`

1. Only creator can call.
2. Allowed only when `Game.WAITING_PLAYERS`.
3. Build `vector<address>` from joined players.
4. `staking_vault.cancel_and_refund(game_owner, players)`.
5. Set `Game.CANCELLED`.

Refund behavior:
- each joined player receives exactly `stake_amount`.

## 5.4 `move_pawn(...)` -> winner path -> `settle_winner(...)`

When winner is detected:
1. Set `Game.ENDED`.
2. Set `Game.winner`.
3. `staking_vault.settle_winner(game_owner, winner_addr)`.

Settlement formula:
- `gross_pot = escrow.pot`
- `tax = (gross_pot * fee_bp) / 10000`
- `winner_payout = gross_pot - tax`

Transfer behavior:
- winner receives `winner_payout`,
- tax is merged into `Vault.accumulated_fees`.

## 5.5 `collect_fees(admin)`

1. Only vault admin can call.
2. Extract all from `accumulated_fees`.
3. Deposit to admin account.

## 6. Security Invariants

1. Escrow isolation:
- One escrow bucket per game owner room lifecycle.
- No shared global match pot for active rooms.

2. Stake consistency:
- `deposit_join` requires `amount == escrow.stake_amount`.

3. Lifecycle safety:
- Settle only from `Escrow.ACTIVE`.
- Refund only from `Escrow.OPEN`.
- No settle/refund twice on terminal states.

4. Authorization:
- Turn actions remain restricted to current player or valid session key.
- Cancellation restricted to creator.
- Fee collection restricted to admin.

5. Fee bounded:
- `fee_bp <= 10000`.

## 7. Current Constraint and Next Upgrade

Current storage keeps `Game` under creator address (one active room per creator).
For multi-room per creator and better indexing, next upgrade should move game storage to table/object keyed by `game_id`.

## 8. Frontend Integration Contract

Frontend should call in this sequence:
1. `create_game(stake, max_players)`
2. `join_game(game_owner)`
3. wait until status `ACTIVE`
4. game loop `roll_dice/move_pawn`
5. on end, read `quote_settlement(game_owner)` for display:
   - gross pot
   - tax (5%)
   - winner payout

For test-money UX, display denom as `tUSD` label in UI while using test chain coin underneath.

## 9. Test Matrix (Minimum)

1. `2-player` full flow with winner settlement and 5% fee.
2. `4-player` full flow with winner settlement and 5% fee.
3. cancel before start refunds all joined players.
4. join same player twice fails.
5. settle on non-active escrow fails.
6. collect fees only by admin.

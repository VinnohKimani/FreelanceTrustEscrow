#![no_std]



use soroban_sdk::{contract, contractimpl, storage::Persistent, token, Address, Env, Symbol};

// Storage keys for persisting state parameters on the ledger

const CLIENT: Symbol = Symbol::short("CLIENT");
const FREELANCER: Symbol = Symbol::short("FREE"); // Note: .short() string values have a max length limitation of 9 characters
const ARBITER: Symbol = Symbol::short("ARBITER");
const TOKEN_ID: Symbol = Symbol::short("TOKEN_ID");
const AMOUNT: Symbol = Symbol::short("AMOUNT");
const IS_INITIALIZED: Symbol = Symbol::short("IS_INIT");
const STATUS: Symbol = Symbol::short("STATUS");

#[contract]
pub struct MilestoneEscrow;

#[contractimpl]
impl MilestoneEscrow {
    /// Initializes the contract state and transfers the escrow amount from the client into the contract.
    pub fn initialize(
        env: Env,
        client: Address,
        freelancer: Address,
        arbiter: Address,
        token_id: Address,
        amount: i128,
    ) {
        let storage = env.storage().persistent();
        
        // Assert initialization safety guardrail
        if storage.has(&IS_INITIALIZED) {
            panic!("Contract instance is already initialized!");
        }

        if amount <= 0 {
            panic!("Escrow amount must be greater than zero.");
        }

        // Verify the client is authorizing this initialization call
        client.require_auth();

        // Save metadata parameters locally inside persistent contract memory
        storage.set(&CLIENT, &client);
        storage.set(&FREELANCER, &freelancer);
        storage.set(&ARBITER, &arbiter);
        storage.set(&TOKEN_ID, &token_id);
        storage.set(&AMOUNT, &amount);
        storage.set(&STATUS, &0u32); // 0 = Active/Funded
        storage.set(&IS_INITIALIZED, &true);

        // Instantiates a client interface for the token contract (e.g., Native XLM token contract)
        let token_client = token::Client::new(&env, &token_id);

        // Securely pull the escrow amount from the client's balance directly into this contract's address
        token_client.transfer(&client, &env.current_contract_address(), &amount);
    }

    /// Releases 100% of the held escrow funds directly to the freelancer. Only the Client can execute this.
    pub fn release_funds(env: Env) {
        let storage = env.storage().persistent();
        let client: Address = storage.get(&CLIENT).unwrap();
        let freelancer: Address = storage.get(&FREELANCER).unwrap();
        let token_id: Address = storage.get(&TOKEN_ID).unwrap();
        let amount: i128 = storage.get(&AMOUNT).unwrap();
        let status: u32 = storage.get(&STATUS).unwrap();

        // Enforce access control guardrails
        client.require_auth();
        if status != 0 {
            panic!("Action failed: Escrow state is not active.");
        }

        // Update contract state to prevent re-entrancy or double payouts
        storage.set(&STATUS, &1u32); // 1 = Funds Successfully Released

        // Transfer funds from contract pool directly to the freelancer
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(&env.current_contract_address(), &freelancer, &amount);
    }

    /// Resolves a payment disagreement. Executable solely by the Arbiter.
    /// Funds can be distributed to either the client or freelancer based on performance verification.
    pub fn resolve_dispute(env: Env, pay_to: Address) {
        let storage = env.storage().persistent();
        let arbiter: Address = storage.get(&ARBITER).unwrap();
        let client: Address = storage.get(&CLIENT).unwrap();
        let freelancer: Address = storage.get(&FREELANCER).unwrap();
        let token_id: Address = storage.get(&TOKEN_ID).unwrap();
        let amount: i128 = storage.get(&AMOUNT).unwrap();
        let status: u32 = storage.get(&STATUS).unwrap();

        // Enforce referee access check
        arbiter.require_auth();
        if status != 0 {
            panic!("Action failed: Escrow state is not active.");
        }

        // Fallback constraint check: Ensure payout address belongs to an actual party involved
        if pay_to != client && pay_to != freelancer {
            panic!("Invalid recipient address allocation designated.");
        }

        // Freeze status mutation state
        storage.set(&STATUS, &2u32); // 2 = Arbitrated / Resolved via Dispute

        // Transfer full fund pool to the verified beneficiary party
        let token_client = token::Client::new(&env, &token_id);
        token_client.transfer(&env.current_contract_address(), &pay_to, &amount);
    }

    /// Public read-only helper method for the Next.js UI to quickly ascertain current state metrics
    pub fn get_status(env: Env) -> u32 {
        env.storage().persistent().get(&STATUS).unwrap_or(0u32)
    }
}
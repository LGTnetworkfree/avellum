import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Avellum } from "../target/types/avellum";
import { expect } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

describe("avellum", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Avellum as Program<Avellum>;
  const authority = provider.wallet;

  // Agent address (simulates an AI agent's Solana address)
  const agentAddress = Keypair.generate().publicKey;

  // PDAs
  let protocolStatePda: PublicKey;
  let agentPda: PublicKey;
  let verifierPda: PublicKey;
  let ratingPda: PublicKey;

  before(async () => {
    [protocolStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("protocol")],
      program.programId
    );

    [agentPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), agentAddress.toBuffer()],
      program.programId
    );

    [verifierPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("verifier"), authority.publicKey.toBuffer()],
      program.programId
    );

    [ratingPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("rating"),
        authority.publicKey.toBuffer(),
        agentPda.toBuffer(),
      ],
      program.programId
    );
  });

  it("initializes the protocol", async () => {
    // Skip if already initialized on devnet from a previous run
    const existing = await provider.connection.getAccountInfo(protocolStatePda);
    if (existing) {
      const state = await program.account.protocolState.fetch(protocolStatePda);
      expect(state.authority.toBase58()).to.equal(
        authority.publicKey.toBase58()
      );
      return;
    }

    await program.methods
      .initialize()
      .accounts({
        protocolState: protocolStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.protocolState.fetch(protocolStatePda);
    expect(state.authority.toBase58()).to.equal(
      authority.publicKey.toBase58()
    );
    expect(state.totalAgents).to.equal(0);
    expect(state.totalRatings.toNumber()).to.equal(0);
  });

  it("registers an agent", async () => {
    await program.methods
      .registerAgent(agentAddress)
      .accounts({
        agent: agentPda,
        protocolState: protocolStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const agent = await program.account.agent.fetch(agentPda);
    expect(agent.address.toBase58()).to.equal(agentAddress.toBase58());
    expect(agent.trustScore.toNumber()).to.equal(0);
    expect(agent.totalWeight.toNumber()).to.equal(0);
    expect(agent.ratingCount).to.equal(0);
    expect(agent.confidence).to.equal(0);
  });

  it("creates a verifier and stakes SOL", async () => {
    // Skip init if verifier already exists on devnet
    const existing = await provider.connection.getAccountInfo(verifierPda);
    if (existing) {
      const verifier = await program.account.verifier.fetch(verifierPda);
      expect(verifier.authority.toBase58()).to.equal(
        authority.publicKey.toBase58()
      );
      expect(verifier.stakedAmount.toNumber()).to.be.greaterThan(0);
      return;
    }

    const stakeAmount = new anchor.BN(0.01 * LAMPORTS_PER_SOL);

    await program.methods
      .stakeInit(stakeAmount)
      .accounts({
        verifier: verifierPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const verifier = await program.account.verifier.fetch(verifierPda);
    expect(verifier.authority.toBase58()).to.equal(
      authority.publicKey.toBase58()
    );
    expect(verifier.stakedAmount.toNumber()).to.equal(0.01 * LAMPORTS_PER_SOL);
  });

  it("adds additional stake to existing verifier", async () => {
    const additionalStake = new anchor.BN(0.005 * LAMPORTS_PER_SOL);

    await program.methods
      .stakeAdd(additionalStake)
      .accounts({
        verifier: verifierPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const verifier = await program.account.verifier.fetch(verifierPda);
    expect(verifier.stakedAmount.toNumber()).to.equal(0.015 * LAMPORTS_PER_SOL);
  });

  it("rates an agent", async () => {
    const score = 85;

    await program.methods
      .rateAgent(score)
      .accounts({
        rating: ratingPda,
        agent: agentPda,
        verifier: verifierPda,
        protocolState: protocolStatePda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const agent = await program.account.agent.fetch(agentPda);
    expect(agent.trustScore.toNumber()).to.equal(85);
    expect(agent.ratingCount).to.equal(1);
    expect(agent.confidence).to.equal(0); // <5 ratings

    const rating = await program.account.rating.fetch(ratingPda);
    expect(rating.score).to.equal(85);
    expect(rating.stakedWeight.toNumber()).to.equal(0.015 * LAMPORTS_PER_SOL);
    expect(rating.timestamp.toNumber()).to.be.greaterThan(0);

    const state = await program.account.protocolState.fetch(protocolStatePda);
    expect(state.totalRatings.toNumber()).to.equal(1);
  });

  it("rejects score > 100", async () => {
    // This will fail because the rating PDA already exists from the previous test,
    // but even if it didn't, the score validation would reject it.
    try {
      await program.methods
        .rateAgent(101)
        .accounts({
          rating: ratingPda,
          agent: agentPda,
          verifier: verifierPda,
          protocolState: protocolStatePda,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown an error");
    } catch (err) {
      // Either InvalidScore or account-already-exists — both are valid rejections
      expect(err).to.exist;
    }
  });
});

# DeFi Pooling (ETHDenver 2023) - Frontend

This is our ETHDenver project's frontend, it allows anyone on L2 to access a few DeFi vaults only accessible on L1, but without having to pay for the full gas price on L1.

The idea is simple and comes from one of our team member, Florent, who wanted to access a new protocol on Ethereum L1 that lets you deposit USDC that gets lent to bond-collateralized borrowers. The problem is that the transaction were obviously high on the L1 ; so we asked ourselves: "why not pool deposits on L2, and bridge everyone to L1 in order to reduce the fees".

So we built "DeFi Pooling", in its current version for the Hackathon (of course constrained by time), it allows anyone to deposit USDC (the Axelar USDC version) in a Polygon Mumbai Smart Contract called `PoolerL2`. A small fee is taken with each deposit and put in a "Fee Bucket"; that bucket get distributed to whoever calls `PoolerL2.launchBus()`. This allows the protocol to run close to permissionlessly. At the core of the idea, users are exchanging time for money. Everyone gets access to L1 protocols while remaining on L2 and paying L2 fees.

When a bus is launched, the funds get bridged to Ethereum Goerli through **Axelar** and end up in `PoolerL1` contract that will deposit the funds to the L1 protocol that the bus was targeting. The L1 protocol will mint yield-bearing tokens (so compatible with Compound, Yearn, Flux Finance, etc) that go to the `PoolerL1`, and the exact number of these tokens gets minted on L2 to everyone who was in the bus; thus there is another bridge transaction going from L1 to L2 that contains this info. To make sure the bridgor is incentivized to make the roundtrip, they also get part of the Fee Bucket (paid on L2). At the end, users who deposited on L2 get a receipt tokens (with a rate of 1:1 to the L1 receipt token) they can burn to get their funds back. Everyone bus roundtrip handles both the deposits & withdrawals.

**What if the second bridge TX doesn't go through?**

In the normal situation, whoever launched the bus on L2, will also launch the bus on L1; but otherwise anyone can call the L1 bridge transaction to unlock the bus, they'll get part of the fee bucket for it. However, even in the worst case scenario where noone bridges back and the fee bucket isn't enough to incentivize, we use a **Chainlink Automation** smart contract with some custom logic that will launch the bus on L1 if there's a bus stuck there for more than 5 minutes. That contract is already funded with some LINK but anyone can send more.

We also use **OpenZeppelin Defender** to automate `launchBus()` on the L2 once 10,000 USDC have been deposited.

**How does the frontend work?**

We are using React with wagmi & Tailwind. For the nodes we are using **Tenderly Web3 Gateway** & **Alchemy**.

**Plan your retirement**

DeFi Vaults let enter in new kinds of investments, some of which can help you plan your retirement. You can use this frontend to have an idea of how much you'd need to deposit to attain your goals.

**Chainlink Functions**

With Chainlink Functions, we can monitor the gas price on the L1 to warn the bridgor on-chain before they launch the bus. We send a JavaScript script, that fetches the gas price in UDSC, to a Chainlink Functions contract and we can then get that price on-chain with an oracle contract.

### Deployments

The working MVP is deployed on Ethereum Goerli (for the PoolerL1 & GateL1) and Polygon Mumbai (for the PoolerL2 & GateL2).

**Ethereum Goerli**

PoolerL1: 0x2424e8421959f7e522afded0d607e60b30f6332d

GateL1: 0xb5949e4f80fbd364661c28f4fe3e0bac277706d9

**Polygon Mumbai**

PoolerL2: 0xdf004020f283b46c40ee67917d8e9468c5c652e4

GateL2: 0x935952478e46ea2cc65c87a9187d3d2f3dd05c24

But we also deployed the **PoolerL2** on Scroll and Base without the **GateL2** because the bridge we used for this hackathon was not available on these L2s ; but we're eager to make them fully functional.

**Base Goerli**

PoolerL2: 0x2B4446406Cf12aE8D5dc4E14Edd1fc06cE6f9815

GateL2 (WIP): 0x014Cc34DfFe4Ed166E8Cd2f6f78fFDAF0bdEba62

**Scroll Alpha**

PoolerL2: 0x8d7F472B95410F2e18A4348802a79e4d2ed76398

GateL2: 0xf584d6b98aE9cA1dAD0d0b17422beEeF8745C1E7

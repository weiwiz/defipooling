# DeFi Pooling (ETHDenver 2023) - Frontend

This is our ETHDenver project's frontend, it allows anyone on L2 to access a few DeFi vaults only accessible on L1, but without having to pay for the full gas price on L1.

The idea is simple and comes from one of our team member, Florent, who wanted to access a new protocol on Ethereum L1 that lets you deposit USDC that gets lent to bond-collateralized borrowers. The problem is that the transaction were obviously high on the L1 ; so we asked ourselves: "why not pool deposits on L2, and bridge everyone to L1 in order to reduce the fees".

So we built "DeFi Pooling", in its current version for the Hackathon (of course constrained by time), it allows anyone to deposit USDC (the Axelar USDC version) in a Polygon Mumbai Smart Contract called `PoolerL2`. A small fee is taken with each deposit and put in a "Fee Bucket"; that bucket get distributed to whoever calls `PoolerL2.launchBus()`. This allows the protocol to run close to permissionlessly. At the core of the idea, users are exchanging time for money. Everyone gets access to L1 protocols while remaining on L2 and paying L2 fees.

When a bus is launched, the funds get bridged to Ethereum Goerli through **Axelar** and end up in `PoolerL1` contract that will deposit the funds to the L1 protocol that the bus was targeting. The L1 protocol will mint yield-bearing tokens (so compatible with Compound, Yearn, Flux Finance, etc) that go to the `PoolerL1`, and the exact number of these tokens gets minted on L2 to everyone who was in the bus; thus there is another bridge transaction going from L1 to L2 that contains this info. To make sure the bridgor is incentivized to make the roundtrip, they also get part of the Fee Bucket (paid on L2). At the end, users who deposited on L2 get a receipt tokens (with a rate of 1:1 to the L1 receipt token) they can burn to get their funds back. Everyone bus roundtrip handles both the deposits & withdrawals.

**What if the second bridge TX doesn't go through?**
In the normal situation, whoever launched the bus on L2, will also launch the bus on L1; but otherwise anyone can call the L1 bridge transaction to unlock the bus, they'll get part of the fee bucket for it. However, even in the worst case scenario where noone bridges back and the fee bucket isn't enough to incentivize, we use a **Chainlink Automation** smart contract with some custom logic that will launch the bus on L1 if there's a bus stuck there for more than 5 minutes. That contract is already funded with some LINK but anyone can send more.

**How does the frontend work?**
We are using React with wagmi & Tailwind. For the nodes we are using **Tenderly Web3 Gateway** & **Alchemy**.

**Plan your retirement**
DeFi Vaults let enter in new kinds of investments, some of which can help you plan your retirement. You can use this frontend to have an idea of how much you'd need to deposit to attain your goals.

**Chainlink Functions**
With Chainlink Functions, we can monitor the gas price on the L1 to warn the bridgor on-chain before they launch the bus. We send a JavaScript script, that fetches the gas price in UDSC, to a Chainlink Functions contract and we can then get that price on-chain with an oracle contract.

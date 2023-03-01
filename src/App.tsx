import { useState } from "react";
import "./App.css";
import VaultLine, { VaultInfo } from "./components/VaultLine";
import ActionModal from "./components/ActionModal";
import TokenLine from "./components/TokenLine";
import ConnectButtonWrapper from "./components/ConnectButton";

function App() {
  const [vaults, setVaults] = useState<VaultInfo[]>([
    { asset: "USDC", protocol: "Flux Finance", tvl: "6.98M", apy: 3.56 },
    { asset: "USDT", protocol: "Compound V2", tvl: "143.76M", apy: 2.23 },
  ]);
  const [vault, setVault] = useState<VaultInfo | undefined>(undefined);
  const [balance, setBalance] = useState<number>();

  const sortVaults = (attr: string) => {
    switch (attr) {
      case "asset":
        vaults.sort((a, b) =>
          a.asset > b.asset ? 1 : b.asset > a.asset ? -1 : 0
        );
        break;
      case "protocol":
        vaults.sort((a, b) =>
          a.protocol > b.protocol ? 1 : b.protocol > a.protocol ? -1 : 0
        );
        break;
      case "tvl":
        vaults.sort((a, b) => (a.tvl > b.tvl ? 1 : b.tvl > a.tvl ? -1 : 0));
        break;
      case "apy":
        vaults.sort((a, b) => (a.apy > b.apy ? 1 : b.apy > a.apy ? -1 : 0));
        break;
      default:
        break;
    }
    setVaults([...vaults]);
  };

  return (
    <div className="h-screen bg-[#F2F3F6]">
      <header className="App-header">
        <p className="hidden pt-3 text-center text-3xl md:block">
          DeFi Pooling
        </p>
        <div className="pt-3 text-center">
          <ConnectButtonWrapper />
        </div>
        <section className="m-auto mt-12 rounded-lg border border-gray-300 bg-white shadow-sm md:w-3/5">
          <p className="mt-3 ml-3 text-xl">DeFi Vaults</p>
          <table className="w-full table-auto text-center">
            <thead className="rounded-ld border-b border-black">
              <tr className="text-[#6B6B6B]">
                <th
                  onClick={() => sortVaults("asset")}
                  className="cursor-pointer p-6"
                >
                  Asset
                </th>
                <th
                  onClick={() => sortVaults("protocol")}
                  className="cursor-pointer p-6"
                >
                  Protocol
                </th>
                <th
                  onClick={() => sortVaults("tvl")}
                  className="cursor-pointer p-6"
                >
                  Total
                </th>
                <th
                  onClick={() => sortVaults("apy")}
                  className="cursor-pointer p-6"
                >
                  APY
                </th>
              </tr>
            </thead>
            <tbody>
              {vaults.map((vault) => (
                <VaultLine
                  key={vault.asset + vault.protocol}
                  {...vault}
                  open={() => setVault(vault)}
                />
              ))}
            </tbody>
          </table>
        </section>
        <section className="m-auto mt-12 rounded-lg border border-gray-300 bg-white shadow-sm md:w-3/5">
          <p className="mt-3 ml-3 text-xl">My holdings</p>
          <table className="w-full table-auto text-center">
            <thead className="rounded-ld border-b border-black">
              <tr className="text-[#6B6B6B]">
                <th className="cursor-pointer p-6">Asset</th>
                <th
                  onClick={() => sortVaults("protocol")}
                  className="cursor-pointer p-6"
                >
                  Balance
                </th>
                <th
                  onClick={() => sortVaults("tvl")}
                  className="cursor-pointer p-6"
                >
                  USD Value
                </th>
              </tr>
            </thead>
            <tbody>
              <TokenLine asset="USDC" sendBalance={setBalance} />
            </tbody>
          </table>
        </section>
        <section className="m-auto mt-12 rounded-lg border border-gray-300 bg-white shadow-sm md:w-3/5">
          <p className="mt-3 ml-3 text-xl">Simulate retirement</p>
          <p className="ml-3 mt-3 text-2xl">
            With a balance of {balance} USDC, you can already prepare your
            retirement.
            <br /> Fill the below sentence to have a more precise track to your
            post-work lifestyle.
          </p>
        </section>
        {vault && (
          <ActionModal close={() => setVault(undefined)} vault={vault} />
        )}
      </header>
    </div>
  );
}

export default App;

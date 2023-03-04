import { useEffect, useState } from "react";
import "./App.css";
import VaultLine, { VaultInfo } from "./components/VaultLine";
import ActionModal from "./components/ActionModal";
import TokenLine from "./components/TokenLine";
import ConnectButtonWrapper from "./components/ConnectButton";
import Histogram from "react-chart-histogram";
import { utils } from "ethers";
import { useAccount } from "wagmi";

function App() {
  const { address } = useAccount();
  const [vaults, setVaults] = useState<VaultInfo[]>([
    { asset: "USDC", protocol: "Flux Finance", tvl: "6.98M", apy: 3.56 },
    { asset: "USDT", protocol: "Compound V2", tvl: "143.76M", apy: 2.23 },
  ]);
  const [vault, setVault] = useState<VaultInfo | undefined>(undefined);
  const [balance, setBalance] = useState<string>();
  const [age, setAge] = useState("25");
  const [current, setCurrent] = useState("0");
  const [future, setFuture] = useState("200");
  const [gains, setGains] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  const handleAge = (newAge: string) => {
    if (isNaN(parseInt(newAge))) {
      setAge("");
      return;
    }

    setAge(newAge);
  };

  const handleCurrent = (newCurrent: string) => {
    if (isNaN(parseInt(newCurrent))) {
      setCurrent("");
      return;
    }

    setCurrent(newCurrent);
  };

  const handleFuture = (newFuture: string) => {
    if (isNaN(parseInt(newFuture))) {
      setFuture("");
      return;
    }

    setFuture(newFuture);
  };

  const computeRetirement = (years: number) => {
    // FV = y * ((1 + p/12)^n - 1) * (1 + p/12) / (p/12) + x * (1 + p/12)^n
    const x = parseFloat(current);
    const y = parseFloat(future);
    const n = years * 12;
    const p = vaults[1].apy / 100 / 12;
    const FV =
      ((y * ((1 + p / 12) ^ (n - 1)) * (1 + p / 12)) / (p / 12) +
        x * (1 + p / 12)) ^
      n;
    const futureValue =
      y * (((Math.pow(1 + p, n) - 1) * (1 + p)) / p) + x * Math.pow(1 + p, n);
    console.log(futureValue);
    return futureValue;
  };

  useEffect(() => {
    const newLabels = [];
    const newGains = [];
    for (let i = 30; i <= 60; i = i + 10) {
      console.log("trying ", i);
      if (i - parseInt(age) > 0) {
        newLabels.push(`Age ${i}`);
        newGains.push(computeRetirement(i - parseInt(age)));
      }
    }
    setLabels(newLabels);
    setGains(newGains);
  }, [age, current, future]);

  useEffect(() => {
    if (balance) setCurrent(utils.formatUnits(balance, 6));
  }, [balance]);

  useEffect(() => {
    // Warning: Axelar USDC isn't in the Cypher API, so we're using MATIC
    //          for now even though the user needs Axelar USDC
    //@ts-ignore
    window.Cypher({
      address,
      targetChainIdHex: "0x13881",
      requiredTokenBalance: 0,
      isTestnet: true,
      callBack: () => {
        console.log("callBack called");
      },
    });
  }, [address]);

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
    <div className="h-screen overflow-auto bg-[#F2F3F6]">
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
        <section className="m-auto my-12 rounded-lg border border-gray-300 bg-white shadow-sm md:w-3/5">
          <p className="mt-3 ml-3 text-xl">Simulate retirement</p>
          {balance !== "0" && (
            <p className="ml-3 mt-3 text-2xl">
              With a balance of{" "}
              {balance && utils.formatUnits(balance.toString(), 6)} USDC, you
              can already prepare your retirement.
            </p>
          )}
          <p className="ml-3 mt-3 text-2xl">
            Fill the below sentence to have a more precise track to your
            post-work lifestyle.
          </p>
          <p className="my-3 ml-3 text-2xl">
            I am
            <input
              type="text"
              value={age}
              onChange={(e) => handleAge(e.target.value)}
              className="mx-1 w-8 border-b border-black"
            />
            years old, I can currently invest
            <input
              type="text"
              value={current}
              onChange={(e) => handleCurrent(e.target.value)}
              className="mx-1 w-36 border-b border-black"
            />
            USDC and I can add
            <input
              type="text"
              value={future}
              onChange={(e) => handleFuture(e.target.value)}
              className="mx-1 w-36 border-b border-black"
            />
            USDC every month.
          </p>
          <div className="m-auto w-fit">
            <Histogram
              xLabels={labels}
              yValues={gains}
              width="700"
              height="300"
              options={{ fillColor: "#00FF00", strokeColor: "#FFFFFF" }}
            />
          </div>

          <p className="mt-3 ml-3 text-2xl">
            By investing the the Flux Finance Vault currently yielding 3.56%,
            you'll get this:
          </p>
          <div className="m-auto w-fit text-xl">
            {labels.map((label, index) => (
              <p className="mb-1">
                By {label}, you'll have{" "}
                <span className="font-bold">
                  {gains[index].toFixed(2)} USDC
                </span>
              </p>
            ))}
          </div>
        </section>
        {vault && (
          <ActionModal close={() => setVault(undefined)} vault={vault} />
        )}
      </header>
    </div>
  );
}

export default App;

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { utils } from "ethers";
import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { truncateEthAddress } from "../utils";

const ConnectButtonWrapper = () => {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { disconnect } = useDisconnect();

  if (isConnected && address)
    return (
      <div
        className="top-3 right-5 m-auto w-fit cursor-pointer rounded-lg border border-black px-5 py-2 font-bold text-black md:absolute"
        onClick={() => disconnect()}
      >
        {truncateEthAddress(address)} on {chain?.name}
      </div>
    );
  return (
    <div className="absolute top-3 right-3">
      <ConnectButton />
    </div>
  );
};

export default ConnectButtonWrapper;

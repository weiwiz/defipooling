import { constants, Contract, utils } from "ethers";
import { useEffect, useState } from "react";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
} from "wagmi";
import { VaultInfo } from "./VaultLine";
import PoolerL2ABI from "../abis/PoolerL2.json";

const ActionModal = ({
  close,
  vault,
  balance,
}: {
  close: () => void;
  vault: VaultInfo;
  balance?: string;
}) => {
  const { asset, protocol, tvl, apy } = vault;
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("0");
  const [poolingFee, setPoolingFee] = useState(0);
  const { address } = useAccount();
  const { chain, chains } = useNetwork();
  const { data } = useContractRead({
    address: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, "0x0f5b9D9b2425C0Df9f5936C57656DEd82CdD258e"], // 2nd arg is PoolerL2
    chainId: chain?.id,
  });
  const [allowance, setAllowance] = useState("");

  // Transaction to approve aUSDC
  const { config } = usePrepareContractWrite({
    address: "0x2c852e740B62308c46DD29B982FBb650D063Bd07",
    abi: erc20ABI,
    functionName: "approve",
    args: ["0x0f5b9D9b2425C0Df9f5936C57656DEd82CdD258e", constants.MaxUint256],
  });
  const approve = useContractWrite(config);

  // Transaction to deposit aUSDC
  const prepareDeposit = usePrepareContractWrite({
    address: "0x0f5b9D9b2425C0Df9f5936C57656DEd82CdD258e",
    abi: PoolerL2ABI.abi,
    functionName: "deposit",
    args: [amount === "" ? "0" : utils.parseUnits(amount, 6)],
  });
  const deposit = useContractWrite(prepareDeposit.config);

  // Transaction to wthdraw pUSD (receipt token of Pooler L2)
  const prepareWithdraw = usePrepareContractWrite({
    address: "0x0f5b9D9b2425C0Df9f5936C57656DEd82CdD258e",
    abi: PoolerL2ABI.abi,
    functionName: "cancelDeposit",
    args: [],
  });
  const withdraw = useContractWrite(prepareWithdraw.config);

  const handleInput = (amount: string) => {
    if (Number.isNaN(parseFloat(amount))) {
      setAmount("");
      return;
    }
    setPoolingFee(parseFloat(amount) * 0.005);
    setAmount(amount);
  };

  useEffect(() => {
    if (data) setAllowance(data.toString());
  }, [data]);

  useEffect(() => {
    if (approve.isSuccess) {
      setAllowance("1");
    }
  }, [approve.isSuccess]);

  return (
    <div
      onClick={close}
      className="absolute top-0 left-0 h-screen w-full border border-black bg-[#79797B]/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="m-auto mt-36 w-11/12 rounded-lg bg-white text-center opacity-100 shadow-2xl md:w-2/5 md:min-w-max md:max-w-lg"
      >
        <p className="m-3 border-b border-gray-300 p-3 text-lg font-bold opacity-100">
          {asset}
        </p>
        <div className="flex w-full justify-evenly">
          <p
            className={`cursor-pointer rounded-lg py-2 px-16 hover:bg-gray-300/70 ${
              tab === "deposit" ? "bg-gray-300/70 font-bold" : ""
            }`}
            onClick={() => setTab("deposit")}
          >
            Deposit
          </p>{" "}
          <p
            className={`cursor-pointer rounded-lg py-2 px-16 hover:bg-gray-300/70 ${
              tab === "withdraw" ? "bg-gray-300/70 font-bold" : ""
            }`}
            onClick={() => setTab("withdraw")}
          >
            Withdraw
          </p>{" "}
        </div>

        {allowance !== "0" ? (
          <div>
            <div className="m-auto w-11/12">
              <input
                className="mt-6 w-full rounded-lg border border-gray-300 bg-[#79797B]/20 p-3"
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => handleInput(e.target.value)}
              />
              {balance && (
                <p
                  onClick={() => setAmount(utils.formatUnits(balance, 6))}
                  className="mb-8 cursor-pointer text-right text-sm underline"
                >
                  USDC Balance: {utils.formatUnits(balance, 6)}
                </p>
              )}
            </div>

            <div className="m-auto mt-8 flex w-11/12 justify-between border-t border-gray-300 pt-3 font-bold">
              <p>Current APY</p>
              <p>{apy}%</p>
            </div>
            <div className="m-auto flex w-11/12 justify-between font-bold">
              <p>Pooling fees</p>
              <p>
                {poolingFee} {asset}
              </p>
            </div>
            <button
              onClick={
                tab === "deposit"
                  ? () => deposit.write?.()
                  : () => withdraw.write?.()
              }
              className="my-8 w-11/12 rounded-lg border py-2"
            >
              {tab === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          </div>
        ) : (
          <div>
            <p className="mt-6">
              You need to approve USDC spending on this dapp
            </p>
            <button
              onClick={() => approve.write?.()}
              className="my-8 w-11/12 rounded-lg border py-2"
            >
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionModal;

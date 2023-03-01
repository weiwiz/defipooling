import { useState } from "react";
import { VaultInfo } from "./VaultLine";

const ActionModal = ({
  close,
  vault,
}: {
  close: () => void;
  vault: VaultInfo;
}) => {
  const { asset, protocol, tvl, apy } = vault;
  const [tab, setTab] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [poolingFee, setPoolingFee] = useState(0);

  const handleInput = (amount: string) => {
    if (Number.isNaN(parseFloat(amount))) {
      setAmount("");
      return;
    }
    setPoolingFee(parseFloat(amount) * 0.005);
    setAmount(amount);
  };

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

        <div className="m-auto w-11/12">
          <input
            className="mt-6 w-full rounded-lg border border-gray-300 bg-[#79797B]/20 p-3"
            type="text"
            placeholder="0"
            value={amount}
            onChange={(e) => handleInput(e.target.value)}
          />
          <p className="mb-8 cursor-pointer text-right text-sm underline">
            DAI Balance: 42
          </p>
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

        <button className="my-8 w-11/12 rounded-lg border py-2">
          {tab === "deposit" ? "Deposit" : "Withdraw"}
        </button>
      </div>
    </div>
  );
};

export default ActionModal;

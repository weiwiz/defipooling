import axios from "axios";
import { utils } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useNetwork,
  useSendTransaction,
} from "wagmi";
import { erc20ABI } from "wagmi";
import tokens from "../tokens.json";

interface ITokenLine {
  asset: string;
  sendBalance: (balance: string) => void;
}

interface Token {
  name: string;
  chains: any;
}

const getTokenFromName = (name: string): Token | undefined => {
  return tokens.find((token: Token) => token.name === name);
};

const TokenLine = ({ asset, sendBalance }: ITokenLine) => {
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>("");

  useEffect(() => {
    if (balance) sendBalance(balance);
  }, [balance]);

  useEffect(() => {
    getBalanceFromCovalent();
  }, [address]);

  const getBalanceFromCovalent = async () => {
    const res = await axios.get(
      `https://api.covalenthq.com/v1/matic-mumbai/address/${address}/balances_v2/?key=${process
        .env.REACT_APP_COVALENT_API!}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    setBalance(res.data.data.items[1].balance);
  };

  return (
    <tr className="cursor-pointer border-b border-gray-300 font-bold hover:bg-[#F2F3F6]">
      <td className="p-6">{asset}</td>
      <td className="p-4">{balance && utils.formatUnits(balance, 6)}</td>
      <td className="p-4">${balance && utils.formatUnits(balance, 6)}</td>
    </tr>
  );
};

export default TokenLine;

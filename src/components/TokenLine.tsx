import { utils } from "ethers";
import { useEffect } from "react";
import { useAccount, useContractRead, useNetwork } from "wagmi";
import { erc20ABI } from "wagmi";
import tokens from "../tokens.json";

interface ITokenLine {
  asset: string;
  sendBalance: (balance: number) => void;
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
  const { chain, chains } = useNetwork();
  const { data, error, isLoading } = useContractRead({
    address: getTokenFromName(asset)?.chains[chain?.id!],
    abi: erc20ABI,
    functionName: "balanceOf",
    args: [address!],
    chainId: chain?.id,
  });

  useEffect(() => {
    if (data) sendBalance(parseFloat(utils.formatUnits(data.toString())));
  }, [data]);

  return (
    <tr className="cursor-pointer border-b border-gray-300 font-bold hover:bg-[#F2F3F6]">
      <td className="p-6">{asset}</td>
      <td className="p-4">{data?.toString()}</td>
      <td className="p-4">${data?.toString()}</td>
    </tr>
  );
};

export default TokenLine;

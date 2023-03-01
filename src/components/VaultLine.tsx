import React, { FC } from "react";

export interface VaultInfo {
  asset: string;
  protocol: string;
  tvl: string;
  apy: number;
}

interface IVaultLine extends VaultInfo {
  open: () => void;
}

const VaultLine = ({ asset, protocol, tvl, apy, open }: IVaultLine) => {
  return (
    <tr onClick={open} className="cursor-pointer font-bold hover:bg-[#F2F3F6]">
      <td className="p-6">{asset}</td>
      <td className="p-4">{protocol}</td>
      <td className="p-4">${tvl}</td>
      <td className="p-4">{apy}%</td>
    </tr>
  );
};

export default VaultLine;

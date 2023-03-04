import React, { FC } from "react";

export interface VaultInfo {
  asset: string;
  protocol: string;
  tvl: string;
  apy: number;
  active: boolean;
}

interface IVaultLine extends VaultInfo {
  open: () => void;
}

const VaultLine = ({ asset, protocol, tvl, apy, open, active }: IVaultLine) => {
  return (
    <tr
      onClick={active ? open : () => {}}
      className={`${
        active ? "cursor-pointer" : ""
      } font-bold hover:bg-[#F2F3F6]`}
    >
      <td className="p-6">
        {asset} ({active ? "Active" : "Inactive"})
      </td>
      <td className="p-4">{protocol}</td>
      <td className="p-4">${tvl}</td>
      <td className="p-4">{apy}%</td>
    </tr>
  );
};

export default VaultLine;

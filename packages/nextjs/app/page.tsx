"use client";

import { useState } from "react";
import { Channel } from "./_components/Channel";
import { Join } from "./_components/Join";
import { People } from "./_components/People";
import type { NextPage } from "next";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useOpenChannel } from "~~/hooks/useOpenChannel";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "keys", args: [address] });
  const [other, setOther] = useState<Address>();
  const opening = useOpenChannel();

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {!address || !key ? (
        <Join />
      ) : other ? (
        <Channel me={address} other={other} onBack={() => setOther(undefined)} {...opening} />
      ) : (
        <People
          me={address}
          onPick={user => {
            setOther(user);
            opening.open(address, user);
          }}
        />
      )}
    </div>
  );
};

export default Home;

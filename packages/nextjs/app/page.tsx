"use client";

import { useState } from "react";
import { Channel } from "./_components/Channel";
import { Join } from "./_components/Join";
import { JoinChannel } from "./_components/JoinChannel";
import { PasteKey } from "./_components/PasteKey";
import { People } from "./_components/People";
import { Restore } from "./_components/Restore";
import type { NextPage } from "next";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useJoinChannel } from "~~/hooks/useJoinChannel";
import { useOpenChannel } from "~~/hooks/useOpenChannel";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "keys", args: [address] });
  const [other, setOther] = useState<Address>();
  const opening = useOpenChannel();
  const { joining, join, leave } = useJoinChannel(key ? address : undefined);
  const [pastedKey, setPastedKey] = useState("");

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {!address || !key ? (
        <Join />
      ) : joining ? (
        <JoinChannel
          {...joining}
          me={address}
          onBack={() => {
            leave();
            setOther(undefined);
          }}
          onReply={() => {
            leave();
            setOther(joining.from);
            opening.open(address, joining.from);
          }}
        />
      ) : other ? (
        <Channel me={address} other={other} onBack={() => setOther(undefined)} {...opening} />
      ) : (
        <>
          <People
            me={address}
            onPick={user => {
              setPastedKey("");
              if (pastedKey) return join(user, pastedKey);
              setOther(user);
              opening.open(address, user);
            }}
          />
          <PasteKey value={pastedKey} onChange={setPastedKey} />
          <Restore me={address} {...opening} />
        </>
      )}
    </div>
  );
};

export default Home;

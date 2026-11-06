"use client";

import { useState } from "react";
import { Chat } from "./_components/Chat";
import { PasteKey } from "./_components/PasteKey";
import { People } from "./_components/People";
import { Register } from "./_components/Register";
import { Restore } from "./_components/Restore";
import type { NextPage } from "next";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useJoinChannel } from "~~/hooks/useJoinChannel";
import { useOpenChannel } from "~~/hooks/useOpenChannel";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "userKeys", args: [address] });
  const registered = !!key && key !== "0x";
  const [other, setOther] = useState<Address>();
  const { step, restored, restore } = useOpenChannel();
  const { joining, join, leave } = useJoinChannel(registered ? address : undefined);
  const [pastedKey, setPastedKey] = useState("");
  const person = joining?.from ?? other;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      {!address || !registered ? (
        <Register />
      ) : person ? (
        <Chat
          // A join starts Chat afresh, so it celebrates even after you said hi.
          key={joining ? `${person}:joining` : person}
          me={address}
          other={person}
          joining={joining}
          onBack={() => {
            leave();
            setOther(undefined);
          }}
        />
      ) : (
        <>
          <People
            me={address}
            onPick={user => {
              setPastedKey("");
              if (pastedKey) join(user, pastedKey);
              else setOther(user);
            }}
          />
          <PasteKey value={pastedKey} onChange={setPastedKey} />
          <Restore me={address} step={step} restored={restored} restore={restore} />
        </>
      )}
    </div>
  );
};

export default Home;

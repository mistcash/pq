"use client";

import { useEffect, useState } from "react";
import { Chat } from "./_components/Chat";
import { Landing } from "./_components/Landing";
import { People } from "./_components/People";
import { Register } from "./_components/Register";
import { Restore } from "./_components/Restore";
import type { NextPage } from "next";
import type { Address } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useOpenChannel } from "~~/hooks/useOpenChannel";
import { startProver } from "~~/utils/crypto";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "userKeys", args: [address] });
  const [other, setOther] = useState<Address>();
  const { step, restored, restore } = useOpenChannel();
  // Loads the prover in the background now, so opening a Channel only waits for the proof itself.
  useEffect(() => void startProver(), []);

  return (
    <>
      <div className="w-full max-w-md mx-auto px-4 py-8">
        {/* Join only once the chain says you haven't: it makes a new passkey and replaces your User Key. */}
        {!address || key === "0x" ? (
          <Register />
        ) : !key ? (
          <span className="loading loading-dots loading-lg block mx-auto" />
        ) : other ? (
          <Chat key={other} me={address} other={other} onBack={() => setOther(undefined)} />
        ) : (
          <>
            <People me={address} onPick={setOther} />
            <Restore me={address} step={step} restored={restored} restore={restore} />
          </>
        )}
      </div>
      <Landing />
    </>
  );
};

export default Home;

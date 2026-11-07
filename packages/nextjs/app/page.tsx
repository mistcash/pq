"use client";

import { useEffect, useState } from "react";
import { Chat } from "./_components/Chat";
import { HowItWorks, Landing } from "./_components/Landing";
import { People } from "./_components/People";
import { Register } from "./_components/Register";
import { Restore } from "./_components/Restore";
import type { NextPage } from "next";
import { type Address, zeroHash } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useOpenChannel } from "~~/hooks/useOpenChannel";
import { startProver } from "~~/utils/crypto";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({
    contractName: "PqMsg",
    functionName: "userKeyHashes",
    args: [address],
  });
  const [other, setOther] = useState<Address>();
  const { step, restored, restore } = useOpenChannel();
  // Loads the prover in the background now, so opening a Channel only waits for the proof itself.
  useEffect(() => void startProver(), []);
  // Join only once the chain says you haven't: it makes a new passkey and replaces your User Key.
  const joining = !address || key === zeroHash;

  return (
    <>
      {/* The first screen, and a snap point, so the page stays on the app while it loads. */}
      <section className="snap-start min-h-[calc(100svh-4rem)] flex flex-col items-center gap-8 px-4 py-8">
        {/* The Join card sits mid-screen; the app sits up top, so it doesn't jump as chats load. */}
        <div className={`w-full max-w-md ${joining ? "my-auto" : "mb-auto"}`}>
          {joining ? (
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
        <HowItWorks />
      </section>
      <Landing />
    </>
  );
};

export default Home;

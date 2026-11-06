"use client";

import { useState } from "react";
import { PROGRESS } from "./Chat";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Avatar } from "~~/components/Avatar";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { type UnlockStep, useSenderKey } from "~~/hooks/useSenderKey";
import { loadCrypto } from "~~/utils/crypto";
import { friendlyMessage } from "~~/utils/friendly";
import { notification } from "~~/utils/scaffold-eth";

const FRIENDS = ["0x01", "0x02", "0x05"].map(n => n.padEnd(42, "0"));

/** Connect, then register with one tap and a signature, which unlocks your User Key. */
export const Register = () => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "PqMsg" });
  const [step, setStep] = useState<"start" | UnlockStep>();
  const senderKey = useSenderKey(setStep);

  const join = async () => {
    setStep("start");
    try {
      const userKey = (await loadCrypto()).userKey(await senderKey(address!));
      setStep(undefined);
      // The transactor shows its own errors.
      await writeContractAsync({ functionName: "register", args: [userKey] }).catch(() => undefined);
    } catch (e) {
      notification.error(friendlyMessage(e));
    }
    setStep(undefined);
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-8 items-center text-center gap-5">
      {address ? (
        <Avatar address={address} size={128} />
      ) : (
        <div className="flex -space-x-5">
          {FRIENDS.map((friend, i) => (
            <div key={friend} className={`rounded-full ring-4 ring-base-100 ${i === 1 ? "-translate-y-3" : ""}`}>
              <Avatar address={friend} size={88} />
            </div>
          ))}
        </div>
      )}
      <div>
        <h1 className="text-4xl font-bold m-0">{address ? "Hi, it's you!" : "pqmsg"}</h1>
        <p className="text-lg text-base-content/70 mb-0">
          {step
            ? PROGRESS[step]
            : address
              ? "Join so people can find you and message you."
              : "Tiny private messages, from you to anyone."}
        </p>
      </div>
      {address ? (
        <button className="btn btn-primary btn-lg btn-block" disabled={!!step || isMining} onClick={join}>
          {step || isMining ? <span className="loading loading-dots" /> : "Join"}
        </button>
      ) : (
        <button className="btn btn-primary btn-lg btn-block" onClick={openConnectModal}>
          Connect wallet
        </button>
      )}
    </div>
  );
};

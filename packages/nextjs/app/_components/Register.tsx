"use client";

import { useEffect, useState } from "react";
import { PROGRESS } from "./Chat";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Avatar } from "~~/components/Avatar";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { storeUserKey } from "~~/hooks/useFixedSender";
import { useSenderKey } from "~~/hooks/useSenderKey";
import { recordEntity, recordTx } from "~~/services/store/deepDive";
import { loadCrypto } from "~~/utils/crypto";
import { friendlyMessage } from "~~/utils/friendly";
import { passkeyProblem } from "~~/utils/passkey";
import { notification } from "~~/utils/scaffold-eth";

const FRIENDS = ["0x01", "0x02", "0x05"].map(n => n.padEnd(42, "0"));
const PERKS = ["🔒 Post-quantum", "🌍 On Ethereum", "🙈 The chain can't see who's talking"];

/** Connect, then register with one tap and a new passkey, which makes your User Key. */
export const Register = () => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "PqMsg" });
  const [step, setStep] = useState<"start" | "passkey">();
  const { join: newSenderKey } = useSenderKey(setStep);
  const [problem, setProblem] = useState<string>();
  // Says so up front when this browser can't make the passkey Join needs.
  useEffect(() => void passkeyProblem().then(setProblem, () => undefined), []);

  const join = async () => {
    setStep("start");
    try {
      // Before anything else, while the tap still counts: Safari only shows passkey prompts straight after one.
      const senderKey = await newSenderKey(address!);
      const userKey = (await loadCrypto()).userKey(senderKey);
      setStep(undefined);
      // The transactor shows its own errors.
      const tx = await writeContractAsync({ functionName: "register", args: [userKey], account: address }).catch(
        () => undefined,
      );
      if (tx) {
        recordTx("unlock", tx);
        // Your key goes on Arkiv once its hash is on-chain (ADR-0005).
        const entity = await storeUserKey(address!, userKey);
        if (entity) recordEntity("unlock", entity);
      }
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
        <h1 className={`font-bold m-0 ${address ? "text-4xl" : "text-6xl"}`}>{address ? "Hi, it's you!" : "pq"}</h1>
        <p className="text-lg text-base-content/70 text-balance mb-0">
          {step
            ? PROGRESS[step]
            : address
              ? (problem ?? "Join so people can find you and message you.")
              : "Scalable, post-quantum cryptographic messaging for private payments and peer coordination."}
        </p>
      </div>
      {address ? (
        <button className="btn btn-primary btn-lg btn-block" disabled={!!step || isMining || !!problem} onClick={join}>
          {step || isMining ? <span className="loading loading-dots" /> : "Join"}
        </button>
      ) : (
        <>
          <button className="btn btn-primary btn-lg btn-block" onClick={openConnectModal}>
            Connect wallet
          </button>
          <ul className="flex flex-wrap justify-center gap-2 m-0 p-0 text-sm">
            {PERKS.map(perk => (
              <li key={perk} className="rounded-full bg-base-200 px-3 py-1">
                {perk}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

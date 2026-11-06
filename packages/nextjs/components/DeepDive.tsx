"use client";

import { useEffect, useState } from "react";
import { TxLink } from "~~/components/TxLink";
import { type DiveStep, type DiveValues, VALUES, useDeepDive } from "~~/services/store/deepDive";

type Layer = "Browser" | "Circuit" | "Chain" | "Watch out";

const LAYERS: Record<Layer, string> = { Browser: "💻", Circuit: "🧮", Chain: "⛓️", "Watch out": "⚠️" };
const WHERE = { secret: "🔒 secret", browser: "💻 your browser", chain: "🌍 on-chain" };

const STEPS: { step: DiveStep; title: string; what: string; notes: [Layer, string][] }[] = [
  {
    step: "unlock",
    title: "Join & unlock",
    what: "Your Password and a wallet signature make your Sender Key, the one secret every other key comes from. Joining puts the public half of a key pair made from it, your User Key, on-chain.",
    notes: [
      [
        "Browser",
        "Argon2id stretches your Password with 64 MiB of memory, salted with the signature. Poseidon2 hashes both into your Sender Key, which seeds a Kyber512 key pair. It all runs in Go, compiled to WASM.",
      ],
      [
        "Chain",
        "Joining calls register(User Key) from your own wallet, so anyone can see that your address joined, and its 800-byte User Key. That's what lets people encrypt to you.",
      ],
      [
        "Watch out",
        "Your Sender Key lives only in this tab's memory, and your Password is never stored or sent. There's no reset. Your wallet's public key is on-chain now, and your Password is what stops a future quantum computer from re-deriving your keys from it.",
      ],
    ],
  },
  {
    step: "open",
    title: "Say hi",
    what: "Your browser makes a Channel Key just for them, encrypts it to their User Key, and proves the encryption is honest without saying who it's for.",
    notes: [
      [
        "Browser",
        "Channel Key = H(Sender Key, their User Index). Kyber512, which is post-quantum, encrypts it to their User Key, and a Groth16 proof is made right here.",
      ],
      [
        "Circuit",
        "Proves the Encrypted Channel Key encrypts the Channel Key behind the Channel Key Hash. Their User Key is a private input, so the proof doesn't reveal whose key it was.",
      ],
      [
        "Chain",
        "The Fixed Sender calls openChannel, so your address isn't on it. The Verifier checks the proof, and PqMsg stores the Channel Key Hash, Encrypted Channel Key and Encrypted Sender. Nothing names either of you.",
      ],
      [
        "Watch out",
        "Fetching their User Key asks your RPC provider for it by address, so the provider could tell who you're about to message. The Fixed Sender is our server: it can't read anything, but it sees your IP and when you send. The Groth16 setup is dev-only, and Groth16 isn't post-quantum, so whoever ran the setup, or a quantum computer, could forge proofs. That allows junk Channels, not reading yours.",
      ],
    ],
  },
  {
    step: "send",
    title: "Send",
    what: "Each message gets its own Message Key. Hashes of it hide the message's two halves, and it's filed under a Message ID that nobody else can link to your Channel.",
    notes: [
      [
        "Browser",
        "Message Key = H(Channel Key, Message Index), and Message ID = H(Message Key, 0). Each 31-byte half plus H(Message Key, 1 or 2) gives a Ciphertext Element.",
      ],
      ["Circuit", "None yet: in Phase 1, messages are encrypted outside the circuit."],
      [
        "Chain",
        "The Fixed Sender calls post(Message ID, Ciphertext Elements), so your address isn't on it. They stay in a public mapping forever.",
      ],
      ["Watch out", "Hash-and-add is a simple one-time pad from Poseidon2, not a standard authenticated cipher."],
    ],
  },
  {
    step: "find",
    title: "Find my chats",
    what: "Your browser rebuilds every Channel you opened, and tries to decrypt every Channel on-chain to find the ones opened to you.",
    notes: [
      [
        "Browser",
        "It rebuilds your Channel Key for each User Index and looks for its hash. Then it decrypts every Encrypted Channel Key with your Kyber512 secret key. Only Channels opened to you give back a Channel Key that matches, and their Encrypted Sender says who opened them.",
      ],
      ["Chain", "It only reads, and it downloads every User and Channel, so the reads don't say which ones are yours."],
      [
        "Watch out",
        "Reading messages asks for specific Message IDs, so your RPC provider could tie those reads to your IP. Found Channel Keys are kept unencrypted in this browser's storage.",
      ],
    ],
  },
];

/** Turns deep dive mode on and off, remembered in this browser. */
export const DeepDiveToggle = () => {
  const on = useDeepDive(state => state.on);
  useEffect(() => {
    useDeepDive.persist.rehydrate();
  }, []);

  return (
    <button
      className={`btn btn-sm px-2 ${on ? "btn-primary btn-soft" : "btn-ghost"}`}
      aria-label="Deep dive"
      aria-pressed={on}
      onClick={() => useDeepDive.setState({ on: !on })}
    >
      🤿 <span className="hidden sm:inline">Deep dive</span>
    </button>
  );
};

/** What each step did under the hood, with this session's real values: a sidebar on desktop, below the page on phones. */
export const DeepDive = () => {
  const { on, steps } = useDeepDive();
  if (!on) return null;

  return (
    <aside className="flex flex-col gap-4 px-4 py-6 border-t border-base-300 bg-base-200 lg:w-[26rem] lg:shrink-0 lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <div>
        <h2 className="text-2xl font-bold m-0">🤿 Deep dive</h2>
        <p className="text-base-content/70 m-0">What each step just did, with your real values.</p>
      </div>
      {STEPS.map(({ step, title, what, notes }) => (
        <details key={step} open className="card bg-base-100 border border-base-300 p-4">
          <summary className="text-lg font-semibold cursor-pointer">{title}</summary>
          <div className="flex flex-col gap-3 mt-3">
            <p className="m-0">{what}</p>
            {steps[step] ? (
              <Values values={steps[step]} />
            ) : (
              <p className="text-sm text-base-content/70 m-0">Do this step to see your values here.</p>
            )}
            <ul className="flex flex-col gap-2 m-0 p-0 list-none text-sm">
              {notes.map(([layer, text]) => (
                <li key={layer}>
                  <span className="font-semibold">
                    {LAYERS[layer]} {layer}:
                  </span>{" "}
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ))}
    </aside>
  );
};

const Values = ({ values }: { values: DiveValues }) => (
  <dl className="flex flex-col gap-2 m-0 p-3 rounded-box bg-base-200">
    {(Object.keys(VALUES) as (keyof typeof VALUES)[]).map(name => {
      const value = values[name];
      return value && <Value key={name} name={name} value={value} />;
    })}
  </dl>
);

/** One value, labelled with where it lives. Secrets show a short prefix until tapped. */
const Value = ({ name, value }: { name: keyof typeof VALUES; value: string }) => {
  const [label, where] = VALUES[name];
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="flex items-center justify-between gap-2 text-sm font-semibold">
        {label}
        <span className={`badge badge-sm badge-soft ${where === "secret" ? "badge-warning" : ""}`}>
          {where === "secret" && shown ? "🔒 don't share" : WHERE[where]}
        </span>
      </dt>
      <dd className="m-0">
        {where === "secret" ? (
          <button
            className="font-mono text-xs text-left break-all cursor-pointer"
            aria-label={shown ? `Hide ${label}` : `Reveal ${label}`}
            onClick={() => setShown(!shown)}
          >
            {shown ? value : `${value.slice(0, 10)}… tap to reveal`}
          </button>
        ) : (
          <code className="block font-mono text-xs break-all max-h-24 overflow-y-auto">{value}</code>
        )}
        {name === "tx" && <TxLink hash={value} />}
      </dd>
    </div>
  );
};

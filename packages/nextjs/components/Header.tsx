"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { DeepDiveToggle } from "~~/components/DeepDive";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { isConnected } = useAccount();
  const pathname = usePathname();
  // The landing card has its own Connect button.
  const showConnect = isConnected || pathname !== "/";

  return (
    <div className="sticky top-0 navbar bg-base-100 min-h-16 shrink-0 justify-between z-20 border-b border-base-300 px-4">
      <Link href="/" className="rounded-xl">
        <Image src="/logo.svg" alt="pq" width={40} height={40} className="rounded-xl" priority />
      </Link>
      <div className="flex items-center gap-1">
        <DeepDiveToggle />
        {showConnect && <RainbowKitCustomConnectButton />}
        {isLocalNetwork && <FaucetButton />}
        {isLocalNetwork && (
          <Link href="/debug" className="btn btn-ghost btn-sm px-2" aria-label="Debug">
            <BugAntIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
};

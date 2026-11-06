import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

/** Links a transaction this browser sent on the block explorer, to see how little it gives away. Nothing on a local chain. */
export const TxLink = ({ hash, className = "" }: { hash?: string; className?: string }) => {
  const { targetNetwork } = useTargetNetwork();
  const href = hash && getBlockExplorerTxLink(targetNetwork.id, hash);
  return href ? (
    <a
      className={`link link-hover inline-flex items-center gap-1 text-sm text-base-content/70 ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      See it on Etherscan <ArrowTopRightOnSquareIcon className="h-4 w-4" />
    </a>
  ) : null;
};

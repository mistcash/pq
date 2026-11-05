"use client";

import { Join } from "./_components/Join";
import { People } from "./_components/People";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address } = useAccount();
  const { data: key } = useScaffoldReadContract({ contractName: "PqMsg", functionName: "keys", args: [address] });

  return <div className="w-full max-w-md mx-auto px-4 py-8">{address && key ? <People me={address} /> : <Join />}</div>;
};

export default Home;

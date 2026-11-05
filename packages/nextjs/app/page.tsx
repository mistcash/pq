"use client";

import { Join } from "./_components/Join";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8">
      <Join />
    </div>
  );
};

export default Home;

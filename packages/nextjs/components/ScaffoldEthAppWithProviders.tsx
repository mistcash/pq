"use client";

import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Avatar } from "~~/components/Avatar";
import { DeepDive } from "~~/components/DeepDive";
import { Header } from "~~/components/Header";
import { PasswordPrompt } from "~~/components/PasswordPrompt";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className={`flex flex-col min-h-screen `}>
        <Header />
        <main className="relative flex flex-col lg:flex-row flex-1 overflow-x-clip">
          <div className="flex flex-col flex-1 min-w-0">{children}</div>
          <DeepDive />
        </main>
      </div>
      <Toaster />
      <PasswordPrompt />
    </>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider avatar={Avatar} theme={lightTheme({ accentColor: "#0052FF", borderRadius: "large" })}>
          <ProgressBar height="3px" color="#0052FF" />
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

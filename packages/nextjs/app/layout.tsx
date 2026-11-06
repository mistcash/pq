import { Fredoka } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "pq",
  description: "Scalable, post-quantum cryptographic messaging for private payments and peer coordination.",
});

const fredoka = Fredoka({ subsets: ["latin"] });

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`scroll-smooth snap-y snap-proximity scroll-pt-16 ${fredoka.className}`}
    >
      <body>
        <ThemeProvider forcedTheme="light">
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;

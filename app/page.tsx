"use client";

import dynamic from "next/dynamic";

const PortfolioClient = dynamic(() => import("../components/PortfolioClient"), {
  ssr: false,
  loading: () => (
    <main className="site-loader" aria-label="Loading portfolio">
      <span>YZ</span>
      <i />
    </main>
  ),
});

export default function Page() {
  return <PortfolioClient />;
}

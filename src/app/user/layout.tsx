import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apotek Roxy - Customer Display",
  description: "Customer display system for Apotek Roxy",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

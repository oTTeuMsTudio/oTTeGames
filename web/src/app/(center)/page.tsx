import type { Metadata } from "next";
import { NodeSheet } from "@/components/docs/node-sheet";

export const metadata: Metadata = {
  title: "Unreal nodes and blueprints",
  description:
    "Full-screen index of Unreal Engine blueprint nodes, blueprint groups, and node references, with links to the official explanations.",
};

export default function HomePage() {
  return <NodeSheet />;
}

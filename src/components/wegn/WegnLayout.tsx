import type { ReactNode } from "react";
import "../../pages/wegn/wegn.css";
import WegnNav from "./WegnNav";
import WegnFooter from "./WegnFooter";
import AiFloatingLauncher from "./AiFloatingLauncher";

export default function WegnLayout({ children }: { children: ReactNode }) {
  return (
    <div className="wegn-scope">
      <WegnNav />
      <main>{children}</main>
      <AiFloatingLauncher />
      <WegnFooter />
    </div>
  );
}

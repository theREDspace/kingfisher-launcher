import { Settings } from "lucide-react";
import { OrgSwitcher } from "@/components/layout/OrgSwitcher";
import type { OrgManagerRequest } from "@/components/orgs/OrgManagementModal";

interface NavbarProps {
  onOpenOrgManager: (request: OrgManagerRequest) => void;
}

export function Navbar({ onOpenOrgManager }: NavbarProps) {
  return (
    <div className="sticky top-0 z-40 border-b border-navy/8 bg-white/72 shadow-[0_1px_0_rgb(255_255_255_/_60%)_inset,0_6px_24px_-12px_rgb(31_43_50_/_18%)] backdrop-blur-2xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-6">
        <div className="flex items-center">
          <img
            src="/kingfisher-launcher-logo.png"
            alt="Kingfisher Launcher"
            className="h-9 w-auto"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <OrgSwitcher onOpenOrgManager={onOpenOrgManager} />

          <button
            type="button"
            title="Manage organizations"
            aria-label="Manage organizations"
            onClick={() => onOpenOrgManager({ view: "list" })}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-border bg-white text-navy shadow-sm"
          >
            <Settings size={19} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

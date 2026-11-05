"use client";

import { useCallback } from "react";
import { X, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/smoothui/dialog";
import SmoothButton from "@/components/smoothui/smooth-button";
import type { Asset } from "@/lib/types";

interface AssetInfoModalProps {
  asset: Asset | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssetInfoModal({
  asset,
  open,
  onOpenChange,
}: AssetInfoModalProps) {
  const handleOsmLink = useCallback(() => {
    if (!asset) return;
    const lat = asset.lat.toFixed(5);
    const lon = asset.lon.toFixed(5);
    const url = `https://www.openstreetmap.org/#map=14/${lat}/${lon}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [asset]);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center"
          aria-label={`View details for ${asset.name}`}
        >
          <span />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{asset.name}</DialogTitle>
          <DialogDescription>
            {asset.type} · {asset.lat.toFixed(4)}, {asset.lon.toFixed(4)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <table className="w-full text-left text-sm">
            <tbody>
              {Object.entries(asset.tags).map(([key, value]) => (
                <tr key={key} className="border-b border-[var(--border-secondary)] last:border-b-0">
                  <td className="py-2 w-1/3 text-[var(--text-muted)] font-mono">
                    {key}
                  </td>
                  <td className="py-2 text-[var(--text-secondary)]">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2">
          <SmoothButton
            variant="solid"
            color="accent"
            size="sm"
            onClick={handleOsmLink}
          >
            <ExternalLink size={14} strokeWidth={2} className="mr-1" />
            Open on OpenStreetMap
          </SmoothButton>
          <SmoothButton
            variant="soft"
            color="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <X size={14} strokeWidth={2} />
            Close
          </SmoothButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

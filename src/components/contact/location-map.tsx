"use client";

import { useEffect, useRef } from "react";
import type { Branch } from "@/lib/content/branches";
import { branchesCenter } from "@/lib/domain/branch";

export function LocationMap({
  locations: branches,
  openMapsLabel,
}: {
  locations: readonly Branch[];
  openMapsLabel: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Koordinat peta sudah tidak hardcode: pusat = rata-rata koordinat cabang.
    const center = branchesCenter(branches);
    if (!center || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current).setView(
      [center.latitude, center.longitude],
      13,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    branches.forEach((branch) => {
      // Cabang tanpa koordinat tidak mendapat marker, seperti sebelumnya.
      if (branch.latitude === null || branch.longitude === null) return;

      const marker = L.circleMarker([branch.latitude, branch.longitude], {
        radius: 18,
        fillColor: "#4A2C1A",
        color: "#ffffff",
        weight: 4,
        opacity: 1,
        fillOpacity: 1,
      }).addTo(map);

      marker.bindPopup(
        `<div style="min-width:220px;padding:4px"><b style="font-size:16px;color:#4A2C1A">${branch.name}</b><br/><span style="color:#666;font-size:13px">${branch.address}</span><br/><br/><a href="${branch.mapsUrl}" target="_blank" rel="noopener noreferrer" style="color:#4A2C1A;font-weight:600;font-size:14px">${openMapsLabel} ↗</a></div>`,
        { maxWidth: 300 }
      );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [branches, openMapsLabel]);

  // Belum ada satu pun koordinat → peta tidak dirender daripada menampilkan
  // pandangan dunia kosong.
  if (branchesCenter(branches) === null) return null;

  return (
    <div
      ref={mapRef}
      className="h-[400px] w-full rounded-sm"
      style={{ zIndex: 0 }}
    />
  );
}

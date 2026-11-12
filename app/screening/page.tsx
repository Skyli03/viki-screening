"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ladeStand } from "@/lib/speicher";
import { wiedereinstieg } from "@/lib/schritte";

// Einstieg / Wiedereinstieg: springt zum ersten offenen Schritt.
export default function ScreeningStart() {
  const router = useRouter();
  useEffect(() => {
    const stand = ladeStand();
    if (!stand.klasse) { router.replace("/"); return; }
    const ziel = wiedereinstieg(stand);
    router.replace(ziel ? `/screening/${ziel}` : "/ergebnis");
  }, [router]);
  return null;
}

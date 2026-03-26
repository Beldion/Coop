import { clsx } from "clsx";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";
// import { useAuthStore } from "@/store/useStore";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatZipCode = (value) => {
  return value.slice(0, 5);
};

export const formatTin = (value) => {
  // remove non-numbers
  let clean = value.replace(/\D/g, "");

  // ensure max 12 digits
  clean = clean.slice(0, 12);

  // auto-pad if less than 11 → make it 12
  if (clean.length > 0 && clean.length < 12) {
    clean = clean.padEnd(12, "0");
  }

  return clean;
};

export const formatPhone = (value) => {
  return value.replace(/\D/g, "").slice(0, 11);
};

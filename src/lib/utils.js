import { clsx } from "clsx";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
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

// generate dates based on loan term and payment frequency

// ✅ ALWAYS 15th & LAST DAY OF MONTH + YEAR
export function generateDates(
  service_fee,
  loan_amount,
  interest_rate,
  term_months,
  loan_type,
) {
  if (!service_fee && !loan_amount && !interest_rate && !term_months) {
    return true;
  }

  const computedMonthlyPayment = () => {
    console.log(loan_type);
    if (loan_type === "Member") {
      return (
        (Number(loan_amount) * (Number(interest_rate) / 100) +
          Number(loan_amount)) /
        Number(term_months)
      );
    } else if (loan_type === "Associate") {
      return Number(loan_amount) / Number(term_months);
    } else {
      return Number(loan_amount) / Number(term_months);
    }
  };

  const dates = [];
  let current = new Date();

  for (let i = 0; i < parseInt(term_months); i++) {
    const year = current.getFullYear();
    const month = current.getMonth();

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    let nextDate;

    if (current.getDate() < 15) {
      nextDate = new Date(year, month, 15);
    } else if (current.getDate() < lastDayOfMonth) {
      nextDate = new Date(year, month, lastDayOfMonth);
    } else {
      nextDate = new Date(year, month + 1, 15);
    }

    if (nextDate.getMonth() === 11) {
      // move to January 15 next year
      nextDate = new Date(nextDate.getFullYear() + 1, 0, 15);
    }

    dates.push(
      `${nextDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} - ₱${computedMonthlyPayment()} 
        `,
    );

    current = new Date(nextDate);
    current.setDate(current.getDate() + 1);
  }
  console.log("Generated Dates:", dates);
  return dates;
}

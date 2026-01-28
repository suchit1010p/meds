export const calculateCrowdLevel = ({ bookedTokens }) => {
  if (bookedTokens >= 10) {
    return {
      level: "HIGH",
      badgeClass: "bg-rose-100 text-rose-700",
      barClass: "bg-rose-500",
      waitTime: "45+ mins",
    };
  }



  if (bookedTokens >= 5) {
    return {
      level: "MEDIUM",
      badgeClass: "bg-amber-100 text-amber-700",
      barClass: "bg-amber-500",
      waitTime: "15–30 mins",
    };
  }


  return {
    level: "LOW",
    badgeClass: "bg-emerald-100 text-emerald-700",
    barClass: "bg-emerald-500",
    waitTime: "5–10 mins",
  };
};

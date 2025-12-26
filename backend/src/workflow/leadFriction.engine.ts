export function frictionStrategy(friction: string) {
  switch (friction) {
    case "budget_uncertainty":
      return "share_price_range";
    case "choice_overload":
      return "ask_clarifying_question";
    case "trust_validation":
      return "send_case_study";
    case "timeline_pressure":
      return "immediate_call";
    default:
      return "nurture";
  }
}

import { defineMcp } from "@lovable.dev/mcp-js";
import listSalarySlips from "./tools/list-salary-slips";
import listOfferLetters from "./tools/list-offer-letters";
import listConfirmationLetters from "./tools/list-confirmation-letters";
import listRelievingLetters from "./tools/list-relieving-letters";
import listExperienceCertificates from "./tools/list-experience-certificates";

export default defineMcp({
  name: "payment-slip-mcp",
  title: "Payment Slip MCP",
  version: "0.1.0",
  instructions:
    "Read-only access to HR documents stored in this app: salary slips, offer letters, confirmation letters, relieving letters, and experience certificates. Use the list_* tools to browse recent records or search by employee name.",
  tools: [
    listSalarySlips,
    listOfferLetters,
    listConfirmationLetters,
    listRelievingLetters,
    listExperienceCertificates,
  ],
});
import type { CompanyProfile } from "./types";

export const COMPANY: CompanyProfile = {
  name: "Nexus Technologies (Pvt) Ltd",
  type: "Private Limited Company",
  location: "Harare, Zimbabwe",
  yearsOperating: 11,
  employees: 42,
  annualCapacity: 2400000,
  about:
    "ICT systems integrator supplying and supporting network, compute and security infrastructure for public sector, utility and education clients across Zimbabwe.",
  capabilities: [
    "IT Hardware",
    "Networking Equipment",
    "Software Development",
    "Systems Integration",
    "Cybersecurity",
    "Cloud Services",
  ],
  categories: [
    { code: "ICT-001", name: "ICT Equipment & Hardware" },
    { code: "ICT-004", name: "Networking & Communications" },
    { code: "ICT-007", name: "Software & Licensing" },
    { code: "ICT-011", name: "ICT Services & Systems Integration" },
    { code: "SEC-008", name: "Security Systems & Services" },
  ],
  certifications: [
    { name: "Company Registration (CR14)", status: "Valid", detail: "Registered 2015 — Reg. No. 3421/2015" },
    { name: "Tax Clearance (ITF263)", status: "Valid", detail: "Valid to 31 December 2026" },
    { name: "PRAZ Supplier Registration", status: "Valid", detail: "Categories ICT-001, ICT-004, ICT-007, ICT-011, SEC-008" },
    { name: "OEM Networking Partner (Gold)", status: "Expiring", detail: "Renewal due in 46 days" },
    { name: "ISO 27001:2022", status: "Missing", detail: "Not certified — gap for security service tenders" },
  ],
  documents: [
    { filename: "Certificate of Incorporation.pdf", type: "PDF", updated: "2025-02-11", status: "Current" },
    { filename: "Tax Clearance ITF263 2026.pdf", type: "PDF", updated: "2026-01-08", status: "Current" },
    { filename: "PRAZ Registration Certificate.pdf", type: "PDF", updated: "2026-01-22", status: "Current" },
    { filename: "Audited Financials 2024-2025.pdf", type: "PDF", updated: "2025-09-30", status: "Current" },
    { filename: "OEM Partner Certificate.pdf", type: "PDF", updated: "2025-06-14", status: "Expiring" },
    { filename: "Manufacturer Authorisation Template.docx", type: "DOCX", updated: "2025-11-02", status: "Current" },
    { filename: "ISO 27001 Certificate.pdf", type: "PDF", updated: "—", status: "Missing" },
  ],
  preferences: {
    preferredCategories: [
      "ICT Equipment & Hardware",
      "Networking & Communications",
      "ICT Services & Systems Integration",
      "Software & Licensing",
    ],
    minValue: 25000,
    maxValue: 500000,
    preferredLocations: ["Harare", "Bulawayo", "Gweru"],
    minLeadTimeDays: 7,
    excludedCategories: ["Building & Civil Works", "Medical Equipment & Supplies", "Transport & Fleet Services"],
  },
};

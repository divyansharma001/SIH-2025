export const API_URL = "http://localhost:3000/check-product";

export const MOCK_API_RESPONSE = {
  jobId: "mock-job-id-12345",
  productUrl:
    "https://www.amazon.in/Aashirvaad-Protein-Digestion-Ancient-Nutritious/dp/B0DW4JNC4T/",
  complianceResult: [
    { rule: "MRP Presence", compliant: true, evidence: "Found in scraped price" },
    { rule: "Net Quantity", compliant: true, evidence: "Found keyword: 1 KG" },
    { rule: "Manufacturer Details", compliant: false, evidence: "Not found", suggestion: "Add manufacturer/packer details" },
    { rule: "Manufacturing Date", compliant: false, evidence: "Not found", suggestion: "Add manufacturing/packaging date" },
    { rule: "Expiry/Best Before", compliant: true, evidence: "Found in description" },
    { rule: "Customer Care", compliant: false, evidence: "Not found", suggestion: "Add consumer care phone or email" },
    { rule: "Country of Origin", compliant: false, evidence: "Not found", suggestion: "Add country of origin statement" },
  ],
  overallScore: "42.86%",
  recommendations: [
    "Add manufacturer/packer details",
    "Add manufacturing/packaging date",
    "Add consumer care phone or email",
    "Add country of origin or 'made in' statement",
  ],
};

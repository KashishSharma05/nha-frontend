// Reports Service

import api from "./api";

export function getClaimReport(claimId) {
  return api.get(`/api/reports/claim/${claimId}/`);
}

export function getComplianceReport(claimId) {
  return api.get(`/api/reports/compliance/${claimId}/`);
}

export function getDashboardAnalytics() {
  return api.get("/api/reports/dashboard/");
}

export function getNotifications() {
  return api.get("/api/reports/notifications/");
}

export function exportReports() {
  return api.get("/api/reports/export/");
}

export function getAdminReview() {
  return api.get("/api/reports/admin-review/");
}

export function getClaimHistory() {
  return api.get("/api/reports/history/");
}

export function getClaimInsights() {
  return api.get("/api/reports/insights/");
}

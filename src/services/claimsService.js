// Claims Service

import api from "./api";

export function createClaim(payload) {
  return api.post("/api/claims/create/", payload);
}

export function listClaims() {
  return api.get("/api/claims/list/");
}

export function getClaimById(claimId) {
  return api.get(`/api/claims/${claimId}/`);
}

export function updateClaim(claimId, payload) {
  return api.put(`/api/claims/update/${claimId}/`, payload);
}

export function deleteClaim(claimId) {
  return api.delete(`/api/claims/delete/${claimId}/`);
}

export function searchClaims(query) {
  return api.get(`/api/claims/search/?q=${encodeURIComponent(query)}`);
}

export function filterClaimsByStatus(status) {
  return api.get(`/api/claims/filter/?status=${encodeURIComponent(status)}`);
}

export function getClaimSummary() {
  return api.get("/api/claims/summary/");
}

export function getClaimTimeline(claimId) {
  return api.get(`/api/claims/timeline/${claimId}/`);
}

export function uploadClaimDocument(claimId, file) {
  const formData = new FormData();
  formData.append("document", file);
  return api.upload(`/api/claims/upload/${claimId}/`, formData);
}

export function extractDataFromDocument(file) {
  const formData = new FormData();
  formData.append("document", file);
  return api.upload(`/api/verification/extract/`, formData);
}

export function bulkCreateClaims(claimsArray) {
  // Backend expects: { "claims": [...] }
  return api.post("/api/claims/bulk-create/", { claims: claimsArray });
}

export function generatePS1Output(claimId, options = {}) {
  // options could be { case_id: "...", s3_link: "..." }
  return api.post(`/api/claims/ps1/generate/${claimId}/`, options);
}

export function getPS1Output(claimId) {
  return api.get(`/api/claims/ps1/result/${claimId}/`);
}


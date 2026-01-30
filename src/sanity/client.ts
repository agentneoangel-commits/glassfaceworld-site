import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "wxjd5ij6",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});

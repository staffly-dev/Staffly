import axios from "axios";
import { Env } from "../config/env.config";

export async function verify_user_exists_and_token_valid(
  user_id: string,
  access_token: string
): Promise<void> {
  if (!user_id || !access_token) {
    throw new Error("user_id and access_token are required");
  }

  const base_url = Env.API_GATEWAY_BASE_URL || "http://localhost:4000";
  const clean_base_url = base_url.replace(/\/$/, "");

  // First verify token is valid
  const verify_url = `${clean_base_url}/api/v1/hrms/auth/verify-token`;
  try {
    const verify_response = await axios.post(verify_url, { token: access_token }, { timeout: 6000 });
    
    if (verify_response.status !== 200) {
      const detail = verify_response.data?.message || verify_response.statusText;
      throw new Error(detail || "Invalid or expired access token");
    }
  } catch (error: any) {
    if (error.response) {
      const detail = error.response.data?.message || error.response.statusText;
      throw new Error(detail || "Invalid or expired access token");
    }
    console.error(`Failed calling API Gateway verify-token: ${error.message}`);
    throw new Error(
      `Could not reach API Gateway at ${clean_base_url} for user verification. Please start the API Gateway service first. The user_id ${user_id} cannot be validated without the Gateway running.`
    );
  }

  // Now get the actual user from the database to verify user_id exists
  const user_url = `${clean_base_url}/api/v1/hrms/users/me`;
  try {
    const user_response = await axios.get(user_url, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: 6000
    });

    if (user_response.status !== 200) {
      const detail = user_response.data?.message || user_response.statusText;
      throw new Error(detail || "Could not retrieve user from API Gateway database");
    }

    const user_data = user_response.data?.user || {};
    const db_user_id = user_data.id ? String(user_data.id) : null;

    if (!db_user_id) {
      throw new Error("User not found in API Gateway database");
    }

    // This is the critical check: provided user_id must exist in Gateway DB
    if (db_user_id !== user_id) {
      console.warn(`User ID mismatch: provided=${user_id}, database=${db_user_id}`);
      throw new Error(`User ID ${user_id} does not exist in API Gateway database`);
    }

    console.log(`User ${user_id} verified successfully in API Gateway database`);
  } catch (error: any) {
    if (error.response) {
      const detail = error.response.data?.message || error.response.statusText;
      throw new Error(detail || "Could not retrieve user from API Gateway database");
    }
    console.error(`Failed calling API Gateway get user: ${error.message}`);
    throw new Error("Could not reach API Gateway to verify user existence");
  }
}


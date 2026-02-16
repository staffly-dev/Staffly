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
    console.log(`[Gateway Client] Verifying token at: ${verify_url}`);
    const verify_response = await axios.post(verify_url, { token: access_token }, { timeout: 6000 });

    if (verify_response.status !== 200) {
      const detail = verify_response.data?.message || verify_response.statusText;
      console.error(`[Gateway Client] Token verification failed with status ${verify_response.status}: ${detail}`);
      throw new Error(detail || "Invalid or expired access token");
    }
    console.log(`[Gateway Client] Token verified successfully`);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.message || error.response.data?.error || error.response.statusText;
      console.error(`[Gateway Client] Token verification error (${status}): ${detail}`);
      throw new Error(detail || "Invalid or expired access token");
    }
    console.error(`[Gateway Client] Failed calling API Gateway verify-token: ${error.message}`);
    throw new Error(
      `Could not reach API Gateway at ${clean_base_url} for user verification. Please start the API Gateway service first. The user_id ${user_id} cannot be validated without the Gateway running.`
    );
  }

  // Now get the actual user from the database to verify user_id exists
  const user_url = `${clean_base_url}/api/v1/hrms/users/me`;
  try {
    console.log(`[Gateway Client] Fetching user data from: ${user_url}`);
    const user_response = await axios.get(user_url, {
      headers: { Authorization: `Bearer ${access_token}` },
      timeout: 6000
    });

    if (user_response.status !== 200) {
      const detail = user_response.data?.message || user_response.statusText;
      throw new Error(detail || "Could not retrieve user from API Gateway database");
    }

    // Handle different response structures
    const response_data = user_response.data;
    let user_data: any = {};

    // Check if user is directly in data or nested
    if (response_data?.user) {
      user_data = response_data.user;
    } else if (response_data?.data?.user) {
      user_data = response_data.data.user;
    } else if (response_data?.id) {
      // User data might be at root level
      user_data = response_data;
    }

    const db_user_id = user_data?.id ? String(user_data.id) : null;

    if (!db_user_id) {
      console.error(`User data structure unexpected. Response:`, JSON.stringify(response_data, null, 2));
      throw new Error("User not found in API Gateway database - invalid user data structure");
    }

    // This is the critical check: provided user_id must exist in Gateway DB
    if (db_user_id !== user_id) {
      console.warn(`User ID mismatch: provided=${user_id}, database=${db_user_id}`);
      throw new Error(`User ID ${user_id} does not match the authenticated user (${db_user_id})`);
    }

    console.log(`User ${user_id} verified successfully in API Gateway database`);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.message || error.response.data?.error || error.response.statusText;

      // Provide more specific error messages based on status code
      if (status === 401) {
        throw new Error(detail || "Invalid or expired access token");
      } else if (status === 404) {
        throw new Error(detail || "User endpoint not found - API Gateway routing issue");
      } else if (status === 500) {
        throw new Error(detail || "Internal server error in API Gateway");
      } else {
        throw new Error(detail || `API Gateway returned status ${status}`);
      }
    }
    console.error(`Failed calling API Gateway get user: ${error.message}`);
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error(`Could not reach API Gateway at ${clean_base_url}. Please ensure the API Gateway service is running.`);
    }
    throw new Error(`Could not verify user existence: ${error.message}`);
  }
}


/**
 * Zerion API Client
 * Handles all API requests to Zerion with proper authentication
 */

/** 
import dotenv from "dotenv"
dotenv.config()
**/

const ZERION_API_BASE = "https://api.zerion.io/v1"
const ZERION_API_KEY = process.env.ZERION_API_KEY as string

export interface ZerionRequestOptions {
  endpoint: string
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
}

export class ZerionAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
  ) {
    super(message)
    this.name = "ZerionAPIError"
  }
}

/**
 * Make authenticated request to Zerion API
 */
export async function zerionRequest<T>({ endpoint, params = {}, headers = {} }: ZerionRequestOptions): Promise<T> {
  const queryParts: string[] = []
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Don't encode the key if it contains brackets (for Zerion API compatibility)
      queryParts.push(`${key}=${encodeURIComponent(String(value))}`)
    }
  })

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const url = `${ZERION_API_BASE}${endpoint}${queryString}`

  console.log("Zerion API Request:", url)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Basic ${ZERION_API_KEY}`,
        accept: "application/json",
        ...headers,
      },
      cache: "no-store", // Ensure fresh data for real-time updates
    })

    console.log("Zerion API Response Status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("Zerion API Error Response:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }

      throw new ZerionAPIError(
        errorData.message || `API request failed: ${response.statusText}`,
        response.status,
        errorData,
      )
    }

    const data = await response.json()
    console.log("Zerion API Response Data:", JSON.stringify(data).substring(0, 200))
    return data
  } catch (error) {
    console.log("Zerion API Error:", error)
    if (error instanceof ZerionAPIError) {
      throw error
    }
    throw new ZerionAPIError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

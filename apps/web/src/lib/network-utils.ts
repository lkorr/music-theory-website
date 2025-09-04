/**
 * Network and IP Utilities
 * 
 * Common utilities for handling IP addresses and network-related functions
 * across API endpoints.
 */

export type IPVersion = 'IPv4' | 'IPv6' | 'unknown';
export type RegionHint = 'local/private' | 'external';

/**
 * Extract client IP address from request headers
 * Checks multiple headers in order of priority for reverse proxies and CDNs
 */
export function getClientIP(request: Request): string {
  const headers = [
    'x-forwarded-for',     // Standard forwarded header
    'x-real-ip',           // Nginx reverse proxy
    'cf-connecting-ip',    // Cloudflare
    'x-client-ip',         // Apache/alternative
    'x-cluster-client-ip', // Cluster environments
    'x-forwarded',         // Alternative forwarded header
    'forwarded-for',       // Legacy header
    'forwarded'            // RFC 7239 standard
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Take the first IP from comma-separated list (client IP)
      const ip = value.split(',')[0].trim();
      
      // Basic IP validation (IPv4 or IPv6)
      if (isValidIP(ip)) {
        return ip;
      }
    }
  }

  return 'unknown';
}

/**
 * Basic IP address validation
 */
function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (ipv4Regex.test(ip)) {
    return true;
  }

  // IPv6 validation (basic)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  if (ipv6Regex.test(ip)) {
    return true;
  }

  // IPv6 compressed format (simplified check)
  if (ip.includes('::') && ip.split('::').length === 2) {
    return true;
  }

  return false;
}

/**
 * Determine IP version
 */
export function getIPVersion(ip: string): IPVersion {
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }

  if (ip.includes(':')) {
    return 'IPv6';
  }

  if (ip.includes('.')) {
    return 'IPv4';
  }

  return 'unknown';
}

/**
 * Check if IP address is from a private/internal network
 */
export function isPrivateIP(ip: string): boolean {
  if (!ip || ip === 'unknown') {
    return false;
  }

  // Private IPv4 ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8 (loopback)
    /^169\.254\./, // 169.254.0.0/16 (link-local)
  ];

  return privateRanges.some(range => range.test(ip));
}

/**
 * Get geographic region hint from IP (very basic)
 * Note: This is a simple heuristic, for production use a proper GeoIP service
 */
export function getIPRegionHint(ip: string): RegionHint {
  if (!ip || ip === 'unknown' || isPrivateIP(ip)) {
    return 'local/private';
  }

  // This is a very basic implementation
  // In production, use a proper GeoIP database or service
  return 'external';
}

/**
 * Sanitize IP address for logging (mask last octet for privacy)
 */
export function sanitizeIPForLogging(ip: string): string {
  if (!ip || ip === 'unknown') {
    return ip;
  }

  // For IPv4, mask last octet
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }

  // For IPv6, mask last 64 bits
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
    }
  }

  return 'xxx.xxx.xxx.xxx';
}

/**
 * Parse User-Agent header safely
 */
export function parseUserAgent(userAgent: string | null): {
  raw: string;
  sanitized: string;
  isBot: boolean;
} {
  const raw = userAgent || 'unknown';
  
  // Sanitize user agent (remove potential injection characters)
  const sanitized = raw
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .slice(0, 200); // Limit length

  // Simple bot detection
  const botPatterns = /bot|crawler|spider|scraper|wget|curl/i;
  const isBot = botPatterns.test(sanitized);

  return {
    raw,
    sanitized,
    isBot
  };
}

/**
 * Rate limiting key generator based on IP and endpoint
 */
export function generateRateLimitKey(
  ip: string, 
  endpoint: string, 
  userId?: string
): string {
  const sanitizedIP = sanitizeIPForLogging(ip);
  const baseKey = `${sanitizedIP}:${endpoint}`;
  
  return userId ? `${baseKey}:${userId}` : baseKey;
}

/**
 * Security headers for client IP information
 */
export function getSecurityHeaders(ip: string): Record<string, string> {
  const isPrivate = isPrivateIP(ip);
  
  return {
    'X-Client-IP-Type': isPrivate ? 'private' : 'public',
    'X-IP-Version': getIPVersion(ip),
    'X-Region-Hint': getIPRegionHint(ip)
  };
}
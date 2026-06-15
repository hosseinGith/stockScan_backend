import type { Request } from 'express';

export default function getIp(request: Request) {
 const forwarded = request.headers['x-forwarded-for'];
 if (forwarded) {
  const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;

  return forwardedStr.split(',')[0].trim();
 }

 return (
  (request.headers['x-real-ip'] as string) ||
  request.ip ||
  request.socket?.remoteAddress ||
  'unknown'
 );
}

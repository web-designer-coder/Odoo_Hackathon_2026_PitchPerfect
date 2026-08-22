/**
 * DNS override — must be the FIRST import in the entire app.
 * Forces Node.js DNS to use Google (8.8.8.8) instead of system DNS.
 * This is needed because Cloudflare Family DNS (1.1.1.3) blocks MongoDB SRV records.
 */
import { setDefaultResultOrder } from 'node:dns';
import dns from 'node:dns';

// Override DNS servers at Node level — bypasses system DNS for this process only
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
setDefaultResultOrder('ipv4first');

# 🌐 DevOps & Production Deployment Matrix

Per the workspace Autonomous Development & Deployment Protocol, automated deployment is executed via `deploy.sh` with strict multi-tenant isolation.

---

## 🖥️ 1. Target Node Specifications

- **Production Host:** `79.137.14.75`
- **Application Target Path:** `/var/www/zero-bench` (Static & SSR bundles)
- **Fallback / Legacy Root:** `/var/www/promo-fresh/front`
- **Reverse Proxy:** Nginx with SSL termination and multi-site routing.

---

## 🔐 2. Deployment Security & Isolation Rules

1. **Authentication Exclusivity:** Deployment must authenticate strictly via SSH public key (`~/.ssh/id_rsa`). Passwords or hardcoded secret tokens are strictly forbidden.
2. **Multi-Tenant Safety:**
   - The host VM runs multiple isolated client domains.
   - Deployments must sync strictly to `/var/www/zero-bench/` (or designated sub-paths).
   - Global Nginx reload (`systemctl reload nginx`) is executed non-destructively, preserving sibling service operations without regression.
3. **Payload Distribution:**
   - Client browser assets: `/var/www/zero-bench/browser/`
   - Server SSR runtime: `/var/www/zero-bench/server/`

---

## 🚀 3. Deployment Script Execution

```bash
# Verify local build before deployment
./deploy.sh
```

### Script Execution Flow (`deploy.sh`):
1. **Validate SSH Credentials:** Checks existence of `~/.ssh/id_rsa` or falls back to ssh-agent.
2. **Production Build:** Executes `npm run build` (generates Zoneless + SSR prerendered assets in `dist/zero-bench`).
3. **Distribution Sync:** Uses `rsync -avz --delete` over SSH to copy browser and server bundles.
4. **Graceful Nginx Reload:** Reloads static host targets without downtime.

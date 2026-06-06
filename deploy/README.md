# Deploying crow-api to a GCP VM

Stack: NestJS (port 8080) behind **nginx + HTTPS**, run with **PM2**.
Database is **Supabase Postgres** (not on the VM) — the VM only runs Node and
reaches Supabase over the network.

Because there's no custom domain, the API is served at `https://<IP>.nip.io`
(nip.io maps the IP to a hostname so Let's Encrypt can issue a real cert).
Swap in a real domain later by re-running certbot with `-d api.yourdomain.com`.

---

## 0. Local prerequisites

- `gcloud` CLI installed and authenticated (`gcloud auth login`).
- Commit & push these deploy files so the VM's `git clone` includes them.

## 1. Provision the VM (run locally)

```bash
PROJECT_ID=your-gcp-project
REGION=asia-south1            # match your Supabase region for low latency
ZONE=asia-south1-c
VM_NAME=crow-api

gcloud config set project "$PROJECT_ID"

# Reserve a static external IP
gcloud compute addresses create crow-api-ip --region="$REGION"
IP=$(gcloud compute addresses describe crow-api-ip --region="$REGION" --format='value(address)')
echo "Static IP: $IP"

# Create the VM (Ubuntu 22.04, 2 vCPU / 4GB). e2-small (2GB) also works but
# may need swap to build; e2-medium is more comfortable.
gcloud compute instances create "$VM_NAME" \
  --zone="$ZONE" \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --address="$IP" \
  --tags=http-server,https-server \
  --boot-disk-size=20GB

# Firewall for 80/443 (skip a rule if it already exists on the network)
gcloud compute firewall-rules create allow-http  --allow=tcp:80  --target-tags=http-server  --direction=INGRESS || true
gcloud compute firewall-rules create allow-https --allow=tcp:443 --target-tags=https-server --direction=INGRESS || true

API_HOST=$(echo "$IP" | tr '.' '-').nip.io
echo "API will be: https://$API_HOST"

# SSH in
gcloud compute ssh "$VM_NAME" --zone="$ZONE"
```

## 2. Install runtime (on the VM)

```bash
sudo apt-get update && sudo apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2
node -v   # expect v22.x
```

## 3. Get the code (private repo → deploy key)

```bash
ssh-keygen -t ed25519 -C "crow-api-vm" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# Add the printed key as a read-only Deploy Key at:
#   https://github.com/Crowwhub/backend-crow/settings/keys
git clone git@github.com:Crowwhub/backend-crow.git
cd backend-crow
```

(Alternative: `git clone https://<PAT>@github.com/Crowwhub/backend-crow.git`.)

## 4. Configure environment

```bash
cp .env.example .env
nano .env
```

Fill in `DATABASE_URL` (pooled, `?pgbouncer=true&connection_limit=1`),
`DIRECT_URL` (port 5432, migrations), `SUPABASE_*`, `JWT_SECRET`, `PORT=8080`,
and `WEB_ORIGIN` = your frontend origin (e.g. `https://crowhub.vercel.app`).

## 5. First deploy

```bash
bash deploy/deploy.sh        # npm ci, prisma generate, migrate deploy, build, pm2 start
pm2 startup systemd -u "$USER" --hp "$HOME"   # then run the sudo line it prints
pm2 save

# sanity check on the VM
pm2 status
pm2 logs crow-api --lines 50
curl -s localhost:8080/ -o /dev/null -w "%{http_code}\n"
```

## 6. nginx reverse proxy

```bash
API_HOST=$(curl -s ifconfig.me | tr '.' '-').nip.io
echo "$API_HOST"
sudo cp deploy/nginx-crow-api.conf /etc/nginx/sites-available/crow-api
sudo sed -i "s/__API_HOST__/$API_HOST/" /etc/nginx/sites-available/crow-api
sudo ln -sf /etc/nginx/sites-available/crow-api /etc/nginx/sites-enabled/crow-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
curl -s "http://$API_HOST/" -o /dev/null -w "%{http_code}\n"
```

## 7. HTTPS (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d "$API_HOST" --non-interactive --agree-tos -m you@example.com --redirect
curl -s "https://$API_HOST/" -o /dev/null -w "%{http_code}\n"
```

certbot adds the 443 server block, an HTTP→HTTPS redirect, and an auto-renew timer.

## 8. Point the frontend at the API

In the frontend env (e.g. Vercel):

```
NEXT_PUBLIC_API_URL=https://<API_HOST>
```

Make sure the backend `WEB_ORIGIN` equals the frontend origin, then
`pm2 reload crow-api --update-env`. Redeploy the frontend.

## Redeploys

```bash
cd ~/backend-crow && bash deploy/deploy.sh
```

## Notes / gotchas

- **socket.io**: keep PM2 `instances: 1` (set in `ecosystem.config.js`). Multiple
  instances need sticky sessions + a shared adapter. nginx WS upgrade is configured.
- **Connection pool**: the pooled `DATABASE_URL` must use `pgbouncer=true&connection_limit=1`;
  migrations use the direct `DIRECT_URL`. This prevents the pool-timeout errors.
- Do **not** open port 8080 in the firewall — only 80/443. The app stays on localhost.
- If `npm run build` OOMs on a 2GB machine, add swap:
  `sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`.

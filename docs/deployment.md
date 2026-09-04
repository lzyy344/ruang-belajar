# Deployment Guide

## Environments

| Environment | Branch | URL | Auto Deploy |
|-------------|--------|-----|-------------|
| Development | Local | http://localhost:3000 | Manual |
| Staging | `develop` | https://staging.ruangbelajar.app | On push |
| Production | `main` (tags) | https://ruangbelajar.app | On tag `v*` |

## Infrastructure Requirements

### Minimum Production Specs

| Component | Specs |
|-----------|-------|
| **App Server** | 2 vCPU, 4GB RAM (x2 for HA) |
| **PostgreSQL** | 2 vCPU, 8GB RAM, 100GB SSD |
| **Redis** | 1 vCPU, 2GB RAM (Cluster: 3 nodes) |
| **MinIO/S3** | 2 vCPU, 4GB RAM, 500GB SSD (or AWS S3) |
| **Nginx** | 1 vCPU, 1GB RAM |
| **Monitoring** | 1 vCPU, 2GB RAM |

### Recommended Production Specs

| Component | Specs |
|-----------|-------|
| **App Server** | 4 vCPU, 8GB RAM (x3 for HA) |
| **PostgreSQL** | 4 vCPU, 16GB RAM, 500GB NVMe |
| **Redis** | 2 vCPU, 4GB RAM (Cluster: 6 nodes) |
| **MinIO/S3** | 4 vCPU, 8GB RAM, 1TB NVMe (or AWS S3 + CloudFront) |
| **Nginx** | 2 vCPU, 2GB RAM (x2 for HA) |
| **Monitoring** | 2 vCPU, 4GB RAM |

## Pre-Deployment Checklist

### Secrets Management
- [ ] All secrets in GitHub Environments (not repo secrets)
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] Database passwords rotated
- [ ] API keys for AI providers configured
- [ ] SMTP credentials for emails
- [ ] S3 credentials with minimal permissions

### Database
- [ ] PostgreSQL 16+ with `pgvector` extension
- [ ] Connection pooling (PgBouncer) configured
- [ ] Automated backups (daily + WAL archiving)
- [ ] Read replica for analytics queries
- [ ] SSL/TLS enforced for connections

### Redis
- [ ] Redis 7+ with persistence (AOF + RDB)
- [ ] Cluster mode for HA
- [ ] Memory policy: `allkeys-lru`
- [ ] TLS enabled
- [ ] Authentication enabled

### Storage
- [ ] S3 bucket with versioning enabled
- [ ] Lifecycle policies for old files
- [ ] CORS configured for direct uploads
- [ ] CloudFront/CDN for public assets
- [ ] Signed URL expiry: 1 hour

### DNS & SSL
- [ ] Domain configured with A/AAAA records
- [ ] Let's Encrypt / ACME certificates
- [ ] CAA records for certificate authority
- [ ] HSTS preload list submission

### Monitoring
- [ ] Sentry DSN configured for all environments
- [ ] Prometheus scraping configured
- [ ] Grafana dashboards imported
- [ ] Alert rules for: error rate, latency, queue depth, disk space
- [ ] Log aggregation (Loki/ELK)
- [ ] Uptime monitoring (external)

## Deployment Steps

### 1. Staging Deployment (Automatic on `develop`)

```bash
# Triggered automatically on push to develop
# Or manually:
gh workflow run cd-staging.yml
```

**What happens:**
1. Docker images built and pushed to GHCR
2. Images pulled on staging server
3. Database migrations run
4. Containers restarted with zero-downtime
5. Health checks verified
6. Smoke tests run

### 2. Production Deployment (Tag-based)

```bash
# Create release tag
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# Or via GitHub UI: Create new release
```

**What happens (Blue-Green):**
1. New images built with version tags
2. Images pushed to GHCR
3. Production server pulls new images
4. Database migrations run (pre-deployment)
5. New containers started alongside old (scale up)
6. Health checks on new containers
7. Nginx reload to switch traffic
8. Old containers removed (scale down)
9. Rollback automatic if health checks fail

### 3. Manual Deployment (Emergency)

```bash
# On production server
cd /opt/ruang-belajar

# Pull specific version
docker compose -f docker-compose.prod.yml pull web:sha-abc123 worker:sha-abc123

# Run migrations
docker compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# Deploy
docker compose -f docker-compose.prod.yml up -d --no-deps web worker

# Verify
curl -f https://ruangbelajar.app/health
```

## Database Migrations

### Development
```bash
# Create migration
npm run db:migrate
# Enter name: "add_user_preferences"

# Apply to local DB
npm run db:push
```

### Staging/Production
```bash
# Migrations run automatically in CI/CD
# Or manually:
docker compose exec api npx prisma migrate deploy

# Check status
docker compose exec api npx prisma migrate status
```

### Rollback Migration
```bash
# Only if migration is reversible
docker compose exec api npx prisma migrate resolve --rolled-back "migration_name"
```

## Scaling Guidelines

### Horizontal Scaling Triggers

| Metric | Scale Up Threshold | Scale Down Threshold |
|--------|-------------------|---------------------|
| CPU (Web) | > 70% for 5 min | < 30% for 15 min |
| Memory (Web) | > 80% for 5 min | < 50% for 15 min |
| Request Latency (p95) | > 2s | < 500ms |
| Queue Depth | > 100 jobs | < 10 jobs |
| DB Connections | > 80% pool | < 50% pool |

### Scaling Commands

```bash
# Scale web (Docker Swarm)
docker service scale ruang-belajar_web=5

# Scale workers
docker service scale ruang-belajar_worker=4

# Kubernetes
kubectl scale deployment web --replicas=5
kubectl scale deployment worker --replicas=4
```

## Backup & Disaster Recovery

### Automated Backups

```bash
# PostgreSQL (daily at 2 AM)
0 2 * * * pg_dump -h localhost -U postgres ruang_belajar | gzip > /backups/ruang_belajar_$(date +\%Y\%m\%d).sql.gz

# Redis (RDB + AOF)
# Configured in redis.conf

# MinIO (daily sync to another region)
mc mirror --overwrite minio/ruang-belajar s3-backup/ruang-belajar
```

### Restore Procedure

```bash
# 1. Stop application
docker compose -f docker-compose.prod.yml stop web worker

# 2. Restore PostgreSQL
gunzip -c /backups/ruang_belajar_20240115.sql.gz | docker exec -i ruang-belajar-postgres psql -U postgres -d ruang_belajar

# 3. Restore MinIO (if needed)
mc mirror --overwrite s3-backup/ruang-belajar minio/ruang-belajar

# 4. Restart application
docker compose -f docker-compose.prod.yml start web worker
```

### RPO/RTO Targets

| Scenario | RPO | RTO |
|----------|-----|-----|
| Database failure | 1 hour (WAL) | 30 min |
| Full region outage | 24 hours | 4 hours |
| Accidental deletion | 1 hour | 1 hour |

## Security Hardening

### Network
- [ ] VPC with private subnets for DB, Redis, Workers
- [ ] Security groups: least privilege
- [ ] Nginx only public-facing service
- [ ] Database not accessible from internet
- [ ] Redis not accessible from internet

### Application
- [ ] CSP headers configured
- [ ] HSTS enabled (1 year)
- [ ] Secure cookies (SameSite=Strict)
- [ ] Rate limiting on all endpoints
- [ ] Input validation on all procedures
- [ ] File upload validation (type, size, magic bytes)
- [ ] SQL injection prevention (Prisma parameterized)

### Secrets
- [ ] Rotated every 90 days
- [ ] Stored in GitHub Environments / Vault
- [ ] Never in code or Docker images
- [ ] Audit trail for access

## Rollback Procedures

### Application Rollback
```bash
# Quick rollback to previous version
docker compose -f docker-compose.prod.yml pull web:previous worker:previous
docker compose -f docker-compose.prod.yml up -d --no-deps web worker
```

### Database Rollback
```bash
# Only if migration is reversible
npx prisma migrate resolve --rolled-back "20240115_add_feature"
# Then redeploy previous app version
```

### Full Environment Rollback
```bash
# Restore from backup (see Backup section)
# Point DNS to standby environment
```

## Post-Deployment Verification

### Automated Checks (in CI/CD)
- [ ] Health endpoint responds 200
- [ ] Database connectivity
- [ ] Redis connectivity
- [ ] S3 connectivity
- [ ] AI provider connectivity
- [ ] Authentication flow works
- [ ] Critical user journey (upload → process → quiz)

### Manual Checks
- [ ] Homepage loads
- [ ] Login/Register works
- [ ] File upload works
- [ ] Processing pipeline completes
- [ ] AI chat responds
- [ ] Notifications delivered
- [ ] Analytics tracking
- [ ] Email sending

## Maintenance Windows

| Task | Frequency | Window | Duration |
|------|-----------|--------|----------|
| Security patches | Weekly | Sunday 02:00-04:00 | 30 min |
| Dependency updates | Monthly | Sunday 02:00-04:00 | 1 hour |
| Database maintenance | Monthly | Sunday 03:00-05:00 | 1 hour |
| Certificate renewal | Auto (Let's Encrypt) | - | - |
| Log rotation | Daily | 00:00 | - |

## Incident Response

### Severity Levels

| Level | Definition | Response Time | Escalation |
|-------|------------|---------------|------------|
| SEV-1 | Complete outage, data loss | 15 min | Immediate |
| SEV-2 | Major feature down, degraded performance | 30 min | 1 hour |
| SEV-3 | Minor issue, workaround exists | 4 hours | 24 hours |
| SEV-4 | Cosmetic, non-urgent | Next sprint | - |

### Runbook Links
- [Database Outage](runbooks/database-outage.md)
- [Redis Outage](runbooks/redis-outage.md)
- [S3/MinIO Outage](runbooks/storage-outage.md)
- [AI Provider Outage](runbooks/ai-outage.md)
- [High Error Rate](runbooks/high-error-rate.md)
- [Queue Backup](runbooks/queue-backup.md)
# Security Best Practices - Wellness-Ops

## ⚠️ IMPORTANT SECURITY WARNINGS

### Current Status
This project currently has **hardcoded credentials** in the following files:
- `k8s/backend/backend-secret.yml` - Database password
- `k8s/postgres/postgres-secret.yml` - PostgreSQL password  
- `k8s/backend/backend-jwt-secret.yml` - JWT signing secret

**These are demonstration secrets and MUST be changed before any deployment!**

## 🔒 How to Secure Your Deployment

### Step 1: Generate Strong Secrets

Run the provided script to generate secure random secrets:

```bash
./generate-secrets.sh
```

This will output:
- A strong database password (32 characters)
- A strong JWT secret (64 characters)
- The base64-encoded JWT secret for Kubernetes

### Step 2: Update Secret Files

**DO NOT commit these changes to Git!**

Update the secret values in:
- `k8s/backend/backend-secret.yml`
- `k8s/postgres/postgres-secret.yml`
- `k8s/backend/backend-jwt-secret.yml`

### Step 3 (Recommended): Use External Secret Management

For production deployments, use one of these solutions:

#### Option A: Sealed Secrets (Bitnami)
```bash
# Install Sealed Secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/controller.yaml

# Install kubeseal CLI
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-0.24.0-linux-amd64.tar.gz
tar -xvzf kubeseal-0.24.0-linux-amd64.tar.gz
sudo mv kubeseal /usr/local/bin/

# Create sealed secret
kubectl create secret generic backend-secret \
  --from-literal=DB_PASSWORD=your-strong-password \
  --dry-run=client -o yaml | \
  kubeseal -o yaml > backend-sealed-secret.yml

# Apply sealed secret (safe to commit to Git)
kubectl apply -f backend-sealed-secret.yml
```

#### Option B: External Secrets Operator

Works with:
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

Example with AWS:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secretstore
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: backend-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secretstore
  target:
    name: backend-secret
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: wellness-ops/db-password
```

#### Option C: HashiCorp Vault

```bash
# Install Vault
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault

# Store secrets
vault kv put secret/wellness-ops/db password=your-strong-password
vault kv put secret/wellness-ops/jwt secret=your-jwt-secret

# Use Vault Agent Injector
kubectl annotate serviceaccount backend \
  vault.hashicorp.com/agent-inject="true" \
  vault.hashicorp.com/role="backend"
```

## 🛡️ Additional Security Measures Implemented

### SecurityContext
All deployments now include:
- `runAsNonRoot: true` - Prevents running as root
- `allowPrivilegeEscalation: false` - Prevents privilege escalation
- `capabilities: drop: ALL` - Drops all Linux capabilities

### Network Policies
Network policies restrict traffic:
- PostgreSQL only accepts connections from backend pods
- Backend only accepts connections from nginx-gateway
- Prevents lateral movement in case of compromise

### Resource Limits
All pods have resource limits to prevent:
- Resource exhaustion attacks
- Noisy neighbor problems
- Cluster instability

### Probes
Health checks ensure:
- Fast detection of unhealthy pods
- Automatic restart of failed containers
- No traffic to non-ready pods

## 🔐 Production Checklist

Before deploying to production:

- [ ] Change all default passwords using `./generate-secrets.sh`
- [ ] Implement external secret management (Sealed Secrets/Vault/Cloud Provider)
- [ ] Enable Kubernetes secret encryption at rest
- [ ] Set up RBAC with least-privilege ServiceAccounts
- [ ] Enable audit logging
- [ ] Implement Pod Security Standards/Policies
- [ ] Set up network policies for all namespaces
- [ ] Use private container registry with image scanning
- [ ] Enable TLS for all services (including internal)
- [ ] Implement backup and disaster recovery
- [ ] Set up monitoring and alerting
- [ ] Perform security audit/penetration testing
- [ ] Document incident response procedures

## 📚 References

- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/security-best-practices/)
- [OWASP Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [Sealed Secrets Documentation](https://github.com/bitnami-labs/sealed-secrets)
- [External Secrets Operator](https://external-secrets.io/)
- [HashiCorp Vault](https://www.vaultproject.io/)

## ⚡ Quick Security Wins

If you can't implement full secret management immediately:

1. **Generate strong secrets**: Use `./generate-secrets.sh`
2. **Store in `.env.secret`**: Add to `.gitignore`
3. **Create secrets from file**:
   ```bash
   kubectl create secret generic backend-secret \
     --from-env-file=.env.secret
   ```
4. **Remove from Git**: 
   ```bash
   git filter-repo --path k8s/backend/backend-secret.yml --invert-paths
   git filter-repo --path k8s/postgres/postgres-secret.yml --invert-paths
   ```

---

**Remember**: Security is not a one-time task but an ongoing process. Regularly review and update your security measures.

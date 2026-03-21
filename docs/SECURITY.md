# 🔐 Security in Wellness Ops

This document describes the threats considered for this Kubernetes platform and the concrete controls that are implemented or planned to mitigate them.

---

## ⚠️ Core threats considered

In a Kubernetes platform with CI/CD, GitHub Actions, exposed Ingress, and a database, relevant threats can be grouped into three levels:

### 1. Access and permissions level

| Threat | Description |
|---|---|
| Unauthorized cluster access | A user or process obtains permissions it should not have |
| Privilege escalation | A pod or service account gains access outside its allowed scope |
| Over-privileged service accounts | By default, Kubernetes `default` service accounts may be too permissive |
| Lateral movement across namespaces | A compromised pod can reach other cluster services |

### 2. Image and supply chain level

| Threat | Description |
|---|---|
| Image with known vulnerabilities (CVEs) | Outdated dependencies or insecure base images |
| Image tampering in transit | Artifact integrity is not verified |
| Credentials in Dockerfile or source code | Secrets hardcoded in the image |

### 3. Secrets and configuration level

| Threat | Description |
|---|---|
| Plain-text secrets in Git | Passwords visible in the repository |
| Sensitive variables in ConfigMaps | Data that should be encrypted is stored in plain text |
| Long-lived access tokens (GitHub, GHCR) | No rotation and no limited scope |

---

## 🛡️ Implemented controls

### 1. RBAC — Role-based access control

The principle is simple: each identity (user, service account, process) can do only what is strictly necessary.

#### What is configured?

**Role with minimum permissions** (namespaced, read-only pods):

```yaml
# k8s/rback/role-read-pods/role.yml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: rbac-lab
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

**Dedicated ServiceAccount** (instead of using `default`):

```yaml
# k8s/rback/role-read-pods/serviceaccount.yml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: developer-juan
  namespace: rbac-lab
```

**ClusterRole for global read-only access** (when scope must span the cluster):

```yaml
# k8s/rback/cluster-role/clusterrole.yml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: pod-reader-global
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]
```

References:
- [k8s/rback/role-read-pods/](../k8s/rback/role-read-pods/)
- [k8s/rback/cluster-role/](../k8s/rback/cluster-role/)

#### Why it matters

Without well-defined RBAC, any compromised pod can list secrets, escalate privileges, or modify deployments across the whole cluster. With namespaced `Role` and dedicated `ServiceAccount`, blast radius is constrained to the namespace and permitted verbs.

---

### 2. NetworkPolicy — Network traffic isolation

By default, Kubernetes allows free communication between pods across namespaces. `NetworkPolicy` objects define declarative network rules that restrict that traffic.

#### What should be applied in this project?

Currently, this project does not have NetworkPolicies applied (the cluster uses k3s with Flannel CNI, which supports them). The following is the recommended policy for backend:

```yaml
# Recommended example: k8s/network/backend-network-policy.yml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-only-ingress-and-postgres
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to: []           # allow DNS egress (UDP port 53)
      ports:
        - protocol: UDP
          port: 53
```

#### What this achieves

- Backend only accepts incoming traffic from the Ingress Controller.
- Backend can only egress to postgres on port 5432 and to DNS.
- No other pod can reach backend directly.

#### Why it matters

If a pod in another namespace is compromised, it cannot reach backend or the database. Lateral movement is blocked by default.

---

### 3. Image Scanning — CI vulnerability scanning

Docker images can contain libraries with known CVEs. Detecting them in the pipeline before images reach production is a critical preventive control.

#### Current status

The current pipeline ([.github/workflows/kubernetes-build-push-images.yml](../.github/workflows/kubernetes-build-push-images.yml)) builds and pushes images to GHCR but **does not include vulnerability scanning**.

#### Recommended Trivy integration

[Trivy](https://github.com/aquasecurity/trivy) is an open-source scanner from Aqua Security, widely used in Kubernetes environments and natively supported in GitHub Actions.

```yaml
# Add this step after build and before push:
- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository_owner }}/wellness-ops-backend:${{ github.ref_name }}
    format: table
    exit-code: '1'          # fail the pipeline on CRITICAL CVEs
    severity: 'CRITICAL,HIGH'
    ignore-unfixed: true    # ignore CVEs with no available fix
```

  #### What Trivy scans

  - Vulnerabilities in base system libraries (Debian, Alpine…)
  - Node.js dependencies listed in `package.json`
  - Configuration files with unsafe practices
  - Hardcoded secrets in images

  #### Recommended thresholds

  | Severity | Suggested action |
  |---|---|
  | CRITICAL | Block build — mandatory remediation |
  | HIGH | Block build — mandatory remediation |
  | MEDIUM | Notify — review in sprint |
  | LOW | Inventory — no immediate blocking |

---

### 4. Secrets management — Avoid plain-text secrets

Secrets (passwords, tokens, JWT keys) are among the most sensitive platform data. Exposing them in Git or logs is one of the most common and severe vulnerabilities.

#### Current project strategy

The project applies a layered strategy:

**Layer 1 — Kubernetes Secrets (base)**

Database credentials and JWT token are injected as environment variables through Kubernetes Secrets, not ConfigMaps.

```yaml
# k8s/backend/backend-secret.yml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
type: Opaque
stringData:
  DB_NAME: wellness
  DB_USER: postgres
  DB_PASSWORD: wellness
```

> ⚠️ This file exists in the repository with development values. **In production, this file should not exist in Git.** Values must be managed outside the repository.

**Layer 2 — Sealed Secrets (encryption at rest for GitOps)**

For the GitOps flow with ArgoCD, the PostgreSQL secret is encrypted using [Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) before being committed to the repository.

```yaml
# k8s/postgres-sealed-secret.yml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: postgres-secret
  namespace: default
spec:
  encryptedData:
    POSTGRES_DB: AgCrvt/pkogBVde...   # encrypted with cluster key
    POSTGRES_PASSWORD: AgBCRwnpGigh...
    POSTGRES_USER: AgDI1cimGIZWro...
```

The `sealed-secrets-controller` in the cluster decrypts the `SealedSecret` and creates the real `Secret` at runtime. The decryption key **never leaves the cluster**.

Reference: [k8s/postgres-sealed-secret.yml](../k8s/postgres-sealed-secret.yml)

**Layer 3 — GitHub Actions Secrets**

Required pipeline tokens (GHCR, kubeconfig) are stored as encrypted repository secrets in GitHub, never in source code:

```yaml
# Example usage in workflow:
- name: Login to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}   # ephemeral token per job
```

  #### Applied best practices

  | Practice | Status |
  |---|---|
  | DB credentials in Secret, not ConfigMap | ✅ Applied |
  | Sealed Secrets for GitOps | ✅ Applied (production) |
  | GHCR token not hardcoded | ✅ ephemeral `GITHUB_TOKEN` |
  | JWT secret as Kubernetes Secret | ✅ `backend-jwt-secret` exists |
  | Development secret without real values in Git | ⚠️ Pending review |
  | Periodic credential rotation | ⚠️ Not automated |

---

## 🔍 Security posture summary

| Area | Status | Improvement priority |
|---|---|---|
| RBAC with least privilege principle | ✅ Configured | Extend to all services |
| NetworkPolicy | ⚠️ Not applied | High — implement before external exposure |
| CI image scanning | ❌ Not configured | High — add Trivy to pipeline |
| Secrets in Kubernetes Secret | ✅ Applied | — |
| Sealed Secrets for GitOps | ✅ Applied | — |
| Development secrets in Git | ⚠️ Review | Medium — use dummy values or exclude |
| Credential rotation | ❌ Manual | Medium — evaluate automation |

---

## 📎 Repository references

- RBAC (Role namespaced): [k8s/rback/role-read-pods/](../k8s/rback/role-read-pods/)
- RBAC (ClusterRole): [k8s/rback/cluster-role/](../k8s/rback/cluster-role/)
- Backend Secret: [k8s/backend/backend-secret.yml](../k8s/backend/backend-secret.yml)
- JWT Secret: [k8s/backend/backend-jwt-secret.yml](../k8s/backend/backend-jwt-secret.yml)
- Sealed Secret (postgres): [k8s/postgres-sealed-secret.yml](../k8s/postgres-sealed-secret.yml)
- Pipeline CI/CD: [.github/workflows/kubernetes-build-push-images.yml](../.github/workflows/kubernetes-build-push-images.yml)

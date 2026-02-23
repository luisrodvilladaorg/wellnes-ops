#!/bin/bash

# Script to generate secure secrets for Wellness-Ops
# Usage: ./generate-secrets.sh

echo "=== Generating Secure Secrets for Wellness-Ops ==="
echo ""

# Generate database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "Database Password (DB_PASSWORD):"
echo "$DB_PASSWORD"
echo ""

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# Portable base64 encoding (works on both Linux and macOS)
if base64 --version 2>&1 | grep -q "GNU coreutils"; then
  # GNU base64 (Linux)
  JWT_SECRET_B64=$(echo -n "$JWT_SECRET" | base64 -w 0)
else
  # BSD base64 (macOS)
  JWT_SECRET_B64=$(echo -n "$JWT_SECRET" | base64)
fi

echo "JWT Secret (plain):"
echo "$JWT_SECRET"
echo ""
echo "JWT Secret (base64 for Kubernetes):"
echo "$JWT_SECRET_B64"
echo ""

echo "=== Instructions ==="
echo ""
echo "1. Update k8s/backend/backend-secret.yml:"
echo "   DB_PASSWORD: $DB_PASSWORD"
echo ""
echo "2. Update k8s/postgres/postgres-secret.yml:"
echo "   POSTGRES_PASSWORD: $DB_PASSWORD"
echo ""
echo "3. Update k8s/backend/backend-jwt-secret.yml:"
echo "   JWT_SECRET: $JWT_SECRET_B64"
echo ""
echo "IMPORTANT: Keep these secrets secure! Do not commit them to Git."
echo "Consider using Sealed Secrets or an external secret manager."
echo ""

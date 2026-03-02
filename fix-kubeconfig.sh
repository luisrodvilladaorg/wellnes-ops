#!/bin/bash
# Script para corregir el kubeconfig de k3d automáticamente

set -e

echo "🔧 Corrigiendo kubeconfig de k3d..."

# Regenerar kubeconfig desde k3d
k3d kubeconfig get cluster-wellness-local > ~/.kube/config

# Corregir la dirección del servidor (0.0.0.0 -> host válido en SAN)
CURRENT_SERVER="$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')"
FIXED_SERVER="${CURRENT_SERVER/0.0.0.0/127.0.0.1}"

kubectl config set-cluster k3d-cluster-wellness-local --server="${FIXED_SERVER}"

# Asegurar validación TLS con CA del cluster
kubectl config unset clusters.k3d-cluster-wellness-local.insecure-skip-tls-verify >/dev/null 2>&1 || true

# Verificar que funciona
if kubectl get nodes &> /dev/null; then
    echo "✅ Kubeconfig corregido correctamente"
    kubectl get nodes
else
    echo "❌ Error al conectar al cluster"
    exit 1
fi

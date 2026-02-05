Guía completa de diagnóstico y arreglo de HTTPS (con comandos y motivos)
=======================================================================

Resumen breve
-------------
Se diagnosticó un fallo de TLS al acceder a https://wellness.local. El problema no estaba en el backend sino en la exposición del Ingress: el host del certificado no coincidía, el Ingress duplicado colisionaba, y MetalLB asignaba IPs fuera de la red real de k3d. Se corrigieron manifiestos, se instaló y configuró MetalLB con el rango correcto, se actualizó /etc/hosts y se verificó con curl.


Índice
------
1) Diagnóstico inicial (comandos y por qué)
2) Correcciones de manifiestos (comandos y por qué)
3) Instalación y configuración de MetalLB (comandos y por qué)
4) Verificación de red (comandos y por qué)
5) Resolución local (comandos y por qué)
6) Verificación final (comandos y por qué)
7) Listados de recursos relevantes (resumen)
8) Causa raíz y solución final (explicación corta)


1) Diagnóstico inicial (comandos y por qué)
-------------------------------------------

Comando:
kubectl get ingress -A
Qué hace:
Lista todos los Ingress en todos los namespaces.
Por qué se ejecutó:
Para detectar duplicados, confirmar el host y ver si el Ingress TLS existía.

Comando:
kubectl describe ingress wellness-ingress -n default
Qué hace:
Muestra reglas, TLS, anotaciones y eventos del Ingress.
Por qué se ejecutó:
Para confirmar el host real, el secret TLS y las anotaciones del issuer.

Comando:
kubectl get certificate wellness-tls -n default -o wide
Qué hace:
Muestra estado del Certificate y el issuer asociado.
Por qué se ejecutó:
Para validar si el cert estaba Ready y con qué issuer.

Comando:
kubectl describe certificate wellness-tls -n default
Qué hace:
Detalla CN/DNSNames, emisor y eventos de emisión.
Por qué se ejecutó:
Para comprobar si el cert estaba generado para wellness.local o para otro host.

Comando:
kubectl get svc -n ingress-nginx -o wide
Qué hace:
Muestra el servicio del controlador Ingress y su IP externa.
Por qué se ejecutó:
Para ver si había IP accesible desde el host o estaba en pending.

Comando:
curl -vk https://wellness.local/api/health
Qué hace:
Prueba conexión TLS y respuesta del endpoint de salud.
Por qué se ejecutó:
Para reproducir el error SSL y tener un baseline antes de cambios.


2) Correcciones de manifiestos (comandos y por qué)
---------------------------------------------------

Comando:
kubectl apply -f k8s/tls/ca-issuer.yml
Qué hace:
Aplica el ClusterIssuer selfsigned (raíz inicial).
Por qué se ejecutó:
Es necesario para crear el CA interno.

Comando:
kubectl apply -f k8s/tls/ca-certificate.yml
Qué hace:
Crea el certificado CA (wellness-ca) en cert-manager.
Por qué se ejecutó:
Necesario para emitir certificados para el Ingress.

Comando:
kubectl apply -f k8s/tls/ca-clusterissuer.yml
Qué hace:
Crea el ClusterIssuer que usa el secret del CA.
Por qué se ejecutó:
Para que cert-manager pueda firmar el cert TLS final.

Comando:
kubectl apply -f k8s/tls/wellness-tls.yml
Qué hace:
Emite el certificado TLS para wellness.local.
Por qué se ejecutó:
El cert anterior estaba para wellness.127.0.0.1.nip.io.

Comando:
kubectl apply -f k8s/tls/wellness-ingress.yml
Qué hace:
Aplica el Ingress TLS con host wellness.local.
Por qué se ejecutó:
Para alinear host y TLS con el certificado correcto.

Comando:
kubectl apply -f k8s/ingress/ingress-http.yml
Qué hace:
Aplica el Ingress HTTP (renombrado para evitar colisión).
Por qué se ejecutó:
Evitar conflicto de host/path con el TLS.


3) Instalación y configuración de MetalLB (comandos y por qué)
--------------------------------------------------------------

Comando:
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
Qué hace:
Instala MetalLB (controller + speaker y CRDs).
Por qué se ejecutó:
Para asignar IPs externas a servicios LoadBalancer en k3d.

Comando:
kubectl -n metallb-system rollout status deploy/controller
Qué hace:
Espera a que el controlador de MetalLB esté listo.
Por qué se ejecutó:
Evitar fallos al crear los pools antes de que el controlador responda.

Comando:
kubectl -n metallb-system rollout status ds/speaker
Qué hace:
Espera a que el speaker de MetalLB esté listo.
Por qué se ejecutó:
Es necesario para anunciar IPs vía L2.

Comando:
kubectl apply -f k8s/metallb/ip-pool.yml
Qué hace:
Crea el IPAddressPool para MetalLB.
Por qué se ejecutó:
Definir el rango de IPs a asignar (ajustado a la red real de k3d).

Comando:
kubectl apply -f k8s/metallb/12-advertisement.yml
Qué hace:
Crea el L2Advertisement.
Por qué se ejecutó:
Anunciar en L2 las IPs del pool.


4) Verificación de red (comandos y por qué)
-------------------------------------------

Comando:
docker network inspect k3d-cluster-wellness-local
Qué hace:
Muestra la red real de Docker usada por k3d.
Por qué se ejecutó:
Para confirmar que el rango correcto era 172.19.0.0/16.

Comando:
docker ps --filter name=serverlb --format "{{.ID}} {{.Names}} {{.Ports}}"
Qué hace:
Muestra el load balancer de k3d y sus puertos expuestos.
Por qué se ejecutó:
Para verificar que 80/443 están publicados en el host.


5) Limpieza y reasignación de IPs (comandos y por qué)
------------------------------------------------------

Comando:
kubectl -n ingress-nginx get svc ingress-nginx-controller -o yaml | sed '/loadBalancerIP:/d' | sed '/^status:/,$d' > /tmp/ingress-nginx-svc.yaml
Qué hace:
Exporta el Service sin status ni loadBalancerIP.
Por qué se ejecutó:
Para recrearlo limpio y forzar nueva asignación de IP.

Comando:
kubectl -n ingress-nginx delete svc ingress-nginx-controller
Qué hace:
Elimina el service actual del Ingress.
Por qué se ejecutó:
Liberar la IP antigua no válida.

Comando:
kubectl apply -f /tmp/ingress-nginx-svc.yaml
Qué hace:
Recrea el service del Ingress sin IP fija.
Por qué se ejecutó:
Permitir que MetalLB asigne una IP válida del pool nuevo.

Comando:
kubectl -n default delete svc nginx-gateway
Qué hace:
Elimina el service nginx-gateway.
Por qué se ejecutó:
Liberar IP antigua no válida y evitar conflictos.

Comando:
kubectl -n default apply -f k8s/nginx/nginx-service.yml
Qué hace:
Recrea nginx-gateway y asigna IP válida.
Por qué se ejecutó:
Evitar que otro LoadBalancer quede con IP fuera del pool.


6) Resolución local (comandos y por qué)
----------------------------------------

Comando:
grep -n "wellness.local" /etc/hosts
Qué hace:
Muestra la línea de resolución local del host.
Por qué se ejecutó:
Validar que wellness.local apunta a la IP correcta.

Comando:
sudo sed -i 's/.*\bwellness\.local\b.*/172.19.255.200 wellness.local/' /etc/hosts
Qué hace:
Actualiza la IP de wellness.local en /etc/hosts.
Por qué se ejecutó:
Hacer que el host resuelva al IP del Ingress.


7) Verificación final (comandos y por qué)
------------------------------------------

Comando:
curl -v http://wellness.local/health --connect-timeout 5
Qué hace:
Prueba HTTP y muestra redirección.
Por qué se ejecutó:
Confirmar redirección 308 a HTTPS.

Comando:
curl -vk https://wellness.local/api/health --connect-timeout 5
Qué hace:
Prueba HTTPS con salida detallada del handshake.
Por qué se ejecutó:
Confirmar que TLS responde 200 y el backend está sano.


8) Listados de recursos relevantes (resumen)
-------------------------------------------

Ingress TLS
- default/wellness-ingress
- Host: wellness.local
- TLS secret: wellness-tls
- Paths: /api -> backend:3000, / -> frontend-service:80

Ingress HTTP (renombrado)
- default/wellness-ingress-http
- Evita colisión con TLS

Services LoadBalancer
- ingress-nginx-controller (IP MetalLB del Ingress)
- nginx-gateway (IP MetalLB del gateway)

Cert-manager
- ClusterIssuer: wellness-ca
- Certificate: wellness-tls (CN wellness.local)


Causa raíz y solución final (explicación corta)
-----------------------------------------------
La conexión HTTPS fallaba porque el certificado no correspondía al host real, había colisiones de Ingress, y MetalLB asignaba IPs fuera de la red de k3d, lo que hacía que el host no pudiera enrutar hacia el Ingress. Se corrigieron los manifiestos (host y issuer), se ajustó el pool de MetalLB al rango 172.19.0.0/16, se recrearon services para reasignar IPs válidas, y se actualizó /etc/hosts. Tras ello, el endpoint HTTPS respondió correctamente.


Fin del documento
-----------------

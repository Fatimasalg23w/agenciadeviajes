import requests, json

# Lista de proxies que quieres probar (IP:PUERTO)
proxies = [
  "38.49.152.103:8080",
  "200.188.112.142:999",
  "187.189.63.149:8080",
  "45.174.94.26:999",
  "186.96.50.113:999",
  "38.194.235.146:999",
  "200.188.112.138:999"
]


validos = []

for proxy in proxies:
    proxy_url = f"http://{proxy}"
    try:
        r = requests.get(
            "https://www.despegar.com.mx",
            proxies={"http": proxy_url, "https": proxy_url},
            timeout=5
        )
        print(proxy, "→", r.status_code)
        if r.status_code in [200, 302]:
            validos.append(proxy)
    except Exception as e:
        print(proxy, "falló:", e)

# 👉 Guardar directamente en proxies.json
with open("proxies.json", "w") as f:
    json.dump(validos, f, indent=2)

print("\nProxies válidos guardados en proxies.json:", validos)

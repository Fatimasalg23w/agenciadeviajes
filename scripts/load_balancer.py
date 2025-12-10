import subprocess, json, random

# Cargar proxies desde proxies.json
with open("proxies.json") as f:
    PROXIES = json.load(f)

workers = [
    ["python3", "scripts/playwright_worker.py"],
    ["python3", "scripts/playwright_worker_edge.py"]
]

def get_random_proxy():
    if not PROXIES:
        return None
    return random.choice(PROXIES)

def run_with_fallback(args):
    for worker in workers:
        proxy = get_random_proxy()
        env = dict(**{"HTTP_PROXY": proxy, "HTTPS_PROXY": proxy}) if proxy else None
        try:
            print(f"\n>>> Ejecutando {worker[1]} con proxy {proxy or 'sin proxy'}")
            result = subprocess.run(worker + args, check=True, capture_output=True, text=True, env=env)
            try:
                data = json.loads(result.stdout)
                print(json.dumps(data, ensure_ascii=False, indent=2))
            except Exception:
                print(result.stdout)
            return
        except subprocess.CalledProcessError as e:
            print(f"Worker falló: {worker[1]} Error: {e}")
    print("Todos los workers fallaron")

if __name__ == "__main__":
    args = ["Londres", "Cancún", "2025-12-10", "2025-12-17", "PAQUETE"]
    run_with_fallback(args)

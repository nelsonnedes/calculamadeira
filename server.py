import http.server
import socketserver
import os

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar headers necessários para PWA
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Service-Worker-Allowed', '/')
        super().end_headers()

PORT = 8000

print(f"""
Servidor iniciado em:
Local: http://localhost:{PORT}
""")

# Pegar o IP local para acesso via celular
import socket
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)
print(f"Para acessar pelo celular use: http://{local_ip}:{PORT}")
print("\nCertifique-se que o celular está na mesma rede Wi-Fi")
print("\nPressione Ctrl+C para parar o servidor")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado!") 
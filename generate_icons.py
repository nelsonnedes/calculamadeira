import os
from cairosvg import svg2png, svg2svg

# Tamanhos dos ícones
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# Ler o arquivo SVG
with open('icons/icon.svg', 'rb') as svg_file:
    svg_content = svg_file.read()

# Criar os ícones em diferentes tamanhos
for size in sizes:
    # Gerar PNG
    svg2png(
        bytestring=svg_content,
        write_to=f'icons/icon-{size}x{size}.png',
        output_width=size,
        output_height=size
    )
    print(f'Ícone {size}x{size} gerado com sucesso!')

print('\nTodos os ícones foram gerados com sucesso!') 
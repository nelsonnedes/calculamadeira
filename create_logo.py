from PIL import Image, ImageDraw

# Criar uma nova imagem com fundo transparente
size = 200
image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Desenhar fundo vermelho escuro com cantos arredondados
draw.rounded_rectangle([(0, 0), (size-1, size-1)], radius=20, fill='#8B0000')

# Desenhar corpo da calculadora (branco)
draw.rounded_rectangle([(40, 40), (160, 160)], radius=10, fill='white')

# Desenhar display (cinza claro)
draw.rounded_rectangle([(50, 50), (150, 80)], radius=5, fill='#f0f0f0')

# Desenhar botões (vermelho escuro)
button_positions = [
    # Linha 1
    [(50, 90), (70, 110)],
    [(75, 90), (95, 110)],
    [(100, 90), (120, 110)],
    [(125, 90), (145, 110)],
    # Linha 2
    [(50, 115), (70, 135)],
    [(75, 115), (95, 135)],
    [(100, 115), (120, 135)],
    [(125, 115), (145, 135)],
    # Linha 3
    [(50, 140), (70, 160)],
    [(75, 140), (95, 160)],
    [(100, 140), (120, 160)],
    [(125, 140), (145, 160)]
]

for pos in button_positions:
    draw.rounded_rectangle(pos, radius=3, fill='#8B0000')

# Salvar a imagem
image.save('logo.png')
print("Logo criada com sucesso!") 
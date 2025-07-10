from PIL import Image, ImageDraw

# Tamanhos dos ícones
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

def create_icon(size):
    # Criar uma nova imagem com fundo transparente
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Calcular proporções
    padding = size // 8
    calc_size = size - (2 * padding)
    button_size = calc_size // 4
    spacing = button_size // 4
    
    # Desenhar fundo vermelho escuro com cantos arredondados
    draw.rounded_rectangle([(0, 0), (size, size)], radius=size//4, fill=(139, 0, 0))
    
    # Desenhar calculadora branca
    draw.rounded_rectangle(
        [(padding, padding), (size-padding, size-padding)],
        radius=size//16,
        fill=(255, 255, 255)
    )
    
    # Desenhar display
    display_height = calc_size // 4
    draw.rounded_rectangle(
        [(padding*1.2, padding*1.2), (size-padding*1.2, padding*1.2+display_height)],
        radius=size//32,
        fill=(224, 224, 224)
    )
    
    # Desenhar botões
    button_y = padding*1.2 + display_height + spacing
    for row in range(3):
        button_x = padding*1.2
        for col in range(4):
            draw.rounded_rectangle(
                [(button_x, button_y), (button_x+button_size, button_y+button_size)],
                radius=size//32,
                fill=(139, 0, 0)
            )
            button_x += button_size + spacing
        button_y += button_size + spacing
    
    # Salvar o ícone
    image.save(f'icons/icon-{size}x{size}.png')
    print(f'Ícone {size}x{size} gerado com sucesso!')

# Gerar ícones em todos os tamanhos
for size in sizes:
    create_icon(size)

print('\nTodos os ícones foram gerados com sucesso!') 
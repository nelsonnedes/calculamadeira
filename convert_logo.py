from PIL import Image
import cairosvg

# Converter SVG para PNG
cairosvg.svg2png(url='logo.svg', write_to='logo.png', output_width=200, output_height=200)
print("Logo convertida com sucesso!") 
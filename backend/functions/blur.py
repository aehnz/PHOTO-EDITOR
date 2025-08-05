from PIL import Image, ImageFilter
import io

def blur(imageBytes: bytes, radius: int = 2) -> bytes:
    try:
        with io.BytesIO(imageBytes) as inputStream:
            img = Image.open(inputStream)
            imageFormat = img.format if img.format else 'PNG'
            blurredIMG = img.filter(ImageFilter.GaussianBlur(radius))
            outputStream = io.BytesIO()
            blurredIMG.save(outputStream, format=imageFormat)
            return outputStream.getvalue()
    except Exception as e:
        print(f"An error occurred during image blurring: {e}")
        return b''
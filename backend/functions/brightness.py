from PIL import Image, ImageEnhance
import io


def brightness(imageBytes: bytes, brightness_factor: float = 1.0) -> bytes:
    try:
        with io.BytesIO(imageBytes) as inputStream:
            img = Image.open(inputStream)
            imageFormat = img.format if img.format else 'PNG'
            enhancer = ImageEnhance.Brightness(img)
            bright_img = enhancer.enhance(brightness_factor)
            outputStream = io.BytesIO()
            bright_img.save(outputStream, format=imageFormat)
            return outputStream.getvalue()
    except Exception as e:
        print(f"An error occurred during brightness adjustment: {e}")
        return b''
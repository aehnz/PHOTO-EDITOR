from PIL import Image, ImageEnhance
import io


def contrast(imageBytes: bytes, contrast_factor: float = 1.0) -> bytes:
    try:
        with io.BytesIO(imageBytes) as inputStream:
            img = Image.open(inputStream)
            imageFormat = img.format if img.format else 'PNG'
            enhancer = ImageEnhance.Contrast(img)
            contrasted_img = enhancer.enhance(contrast_factor)
            outputStream = io.BytesIO()
            contrasted_img.save(outputStream, format=imageFormat)
            return outputStream.getvalue()
    except Exception as e:
        print(f"An error occurred during contrast adjustment: {e}")
        return b''

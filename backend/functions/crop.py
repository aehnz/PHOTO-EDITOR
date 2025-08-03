from PIL import Image
import io

def crop(inputBytes: bytes, left: int, upper: int, right: int, lower: int) -> bytes:

    try:
        with io.BytesIO(inputBytes) as inputStream:
            img = Image.open(inputStream)
            imageFormat = img.format if img.format else 'PNG'
            croppedIMG = img.crop((left, upper, right, lower))
            outputStream = io.BytesIO()
            croppedIMG.save(outputStream, format=imageFormat)
            return outputStream.getvalue()

    except Exception as e:
        print(f"An error occurred during image cropping: {e}")
        return b''

from PIL import Image
import io

def rotate(imageBytes: bytes, degrees: int = 90) -> bytes:

    try:
        degrees=degrees%360        
        with io.BytesIO(imageBytes) as inputStream:
            img = Image.open(inputStream)
            imageFormat = img.format
            rotatedIMG = img.rotate(degrees, expand=True)
            outputStream = io.BytesIO()
            rotatedIMG.save(outputStream, format=imageFormat)
            return outputStream.getvalue()

    except Exception as e:
        print(f"An error occurred during image rotation: {e}")
        return b''
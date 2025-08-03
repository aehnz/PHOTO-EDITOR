from PIL import Image
import io

def rotate(image_bytes: bytes, degrees: int = 90) -> bytes:

    try:
        # Normalize degrees to [0, 360)
        degrees = degrees % 360
        # Use a BytesIO object to treat the bytes as a file.
        with io.BytesIO(image_bytes) as byte_stream:
            img = Image.open(byte_stream)

            # Storing the original format.
            original_format = img.format

            # Rotate the image.
            rotated_img = img.rotate(degrees, expand=True)

            # Create a new BytesIO object to save the rotated image.
            rotated_byte_stream = io.BytesIO()

            # Save the rotated image
            rotated_img.save(rotated_byte_stream, format=original_format)
            return rotated_byte_stream.getvalue()

    except Exception as e:
        print(f"An error occurred during image rotation: {e}")
        return b''
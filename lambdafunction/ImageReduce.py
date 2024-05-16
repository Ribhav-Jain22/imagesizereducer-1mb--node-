import os
import base64
import tempfile
from PIL import Image
import json

def resize_image(input_image_data, output_image_path):
    # Decode base64-encoded image data
    image_bytes = base64.b64decode(input_image_data)

    # Create a BytesIO object to read the image
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_image_file:
        temp_image_file.write(image_bytes)
        temp_image_file_path = temp_image_file.name

    # Open the image using PIL
    with Image.open(temp_image_file_path) as img:
        # Resize the image to 40x40
        resized_img = img.resize((40, 40))

        # Save the resized image
        resized_img.save(output_image_path)

    # Clean up temporary file
    os.unlink(temp_image_file_path)

def lambda_handler(event, context):
    # Get the input image data from the event
    input_image_data = event['image_data']

    # Create a temporary directory to save the resized image
    with tempfile.TemporaryDirectory() as temp_dir:
        output_image_path = os.path.join(temp_dir, "output_image.jpg")

        # Resize the image
        resize_image(input_image_data, output_image_path)

        # Read the resized image data
        with open(output_image_path, 'rb') as f:
            resized_image_data = base64.b64encode(f.read()).decode('utf-8')

    return {
        'resized_image_data': resized_image_data
    }

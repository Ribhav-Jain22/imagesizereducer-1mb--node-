const imagemagick = require('imagemagick');

exports.handler = async (event) => {
    try {
        const imageData = JSON.parse(event.image_data);
        
        // Assume the image data is base64 encoded
        const inputImageBuffer = Buffer.from(imageData, 'base64');
        
        // Define the target size in bytes (1MB = 1024 * 1024 bytes)
        const targetSize = 1024 * 1024;
        
        // Use imagemagick to resize the image while keeping the aspect ratio
        return new Promise((resolve, reject) => {
            imagemagick.resize({
                srcData: inputImageBuffer,
                quality: 0.9, // Initial quality (0.9 is a typical starting point)
                format: 'jpg', // Change the format if needed
                width: 800, // Adjust the width to fit the desired size
                height: 600, // Adjust the height to fit the desired size
                progressive: false
            }, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    const resizedImageBuffer = Buffer.from(stdout, 'binary');
                    const fileSize = resizedImageBuffer.length;
                    
                    // If the file size is within the target range, return the resized image
                    if (fileSize <= targetSize) {
                        resolve({
                            statusCode: 200,
                            headers: {
                                'Content-Type': 'image/jpeg'
                            },
                            body: resizedImageBuffer.toString('base64'),
                            isBase64Encoded: true
                        });
                    } else {
                        // If the file size exceeds the target, recursively reduce the quality
                        resolve(resizeImageWithQuality(targetSize, resizedImageBuffer, 0.9));
                    }
                }
            });
        });
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error processing image",
                error: error
            })
        };
    }
};

function resizeImageWithQuality(targetSize, imageBuffer, quality) {
    return new Promise((resolve, reject) => {
        const newQuality = quality - 0.05; // Reduce quality by 5% each time
        
        // Use imagemagick to resize the image with the new quality
        imagemagick.resize({
            srcData: imageBuffer,
            quality: newQuality,
            format: 'jpg', // Change the format if needed
            width: 800, // Adjust the width to fit the desired size
            height: 600, // Adjust the height to fit the desired size
            progressive: false
        }, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                const resizedImageBuffer = Buffer.from(stdout, 'binary');
                const fileSize = resizedImageBuffer.length;
                
                // If the file size is within the target range, return the resized image
                if (fileSize <= targetSize || newQuality <= 0) {
                    resolve({
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'image/jpeg'
                        },
                        body: resizedImageBuffer.toString('base64'),
                        isBase64Encoded: true
                    });
                } else {
                    // If the file size still exceeds the target, recursively reduce the quality
                    resolve(resizeImageWithQuality(targetSize, resizedImageBuffer, newQuality));
                }
            }
        });
    });
}

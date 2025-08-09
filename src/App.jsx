import Button from "./Button.jsx"
import InputFile from "./inputFile.jsx"
import {useState} from "react";
import './App.css'

function App() {

    let [hasImage,setHasImage] = useState(false);
    let [imageSrc, setImageSrc] = useState(null);
    let [cropMode, setCropMode] = useState(false);
    let [cropArea, setCropArea] = useState({
        x: 50,
        y: 50,
        width: 200,
        height: 150
    });
    let [isDragging, setIsDragging] = useState(false);
    let [isResizing, setIsResizing] = useState(false);
    let [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    let [resizeHandle, setResizeHandle] = useState(null);
    let [blurMode, setBlurMode] = useState(false);
    let [blurIntensity, setBlurIntensity] = useState(5);
    let [contrastMode, setContrastMode] = useState(false);
    let [contrastValue, setContrastValue] = useState(100); // 100% is normal contrast

    function handleChange(e){ // to re-render the screen when the image is uploaded
        if(e.target.files.length > 0){
            const File = e.target.files[0];
            const fileReader = new FileReader(); // creating a new File Reader instance

            fileReader.onloadend = () => {
                setImageSrc(fileReader.result) // convert the file in web displayable format
            }

            fileReader.readAsDataURL(File)
            setHasImage(true)
        }
    }

    function removeImage(){
        setImageSrc(null);
        setHasImage(false);
        setCropMode(false);
        setBlurMode(false);
        setBlurIntensity(5);
        setContrastMode(false);
        setContrastValue(100);
    }

    function enableCropMode(){
        if(!hasImage) {
            alert("Please upload an image first before cropping!");
            return;
        }
        setCropMode(true);
    }

    function handleEditAction(action) {
        if(!hasImage) {
            alert(`Please upload an image first before applying ${action.toLowerCase()}!`);
            return;
        }
        
        if(action === 'Blur') {
            enableBlurMode();
        } else if(action === 'Contrast') {
            enableContrastMode();
        } else {
            // Placeholder for future edit functionality
            console.log(`${action} functionality will be implemented here`);
        }
    }

    function cancelCrop(){
        setCropMode(false);
    }

    function enableBlurMode(){
        if(!hasImage) {
            alert("Please upload an image first before applying blur!");
            return;
        }
        setBlurMode(true);
    }

    function cancelBlur(){
        setBlurMode(false);
        setBlurIntensity(5); // Reset to default
    }

    function saveBlur(){
        // Create a canvas to apply blur to the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Apply blur filter and draw image
        ctx.filter = `blur(${blurIntensity}px)`;
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and update image
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setBlurMode(false);
            setBlurIntensity(5); // Reset to default
        }, 'image/png');
    }

    function handleBlurChange(e){
        setBlurIntensity(parseInt(e.target.value));
    }

    function enableContrastMode(){
        if(!hasImage) {
            alert("Please upload an image first before applying contrast!");
            return;
        }
        setContrastMode(true);
    }

    function cancelContrast(){
        setContrastMode(false);
        setContrastValue(100); // Reset to default (100% = normal)
    }

    function saveContrast(){
        // Create a canvas to apply contrast to the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Apply contrast filter and draw image
        ctx.filter = `contrast(${contrastValue}%)`;
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to blob and update image
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setContrastMode(false);
            setContrastValue(100); // Reset to default
        }, 'image/png');
    }

    function handleContrastChange(e){
        setContrastValue(parseInt(e.target.value));
    }

    // Universal handlers for both mouse and touch events
    const getEventCoordinates = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    };

    // Drag and resize handlers
    const handlePointerDown = (e, action, handle = null) => {
        e.preventDefault();
        const coords = getEventCoordinates(e);
        const rect = e.currentTarget.closest('.image-container').getBoundingClientRect();
        const x = coords.clientX - rect.left;
        const y = coords.clientY - rect.top;
        
        setDragStart({ x, y });
        
        if (action === 'drag') {
            setIsDragging(true);
        } else if (action === 'resize') {
            setIsResizing(true);
            setResizeHandle(handle);
        }
    };

    const handlePointerMove = (e) => {
        if (!isDragging && !isResizing) return;
        
        const coords = getEventCoordinates(e);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = coords.clientX - rect.left;
        const y = coords.clientY - rect.top;
        
        const deltaX = x - dragStart.x;
        const deltaY = y - dragStart.y;
        
        if (isDragging) {
            setCropArea(prev => ({
                ...prev,
                x: Math.max(0, Math.min(prev.x + deltaX, rect.width - prev.width)),
                y: Math.max(0, Math.min(prev.y + deltaY, rect.height - prev.height))
            }));
            setDragStart({ x, y });
        } else if (isResizing && resizeHandle) {
            setCropArea(prev => {
                let newArea = { ...prev };
                
                switch (resizeHandle) {
                    case 'nw':
                        newArea.width = Math.max(50, prev.width - deltaX);
                        newArea.height = Math.max(50, prev.height - deltaY);
                        newArea.x = Math.max(0, prev.x + deltaX);
                        newArea.y = Math.max(0, prev.y + deltaY);
                        break;
                    case 'ne':
                        newArea.width = Math.max(50, prev.width + deltaX);
                        newArea.height = Math.max(50, prev.height - deltaY);
                        newArea.y = Math.max(0, prev.y + deltaY);
                        break;
                    case 'sw':
                        newArea.width = Math.max(50, prev.width - deltaX);
                        newArea.height = Math.max(50, prev.height + deltaY);
                        newArea.x = Math.max(0, prev.x + deltaX);
                        break;
                    case 'se':
                        newArea.width = Math.max(50, prev.width + deltaX);
                        newArea.height = Math.max(50, prev.height + deltaY);
                        break;
                }
                
                // Ensure crop area stays within bounds
                if (newArea.x + newArea.width > rect.width) {
                    newArea.width = rect.width - newArea.x;
                }
                if (newArea.y + newArea.height > rect.height) {
                    newArea.height = rect.height - newArea.y;
                }
                
                return newArea;
            });
            setDragStart({ x, y });
        }
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    function saveCrop(){
        // Create a canvas to crop the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        // Get the actual display dimensions and scale
        const displayWidth = img.clientWidth;
        const displayHeight = img.clientHeight;
        const scaleX = img.naturalWidth / displayWidth;
        const scaleY = img.naturalHeight / displayHeight;
        
        // Set canvas size to crop area
        canvas.width = cropArea.width * scaleX;
        canvas.height = cropArea.height * scaleY;
        
        // Draw cropped portion
        ctx.drawImage(
            img,
            cropArea.x * scaleX, cropArea.y * scaleY,
            cropArea.width * scaleX, cropArea.height * scaleY,
            0, 0,
            canvas.width, canvas.height
        );
        
        // Convert canvas to data URL and update image
        const croppedImageData = canvas.toDataURL();
        setImageSrc(croppedImageData);
        setCropMode(false);
    }

  return (
    <>
        {/* Floating orbs */}
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="orb orb4"></div>
        <div className="orb orb5"></div>
        <div className="orb orb6"></div>
        <div className="orb orb7"></div>
        <div className="orb orb8"></div>

        <div className="image-wrapper">
            {hasImage && imageSrc && (
                <div 
                    className={`image-container ${(isDragging || isResizing) ? 'no-select' : ''}`}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                >
                    <img 
                        src={imageSrc} 
                        alt="uploaded Image" 
                        className="uploaded-image"
                        style={{
                            filter: `${blurMode ? `blur(${blurIntensity}px)` : ''} ${contrastMode ? `contrast(${contrastValue}%)` : ''}`.trim()
                        }}
                    />
                    {cropMode && (
                        <div 
                            className={`crop-box ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
                            style={{
                                left: cropArea.x,
                                top: cropArea.y,
                                width: cropArea.width,
                                height: cropArea.height
                            }}
                            onMouseDown={(e) => handlePointerDown(e, 'drag')}
                            onTouchStart={(e) => handlePointerDown(e, 'drag')}
                        >
                            <div 
                                className="crop-handle crop-handle-nw"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'nw');
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'nw');
                                }}
                            ></div>
                            <div 
                                className="crop-handle crop-handle-ne"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'ne');
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'ne');
                                }}
                            ></div>
                            <div 
                                className="crop-handle crop-handle-sw"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'sw');
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'sw');
                                }}
                            ></div>
                            <div 
                                className="crop-handle crop-handle-se"
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'se');
                                }}
                                onTouchStart={(e) => {
                                    e.stopPropagation();
                                    handlePointerDown(e, 'resize', 'se');
                                }}
                            ></div>
                        </div>
                    )}
                </div>
            )}
            {hasImage && imageSrc && (<button type="button" id="close" onClick={removeImage}>X</button>)}
        </div>

        <div className="input-wrapper">
            {!hasImage ? <InputFile onImageUpload={handleChange}/> : null}
        </div>

        <div className="btn">
            {!cropMode && !blurMode && !contrastMode ? (
                <div className="button-grid">
                    <Button name="Crop" onClick={enableCropMode} disabled={!hasImage}/>
                    <Button name="Blur" onClick={() => handleEditAction("Blur")} disabled={!hasImage}/>
                    <Button name="Contrast" onClick={() => handleEditAction("Contrast")} disabled={!hasImage}/>
                    <Button name="Rotate" onClick={() => handleEditAction("Rotate")} disabled={!hasImage}/>
                </div>
            ) : cropMode ? (
                <div className="button-row">
                    <Button name="Save Crop" onClick={saveCrop}/>
                    <Button name="Cancel" onClick={cancelCrop}/>
                </div>
            ) : blurMode ? (
                <>
                    <div className="blur-controls">
                        <label htmlFor="blur-slider" className="blur-label">
                            Blur: {blurIntensity}px
                        </label>
                        <input 
                            type="range" 
                            id="blur-slider"
                            min="0" 
                            max="20" 
                            value={blurIntensity}
                            onChange={handleBlurChange}
                            className="blur-slider"
                        />
                    </div>
                    <div className="button-row">
                        <Button name="Save Blur" onClick={saveBlur}/>
                        <Button name="Cancel" onClick={cancelBlur}/>
                    </div>
                </>
            ) : contrastMode ? (
                <>
                    <div className="contrast-controls">
                        <label htmlFor="contrast-slider" className="contrast-label">
                            Contrast: {contrastValue}%
                        </label>
                        <input 
                            type="range" 
                            id="contrast-slider"
                            min="0" 
                            max="200" 
                            value={contrastValue}
                            onChange={handleContrastChange}
                            className="contrast-slider"
                        />
                    </div>
                    <div className="button-row">
                        <Button name="Save Contrast" onClick={saveContrast}/>
                        <Button name="Cancel" onClick={cancelContrast}/>
                    </div>
                </>
            ) : null}
        </div>

    </>
  )
}

export default App

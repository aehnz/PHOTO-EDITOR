import Button from "./Button.jsx"
import InputFile from "./inputFile.jsx"
import {useState, useRef} from "react";
import { motion, AnimatePresence } from "framer-motion";
import './App.css'

function LandingPage({ onStartEditing }) {
  return (
    <motion.div
      className="landing-page"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="landing-content"
        initial={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="app-title"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          VoxEdit
        </motion.h1>
        <motion.p
          className="app-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          AI Voice Powered Photo Editor
        </motion.p>
        <motion.button
          className="start-button"
          onClick={onStartEditing}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Editing
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function PhotoEditor() {

    const [hasImage,setHasImage] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [cropMode, setCropMode] = useState(false);
    const [cropArea, setCropArea] = useState({
        x: 50,
        y: 50,
        width: 200,
        height: 150
    });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeHandle, setResizeHandle] = useState(null);
    const [blurMode, setBlurMode] = useState(false);
    const [blurIntensity, setBlurIntensity] = useState(5);
    const [contrastMode, setContrastMode] = useState(false);
    const [contrastValue, setContrastValue] = useState(100); 
    const [rotateMode, setRotateMode] = useState(false);
    const [rotateDegree, setRotateDegree] = useState(0);
    const [micAnimationActive, setMicAnimationActive] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [brightnessMode, setBrightnessMode] = useState(false);
    const [brightnessValue, setBrightnessValue] = useState(100); 
    const recognitionRef = useRef(null);

    function handleChange(e){ 
        if(e.target.files.length > 0){
            const File = e.target.files[0];
            const fileReader = new FileReader(); 

            fileReader.onloadend = () => {
                setImageSrc(fileReader.result) 
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
        setRotateMode(false);
        setRotateDegree(0);
        setBrightnessMode(false);
        setBrightnessValue(100);
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
        } else if(action === 'Brightness') {
            enableBrightnessMode();
        } else if(action === 'Rotate') {
            enableRotateMode();
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
        setBlurIntensity(5); 
    }


    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }


    async function processImageOnBackend(operation, params = {}) {
        if (!imageSrc) return;
        const blob = dataURLtoBlob(imageSrc);
        const formData = new FormData();
        formData.append('image', blob, 'image.png');
        formData.append('operation', operation);
        Object.entries(params).forEach(([key, value]) => {
            formData.append(key, value);
        });
        try {
            const response = await fetch('https://vox-edit.onrender.com/process-image', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Backend error');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setImageSrc(url);
        } catch (err) {
            alert('Image processing failed: ' + err.message);
        }
    }

    async function buildImageBlobFromSrc() {
        if (!imageSrc) return null;
        try {
            if (imageSrc.startsWith('data:')) {
                return dataURLtoBlob(imageSrc);
            } else {
                const res = await fetch(imageSrc);
                return await res.blob();
            }
        } catch (e) {
            return null;
        }
    }

    async function sendVoiceCommandToBackend(transcript) {
        const formData = new FormData();
        formData.append('command', transcript);
        
        if (hasImage && imageSrc) {
            const blob = await buildImageBlobFromSrc();
            if (blob) formData.append('image', blob, 'image.png');
        }
        try {
            const response = await fetch('https://vox-edit.onrender.com/voice-command', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                
                let msg = 'Backend error';
                try {
                    const data = await response.json();
                    msg = data?.error || JSON.stringify(data);
                } catch (_) {
                    
                }
                throw new Error(msg);
            }
            const resultBlob = await response.blob();
            const url = URL.createObjectURL(resultBlob);
            setImageSrc(url);
        } catch (err) {
            alert('Voice command failed: ' + err.message);
        }
    }

    function handleMicClick(){
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech Recognition not supported in this browser.');
            return;
        }
        
        if (recognitionRef.current && isListening) {
            try { recognitionRef.current.stop(); } catch(_) {}
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onstart = () => {
            setIsListening(true);
            setMicAnimationActive(true);
        };
        recognition.onerror = () => {
            setIsListening(false);
            setMicAnimationActive(false);
        };
        recognition.onend = () => {
            setIsListening(false);
            setMicAnimationActive(false);
        };
        recognition.onresult = (event) => {
            const transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
            if (transcript && transcript.trim().length > 0) {
                sendVoiceCommandToBackend(transcript.trim());
            }
        };
        recognitionRef.current = recognition;
        recognition.start();
    }

    function saveBlur(){
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.filter = `blur(${blurIntensity}px)`;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setBlurMode(false);
            setBlurIntensity(5); 
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
        setContrastValue(100); 
    }

    function saveContrast(){
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
     
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.filter = `contrast(${contrastValue}%)`;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setContrastMode(false);
            setContrastValue(100); 
        }, 'image/png');
    }

    function handleContrastChange(e){
        setContrastValue(parseInt(e.target.value));
    }

    function enableRotateMode(){
        if(!hasImage) {
            alert("Please upload an image first before rotating!");
            return;
        }
        setRotateMode(true);
    }

    function cancelRotate(){
        setRotateMode(false);
        setRotateDegree(0); 
    }

    function saveRotate(){
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        const radian = (rotateDegree * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radian));
        const cos = Math.abs(Math.cos(radian));
        const newWidth = img.naturalWidth * cos + img.naturalHeight * sin;
        const newHeight = img.naturalWidth * sin + img.naturalHeight * cos;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.save();
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radian);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();
        
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setRotateMode(false);
            setRotateDegree(0); 
        }, 'image/png');
    }

    function handleRotateChange(e){
        setRotateDegree(parseInt(e.target.value));
    }

    function enableBrightnessMode(){
        if(!hasImage) {
            alert("Please upload an image first before applying brightness!");
            return;
        }
        setBrightnessMode(true);
    }

    function cancelBrightness(){
        setBrightnessMode(false);
        setBrightnessValue(100); 
    }

    function handleBrightnessChange(e){
        setBrightnessValue(parseInt(e.target.value));
    }

    function saveBrightness(){
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.filter = `brightness(${brightnessValue}%)`;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
            const newImageUrl = URL.createObjectURL(blob);
            setImageSrc(newImageUrl);
            setBrightnessMode(false);
            setBrightnessValue(100); 
        }, 'image/png');
    }

    
    const getEventCoordinates = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
        }
        return { clientX: e.clientX, clientY: e.clientY };
    };

    
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
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.querySelector('.uploaded-image');
        
        const displayWidth = img.clientWidth;
        const displayHeight = img.clientHeight;
        const scaleX = img.naturalWidth / displayWidth;
        const scaleY = img.naturalHeight / displayHeight;
        
        canvas.width = cropArea.width * scaleX;
        canvas.height = cropArea.height * scaleY;
        
        ctx.drawImage(
            img,
            cropArea.x * scaleX, cropArea.y * scaleY,
            cropArea.width * scaleX, cropArea.height * scaleY,
            0, 0,
            canvas.width, canvas.height
        );
        
        const croppedImageData = canvas.toDataURL();
        setImageSrc(croppedImageData);
        setCropMode(false);
    }



    async function downloadImage() {
        if (!imageSrc) {
            alert('No image to download!');
            return;
        }
        try {
            let blob;
            if (imageSrc.startsWith('data:')) {
                const arr = imageSrc.split(','), mime = arr[0].match(/:(.*?);/)[1],
                      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
                blob = new Blob([u8arr], { type: mime });
            } else {
                const res = await fetch(imageSrc);
                blob = await res.blob();
            }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'edited.png';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Download failed: ' + e.message);
        }
    }

    return (
    <>
        {/* Editor Background - Same as landing page */}
        <div className="editor-background"></div>

        {/* Close (X) button in top-left */}
        {hasImage && imageSrc && (
            <div style={{ position: 'fixed', top: '0.5rem', left: '0.5rem', zIndex: 2000 }}>
                <button type="button" id="close" onClick={removeImage}>X</button>
            </div>
        )}
        {/* Download Image button in top-right */}
        <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000 }}>
            <Button name="Download Image" onClick={downloadImage} disabled={!hasImage}/>
        </div>

        <div className="image-wrapper">
            {hasImage && imageSrc && (
                <div 
                    className={`image-container ${(isDragging || isResizing) ? 'no-select' : ''}`}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    style={{ position: 'relative' }}
                >
                    <img 
                        src={imageSrc} 
                        alt="uploaded Image" 
                        className="uploaded-image"
                        style={{
                            filter: `${blurMode ? `blur(${blurIntensity}px)` : ''} ${contrastMode ? `contrast(${contrastValue}%)` : ''} ${brightnessMode ? `brightness(${brightnessValue}%)` : ''}`.trim(),
                            transform: rotateMode ? `rotate(${rotateDegree}deg)` : undefined
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
        </div>

        <div className="input-wrapper">
            {!hasImage ? <InputFile onImageUpload={handleChange}/> : null}
        </div>

        <div className="btn">
            {!cropMode && !blurMode && !contrastMode && !rotateMode && !brightnessMode ? (
                <div className="button-grid">
                    <Button name="Crop" onClick={enableCropMode} disabled={!hasImage}/>
                    <Button name="Blur" onClick={() => handleEditAction("Blur")} disabled={!hasImage}/>
                    <Button name="Contrast" onClick={() => handleEditAction("Contrast")} disabled={!hasImage}/>
                    <Button name="Brightness" onClick={() => handleEditAction("Brightness")} disabled={!hasImage}/>
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
            ) : rotateMode ? (
                <>
                    <div className="rotate-controls">
                        <label htmlFor="rotate-input" className="rotate-label">
                            Rotate (degrees): 
                        </label>
                        <input 
                            type="number" 
                            id="rotate-degrees-input"
                            min="-360" 
                            max="360" 
                            value={rotateDegree}
                            onChange={handleRotateChange}
                            className="rotate-input"
                            placeholder="Enter degrees"
                        />
                    </div>
                    <div className="button-row">
                        <Button name="Save" onClick={saveRotate}/>
                        <Button name="Cancel" onClick={cancelRotate}/>
                    </div>
                </>
            ) : brightnessMode ? (
                <>
                    <div className="brightness-controls">
                        <label htmlFor="brightness-slider" className="brightness-label">
                            Brightness: {brightnessValue}%
                        </label>
                        <input 
                            type="range" 
                            id="brightness-slider"
                            min="0" 
                            max="200" 
                            value={brightnessValue}
                            onChange={handleBrightnessChange}
                            className="brightness-slider"
                        />
                    </div>
                    <div className="button-row">
                        <Button name="Save Brightness" onClick={saveBrightness}/>
                        <Button name="Cancel" onClick={cancelBrightness}/>
                    </div>
                </>
            ) : null}
        </div>

        {/* Floating Mic Button */}
        <div className="mic-button-container">
            <button 
                className={`mic-button ${micAnimationActive ? 'active' : ''} ${hasImage ? 'has-file' : ''}`}
                title="Voice Command"
                onClick={handleMicClick}
            >
                {micAnimationActive && (
                    <>
                        <span className="mic-ring ring1" aria-hidden="true"></span>
                        <span className="mic-ring ring2" aria-hidden="true"></span>
                        <span className="mic-ring ring3" aria-hidden="true"></span>
                    </>
                )}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" fill="currentColor"/>
                    <path d="M19 10V12C19 16.42 15.42 20 11 20H13C17.42 20 21 16.42 21 12V10H19Z" fill="currentColor"/>
                    <path d="M5 10V12C5 16.42 8.58 20 13 20H11C6.58 20 3 16.42 3 12V10H5Z" fill="currentColor"/>
                    <path d="M12 22V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
        </div>

    </>
  )
}

function App() {
  const [showEditor, setShowEditor] = useState(false);

  const handleStartEditing = () => {
    setShowEditor(true);
  };

  return (
    <AnimatePresence mode="wait">
      {!showEditor ? (
        <LandingPage key="landing" onStartEditing={handleStartEditing} />
      ) : (
        <motion.div
          key="editor"
          initial={{ y: "100vh", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100vh", opacity: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
        >
          <PhotoEditor />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App

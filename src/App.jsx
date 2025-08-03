import Button from "./Button.jsx"
import InputFile from "./inputFile.jsx"
import {useState} from "react";
import './App.css'

function App() {

    let [hasImage,setHasImage] = useState(false);
    let [imageSrc, setImageSrc] = useState(null);

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



  return (
    <>
        <div>
            <Button name="Crop"/>
            <Button name="Blur"/>
            <Button name="Contrast"/>
            <Button name="Rotate"/>
        </div>

        <div>
            {hasImage && imageSrc && (<img src={imageSrc} alt="uploaded Image" className="uploaded-image"/>)}
        </div>

        <div className="input-wrapper">
            {!hasImage ? <InputFile onImageUpload={handleChange}/> : null}
        </div>

    </>
  )
}

export default App

import Button from "./Button.jsx"
import InputFile from "./inputFile.jsx"
import './App.css'

function App() {


  return (
    <>
        <div>
            <Button name="Crop"/>
            <Button name="Blur"/>
            <Button name="Brightness"/>
            <Button name="Rotate"/>
        </div>

        <div className="input-wrapper">
            <InputFile/>
        </div>

    </>
  )
}

export default App

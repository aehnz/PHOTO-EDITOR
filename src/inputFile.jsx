
export default function InputFile({onImageUpload}){
    return(
        <>
            <input type="file" accept="image/*" className="Upload-btn" onChange={onImageUpload}/>
        </>
    );
}
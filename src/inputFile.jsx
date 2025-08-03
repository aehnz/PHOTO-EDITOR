
export default function InputFile({handleChange}){
    return(
        <>
            <input type="file" accept="image/*" className="Upload-btn" onChange={handleChange}/>
        </>
    );
}
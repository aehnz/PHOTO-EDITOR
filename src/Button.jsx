export default function Button({name, onClick, disabled = false}){
    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return(
        <>
            <button 
                className={`button ${disabled ? 'disabled' : ''}`} 
                onClick={handleClick}
                disabled={disabled}
            >
                {name}
            </button>
        </>
    );
}
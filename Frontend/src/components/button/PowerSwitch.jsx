// PowerSwitch.jsx
const PowerSwitch = ({ isOn, toggle }) => {
    return (
        <div className="relative flex justify-center items-center w-[150px] h-[150px]">
            <input
                type="checkbox"
                checked={isOn}
                onChange={toggle}
                className="absolute w-full h-full z-10 cursor-pointer opacity-0"
            />
            <div className="button relative flex justify-center items-center w-full h-full">
                <div
                    className={`absolute w-full h-full bg-radial-gradient from-white to-transparent 
          blur-[20px] opacity-0 transition-all duration-1000 transform perspective-1 backface-hidden
          ${isOn ? 'opacity-15 scale-200' : ''}`}
                />

                <svg className={`power-on absolute w-full h-full z-[1] ${isOn ? 'animate-click' : ''}`}>
                    <line
                        x1="75"
                        y1="34"
                        x2="75"
                        y2="58"
                        className={`stroke-white stroke-[8] stroke-round opacity-0 
            transition-opacity duration-300 delay-1000
            ${isOn ? 'opacity-100 animate-line' : ''}`}
                    />
                    <circle
                        cx="75"
                        cy="80"
                        r="35"
                        className={`stroke-white stroke-[8] stroke-round 
            transition-all duration-400 delay-200
            ${isOn ? 'rotate-302' : 'rotate-[-58deg]'}`}
                        style={{
                            transformOrigin: 'center 80px',
                            strokeDasharray: '220',
                            strokeDashoffset: isOn ? '40' : '220'
                        }}
                    />
                </svg>

                <svg className={`power-off absolute w-full h-full z-[1] ${isOn ? 'animate-click' : ''}`}>
                    <line
                        x1="75"
                        y1="34"
                        x2="75"
                        y2="58"
                        className="stroke-white stroke-[8] stroke-round opacity-20"
                    />
                    <circle
                        cx="75"
                        cy="80"
                        r="35"
                        className="stroke-white stroke-[8] stroke-round opacity-20"
                        style={{
                            transformOrigin: 'center 80px',
                            strokeDasharray: '220',
                            strokeDashoffset: '40',
                            transform: 'rotate(-58deg)'
                        }}
                    />
                </svg>
            </div>
        </div>
    );
};

export default PowerSwitch;
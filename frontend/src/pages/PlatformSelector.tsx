import { useLocation } from 'react-router-dom';

//TODO: va primi platforma sau null si de aici vei selecta de unde pana unde transferi, vezi tu cum
const PlatformSelector = () => {
    const location = useLocation();
    const { platform } = location.state || {};
    return (
        <div>
            <h1>Selected Platform: {platform}</h1>
            {/* Handle platform logic */}
        </div>
    );
}

export default PlatformSelector;
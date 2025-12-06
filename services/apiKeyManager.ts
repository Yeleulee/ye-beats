export const getApiKeys = (): string[] => {
    const envKeys = process.env.YOUTUBE_API_KEY || '';
    return envKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
};

let currentKeyIndex = 0;

export const getCurrentKey = (): string => {
    const keys = getApiKeys();
    if (keys.length === 0) return '';
    return keys[currentKeyIndex];
};

export const rotateKey = (): string => {
    const keys = getApiKeys();
    if (keys.length === 0) return '';
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
    console.log(`🔄 Rotated API Key to index ${currentKeyIndex}`);
    return keys[currentKeyIndex];
};

export const fetchYouTubeWithRotation = async (
    urlBuilder: (key: string) => string
): Promise<Response> => {
    const keys = getApiKeys();
    let attempts = 0;
    
    // If no keys configured, just try once with empty key (will likely fail but handles edge case)
    if (keys.length === 0) {
        return fetch(urlBuilder(''));
    }

    while (attempts < keys.length) {
        const key = getCurrentKey();
        const url = urlBuilder(key);
        
        try {
            const res = await fetch(url);
            
            // If quota error, rotate and retry
            if (res.status === 403 || res.status === 429) {
                console.warn(`⚠️ API Key quota exceeded (${res.status}). Rotating key...`);
                rotateKey();
                attempts++;
                continue;
            }
            
            return res;
        } catch (error) {
            // Network errors might not be key related, but good to be safe? 
            // Usually network error != 403, so we probably shouldn't rotate on generic network error 
            // unless we want to be very aggressive. Let's just throw for now.
            throw error;
        }
    }
    
    // If we exhausted all keys, return the last response (which was 403/429)
    // We need to re-fetch the last one to return a Response object to the caller
    // or we can't easily return the previous response object since we awaited it.
    // Actually, asking to fetch one last time is wasteful.
    // Let's simplified execution:
    
    // We already returned if success.
    // If we are here, it means we failed all attempts.
    // We should probably return a mock 429 response or just throw.
    
    throw new Error('All API keys exhausted or quota exceeded.');
};

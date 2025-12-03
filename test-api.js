// Test YouTube API Search Functionality
// Copy and paste this into your browser console when the app is running

console.log('🧪 Testing YouTube API...');

// Test 1: Check if API key is configured
const apiKey = 'AIzaSyDG7ZgeboRkseyPsL65kf6peqE4_hhWeYE';
console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');

// Test 2: Try a simple search
async function testSearch(query) {
    console.log(`\n🔍 Testing search for: "${query}"`);

    try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=5&key=${apiKey}`;

        const response = await fetch(searchUrl);
        console.log('📡 Response status:', response.status);

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Search successful!');
            console.log('📊 Found', data.items?.length || 0, 'results');
            if (data.items && data.items.length > 0) {
                console.log('🎵 First result:', data.items[0].snippet.title);
            }
            return data;
        } else {
            console.error('❌ API Error:', data.error);
            if (response.status === 403) {
                console.error('⚠️ Quota exceeded or invalid API key');
            }
            return null;
        }
    } catch (error) {
        console.error('💥 Network Error:', error);
        return null;
    }
}

// Run tests
testSearch('The Weeknd Blinding Lights')
    .then(result => {
        if (result) {
            console.log('\n✅ API is working correctly!');
            console.log('You can now use the search feature in the app.');
        } else {
            console.log('\n❌ API is not working. Check the errors above.');
        }
    });

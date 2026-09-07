const geocodeLocation = async (location, country) => {
    const query = [location, country].filter(Boolean).join(", ");
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
        headers: { "User-Agent": "major-project-1-listings/1.0" }
    });

    if (!response.ok) {
        throw new Error(`Geocoding service returned ${response.status}`);
    }

    const results = await response.json();
    if (!results.length) {
        throw new Error("Location could not be found on the map");
    }

    return {
        latitude: Number(results[0].lat),
        longitude: Number(results[0].lon),
        displayName: results[0].display_name
    };
};

module.exports = geocodeLocation;
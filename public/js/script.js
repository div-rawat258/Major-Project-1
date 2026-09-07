(() => {
  "use strict";

  const forms = document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form) => {
    form.noValidate = true;

    form.addEventListener("submit", (event) => {
      const isValid = form.checkValidity();

      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add("was-validated");
    });
  });

  const locationMap = document.querySelector("[data-location-map]");
  const detailMap = document.querySelector("[data-map-latitude]");

  if (!window.L || (!locationMap && !detailMap)) return;

  const redPin = L.divIcon({
    className: "location-marker",
    html: '<i class="fa-solid fa-location-dot location-pin"></i>',
    iconSize: [32, 40],
    iconAnchor: [16, 38]
  });

  const createMap = (element, latitude, longitude, title) => {
    const map = L.map(element).setView([latitude, longitude], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);
    L.marker([latitude, longitude], { icon: redPin }).addTo(map).bindPopup(title || "Listing location").openPopup();
    return map;
  };

  if (detailMap) {
    createMap(
      detailMap,
      Number(detailMap.dataset.mapLatitude),
      Number(detailMap.dataset.mapLongitude),
      detailMap.dataset.mapTitle
    );
  }

  if (locationMap) {
    const form = locationMap.closest("form");
    const locationInput = form.querySelector('input[name="listing[location]"]');
    const countryInput = form.querySelector('input[name="listing[country]"]');
    const status = locationMap.querySelector("[data-map-status]");
    let map;
    let marker;
    let timeout;

    const updateMap = async () => {
      const location = locationInput.value.trim();
      const country = countryInput.value.trim();
      if (location.length < 3) return;
      status.textContent = "Finding location...";

      try {
        const response = await fetch(`/listings/geocode?location=${encodeURIComponent(location)}&country=${encodeURIComponent(country)}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        const point = [result.latitude, result.longitude];
        if (!map) {
          map = L.map(locationMap.querySelector(".location-map")).setView(point, 13);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
          }).addTo(map);
        } else {
          map.setView(point, 13);
        }
        if (marker) marker.remove();
        marker = L.marker(point, { icon: redPin }).addTo(map).bindPopup(result.displayName).openPopup();
        status.textContent = "Location found";
      } catch (error) {
        status.textContent = error.message;
      }
    };

    [locationInput, countryInput].forEach((input) => input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateMap, 700);
    }));

    if (locationInput.value.trim().length >= 3) updateMap();
  }
})();

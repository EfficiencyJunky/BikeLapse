# BikeLapse -- Open source web app / framework for cataloging bike rides or other activities (works with Strava GPX files)
Check out the website here: https://bikelapse.com

The website at the link above is directly hosted from this repository through the magic of Github Pages. So any changes made to the files in this repo will immediately be reflected on the website.


## More info about the BikeLapse project
I built this webapp/framework on top of leaflet.js and various other libraries (listed below) that people have made to work with leaflet. Additional styling and UI was made possible by the use of Bootstrap. My goal for this project was to make it easy for anyone else (you shouldn't have to know how to program to do this) to download the code, upload it to their own repository, enable github sites in that repository and quickly have their own version of the website where they can catalog bike rides that they have recorded either with Strava (just download the GPX files and upload them to this app), or ideally with the companion hardware and iPhone app made specifically for this project. The hardware I created is also open source, which you can find here (link to repos), and the iPhone app may be available in the AppStore soon.


### FRAMEWORKS
* Leaflet.js: https://leafletjs.com/examples/quick-start/
* Leaflet.js (GeoJSON example): https://leafletjs.com/examples/geojson/
* Free TileSets (aka maps to draw stuff on top of) made by Stamen: http://maps.stamen.com/
* Bootstrap: https://getbootstrap.com/


### LIBRARIES
* Convert KML or GPX to GEOJSON: https://mapbox.github.io/togeojson/
* GetDistance function for calculating distances between Lat/Lon points: https://github.com/MovingGauteng/GeoJSON-Tools
* Amazing library for performing calculations and manipulations with dates and times: https://momentjs.com/
* Interactive elevation display for GeoJSON objects: https://github.com/MrMufflon/Leaflet.Elevation

HAVERSINE FORMULA: More info on Haversine formula and calculating distances between GPS locations on a curved surface (the earth): https://www.movable-type.co.uk/scripts/latlong.html

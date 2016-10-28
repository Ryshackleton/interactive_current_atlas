/**
 * Created by ryshackleton on 10/18/16.
 */


var imagetile_handler = (function () {

    /** PRIVATE */
    // base http url for the location of the tileserver
    const baseURL = 'http://currentatlastiles.s3-website-us-west-2.amazonaws.com';
    // base local folder
    const baseFolder = '/';
    // list of possible folders representing tide stages with different tidal ranges
    const pugetTideCurrentFolderList = ['00_Lower_low_slack', '01_Mid_tide_large_flood', '02_Higher_high_slack', '03_Mid_tide_small_ebb',
        '04_Higher_low_slack', '05_Mid_tide_small_flood', '06_Lower_high_slack', '07_Mid_tide_large_ebb'];
    const pugetTideCurrentLongNameList = [ 'Lower low (slack)' ,'Mid-tide between lower low and higher high (large flood)'
        ,'Higher high (slack)' ,'Mid-tide between higher high and lower low (small ebb)' ,'Higher low (slack)' ,'Mid-tide between higher low and lower high (small flood)'
        ,'Lower high (slack)' ,'Mid-tide between lower high and lower low (large ebb)' ];

    /** PUBLIC */
    return {
        /**
         * represents a snapshot of tidal current in Puget Sound
         * Images from: McGary, N., Lincoln, J.H., Washington Sea Grant Program, 1977. Tide prints: surface tidal currents in Puget Sound.
         *                http://nsgl.gso.uri.edu/washu/washuc77001/washuc77001index.html
         * @param {string} longName: long sentence name from Tide Prints (description)
         * @param {string} tileFolderName: the folder in which the tileserver exists in /tiles/ in the public fileserver
         * @param {string} baseURL: contains the base for the tileserver (defaulted to amazon static s3 hosting)
         */
        PugetTidalCurrentStage: function (longName,tileFolderName) {
            this.longName = longName;
            this.folderName = tileFolderName;

            /**
             * Concatenates the baseURL and the tilefolder and
             * returns a string representing the URL of the tile server containing the images for this "time step"
             * @return {string} tileServerURL
             */
            this.tileServerURL = function (isOffline) {
                return isOffline ? baseFolder + 'tiles/' + this.folderName + '/{z}/{x}/{y}.png'
                    : baseURL + '/tiles/' + this.folderName + '/{z}/{x}/{y}.png';
            }
            /**
             * return {Leaflet.tileLayer} representing this tidal current stage
             */
            this.leafletTileLayer = function () {
                return L.tileLayer(this.tileServerURL(), {
                    attribution: 'Map data: &copy; <a href="http://nsgl.gso.uri.edu/washu/washuc77001/washuc77001_full.pdf">Tide Prints</a> contributors',
                    minZoom: 8,
                    maxZoom: 16,
                    center: [-122.673141, 47.766598],
                    bounds: [new L.LatLng(47.0232, -123.181), new L.LatLng(48.51, -122.166)]
                });
            }
        },

        /**
         * @return {list[PugetTidalCurrentStage]} returns an array of the 8 default PugetSound tidal stage objects
         */
        defaultPugetTidalCurrentStages: function () {
            var tideStages = [];
            for( var index in pugetTideCurrentFolderList ) {
                tideStages.push(new imagetile_handler.PugetTidalCurrentStage(pugetTideCurrentLongNameList[index],pugetTideCurrentFolderList[index]));
            }
            return tideStages;
        }
    };

}());
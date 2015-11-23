var coOccurrenceMatrix = [];

/**Load the tags from the CSV file when the window is first loaded
 *
 */
window.onload = function () {

    getAjax("tags.csv", loadTags);

};

/**Read the data from a given file
 *
 * @param textFile - The file in which the data resides
 * @param successFunction - The function which is called when the data is read
 */
function getAjax(textFile, successFunction) {

    $.ajax({

        type: "GET",
        url: textFile,
        dataType: "text",
        success: successFunction
    });

}

/**Create a new tag object
 *
 * @param tagsArray - The array in which the tag name resides
 * @param index - The array position in which the tag name resides
 * @constructor - Returns a new tag object
 */
function Tag(tagsArray, index){

    this.name = tagsArray[index][0].toString();
    this.occurrenceCount = 0;
    this.totalOccurrences = Number(tagsArray[index][1]);

}

/**Load all tags which may occur from the tags.csv file
 *
 * @param data - Data from the CSV file
 */
function loadTags(data) {

    var tagsArray = data.split('\n');

    //Split the data by commas so each array will contain an array of two items - the tag name and total occurrences
    for (var tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        tagsArray[tagIndex] = tagsArray[tagIndex].split(",");
    }

    for (tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        var newTagArray = [];
        for(var j = 0; j < tagsArray.length; j ++){
            newTagArray[j] = new Tag(tagsArray, j);
        }
        coOccurrenceMatrix[tagIndex] = {name: tagsArray[tagIndex][0], tags: newTagArray};
    }

    //Get the list of photos and the tags they contain
    getAjax("photos_tags.csv", loadText);

}

function loadText(data) {

    //Separate the data by line and put into an array
    var textArray = data.split("\n");

    //Split each array item into an array of photo number and tag name
    for (var i = 0; i < textArray.length; i++) {

        textArray[i] = textArray[i].split(",");
        textArray[i][1] = textArray[i][1].replace(/[\n\r]/g, '');

    }

    coOccurrenceText(textArray);
    console.log(textArray);
}

/**Perform the tag co-occurrence algorithm
 *
 * @param tagsArray - an array of each photo number alongside the tag which is included in it
 * Note - many photo numbers will have multiple entries as they have multiple tags
 */
function coOccurrenceText(tagsArray) {

    //Loop through each tag in array and check for co-occurrences both in the following array items with the same photo
    //number and the the previous array items with the same photo number.
    //This enables a tag occurring at array index 10 to be included in the occurrence count for a tag at index 11
    for (var i = 0; i < tagsArray.length; i++) {
            lookForTag(tagsArray, i, 1);
            lookForTag(tagsArray, i, -1);
    }

    for(i = 0; i < coOccurrenceMatrix.length; i ++){
        for(var j = 0; j < coOccurrenceMatrix[i].tags.length; j ++){

            //Calculate weighted score
            coOccurrenceMatrix[i].tags[j].occurrenceCount *= Math.log(10000 / coOccurrenceMatrix[i].tags[j].totalOccurrences);
        }

        //Sort the tags by co-occurrence value
        coOccurrenceMatrix[i].tags = coOccurrenceMatrix[i].tags.sortObjectArray("occurrenceCount");
    }

    //Write the co-occurrence matrix in CSV form to the console (don't use with sorting)
    //coOccurrenceMatrix.createCSV();
}

/**Look for co-occurrences for each tag in the array
 *
 * @param tagsArray - The array of tags to be checked
 * @param i - The position of the current tag to be checked
 * @param posNeg - Value of -1 if algorithm is to look backwards and 1 if algorithm is to look forwards
 */
function lookForTag(tagsArray, i, posNeg){

    var counter = posNeg;

        //Loop until tag one's image number does not equal tag two's image number
        while ((i + counter) < tagsArray.length && i > 0 && tagsArray[i][0] == tagsArray[i + counter][0]) {

            //Check what position the tag in question is at in the co-occurrence Matrix
            var matrixRow = coOccurrenceMatrix.searchObjectArray("name", tagsArray[i][1]);

            if (matrixRow > -1) {
                //Check if the name of the tag in the matrix matches that of the tag being searched for
                var matrixTag = coOccurrenceMatrix[matrixRow].tags.searchObjectArray("name", tagsArray[i + counter][1]);
                //If name matches the add one to co-occurence count
                if (matrixTag > -1) {
                    coOccurrenceMatrix[matrixRow].tags[matrixTag].occurrenceCount++;
                }

            }

            //Move one place forward if algorithm is looking forward and one place backwards if
            // algorithm is looking backwards
            counter += posNeg;

        }

}

//Output the co-occurrence matrix in a CSV readable manner
Array.prototype.createCSV = function(){

    //Add one to start of file to ensure vertical tags and horizontal tags match up with same occurrence count
    //e.g. sky and sky will always meet when occurrence count is 0
    var newLine = ",";

    //Write all tag names to top line of CSV file
    for(var tagNames = 0; tagNames < this.length; tagNames ++){
        newLine += this[tagNames].name + ",";
    }
    //Remove trailing comma and create a new line
    newLine = newLine.substring(0, newLine.length - 1);
    newLine += "\n";

    //Write all tag names in the left column alongside each occurrence count for that tag
    for(var rows = 0; rows < this.length; rows ++){
        newLine += this[rows].name + ",";
        for(var cols = 0; cols < this[rows].tags.length; cols ++){
            newLine += this[rows].tags[cols].occurrenceCount + ",";
        }
        newLine = newLine.substring(0, newLine.length - 1);
        newLine += "\n";
    }

    //Write to console
    console.log(newLine);
};

//Search an array of objects within a specified key for a certain string
/**Search an array of objects within a specified key for a certain string
 *
 * @param objectKey - The key of the object that is to be searched
 * @param searchTerm - Search each occurrence of the object key for this value
 * @returns {number} - The index where the search term occurs
 */
Array.prototype.searchObjectArray = function (objectKey, searchTerm) {

    for (var i = 0; i < this.length; i++) {
        if (this[i][objectKey] == searchTerm) {
            return i;
        }
    }

    return -1;

};

/**Sort an array of objects
 *
 * @param objectKey - The key of the object which is to be sorted upon e.g. occurrences
 * @returns {Array} - The sorted array
 */
Array.prototype.sortObjectArray = function(objectKey){
    return this.sort(function(a, b){return a[objectKey] - b[objectKey]}).reverse();
};

/**Get the top five occurrences of any given tag
 *
 * @param tagName - The name of the tag in which the top five should be returned
 * @returns {*} - An object array of the top five tags
 */
function topFive(tagName){

    //Search the array in the key "name" for the tag name
    var tagIndex = coOccurrenceMatrix.searchObjectArray("name", tagName);
    var topFiveArray = [];

    if(tagIndex > -1){
        for(var i = 0; i < 5; i++){
            topFiveArray.push(coOccurrenceMatrix[tagIndex].tags[i]);
        }
        return topFiveArray;
    }
    //Return this if the tag name inputted cannot be found
    else{
        return "Tag not found";
    }

}

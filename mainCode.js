var coOccurrenceMatrix = [];

//Called when program starts
window.onload = function () {

    getAjax("tags.csv", loadTags);

};

//Read the CSV file
function getAjax(textFile, successFunction) {

    $.ajax({

        type: "GET",
        url: textFile,
        dataType: "text",
        success: successFunction
    });

}

//Create a new Tag object for later manipulation
function Tag(tagsArray, index){

    this.name = tagsArray[index][0].toString();
    this.occurrenceCount = 0;
    this.totalOccurrences = Number(tagsArray[index][1]);

}

//Load all tags from the tags.csv file and put into a matrix
function loadTags(data) {

    //Split data from file up into tags and their total occurrence amount
    var tagsArray = data.split('\n');

    for (var tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        tagsArray[tagIndex] = tagsArray[tagIndex].split(",");
    }

    //Create a new Tag object for each tag read from the file
    for (tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        var newTagArray = [];
        for(var j = 0; j < tagsArray.length; j ++){
            newTagArray[j] = new Tag(tagsArray, j);
        }
        coOccurrenceMatrix[tagIndex] = {name: tagsArray[tagIndex][0], tags: newTagArray};
    }

    getAjax("photos_tags.csv", loadText);

}

//Read data from the photos_tags.csv file and create a 2D array of image numbers and their respective tags
function loadText(data) {

    var textArray = data.split("\n");

    for (var i = 0; i < textArray.length; i++) {

        textArray[i] = textArray[i].split(",");
        textArray[i][1] = textArray[i][1].replace(/[\n\r]/g, '');

    }

    coOccurrenceText(textArray);

}

//Create the co-occurrence matrix
function coOccurrenceText(tagsArray) {

    //Check for co-occurring tags by looking forward in array and then back
    //Looking both forward and back necessary to ensure correct count is included in both meetings of each term
    //e.g. correct occurrence counts in both nyc-person and person-nyc
    for (var i = 0; i < tagsArray.length; i++) {
            lookForTag(tagsArray, i, 1);
            lookForTag(tagsArray, i, -1);
    }
    console.log(tagsArray);

    //Loop through all tags in co-occurrence matrix
    for(i = 0; i < coOccurrenceMatrix.length; i ++){
        for(var j = 0; j < coOccurrenceMatrix[i].tags.length; j ++){

            //Calculate weighted score
            coOccurrenceMatrix[i].tags[j].occurrenceCount *= Math.log(10000 / coOccurrenceMatrix[i].tags[j].totalOccurrences);
        }
        //Sort coOccurrence tags by numerical order of occurrence (don't use when creating CSV file)
        coOccurrenceMatrix[i].tags = coOccurrenceMatrix[i].tags.sortObjectArray("occurrenceCount");
    }

    //Write the co-occurrence matrix in CSV form to the console (don't use with sorting)
    //coOccurrenceMatrix.createCSV();
}

//Check which tags occur in the same image
function lookForTag(tagsArray, i, posNeg){

    //Add one to the counter if looking forward in array and one if looking back
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

            //Add one to/ subtract one from counter to check next/previous image number in array
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
Array.prototype.searchObjectArray = function (objectKey, searchTerm) {

    for (var i = 0; i < this.length; i++) {
        if (this[i][objectKey] == searchTerm) {
            return i;
        }
    }

    return -1;

};

//Sort an array of objects numerically by a given object key
Array.prototype.sortObjectArray = function(objectKey){
    return this.sort(function(a, b){return a[objectKey] - b[objectKey]}).reverse();
};

//Return the top five co-occurring tags for any given tag
function topFive(tagName){

    var tagIndex = coOccurrenceMatrix.searchObjectArray("name", tagName);
    var topFiveArray = [];

    //Push top five tags to array and return
    if(tagIndex > -1){
        for(var i = 0; i < 5; i++){
            topFiveArray.push(coOccurrenceMatrix[tagIndex].tags[i]);
        }
        return topFiveArray;
    }
    else{
        return "Tag not found";
    }

}

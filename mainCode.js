var coOccurrenceMatrix = [], occurencesArray = [];

window.onload = function () {

    getAjax("tags.csv", loadTags);

};

function getAjax(textFile, successFunction) {

    $.ajax({

        type: "GET",
        url: textFile,
        dataType: "text",
        success: successFunction
    });

}

function Tag(tagsArray, index){

    this.name = tagsArray[index][0].toString();
    this.occurrenceCount = 0;
    this.totalOccurrences = Number(tagsArray[index][1]);

}

function loadTags(data) {

    var tagsArray = data.split('\n');

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

    console.log(coOccurrenceMatrix);

    getAjax("photos_tags.csv", loadText);

}

function loadText(data) {

    var textArray = data.split("\n");

    for (var i = 0; i < textArray.length; i++) {

        textArray[i] = textArray[i].split(",");
        textArray[i][1] = textArray[i][1].replace(/[\n\r]/g, '');

    }

    coOccurrenceText(textArray);
    console.log(textArray);
}

function coOccurrenceText(tagsArray) {

    //Create counter used to look backwards in array for items with the same photo index
    for (var i = 0; i < tagsArray.length; i++) {
            lookForTag(tagsArray, i, 1);
            lookForTag(tagsArray, i, -1);
    }

    for(i = 0; i < coOccurrenceMatrix.length; i ++){
        for(var j = 0; j < coOccurrenceMatrix[i].tags.length; j ++){
            coOccurrenceMatrix[i].tags[j].occurrenceCount *= Math.log(tagsArray.length / coOccurrenceMatrix[i].tags[j].totalOccurrences);
        }
        coOccurrenceMatrix[i].tags = coOccurrenceMatrix[i].tags.sortObjectArray("occurrenceCount");
    }

}

function lookForTag(tagsArray, i, posNeg){

    var counter = posNeg;

        while ((i + counter) < tagsArray.length && i > 0 && tagsArray[i][0] == tagsArray[i + counter][0]) {

            //Check what position the tag in question is at in the co-occurrence Matrix
            var matrixRow = coOccurrenceMatrix.searchObjectArray("name", tagsArray[i][1]);

            if (matrixRow > -1) {
                //Check if the name of the tag in the matrix matches that of the tag being searched for
                var matrixTag = coOccurrenceMatrix[matrixRow].tags.searchObjectArray("name", tagsArray[i + counter][1]);
                if (matrixTag > -1) {
                    coOccurrenceMatrix[matrixRow].tags[matrixTag].occurrenceCount++;
                }

            }

            counter += posNeg;

        }

}

//Search an array of objects within a specified key for a certain string
Array.prototype.searchObjectArray = function (objectKey, searchTerm) {

    for (var i = 0; i < this.length; i++) {
        if (this[i][objectKey] == searchTerm) {
            return i;
        }
    }

    return -1;

};

Array.prototype.sortObjectArray = function(objectKey){
    return this.sort(function(a, b){return a[objectKey] - b[objectKey]}).reverse();
};

function topFive(tagName){

    var tagIndex = coOccurrenceMatrix.searchObjectArray("name", tagName);
    var topFiveArray = [];

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

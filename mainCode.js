var coOccurrenceMatrix = [];

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

function loadTags(data) {

    var tagsArray = data.split('\n');

    for (var tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        tagsArray[tagIndex] = tagsArray[tagIndex].split(",");
        tagsArray[tagIndex] = tagsArray[tagIndex][0];
    }

    for (tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        tagsArray[tagIndex] = {name: tagsArray[tagIndex], occurrenceCount: 0};
    }

    for (tagIndex = 0; tagIndex < tagsArray.length; tagIndex++) {
        coOccurrenceMatrix[tagIndex] = {};
        coOccurrenceMatrix[tagIndex].name = tagsArray[tagIndex].name;
        coOccurrenceMatrix[tagIndex].tags = tagsArray;
    }

    console.log(coOccurrenceMatrix);

    getAjax("photos_tags.csv", loadText);

}

function loadText(data) {

    var textArray = data.split("\n");

    for (var i = 0; i < textArray.length; i++) {

        textArray[i] = textArray[i].split(",");
        textArray[i][1] = textArray[i][1].replace(/[\n\r]/g, '');

        console.log(textArray);

        coOccurrenceText(textArray);

    }

}

function coOccurrenceText(textArray){

    var counter;

    for(var i = 0; i < textArray.length; i ++){

        counter = 1;

        //Loop backwards in the array for all elements with the same photo index
        while(i >= counter && textArray[i][0] == textArray[i - counter][0]){

            //Loop through all rows in the matrix to check co-occurrence
            for (var matrixRow = 0; matrixRow < coOccurrenceMatrix.length; matrixRow++) {

                //Check if the name of the tag in the matrix matches that of the tag being searched for
                if (coOccurrenceMatrix[matrixRow].name == textArray[i][1]) {

                    for (var matrixTag = 0; matrixTag < coOccurrenceMatrix[matrixRow].tags.length; matrixTag++) {

                        if (coOccurrenceMatrix[matrixRow].tags[matrixTag].name == textArray[i - counter][1]) {
                                coOccurrenceMatrix[matrixRow].tags[matrixTag].occurrenceCount++;
                            }
                        //}
                    }
                }
            }

            counter++;
        }
    }
}
function coOccurrence(csvData) {

    //Loop through all lines of the csvData (from photos_tags.csv)
    for (var csvLine = 0; csvLine < csvData.length; csvLine++) {

        //Only perform if there is more than one tag in the array
        if (csvData[csvLine].tags.length > 1) {

            //Loop through all tags in the tag array
            for (var csvTagIndex = 0; csvTagIndex < csvData[csvLine].tags.length; csvTagIndex++) {

                //Loop through all tags in the tag array again to compare one tag against another
                for (var csvTagSecond = csvTagIndex + 1; csvTagSecond < csvData[csvLine].tags.length; csvTagSecond++) {

                    //Loop through all rows in the matrix to check co-occurrence
                    for (var matrixRow = 0; matrixRow < coOccurrenceMatrix.length; matrixRow++) {

                        //Check if the name of the tag in the matrix matches that of the tag being searched for
                        if (coOccurrenceMatrix[matrixRow].name == csvData[csvLine].tags[csvTagIndex]) {
                            console.log(coOccurrenceMatrix[matrixRow].name);

                            //Loop through all tags associated with the name found in the matrix
                            for (var matrixTag = 0; matrixTag < coOccurrenceMatrix[matrixRow].tags.length; matrixTag++) {
                                //console.log(coOccurrenceMatrix[matrixRow].name);

                                //If the tag in the CSV array features in the same array as the first tag in question then add one to the counter
                                if (coOccurrenceMatrix[matrixRow].tags[matrixTag].name == csvData[csvLine].tags[csvTagSecond]) {
                                    coOccurrenceMatrix[matrixRow].tags[matrixTag].occurrenceCount++;

                                    //console.log(coOccurrenceMatrix[matrixRow].tags[matrixTag]);
                                    break;
                                }
                            }
                        }
                    }
                }


            }
        }
    }

    /*for(matrixRow = 0; matrixRow < coOccurrenceMatrix.length; matrixRow ++){

     coOccurrenceMatrix[matrixRow].tags.sort(function(a, b){
     if(a.occurrenceCount < b.occurrenceCount) return 1;
     else if(a.occurrenceCount > b.occurrenceCount) return -1;
     });

     }*/
}
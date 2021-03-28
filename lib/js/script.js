sleepData = []
warnings = []
actionItems = []

function create(timeStamp,recordType,recordData){
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"patient":getPatientName(),"timeStamp":timeStamp,"recordType":recordType,"recordData":recordData});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/create", requestOptions)
    .catch(error => console.log('error', error));
}

function update(timeStamp,recordType,recordData){
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"patient":getPatientName(),"timeStamp":timeStamp,"recordType":recordType,"recordData":recordData});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/update", requestOptions)
    .catch(error => console.log('error', error));
}

function read(timeStamp,recordType,recordData){
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"patient":getPatientName(),"timeStamp":timeStamp,"recordType":recordType});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/read", requestOptions)
    .catch(error => console.log('error', error));
}

function delete(timeStamp,recordType,recordData){
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"patient":getPatientName(),"timeStamp":timeStamp,"recordType":recordType});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };
    // make API call with parameters and use promises to get response
    fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/delete", requestOptions)
    .catch(error => console.log('error', error));
}

funtion getPatientName(){
  return "Test Patient"
}

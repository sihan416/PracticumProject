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

async function read(timeStamp,recordType){
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
    var item = fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/read", requestOptions)
    .then(response => response.text())
    .then(result => JSON.parse(result).body.Item)
    .catch(error => console.log('error', error));
    return item;
}

function del(timeStamp,recordType,recordData){
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

async function removeActionItem(id){
  ai = document.getElementById(id);
  var div = ai.parentElement;
  var c = div.parentElement;
  c.style.display = "none";
  var recordData = actionItems.RecordData.filter(e => e != id)
  await update("0","ActionItems",recordData);
}

async function fetchData(){
  sleepData = [];
  conditions = null;
  actionItems = null;
  var date = new Date();
  var labels = [];
  var sumActual = 0;
  var sumTarget = 0;
  missingData = false;
  for (var i = 0; i < 7; i++){
    date.setDate(date.getDate() - 1);
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    timeStamp = mm + '/' + dd + '/' + yyyy;
    labels.push(timeStamp);
    var sleep = await read(timeStamp,"Sleep");
    if (sleep){
      var v = parseFloat(sleep.RecordData);
      sleepData.push(v);
      sumActual += v;
    } else {
      sleepData.push(0);
      missingData = true;
    }
  }
  sleepData = sleepData.reverse();
  labels = labels.reverse();
  await read("0","Conditions").then(item => conditions = item);
  await read("0","ActionItems").then(item => actionItems = item);
  document.getElementById('warningList').innerHTML = "";
  if (missingData){
    document.getElementById('warningList').innerHTML += '<li class="list-group-item rounded list-group-item-danger">You are missing sleep data for the last week, analysis may be inaccurate</li>';
  }
  if (conditions){
    for (var condition in conditions.RecordData) {
      document.getElementById('warningList').innerHTML += '<li class="list-group-item rounded list-group-item-danger"> your ' + conditions.RecordData[condition] + ' condition may be caused by sleep deficiency</li>';
    }
  }

  if (document.getElementById('warningList').innerHTML == ""){
    document.getElementById('warnings').style.display = "none";
  } else {
    document.getElementById('warnings').style.display = "block";
  }
  var target = await read("0","Sleep");
  var targetArr = []
  for (var i = 0; i < 7; i++){
    targetArr.push(parseFloat(target.RecordData));
    sumTarget += parseFloat(target.RecordData);
  }
  var ctxL = document.getElementById("lineChart").getContext('2d');
  var myLineChart = new Chart(ctxL, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
          label: "Target Sleep",
          data: targetArr,
          backgroundColor: [
            'rgba(105, 0, 132, .2)',
          ],
          borderColor: [
            'rgba(200, 99, 132, .7)',
          ],
          borderWidth: 2
        },
        {
          label: "Actual Sleep",
          data: sleepData,
          backgroundColor: [
            'rgba(0, 137, 132, .2)',
          ],
          borderColor: [
            'rgba(0, 10, 130, .7)',
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Hours'
              },
              ticks: {
                beginAtZero: true
              }
            }]
        }
    }
  });
  var pct = Math.round(sumActual/sumTarget*100);
  document.getElementById('status').innerHTML = '<h3>' + pct.toString() + '% of target sleep achieved for the last week</h3>';
  if (pct < 90){
    document.getElementById('status').className = "sticky-right bg-danger text-white rounded container";
  } else {
    document.getElementById('status').className = "sticky-right bg-success text-white rounded container";
  }
  document.getElementById('actionItemsList').innerHTML = "";
  if(actionItems){
    for (var i in actionItems.RecordData){
      c = document.createElement("div");
      c.className = "pl-2 text-left row";
      fc = document.createElement("div");
      fc.className = "form-check";
      fc.innerHTML += '<input class="form-check-input" type="checkbox" value="" id=' + actionItems.RecordData[i] +' onclick="removeActionItem(id)">';
      fc.innerHTML += '<label class="form-check-label" for="' + i.toString() + '">' + actionItems.RecordData[i] + '</label>';
      c.appendChild(fc);
      document.getElementById('actionItemsList').appendChild(c);
    }
  }
}

function createRecordTypeChange(){
  if(document.getElementById('createRecordType').value == "Sleep"){
    document.getElementById('createDateRow').style.display = "block";
    document.getElementById('createDurationRow').style.display = "block";
    document.getElementById('createConditionRow').style.display = "none";
  } else if(document.getElementById('createRecordType').value == "Condition"){
    document.getElementById('createDateRow').style.display = "none";
    document.getElementById('createDurationRow').style.display = "none";
    document.getElementById('createConditionRow').style.display = "block";
  } else {
    document.getElementById('createDateRow').style.display = "none";
    document.getElementById('createDurationRow').style.display = "none";
    document.getElementById('createConditionRow').style.display = "none";
  }
}

function clearCreate(){
  document.getElementById('createRecordType').value = "none";
  document.getElementById('createDate').value = "";
  document.getElementById('createDuration').value = 0;
  document.getElementById('createConditionType').value = "none";
  document.getElementById('createDateRow').style.display = "none";
  document.getElementById('createDurationRow').style.display = "none";
  document.getElementById('createConditionRow').style.display = "none";
  document.getElementById('createCustomConditionRow').style.display = "none";
}

function updateRecordTypeChange(){
  if(document.getElementById('updateRecordType').value == "Sleep"){
    document.getElementById('updateDateRow').style.display = "block";
    document.getElementById('updateDurationRow').style.display = "block";
    document.getElementById('updateConditionRow').style.display = "none";
  } else if(document.getElementById('updateRecordType').value == "Condition"){
    document.getElementById('updateDateRow').style.display = "none";
    document.getElementById('updateDurationRow').style.display = "none";
    document.getElementById('updateConditionRow').style.display = "block";
  } else {
    document.getElementById('updateDateRow').style.display = "none";
    document.getElementById('updateDurationRow').style.display = "none";
    document.getElementById('updateConditionRow').style.display = "none";
  }
}

function clearUpdate(){
  document.getElementById('updateRecordType').value = "none";
  document.getElementById('updateDate').value = "";
  document.getElementById('updateDuration').value = 0;
  document.getElementById('updateConditionType').value = "none";
  document.getElementById('updateDateRow').style.display = "none";
  document.getElementById('updateDurationRow').style.display = "none";
  document.getElementById('updateConditionRow').style.display = "none";
  document.getElementById('deleteCustomConditionRow').style.display = "none";
}

async function createHandler(){
  if(document.getElementById('createRecordType').value == "Sleep"){
    await create(document.getElementById('createDate').value,"Sleep",document.getElementById('createDuration').value);
    await generateActionItems();
    await fetchData();
  } else if(document.getElementById('createRecordType').value == "Condition"){
    var condition = document.getElementById('createConditionType').value;
    if (condition != "none" && condition != "Other" && conditions.RecordData.indexOf(condition) == -1){
      var newData = conditions.RecordData;
      newData.push(condition);
      await update("0","Conditions",newData);
      await fetchData();
    }
  }
  clearCreate();
}

async function updateHandler(){
  if(document.getElementById('updateRecordType').value == "Sleep"){
    await update(document.getElementById('updateDate').value,"Sleep",document.getElementById('updateDuration').value);
    await generateActionItems();
    await fetchData();
  } else if(document.getElementById('updateRecordType').value == "Condition"){
    var condition = document.getElementById('updateConditionType').value;
    if (condition != "none" && condition != "Other" && conditions.RecordData.indexOf(condition) != -1){
      var newData = conditions.RecordData.filter(e => e != condition);
      await update("0","Conditions",newData);
      await fetchData();
    }
  }
  clearUpdate();
}

async function generateActionItems(){
  var newActionItems = [];
  var date = new Date();
  var sumActual = 0;
  var sumTarget = 0;
  var sleepArr = [];
  var weekday = new Array(7);
  weekday[0] = "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";
  for (var i = 0; i < 7; i++){
    date.setDate(date.getDate() - 1);
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    timeStamp = mm + '/' + dd + '/' + yyyy;
    var sleep = await read(timeStamp,"Sleep");
    if (sleep){
      var v = parseFloat(sleep.RecordData);
      sleepArr.push(v);
      sumActual += v;
    } else {
      sleepArr.push(null);
    }
  }

  var target = await read("0","Sleep");
  var targetArr = [];
  for (var i = 0; i < 7; i++){
    targetArr.push(parseFloat(target.RecordData));
    sumTarget += parseFloat(target.RecordData);
  }
  date = new Date();
  for (var i = 0; i < 7; i++){
    date.setDate(date.getDate() - 1);
    if (sleepArr[i] != null && targetArr[i]-sleepArr[i] > 3){
      var day = weekday[date.getDay()];
      newActionItems.push("Take a " + Math.round(targetArr[i]-sleepArr[i]).toString() + " hour nap on " + day);
    }
  }
  var averageShortage = (sumTarget - sumActual)/7;
  if (averageShortage > 1){
    newActionItems.push("Sleep an extra " + Math.round(averageShortage).toString() + " hours each day for the next 7 days");
  } else if (averageShortage > 0) {
    newActionItems.push("Sleep an extra 2 hours each day for the next " + Math.round((sumTarget - sumActual)/2).toString() + " days");
  }

  if (sumTarget-sumActual > 10){
    newActionItems.push("Sleep an extra " + Math.round((sumTarget - sumActual)/2).toString() + " hours on each day of the weekend");
  }

  await update("0","ActionItems",newActionItems);
}

function getPatientName(){
  return window.localStorage.name;
}

async function login(form){
  var myHeaders = new Headers();
  // add content type header to object
  myHeaders.append("Content-Type", "application/json");
  // using built in JSON utility package turn object to string and store in a variable
  var raw = JSON.stringify({"username":form.username.value,"password":form.password.value});
  // create a JSON object with parameters for API call and store in a variable
  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
  };
  // make API call with parameters and use promises to get response
  var item = await fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/login", requestOptions)
  .then(response => response.text())
  .then(result => JSON.parse(result).body.Item)
  .catch(error => console.log('error', error));
  if(item){
    var sessionTimeout = 1; //hours
    var loginDuration = new Date();
    loginDuration.setTime(loginDuration.getTime()+(sessionTimeout*60*60*1000));
    window.localStorage.name = item.RecordData;
    self.location.href = './index.html';
  }else{
    alert("Either the username or password you entered is incorrect.\nPlease try again.");
  }
}

async function signup(form){
  var myHeaders = new Headers();
  // add content type header to object
  myHeaders.append("Content-Type", "application/json");
  // using built in JSON utility package turn object to string and store in a variable
  var raw = JSON.stringify({"age":form.age.value,"name":form.name.value,"username":form.username.value,"password":form.password.value});
  // create a JSON object with parameters for API call and store in a variable
  var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
  };
  // make API call with parameters and use promises to get response
  await fetch("https://f96rvuh0ak.execute-api.us-east-1.amazonaws.com/dev/signup", requestOptions)
  .catch(error => console.log('error', error));
  self.location.href = './login.html';
}

function register(form){
  self.location.href = './signup.html';
}

function logout(){
  window.localStorage.clear();
  self.location.href = './login.html';
}

function createConditionTypeChange(){
  if(document.getElementById('createConditionType').value == "Other"){
    document.getElementById('createCustomConditionRow').style.display = "block";
  } else {
    document.getElementById('createCustomConditionRow').style.display = "none";
  }
}

function deleteConditionTypeChange(){
  if(document.getElementById('updateConditionType').value == "Other"){
    document.getElementById('deleteCustomConditionRow').style.display = "block";
  } else {
    document.getElementById('deleteCustomConditionRow').style.display = "none";
  }
}

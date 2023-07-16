window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount();
});


const localApi = 'http://localhost:7071/api/getAzureResumeCounterTrigger';
const functionApi = 'https://getandupdatecounter.azurewebsites.net/api/hello?code=GewlE6owePzc-HAI3B7BvgRPzDCWPaXqz0nKcoiN6LbPAzFuoAmh7g=='

const getVisitCount = () => {
    let count = 30;
    fetch(functionApi)
    .then(response => {
        return response.json()
    })
    .then(response => {
        console.log("Website called function API.");
        count = response.count;
        document.getElementById('counter').innerText = count;
    }).catch(function(error) {
        console.log(error);
      });
    return count;
}

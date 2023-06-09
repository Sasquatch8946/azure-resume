window.addEventListener('DOMContentLoaded', (event) => {
    getVisitCount();
});


const localApi = 'http://localhost:7071/api/getAzureResumeCounterTrigger';
const functionApi = 'https://azureresumecounter4ever.azurewebsites.net/api/getAzureResumeCounterTrigger?code=o5BQ0JclKrQ_HdhkVf_3U7HAK6egb_TE7wn2P1lkEqvAAzFuvUGN1A==';

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

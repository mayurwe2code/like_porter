
// const axios = require('axios');

//_____________________map_my_india____________________________________
// import axios from "axios";
// axios.get('https://apis.mappls.com/advancedmaps/v1/0f6ca50b636bc6a881bcba87b85e4b82/distance_matrix/driving/75.895478,22.751092;75.867580,22.692744;17ZUL7?')
//     .then((response) => {
//         console.log(JSON.stringify(response.data));
//         console.log(response.data.results.distances);
//         console.log(response.data.results.durations);
//     })
//     .catch((error) => {
//         console.error(error);
//     });
//_____________________________________________________________________

//_______________________rapidapi.com______________________________________________
// const axios = require('axios');
import axios from "axios";

const options = {
    method: 'GET',
    url: 'https://distance-calculator.p.rapidapi.com/distance/simple',
    params: {
        lat_1: '47.373535',
        long_1: '8.541109',
        lat_2: '42.335321',
        long_2: '-71.023516',
        unit: 'miles',
        decimal_places: '2'
    },
    headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': '465d7488ddmshc0d872f78e03de3p11d077jsn7613819a3759',
        'X-RapidAPI-Host': 'distance-calculator.p.rapidapi.com'
    }
};

try {
    const response = await axios.request(options);
    console.log(response.data);
} catch (error) {
    console.error(error);
}
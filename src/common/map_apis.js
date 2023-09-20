import axios from "axios";

export const fetchDistanceMatrix = async (driving, current_latitude, current_longitude, pickup_area_lat, pickup_area_long) => {
    try {
        const response = await axios.get(`https://apis.mappls.com/advancedmaps/v1/0f6ca50b636bc6a881bcba87b85e4b82/distance_matrix/${driving}/${pickup_area_long},${pickup_area_lat};${current_longitude},${current_latitude};17ZUL7`);
        console.log(JSON.stringify(response.data));
        console.log(response.data.results.distances);
        console.log(response.data.results.durations);
        response["data"]["status"] = true
        async function fun_formater(distance, durations) {
            const distanceInKilometers = distance / 1000;

            const hh = String(Math.floor(durations / 3600)).padStart(2, '0');
            const mm = String(Math.floor((durations % 3600) / 60)).padStart(2, '0');
            const ss = String(Math.floor(durations % 60)).padStart(2, '0');
            const formattedDuration = `${hh}:${mm}:${ss}`;
            return { distanceInKilometers, formattedDuration }
        }

        const dur_and_dist_in_formate = await fun_formater(response.data.results.distances[0][1], response.data.results.durations[0][1])
        response["data"]["distanceInKilometers"] = dur_and_dist_in_formate.distanceInKilometers
        response["data"]["formattedDuration"] = dur_and_dist_in_formate.formattedDuration
        return response.data
    } catch (error) {
        console.error(error);
        return { status: false, "error": error }
    }
};
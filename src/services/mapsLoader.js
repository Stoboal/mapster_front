import {useJsApiLoader} from "@react-google-maps/api";
import {MAPS_CONFIG} from '../config/config';

export const useGoogleMapsApi = () => {
    return useJsApiLoader({
        id: MAPS_CONFIG.SCRIPT_ID,
        googleMapsApiKey: MAPS_CONFIG.API_KEY
    });
};

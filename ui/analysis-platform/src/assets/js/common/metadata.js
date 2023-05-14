
import axios from "axios"

export default {

    async checkMetadata( key ){

        const formData = new FormData();
        formData.append("key", key)

        const response = await axios.post("/checkMetadata", formData);
        return response;
    },
}
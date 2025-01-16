import axios from "axios";


const host = "http://localhost:8080"

export const saveMessage = async (user, message) => {

    const res = await axios.post(`${host}/send`)

    console.log(res)

    return res.data

}
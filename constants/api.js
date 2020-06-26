import axios from "axios";
import userAgents from "../utils/userAgents.json";

const ALTEX_API = "https://fenrir.altex.ro/";

axios.defaults.baseURL = ALTEX_API + "catalog/category/";

export const getCategories = () =>
    axios
        .get("tree", { headers: { "User-Agent": userAgents[Math.floor(Math.random() * (userAgents.length - 1))] } })
        .then((res) => res.data)
        .catch((err) => console.error(err));

export const getItemsByCategory = (category) =>
    axios
        .get(category, { headers: { "User-Agent": userAgents[Math.floor(Math.random() * (userAgents.length - 1))] } })
        .then((res) => res.data)
        .catch((err) => console.error(err));

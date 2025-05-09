export const api_host = process.env.REACT_APP_API_HOST;
export default function api(path, options = {}) {
    return fetch(api_host + path, options);
}
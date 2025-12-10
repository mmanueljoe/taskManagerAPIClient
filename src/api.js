import { use } from "react";

const BASE_URL = 'https://jsonplaceholder.typicode.com';


function makeCache(){
    const store = new Map();

    return {
        get : key => store.get(key),
        set : (key, value) => store.set(key, value),
        has : key => store.has(key),
        clear : () => store.clear()
    };
}

const cache = makeCache();


// api helpers
async function safeJSONFetch(path, {useCache = true} = {}){

    if(useCache && cache.has(path)){
        return cache.get(path);
    }

    let response;
    try{
        response = await fetch(`${BASE_URL}/${path}`);    
    }catch(netErr){
        throw new Error(`Network error fetching ${path}: ${netErr.message}`);
    }

    if(!response.ok){
        throw new Error(`HTTP ${response.status} while fetching ${path}`);
    }

    let data;
    try{
        data = await response.json();
    }catch(parseError){
        throw new Error(`Invalid JSON for ${path}: ${parseError.message}`);
    }

    if (useCache) cache.set(path, data);

    return data;
}



export class APIClient {
    // promise-based methods
    fetchUsersPromise(options = {}){
        return safeJSONFetch('users', options);
    }

    async fetchTodosPromise(options = {}){
        return safeJSONFetch('todos', options);
    }

    async fetchUserTodosPromise(userId, options = {}){
        return safeJSONFetch(`todos?userId=${userId}`, options);
    }


    // async/await methods
    async fetchUsers(options = {}){
        return safeJSONFetch('users', options);
    }

    async fetchTodos(options = {}){
        return safeJSONFetch('todos', options);
    }

    async fetchUserTodos(userId, options = {}){
        return safeJSONFetch(`todos?userId=${userId}`, options);
    }

    clearCache(){
        cache.clear();
    }
}
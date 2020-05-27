
const load = async url => {
	return fetch(url, {
		method: "GET"
	}).then(response => response.json());
}

const getAll = async url => {
	return fetch(url, {
		method: "GET"
	}).then(response => response.json());
}

export {
	load,
	getAll
}
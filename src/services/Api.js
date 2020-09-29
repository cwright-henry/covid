import JSZip from 'jszip'
/**
 * see https://javascript.info/fetch-progress
 * 
 * @param {*} url 
 */
export const load = (url, contentId, isZip) => {
	postMessage({
		type: 'url-download-started',
		contentId
	})
	return fetch(url, {
		method: "GET",
		headers: {
			'accept': isZip ? 'application/zip' : 'application/json'
		},
	}).then(async response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const reader = response.body.getReader();

		// Step 2: get total length
		let receivedLength = 0; // received that many bytes at the moment
		let chunks = []; // array of received binary chunks (comprises the body)
		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			chunks.push(value);
			receivedLength += value.length;

			postMessage({
				type: 'url-download-in-progress',
				receivedLength,
				contentId
			})
		}

		// Step 4: concatenate chunks into single Uint8Array
		let chunksAll = new Uint8Array(receivedLength); // (4.1)
		let position = 0;
		for (let chunk of chunks) {
			chunksAll.set(chunk, position); // (4.2)
			position += chunk.length;
		}

		// Step 5: decode into a string
		let result = new TextDecoder("utf-8").decode(chunksAll);

		// We're done!
		let json = null
		if (!isZip) {
			json = JSON.parse(result);
		}
		else {
			// zip files !
			postMessage({
				type: 'url-download-parsing-progress',
				contentId
			})
			const zip = await JSZip.loadAsync(chunksAll)
			const content = await zip.file("all.json").async("string");
			json = JSON.parse(content);
		}
		postMessage({
			type: 'url-download-finished',
			contentId
		});
		return json;
	}).catch(e => {
		postMessage({
			type: 'url-download-error',
			contentId
		});
		throw e;
	})
}
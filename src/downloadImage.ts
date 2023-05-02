import { promises } from "fs";

async function downloadImage(url: string, path: string) {
	const response = await fetch(url);
	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await promises.writeFile(path, buffer);
}

export { downloadImage };

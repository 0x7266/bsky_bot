import fs from "fs";
import { compressImage } from "./compressImage";

async function saveImage(imageIdAndFormat: string) {
	const imgUrl = `https://i.redd.it/${imageIdAndFormat}`;
	//COMPRESS IMAGE MUST GO HERE
	const imgPath = `./images/${imageIdAndFormat}`;
	const response = await fetch(imgUrl);
	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await fs.promises.writeFile(imgPath, buffer);
	const imgSize = fs.statSync(imgPath).size;
	if (imgSize > 976560) {
		compressImage(imgSize, imgPath);
	}
}

export { saveImage };
